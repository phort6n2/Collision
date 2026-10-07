#!/usr/bin/env node
/**
 * Google website-call-conversion swap check.
 *
 * Google's call tracking rewrites the page after load. In css-class mode it
 * finds every element carrying phone_conversion_css_class, DELETES ALL OF ITS
 * CHILDREN, and puts the forwarding number in as a single text node — then
 * walks up to the nearest <a href="tel:"> and rewrites the href.
 *
 * That is the whole hazard. Put the class on a link and the swap eats the icon
 * and the wording; put it nowhere inside a link and the href is never rewritten
 * and the call is never counted. Both failures are invisible to anyone who is
 * not an ad visitor: the page looks correct in every normal page load, and the
 * only symptom of the second one is a conversion number that is lower than it
 * should be, with nothing to point at.
 *
 * So this runs GOOGLE'S OWN SCRIPT, not an imitation of it. Chromium rejects
 * this sandbox's egress proxy CA (it uses the Chrome Root Store and ignores the
 * system/NSS trust), so every off-localhost request is fetched with curl — which
 * does trust the bundle — and fulfilled back into the page. The bytes executing
 * in the page are the real googletagmanager/googleadservices ones.
 *
 * Google ships a test mode for exactly this: load with #google-wcc-debug, wait
 * for its panel, press Force. The swap runs with the forwarding number rendered
 * as 9s, so nothing is called and no conversion is recorded.
 *
 * NOT part of `npm run qa`, deliberately. Every other gate here is hermetic —
 * it builds into /tmp and stubs the network, so it gives the same answer on any
 * machine at any time. This one cannot: it needs Google's live config and the
 * debug panel that only a real Ads ID gets served, and through this sandbox's
 * curl relay the panel's arrival is timing-variable. A build gate that is
 * occasionally wrong about something this important is worse than one you run
 * on purpose, because the first flaky red trains everyone to re-run it.
 *
 * So: run it yourself before shipping a change to any call button, and read the
 * output. It never passes quietly — if the swap did not run it says so and
 * states that nothing below was proven.
 *
 *   node qa/call-swap-check.cjs            # localhost build
 *   node qa/call-swap-check.cjs --url=https://collisionglass.co
 */
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARG = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith('--' + k + '='));
  return hit ? hit.slice(k.length + 3) : d;
};
const TARGET = ARG('url', '');
const PORT = Number(ARG('port', 8102));
const OUT = path.join(__dirname, '..', 'quote-site');

/* This gate needs Google's REAL config for a real account — the debug panel is
   part of the conversion module gtag.js only downloads for a live Ads ID. On an
   unconfigured template there is nothing to exercise and no way to fake it, so
   skip loudly instead of reporting a failure that means "not set up yet". */
const siteCfg = require(path.join(__dirname, '..', 'landing', 'pages.config.cjs')).site;
const ADS_ID = (siteCfg.ads && siteCfg.ads.conversionId) || '';
const CALL_LABEL = (siteCfg.ads && siteCfg.ads.callConversionLabel) || '';
const real = (v) => v && !String(v).startsWith('REPLACE__');
if (!TARGET && !(real(ADS_ID) && real(CALL_LABEL))) {
  console.log('CALL SWAP: skipped — no live Google Ads ID and call label configured.');
  console.log('           Nothing to swap, and Google will not serve the debug panel');
  console.log('           without a real account. Re-run once site.ads is filled in.');
  process.exit(0);
}

const results = [];
const pass = (m) => results.push('ok    ' + m);
const fail = (m) => results.push('FAIL  ' + m);
const info = (m) => results.push('      ' + m);

