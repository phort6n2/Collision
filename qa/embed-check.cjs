#!/usr/bin/env node
/**
 * Embeddable form verification.
 *
 * The embed is the one artifact here that runs on somebody else's page, under
 * somebody else's stylesheet, and gets there by being PASTED — so it is both the
 * most fragile thing we ship and the one nothing else checks. verify reads the
 * generated site; the embed is not a page of that site. tracking-check drives
 * the landing form; the embed is a different file with a different DOM model.
 *
 * Builds a throwaway copy with test IDs, serves it, and drives a real browser
 * through it. Same substitution discipline as tracking-check: a pattern that
 * matches nothing would leave the client's live webhook in the build and post
 * test leads into their CRM, so every substitution is asserted.
 *
 *   node qa/embed-check.cjs
 */
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const http = require('http'); const fs = require('fs'); const path = require('path');

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

const OUT = '/tmp/embedtest-site';
const PORT = 8099;
const results = [];
const fail = (m) => results.push('FAIL  ' + m);
const pass = (m) => results.push('ok    ' + m);
/* Not a failure — both states are legitimate for some clients, but both are
   worth seeing rather than passing silently. */
const warnish = (m) => results.push('warn  ' + m);

/* Read BEFORE the config is patched. Hardcoding the expected Source here would
   make the gate pass only for the client it was written against. */
const siteCfg = require(path.join(__dirname, '..', 'landing', 'pages.config.cjs')).site;
const EMBED_SOURCE = (siteCfg.embed && siteCfg.embed.leadSource) || '';
const EMBED_TERMS = (siteCfg.embed && siteCfg.embed.termsUrl) || '';
const EMBED_PHONE = (siteCfg.embed && siteCfg.embed.phoneE164) || '';
const SITE_PHONE = siteCfg.phoneE164 || '';
const LANDING_SOURCE = siteCfg.leadSource || '';

const cfgPath = path.join(__dirname, '..', 'landing', 'pages.config.cjs');
const orig = fs.readFileSync(cfgPath, 'utf8');

const SUBS = [
  [/webhook:\s*'[^']*'/, "webhook: 'https://services.leadconnectorhq.com/hooks/TESTLOC/webhook-trigger/test-id'"],
  [/clientSlug:\s*'[^']*'/, "clientSlug: 'TESTCLIENT'"]
];
let patched = orig;
for (const [re, to] of SUBS) {
  if (!re.test(patched)) {
    console.error('FAIL  embed-check could not substitute ' + re +
      ' in pages.config.cjs — refusing to build against the live IDs.');
    process.exit(1);
  }
  patched = patched.replace(re, to);
}
fs.writeFileSync(cfgPath, patched);
try { execSync(`OUTDIR=${OUT} node ${path.join(__dirname, '..', 'landing', 'build-pages.cjs')}`, { stdio: 'pipe' }); }
finally { fs.writeFileSync(cfgPath, orig); }

const EMBED = path.join(OUT, 'embed', 'form.html');
if (!fs.existsSync(EMBED)) {
  console.error('FAIL  no embed/form.html in the build — nothing to check.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const f = path.join(OUT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : 'text/plain' });
  fs.createReadStream(f).pipe(res);
});

const URL_BASE = 'http://localhost:' + PORT + '/embed/form.html';

/* Every context needs the same stubs: the broad one first, specific after —
   Playwright uses the LAST matching route. */
async function makeCtx(browser, opts) {
  const o = opts || {};
  const state = { crm: null, crmCalls: 0, app: null, appCalls: 0, appUrl: '' };
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.route('**/*', (route) =>
    route.request().url().startsWith(URL_BASE.slice(0, 22))
      ? route.continue()
      : route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub */' }));
  await ctx.route('**services.leadconnectorhq.com/**', (route) => {
    state.crmCalls++;
    try { state.crm = JSON.parse(route.request().postData() || '{}'); } catch (e) {}
    if (o.crmDown) return route.fulfill({ status: 502, contentType: 'text/plain', body: 'Bad Gateway' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await ctx.route('**glassleads.app/**', (route) => {
    if (o.appDown) return route.abort('failed');
    if (route.request().method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type' } });
    state.appCalls++;
    state.appUrl = route.request().url();
    try { state.app = JSON.parse(route.request().postData() || '{}'); } catch (e) {}
    return route.fulfill({ status: 200, contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true}' });
  });
  return { ctx, state };
}

async function fillValid(p, over) {
  const v = Object.assign({ nm: 'Riley Chen', ph: '5035550142', em: 'riley@example.com',
    zip: '97229', veh: '2021 Toyota RAV4' }, over || {});
  for (const k of Object.keys(v)) await p.fill('#' + k, v[k]);
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: chromePath() });

  /* ---------------- 1. healthy path ---------------- */
  const a = await makeCtx(browser);
  const p = await a.ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(URL_BASE + '?gclid=EMBEDTEST&utm_campaign=organic-test', { waitUntil: 'load' });
  await p.waitForTimeout(250);

  if (await p.evaluate(() => !!document.getElementById('cag-quote-form')?.shadowRoot))
    pass('renders into a shadow root');
  else fail('no shadow root — the WordPress theme would style this form');

  /* A theme that styles bare element selectors is the normal case, not the
     hostile one. If any of this reaches the inputs, the form looks broken on
     their site and nobody finds out until a customer says so. */
  await p.addStyleTag({ content: 'input,select,button{background:lime !important;border:8px dashed magenta !important;font-size:40px !important}' });
  await p.waitForTimeout(100);
  const bg = await p.evaluate(() =>
    getComputedStyle(document.getElementById('cag-quote-form').shadowRoot.querySelector('#nm')).backgroundColor);
  if (bg === 'rgb(255, 255, 255)') pass('host page CSS cannot reach into the form');
  else fail('host page CSS leaked into the form: input background is ' + bg);

  await fillValid(p);
  if (await p.inputValue('#ph') === '(503) 555-0142') pass('phone formats as typed');
  else fail('phone did not format: ' + await p.inputValue('#ph'));
  await p.fill('#zip', '97229abc');
  if (await p.inputValue('#zip') === '97229') pass('ZIP strips non-digits');
  else fail('ZIP did not filter: ' + await p.inputValue('#zip'));

  /* Assert CLOSED first. The previous version of this only checked the drawer
     was visible AFTER a click, which passes just as happily when the drawer is
     stuck open and cannot be closed at all — which is exactly what shipped.
     A disclosure test that never asserts the collapsed state is not a test. */
  if (!(await p.isVisible('#qcMore'))) pass('optional drawer starts closed');
  else fail('optional drawer is open on load — the hidden attribute is being overridden');
  if (await p.getAttribute('#qcExpand', 'aria-expanded') === 'false') pass('drawer reports aria-expanded=false when closed');
  else fail('aria-expanded is not false on load');

  /* Consent links are assembled at RUNTIME from config, so the source-level
     "every URL is absolute" guard in verify cannot see them — it only sees the
     token. A root-relative value in config would resolve against the client's
     own site and 404, on the one line of the form that carries a legal promise.
     Check what the browser actually rendered. */
  const legal = await p.$$eval('.qc-consent a', (as) =>
    as.map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href') })));
  const privacy = legal.find((l) => /privacy/i.test(l.text));
  if (privacy && /^https?:\/\//.test(privacy.href)) pass('consent line links an absolute Privacy Policy URL');
  else fail('consent Privacy Policy link missing or not absolute: ' + JSON.stringify(privacy || null));
  if (EMBED_TERMS) {
    const terms = legal.find((l) => /terms/i.test(l.text));
    if (terms && /^https?:\/\//.test(terms.href)) pass('consent line links an absolute Terms URL');
    else fail('termsUrl is configured but the consent line has no absolute Terms link');
  } else if (legal.some((l) => /terms/i.test(l.text))) {
    fail('a Terms link is rendered with no termsUrl configured');
  } else pass('no termsUrl configured, and no Terms link rendered');

  await p.click('#qcExpand');
  if (await p.isVisible('#qcMore')) pass('optional drawer opens');
  else fail('optional drawer did not open');

  /* And closes again. A disclosure that only opens is a worse control than no
     disclosure, because the affordance says it toggles. */
  await p.click('#qcExpand');
  if (!(await p.isVisible('#qcMore'))) pass('optional drawer closes again');
  else fail('optional drawer cannot be closed once opened');
  if (await p.getAttribute('#qcExpand', 'aria-expanded') === 'false') pass('aria-expanded returns to false');
  else fail('aria-expanded stuck true after closing');
  await p.click('#qcExpand');
  await p.fill('#vin', 'jtmrfrev7hd0000i0');
  if (await p.inputValue('#vin') === 'JTMRFREV7HD00000') pass('VIN uppercases and drops I/O/Q');
  else fail('VIN filter wrong: ' + await p.inputValue('#vin'));
  /* Same shape of bug, same blind spot: .field{display:grid} also beats the UA's
     [hidden] rule, so this field was permanently visible too. */
  if (!(await p.isVisible('#carrierField'))) pass('carrier field starts hidden');
  else fail('carrier field is visible before insurance=yes is chosen');
  await p.check('input[name="insurance"][value="yes"]');
  if (await p.isVisible('#carrierField')) pass('carrier field reveals on insurance=yes');
  else fail('carrier field stayed hidden');
  await p.check('input[name="insurance"][value="no"]');
  if (!(await p.isVisible('#carrierField'))) pass('carrier field hides again on insurance=no');
  else fail('carrier field cannot be hidden once shown');
  await p.check('input[name="insurance"][value="yes"]');
  await p.selectOption('#carrier', 'GEICO');
  /* Change the service away from the default, so service_label is proven to
     track the SELECTION rather than happening to match the first option. */
  await p.selectOption('#svc', 'door-side-glass');

  /* Validation must stop the submit BEFORE anything is POSTed — a half-valid
     lead in the CRM is worse than none, because it looks like a real one. */
  await p.fill('#veh', 'car');
  await p.click('.qc-submit');
  await p.waitForTimeout(250);
  if (a.state.crmCalls === 0 && a.state.appCalls === 0) pass('validation blocks the submit before any POST');
  else fail('posted despite failing validation');
  if (await p.isVisible('#veh-err')) pass('the failing field is named on screen');
  else fail('no error shown on the failing field');

  await p.fill('#veh', '2021 Toyota RAV4');
  await p.click('.qc-submit');
  await p.waitForTimeout(900);

  if (a.state.crmCalls === 1) pass('CRM POSTed exactly once');
  else fail('CRM called ' + a.state.crmCalls + ' times');
  if (a.state.appCalls === 1) pass('leads app POSTed exactly once');
  else fail('leads app called ' + a.state.appCalls + ' times');
  if (/[?&]client=TESTCLIENT\b/.test(a.state.appUrl)) pass('leads-app URL carries the client slug');
  else fail('leads-app URL has no client slug: ' + a.state.appUrl);
  if (a.state.crm && a.state.app && JSON.stringify(a.state.crm) === JSON.stringify(a.state.app))
    pass('both destinations got the identical payload');
  else fail('the two payloads differ');

  const want = { contact_source: EMBED_SOURCE, gclid: 'EMBEDTEST', paid_click: 'yes',
    phone: '+15035550142', postal_code: '97229', service: 'door-side-glass',
    carrier: 'GEICO', insurance: 'yes', vehicle: '2021 Toyota RAV4',
    vin: 'JTMRFREV7HD00000', utm_campaign: 'organic-test' };
  const wrong = Object.entries(want).filter(([k, v]) => (a.state.crm || {})[k] !== v);
  if (!wrong.length) pass('payload correct, contact_source is "' + EMBED_SOURCE + '"');
  else fail('payload wrong: ' + JSON.stringify(wrong));

  /* The assertion that actually matters. Equal to the config value only proves
     the token substituted; DIFFERENT from the landing form's is the whole
     reason the embed exists — it is what lets the client see, in the contact
     list, which leads came from ads and which came from their own site. Two
     paths writing the same Source makes the split invisible. */
  if (EMBED_SOURCE && LANDING_SOURCE && EMBED_SOURCE !== LANDING_SOURCE)
    pass('embed Source differs from the landing form\'s, so the two paths stay distinguishable');
  else fail('embed and landing form both write Source "' + EMBED_SOURCE + '" — the split would be invisible in the CRM');

  /* The landing form sends 33 keys and the CRM's field mapping is built from a
     captured sample of them. A key that silently stops being sent does not
     error — it just arrives blank on every contact from then on. */
  const keys = Object.keys(a.state.crm || {});
  if (keys.length === 37) pass('payload carries all 37 keys');
  else fail('payload has ' + keys.length + ' keys, expected 37: ' + keys.join(','));

  /* ---- readable labels ----
     These exist so the CRM's notification email needs no conditionals. The
     failure mode is not an error, it is an email that reads "Service:
     door-side-glass" — invisible from here unless it is asserted. */
  const lead = a.state.crm || {};
  if (lead.service_label === 'Door or side window glass') pass('service_label is the option text, not the value');
  else fail('service_label wrong: ' + JSON.stringify(lead.service_label));
  if (lead.insurance_label === 'Filing through insurance') pass('insurance_label is an English phrase');
  else fail('insurance_label wrong: ' + JSON.stringify(lead.insurance_label));
  if (lead.source_label && / /.test(lead.source_label) && !/:/.test(lead.source_label))
    pass('source_label reads as prose, not an identifier');
  else fail('source_label looks like a slug or is empty: ' + JSON.stringify(lead.source_label));
  /* The raw values must be untouched — the app reports on them. */
  if (lead.service === 'door-side-glass' && lead.insurance === 'yes') pass('raw values unchanged alongside the labels');
  else fail('a raw value changed: service=' + lead.service + ' insurance=' + lead.insurance);
  /* No stringified undefined/null anywhere. One of these in a lead email is
     the kind of thing a client forwards back with a question mark. */
  const junk = Object.entries(lead).filter(([, v]) => v === 'undefined' || v === 'null' || /\bundefined\b/.test(String(v)));
  if (!junk.length) pass('no "undefined" or "null" strings in the payload');
  else fail('payload carries literal undefined/null: ' + JSON.stringify(junk));
  console.log('  SUMMARY (full):    ' + lead.lead_summary);

  if (await p.isVisible('#quoteSuccess')) pass('success panel shown');
  else fail('no success panel after a valid submit');

  /* Which number the embed prints is a real decision, and an empty
     embed.phoneE164 silently falls back to site.phoneE164 — the tracking line
     the landing pages use. On the client's own site that is wrong twice over:
     it contradicts the number printed everywhere else on the page, and it
     routes organic callers through a line that exists to attribute ad spend
     there is none of here. Assert the rendered links are the configured value,
     not the fallback. */
  const tels = [...new Set(await p.$$eval('a[href^="tel:"]', (as) =>
    as.map((a) => a.getAttribute('href').replace('tel:', ''))))];
  if (!EMBED_PHONE) {
    warnish('embed.phoneE164 is unset — the embed is falling back to the landing site number');
  } else if (tels.length && tels.every((t) => t === EMBED_PHONE)) {
    pass('every call link uses the configured embed number (' + EMBED_PHONE + ')');
  } else {
    fail('call links do not match embed.phoneE164 (' + EMBED_PHONE + '): ' + JSON.stringify(tels));
  }
  if (EMBED_PHONE && SITE_PHONE && EMBED_PHONE === SITE_PHONE)
    warnish('embed and landing site share a number — intended only if the landing number is the real business line');

  /* No conversion, by decision. Ads point at the landing domain; a submission
     here has no click ID, and enhanced conversions could otherwise match the
     person to an older ad click and credit the landing pages for it. */
  const tag = await p.evaluate(() => ({ dl: (window.dataLayer || []).length, gtag: typeof window.gtag }));
  if (tag.dl === 0 && tag.gtag === 'undefined') pass('no gtag and no dataLayer — reports no Ads conversion');
  else fail('a Google tag is present on the embed: ' + JSON.stringify(tag));

  if (!errs.length) pass('no page errors'); else fail('page errors: ' + errs.join('; '));
  await a.ctx.close();

  /* ---------------- 1b. the minimal form ----------------
     Only the required fields: no VIN, no carrier, insurance left at its default.
     This is the COMMON submission, not the edge case, and it is where a naively
     concatenated summary produces "Riley needs  on a  ()." */
  const m = await makeCtx(browser);
  const pm = await m.ctx.newPage();
  await pm.goto(URL_BASE, { waitUntil: 'load' });
  await pm.fill('#nm', 'Dana Alvarez');
  await pm.fill('#ph', '5035550177');
  await pm.fill('#em', 'dana@example.com');
  await pm.fill('#zip', '97229');
  await pm.fill('#veh', '2018 Subaru Forester');
  await pm.selectOption('#svc', 'adas-calibration');
  await pm.click('.qc-submit');
  await pm.waitForTimeout(900);
  const mc = m.state.crm || {};
  const sum = mc.lead_summary || '';
  console.log('  SUMMARY (minimal): ' + sum);
  if (sum && /^[A-Z]/.test(sum) && sum.endsWith('.')) pass('minimal-form summary is a sentence');
  else fail('minimal-form summary is malformed: ' + JSON.stringify(sum));
  if (!/\s{2,}/.test(sum)) pass('summary has no double spaces');
  else fail('summary has collapsed whitespace: ' + JSON.stringify(sum));
  if (!/undefined|null|\(\)|VIN \)|insured with\s*$/.test(sum)) pass('summary has no dangling empty clauses');
  else fail('summary has a dangling clause: ' + JSON.stringify(sum));
  /* An acronym in the option text must survive the sentence-casing. */
  if (/ADAS/.test(sum)) pass('acronym in the service label is not lowercased');
  else fail('acronym was mangled by sentence-casing: ' + JSON.stringify(sum));
  await m.ctx.close();

  /* ---------------- 2. leads app down, CRM fine ----------------
     The app post swallows its own errors by construction, so if it could reach
     the visible form the symptom would be an intermittent form failure with no
     traceable cause. route.abort() rather than a 500: a rejected CORS preflight
     is the likely real failure on a new origin, and it surfaces as a rejected
     promise rather than a status code. This is also the exact state the form
     will be in on the WordPress site until that origin is allowlisted. */
  const b = await makeCtx(browser, { appDown: true });
  const p2 = await b.ctx.newPage();
  const errs2 = [];
  p2.on('pageerror', (e) => errs2.push(e.message));
  await p2.goto(URL_BASE, { waitUntil: 'load' });
  await fillValid(p2, { nm: 'Sam Okafor', ph: '5035550188', em: 'sam@example.com' });
  await p2.click('.qc-submit');
  await p2.waitForTimeout(900);
  if (await p2.isVisible('#quoteSuccess')) pass('leads app down — success panel still shown');
  else fail('a leads-app failure broke the success screen');
  if (b.state.crmCalls === 1) pass('leads app down — CRM still received the lead');
  else fail('a leads-app failure changed CRM delivery: ' + b.state.crmCalls + ' call(s)');
  if (!errs2.length) pass('leads app down — no page error raised');
  else fail('leads-app failure raised page errors: ' + errs2.join('; '));
  await b.ctx.close();

  /* ---------------- 3. CRM down ----------------
     The visitor must be told, not shown a success screen that lied. There is no
     conversion to protect here, so unlike the landing page a CRM failure is
     simply a failure. */
  const c = await makeCtx(browser, { crmDown: true });
  const p3 = await c.ctx.newPage();
  await p3.goto(URL_BASE, { waitUntil: 'load' });
  await fillValid(p3, { nm: 'Jordan Blake', ph: '5035550199', em: 'jordan@example.com' });
  await p3.click('.qc-submit');
  await p3.waitForTimeout(900);
  if (!(await p3.isVisible('#quoteSuccess'))) pass('CRM down — error state, not a false success');
  else fail('showed success despite the CRM failing');
  if (await p3.isVisible('#quoteError')) pass('CRM down — visitor is told to call instead');
  else fail('no error message shown on CRM failure');
  await c.ctx.close();

  /* ---------------- 4. bot trap ----------------
     A scripted submit sets .value and calls click(), generating no trusted
     event. It gets the success screen — telling a bot why it failed is how it
     learns to pass — and nothing is POSTed. */
  const d = await makeCtx(browser);
  const p4 = await d.ctx.newPage();
  await p4.goto(URL_BASE, { waitUntil: 'load' });
  await p4.evaluate(() => {
    const r = document.getElementById('cag-quote-form').shadowRoot;
    const set = (id, v) => { r.querySelector('#' + id).value = v; };
    set('nm', 'Bot Script'); set('ph', '(503) 555-0111'); set('em', 'bot@example.com');
    set('zip', '97229'); set('veh', '2020 Honda Civic');
    r.querySelector('.qc-submit').click();
  });
  await p4.waitForTimeout(700);
  if (d.state.crmCalls === 0 && d.state.appCalls === 0) pass('scripted submit posted nothing');
  else fail('bot trap let a scripted submit through');
  if (await p4.isVisible('#quoteSuccess')) pass('scripted submit still sees a success screen');
  else fail('bot trap revealed itself by showing an error');
  await d.ctx.close();

  await browser.close();
  server.close();
  console.log(results.join('\n'));
  const failed = results.some((r) => r.startsWith('FAIL'));
  console.log(failed ? '\nEMBED: FAILED' : '\nEMBED: ALL PASS');
  process.exitCode = failed ? 1 : 0;
})();