function chromePath() {
  for (const root of [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers'].filter(Boolean)) {
    let entries = [];
    try { entries = fs.readdirSync(root); } catch (e) { continue; }
    for (const name of entries.filter((n) => n.startsWith('chromium')).sort().reverse()) {
      for (const rel of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome']) {
        const p = path.join(root, name, rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return undefined;
}

/* Only Google's own hosts are fetched for real. Everything else third-party is
   stubbed — a QA run has no business pinging a fraud vendor, and each real
   fetch costs seconds. */
const LIVE = /(^|\.)(googletagmanager\.com|googleadservices\.com|google-analytics\.com|gstatic\.com|google\.com|doubleclick\.net)$/;
/* The embedded map is Google's too and is several slow megabytes that have
   nothing to do with call tracking. */
const NOT_LIVE = /^maps\.google\./;

const cache = new Map();
function viaCurl(url) {
  if (cache.has(url)) return cache.get(url);
  let out;
  try {
    const body = execFileSync('curl', ['-sS', '-L', '--max-time', '45', url], {
      maxBuffer: 64 * 1024 * 1024, encoding: 'buffer'
    });
    out = { ok: true, body };
  } catch (e) {
    out = { ok: false, body: Buffer.from('') };
  }
  cache.set(url, out);
  return out;
}

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.webp': 'image/webp',
  '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain' };

/* ---------------------------------------------------------------- the probe
   Collected identically before and after the swap, so the two are comparable
   field by field. Everything is read from the LIVE DOM — a tel: href is the
   only thing that proves a call would be attributed, and the rendered text is
   the only thing that proves the button still says what it said. */
const PROBE = `(() => {
  const out = [];
  document.querySelectorAll('a[href^="tel:"]').forEach((a, i) => {
    const r = a.getBoundingClientRect();
    out.push({
      i,
      href: a.getAttribute('href'),
      text: (a.textContent || '').replace(/\\s+/g, ' ').trim(),
      svgs: a.querySelectorAll('svg').length,
      /* "Is this link in scope for the swap?" — true whether the class sits on
         the link (the old shape) or on a span inside it (the fixed shape).
         Testing only for a descendant made every link in the old build look
         out of scope, which turned the one meaningful exception into noise. */
      gcall: (a.classList.contains('gcall') || a.querySelector('.gcall')) ? 1 : 0,
      w: Math.round(r.width), h: Math.round(r.height),
      where: a.closest('.sticky') ? 'sticky'
           : a.closest('.hdr') ? 'header'
           : a.closest('.ftr') ? 'footer'
           : a.closest('.utilbar') ? 'utilbar'
           : a.closest('.qc-ok') ? 'success'
           : a.closest('.form-error') ? 'error'
           : a.closest('.final') ? 'final'
           : a.closest('.hero') ? 'hero' : 'body',
      cls: a.className
    });
  });
  const hdr = document.querySelector('.hdr .wrap');
  const brand = document.querySelector('.brand');
  const hr = hdr ? hdr.getBoundingClientRect() : null;
  const br = brand ? brand.getBoundingClientRect() : null;
  return {
    links: out,
    header: hr ? { w: Math.round(hr.width), h: Math.round(hr.height) } : null,
    brand: br ? { w: Math.round(br.width), h: Math.round(br.height), right: Math.round(br.right) } : null
  };
})()`;

/* The panel is injected by the debug build of the call-tracking module, which
   arrives on its own schedule — every off-localhost byte here is relayed
   through curl, so it is slower than the open internet. Waiting for the control
   to EXIST is separate from pressing it, because the page has to be scrolled
   and measured in between: the sticky bar only un-hides once the quote form is
   off screen, and a "before" measured while it is still hidden proves nothing.
   Found by accessible text, not a selector — the panel is Google's markup and
   not a contract. */
const FIND_FORCE = `(() => {
  const els = Array.from(document.querySelectorAll('button,input[type=button],a,div,span'));
  return els.findIndex((e) => {
    const t = (e.value || e.textContent || '').trim().toLowerCase();
    return t === 'force' || t === 'force swap';
  });
})()`;

async function waitForForce(page, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (await page.evaluate(FIND_FORCE) >= 0) return true;
    await page.waitForTimeout(400);
  }
  return false;
}

async function clickForce(page) {
  return page.evaluate(`(() => {
    const els = Array.from(document.querySelectorAll('button,input[type=button],a,div,span'));
    const btn = els.find((e) => {
      const t = (e.value || e.textContent || '').trim().toLowerCase();
      return t === 'force' || t === 'force swap';
    });
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
}

(async () => {
  let server = null;
  let base = TARGET;
  if (!base) {
    if (!fs.existsSync(path.join(OUT, 'index.html'))) {
      console.error('FAIL  no build in quote-site/ — run npm run build:landing first.');
      process.exit(1);
    }
    server = http.createServer((req, res) => {
      let f = path.join(OUT, decodeURIComponent(req.url.split('?')[0].split('#')[0]));
      try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch (e) {}
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'text/plain' });
      fs.createReadStream(f).pipe(res);
    });
    await new Promise((r) => server.listen(PORT, r));
    base = 'http://localhost:' + PORT;
  }

  const browser = await chromium.launch({ executablePath: chromePath() });
  let liveHits = 0, liveFails = 0;

  for (const [label, opts] of [
    ['mobile', { ...devices['iPhone 13'] }],
    ['desktop', { viewport: { width: 1280, height: 900 } }]
  ]) {
    const ctx = await browser.newContext(opts);
    /* The panel cannot exist until the swap module has its forwarding number,
       and that arrives from /pagead/conversion/<id>/wcm. Every byte here is
       relayed through curl one request at a time, so that response lands at a
       different moment on every run — which is exactly what made waiting on the
       panel alone flaky. Wait for the thing the panel depends on instead. */
    let wcmSeen = false;
    ctx.on('response', (r) => { if (/\/pagead\/conversion\/[^/]+\/wcm/.test(r.url())) wcmSeen = true; });
    await ctx.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return route.continue();
      if (TARGET && u.hostname === new URL(TARGET).hostname) {
        const r = viaCurl(route.request().url());
        return r.ok
          ? route.fulfill({ status: 200, body: r.body })
          : route.abort();
      }
      if (LIVE.test(u.hostname) && !NOT_LIVE.test(u.hostname)) {
        const r = viaCurl(route.request().url());
        if (process.env.SWAPDEBUG) console.log('    live: ' + u.hostname + u.pathname + (r.ok ? '' : '  <-- CURL FAILED'));
        if (r.ok) { liveHits++; return route.fulfill({ status: 200, contentType: 'application/javascript', body: r.body }); }
        liveFails++;
        return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* unreachable */' });
      }
      if (process.env.SWAPDEBUG) console.log('    stubbed: ' + u.hostname + u.pathname);
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub */' });
    });

    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    /* One reload if the panel does not turn up. Every off-localhost byte is
       relayed through curl, so the debug module's arrival is slower and less
       even than it would be on the open internet, and a miss here is a timing
       accident rather than a result. Two misses is a result. */
    let ready = false;
    for (let attempt = 1; attempt <= 2 && !ready; attempt++) {
      await page.goto(base + '/#google-wcc-debug', { waitUntil: 'load', timeout: 60000 });
      const wcmDeadline = Date.now() + 45000;
      while (!wcmSeen && Date.now() < wcmDeadline) await page.waitForTimeout(300);
      if (!wcmSeen) console.log('  the wcm forwarding-number response never arrived');
      ready = await waitForForce(page, 45000);
      if (!ready) console.log('  panel not up after attempt ' + attempt + (attempt < 2 ? ' — reloading' : ''));
    }

    /* Reveal the sticky bar: it is mounted from the start and hidden with a
       transform, but it only un-hides once the quote form is off screen. */
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);

    const before = await page.evaluate(PROBE);
    const forced = ready && await clickForce(page);
    await page.waitForTimeout(2000);
    const after = await page.evaluate(PROBE);

    console.log('\n=== ' + label + ' ===');
    console.log('  google scripts fetched: ' + liveHits + (liveFails ? ', FAILED: ' + liveFails : ''));
    if (!forced) {
      fail(label + ': the #google-wcc-debug Force control never appeared — the real swap did NOT run, so nothing below was proven');
      await ctx.close();
      continue;
    }
    pass(label + ': Google\'s debug panel found and Force pressed');

    const swapped = after.links.filter((l) => /^tel:\+?9+$/.test((l.href || '').replace(/[^+\d:tel]/g, '')) || /9{7,}/.test(l.href || ''));
    console.log('  tel: links: ' + after.links.length + ', swapped: ' + swapped.length);
    for (const l of after.links) {
      const b = before.links[l.i] || {};
      console.log('    [' + l.where + '] ' + (/9{7,}/.test(l.href) ? 'SWAPPED  ' : 'original ') +
        l.href + '  "' + l.text + '"  svg=' + l.svgs + '  ' + b.w + 'x' + b.h + ' -> ' + l.w + 'x' + l.h);
    }

    /* 1. every link swapped, except the one the call asset is verified against */
    for (const l of after.links) {
      const b = before.links[l.i] || {};
      /* The deliberate exception: the one tel: link with nothing in scope for
         the swap. Everything else on the page is a CTA and must be counted. */
      const isIdentity = b.gcall === 0;
      const didSwap = /9{7,}/.test(l.href || '');
      if (isIdentity) {
        if (!didSwap) pass(label + ': the footer identity link kept the real number (call-asset verification)');
        else fail(label + ': the footer identity link WAS swapped — a rendering crawler would find no real number and the call asset would fail verification');
      } else if (didSwap) {
        pass(label + ': [' + l.where + '] href swapped — this call would be counted');
      } else {
        fail(label + ': [' + l.where + '] href is still ' + l.href + ' — every call from here is uncounted');
      }
    }

    /* 2. the swap must not have eaten the icon or the wording */
    for (const l of after.links) {
      const b = before.links[l.i] || {};
      if (b.svgs !== l.svgs)
        fail(label + ': [' + l.where + '] lost its icon (' + b.svgs + ' svg -> ' + l.svgs + ')');
      const word = (b.text || '').replace(/[\d()+\-.\s]/g, '');
      if (word && !(l.text || '').replace(/[\d()+\-.\s]/g, '').includes(word))
        fail(label + ': [' + l.where + '] lost its wording — "' + b.text + '" became "' + l.text + '"');
    }
    if (!results.some((r) => r.startsWith('FAIL') && r.includes(label + ': [') && /icon|wording/.test(r)))
      pass(label + ': every call button kept its icon and its wording');

    /* 3. nothing moved. A swapped button that grows pushes the header around,
          which is how this was noticed in the first place. */
    let geomOk = true;
    for (const l of after.links) {
      const b = before.links[l.i] || {};
      if (Math.abs((b.w || 0) - l.w) > 12 || Math.abs((b.h || 0) - l.h) > 6) {
        fail(label + ': [' + l.where + '] changed size ' + b.w + 'x' + b.h + ' -> ' + l.w + 'x' + l.h);
        geomOk = false;
      }
    }
    if (before.brand && after.brand && Math.abs(before.brand.right - after.brand.right) > 2) {
      fail(label + ': the logo moved ' + before.brand.right + ' -> ' + after.brand.right + ' — the header button grew and crowded it');
      geomOk = false;
    }
    if (geomOk) pass(label + ': button sizes and header layout unchanged by the swap');

    if (errs.length) fail(label + ': page errors — ' + errs.join('; '));
    await ctx.close();
  }

  await browser.close();
  if (server) server.close();
  console.log('\n' + results.join('\n'));
  const failed = results.some((r) => r.startsWith('FAIL'));
  console.log(failed ? '\nCALL SWAP: FAILED' : '\nCALL SWAP: ALL PASS');
  process.exitCode = failed ? 1 : 0;
})();
