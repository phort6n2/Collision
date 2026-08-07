/**
 * Tracking verification. Builds a throwaway copy of the site with test Google Ads
 * IDs and a test webhook, then drives a real browser through the form and asserts
 * what actually reached dataLayer and what actually got POSTed.
 *
 * Sandbox has no outbound network, so gtag.js and the GHL scripts are stubbed.
 * NOTE: Playwright uses the LAST matching route, so broad stubs are registered
 * first and specific handlers after, or the specific one never runs.
 */
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const http = require('http'); const fs = require('fs'); const path = require('path');

/* Chromium lives at a version-stamped path that moves every Playwright bump.
   Resolve it, and fall back to letting Playwright find its own — a hardcoded
   path turns a routine dependency update into a mystery QA failure. */
function chromePath() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers'].filter(Boolean);
  for (const root of roots) {
    let entries = [];
    try { entries = fs.readdirSync(root); } catch (e) { continue; }
    for (const name of entries.filter((n) => n.startsWith('chromium')).sort().reverse()) {
      for (const rel of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome']) {
        const p = path.join(root, name, rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return undefined;   // undefined => Playwright resolves it itself
}

const OUT = '/tmp/tracktest-site';

/* Drive the test against a real page of this client's, whatever it is called.
   A city page is preferred because it exercises the deepest slug; the home page
   is the fallback for a site that has none yet. */
const cfg = require(path.join(__dirname, '..', 'landing', 'pages.config.cjs'));
const TEST_PAGE = (cfg.cities && cfg.cities[0]) || (cfg.services && cfg.services[0]) || cfg.home;
const TEST_SLUG = TEST_PAGE === cfg.home ? '' : TEST_PAGE.slug;
const TEST_SVC = TEST_PAGE.svcValue;
const results = []; const fail = m => results.push('FAIL  ' + m); const pass = m => results.push('ok    ' + m);

// build a copy with tracking configured
const cfgPath = path.join(__dirname,'..','landing','pages.config.cjs');
const orig = fs.readFileSync(cfgPath, 'utf8');

/* Swap in test IDs by rewriting the config source. Each substitution is
   asserted: a pattern that silently matches nothing leaves the REAL conversion
   ID in the build, and every assertion downstream then fails for a reason that
   looks like a tracking bug and is not. Worse, a webhook that failed to swap
   would post test leads into the client's live CRM. */
const SUBS = [
  [/conversionId:\s*'[^']*'/, "conversionId: 'AW-TEST12345'"],
  [/conversionLabel:\s*'[^']*'/, "conversionLabel: 'TestLabel_abc'"],
  [/leadValue:\s*\d+/, "leadValue: 125"],
  [/webhook:\s*'[^']*'/, "webhook: 'https://services.leadconnectorhq.com/hooks/TESTLOC/webhook-trigger/test-id'"],
  [/locationId:\s*'[^']*'/, "locationId: 'TESTLOC'"],
  [/poolId:\s*'[^']*'/, "poolId: 'TESTPOOL'"],
  /* Not for safety — the broad stub below intercepts every off-localhost
     request, so nothing reaches the real app either way. It is so the URL
     assertion has a known value to look for, and so a run cannot be read as
     evidence that the LIVE slug is correct. Only the app can tell you that. */
  [/clientSlug:\s*'[^']*'/, "clientSlug: 'TESTCLIENT'"]
];
let patched = orig;
for (const [re, to] of SUBS) {
  if (!re.test(patched)) {
    console.error('FAIL  tracking-check could not substitute ' + re +
      ' in pages.config.cjs — refusing to build against the live IDs.');
    process.exit(1);
  }
  patched = patched.replace(re, to);
}
fs.writeFileSync(cfgPath, patched);
try { execSync(`OUTDIR=${OUT} node ${path.join(__dirname,'..','landing','build-pages.cjs')}`, {stdio:'pipe'}); }
finally { fs.writeFileSync(cfgPath, orig); }

const MIME={'.html':'text/html','.js':'application/javascript','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon'};
const server = http.createServer((req,res)=>{
  let f = path.join(OUT, decodeURIComponent(req.url.split('?')[0]));
  try { if (fs.statSync(f).isDirectory()) f = path.join(f,'index.html'); } catch(e){}
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, {'Content-Type': MIME[path.extname(f)]||'text/plain'});
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r=>server.listen(8098,r));
  const browser = await chromium.launch({ executablePath: chromePath() });
  const ctx = await browser.newContext({ viewport:{width:1280,height:900} });

  // broad stub FIRST
  await ctx.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith('http://localhost:8098')) return route.continue();
    return route.fulfill({ status:200, contentType:'application/javascript', body:'/* stub */' });
  });
  // specific handlers AFTER
  let webhookBody = null, webhookCalls = 0;
  await ctx.route('**services.leadconnectorhq.com/**', route => {
    webhookCalls++;
    try { webhookBody = JSON.parse(route.request().postData() || '{}'); } catch(e){}
    return route.fulfill({ status:200, contentType:'application/json', body:'{"ok":true}' });
  });
  await ctx.route('**googletagmanager.com/**', route =>
    route.fulfill({ status:200, contentType:'application/javascript', body:'window.__gtagLoaded=true;' }));
  await ctx.route('**backend.leadconnectorhq.com/**', route =>
    route.fulfill({ status:200, contentType:'application/javascript', body:'window.__dniLoaded=true;' }));
  /* Fraud Blocker ships two tags: fbt.js on every page view, ctrack.js only on
     a conversion. Counting them separately is the whole point — ctrack firing
     on a page view would report a conversion for every visitor. */
  let fbtHits = 0, ctrackHits = 0;
  await ctx.route('**fraudblocker.com/**', route => {
    if (route.request().url().includes('ctrack')) ctrackHits++; else fbtHits++;
    return route.fulfill({ status:200, contentType:'application/javascript', body:'/* stub */' });
  });
  /* The leads-app copy. Counted and captured separately from the CRM post
     because the whole point of it is that the two carry the SAME payload by a
     different route — HighLevel strips gclid on the way through, so the app's
     copy of a lead is the only one that still knows which click paid for it. */
  let appBody = null, appCalls = 0, appUrl = '';
  await ctx.route('**glassleads.app/**', route => {
    if (route.request().method() === 'OPTIONS')
      return route.fulfill({ status:204, headers:{'access-control-allow-origin':'*','access-control-allow-headers':'content-type'} });
    appCalls++;
    appUrl = route.request().url();
    try { appBody = JSON.parse(route.request().postData() || '{}'); } catch(e){}
    return route.fulfill({ status:200, contentType:'application/json',
      headers:{'access-control-allow-origin':'*'}, body:'{"ok":true}' });
  });

  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:8098/' + TEST_SLUG + '?gclid=TEST123&utm_source=google&utm_medium=cpc&utm_campaign=test-campaign&utm_term=test+term&utm_content=rsa1', {waitUntil:'load'});
  await page.waitForTimeout(300);

  // ---- config assertions ----
  const dl = await page.evaluate(() => (window.dataLayer||[]).map(a => Array.from(a)));
  const cfgEvt = dl.find(a => a[0]==='config' && String(a[1]).startsWith('AW-'));
  if (cfgEvt && cfgEvt[2] && cfgEvt[2].allow_enhanced_conversions === true) pass('gtag config has allow_enhanced_conversions:true');
  else fail('missing gtag config with allow_enhanced_conversions:true — ' + JSON.stringify(cfgEvt));
  if (await page.evaluate(()=>window.__gtagLoaded===true)) pass('gtag.js requested with the Ads ID');
  else fail('gtag.js was never requested');
  /* Call tracking is Google's now. The DNI script must be ABSENT: both it and
     Google's swap rewrite the same tel: links, so running the two means a call
     is attributed twice or to neither. */
  if (await page.evaluate(()=>window.__dniLoaded!==true)) pass('no HighLevel DNI script — Google owns call tracking');
  else fail('HighLevel DNI script loaded — it conflicts with Google number swapping');
  const callCfg = dl.find(a => a[0]==='config' && /\/.+/.test(String(a[1])) && a[2] && a[2].phone_conversion_number);
  if (callCfg) pass('calls-from-website config present: ' + callCfg[1]);
  else fail('no phone_conversion_number config — website calls would not be tracked');
  if (callCfg && callCfg[2].phone_conversion_css_class) {
    const cls = callCfg[2].phone_conversion_css_class;
    const n = await page.locator('.' + cls).count();
    if (n > 0) pass('swap scoped to .' + cls + ', ' + n + ' element(s) on the page');
    else fail('phone_conversion_css_class "' + cls + '" matches no element — Google would swap nothing');
  } else fail('phone_conversion_css_class missing — the footer identity line would be swapped too');

  // service pre-selected from the page's svcValue
  const svc = await page.inputValue('#svc');
  if (svc === TEST_SVC) pass('form pre-selects this page\'s service ('+svc+')');
  else fail('service dropdown not pre-selected, got: ' + svc);

  /* ---- bot trap, before anything touches the page ----
     A submit with no trusted pointerdown/keydown inside the form is a script.
     This has to run on a pristine page: Playwright's fill() and click() dispatch
     real trusted events, so any interaction here would satisfy the guard and the
     assertion would pass for the wrong reason. Values are set through the DOM
     and the submit is requested programmatically — exactly what a bot does. */
  await page.evaluate(() => {
    const set = (id, v) => { const e = document.getElementById(id); e.value = v;
      e.dispatchEvent(new Event('input', { bubbles:true })); };
    set('nm','Bot Script'); set('ph','7145550199'); set('em','bot@example.com');
    set('zip','92614'); set('veh','2021 Toyota RAV4');
    document.getElementById('quoteForm').requestSubmit();
  });
  await page.waitForTimeout(400);
  if (ctrackHits === 0) pass('Fraud Blocker conversion tag did NOT fire for a scripted submit');
  else fail('Fraud Blocker ctrack fired for a bot — ' + ctrackHits + ' hit(s)');
  if (webhookCalls === 0) pass('scripted submit with no user interaction is dropped (bot trap)');
  else fail('scripted submit reached the webhook — the interaction trap is not working');

  // ---- fill + submit as a real visitor ----
  await page.reload({ waitUntil:'load' });
  await page.fill('#nm','Alex Ramirez');
  await page.fill('#ph','7145550142');
  await page.fill('#em','alex@example.com');
  await page.fill('#zip','92614');
  await page.fill('#veh','2021 Toyota RAV4');   // now a required, always-visible field
  await page.click('#qcExpand');
  await page.check('#ins-y');
  await page.selectOption('#carrier','GEICO');
  await page.click('.qc-submit');
  await page.waitForTimeout(600);

  if (ctrackHits === 1) pass('Fraud Blocker conversion tag fired once on a real submit');
  else fail('expected 1 Fraud Blocker ctrack hit after a real submit, got ' + ctrackHits);
  if (fbtHits >= 1) pass('Fraud Blocker page tag loaded on view');
  else fail('Fraud Blocker fbt.js never loaded');
  if (await page.locator('#quoteSuccess.on').count()) pass('success panel shown after submit');
  else fail('success panel did not appear');

  // ---- webhook payload ----
  if (webhookCalls === 1) pass('webhook POSTed exactly once');
  else fail('webhook called ' + webhookCalls + ' times');
  const need = {gclid:'TEST123', utm_source:'google', utm_medium:'cpc', utm_campaign:'test-campaign',
                utm_term:'test term', utm_content:'rsa1', phone:'+17145550142',
                postal_code:'92614', email:'alex@example.com', carrier:'GEICO', insurance:'yes',
                service:TEST_SVC, page_path:'/' + TEST_SLUG};
  const bad = Object.entries(need).filter(([k,v]) => (webhookBody||{})[k] !== v);
  if (!bad.length) pass('webhook payload carries gclid, all 5 UTMs, E.164 phone, ZIP, carrier, service, page_path');
  else fail('webhook payload wrong: ' + JSON.stringify(bad) + ' got ' + JSON.stringify(webhookBody));
  if (appCalls === 1) pass('leads-app POSTed exactly once');
  else fail('leads-app called ' + appCalls + ' times');
  if (/[?&]client=TESTCLIENT\b/.test(appUrl)) pass('leads-app URL carries the client slug');
  else fail('leads-app URL has no client slug: ' + appUrl);
  /* Same object, not a reshaped one. The app reads every field from the payload
     root, so a rename or an extra nesting level here is a silent data loss. */
  if (appBody && JSON.stringify(appBody) === JSON.stringify(webhookBody))
    pass('leads-app got the identical payload, not a reshaped copy');
  else fail('leads-app payload differs from the CRM payload');
  /* The two fields the app cannot work without. gclid is the reason this post
     exists at all; landing_page is how the app tells "genuinely organic" from
     "attribution went missing" instead of guessing. */
  if (appBody && appBody.gclid === 'TEST123' && appBody.landing_page)
    pass('leads-app copy carries gclid and landing_page');
  else fail('leads-app copy is missing gclid or landing_page');
  if (webhookBody && webhookBody.landing_page && webhookBody.referrer !== undefined) pass('webhook carries landing_page + referrer');
  else fail('webhook missing landing_page/referrer');

  // ---- conversion assertions ----
  const dl2 = await page.evaluate(() => (window.dataLayer||[]).map(a => Array.from(a)));
  const ud = dl2.find(a => a[0]==='set' && a[1]==='user_data');
  if (ud && ud[2].email==='alex@example.com' && ud[2].phone_number==='+17145550142')
    pass('enhanced conversions: set user_data with email + E.164 phone');
  else fail('user_data wrong: ' + JSON.stringify(ud));
  const conv = dl2.filter(a => a[0]==='event' && a[1]==='conversion');
  if (conv.length === 1) pass('exactly one conversion event fired');
  else fail(conv.length + ' conversion events fired');
  const p = conv[0] && conv[0][2] || {};
  if (p.send_to === 'AW-TEST12345/TestLabel_abc') pass('send_to is AdsID/Label');
  else fail('send_to wrong: ' + p.send_to);
  if (String(p.transaction_id).includes('TEST123') && String(p.transaction_id).includes('7145550142'))
    pass('transaction_id leads with the gclid and the phone');
  else fail('transaction_id wrong: ' + p.transaction_id);
  if (p.value === 125 && p.currency === 'USD') pass('conversion carries value 125 USD');
  else fail('value/currency wrong: ' + JSON.stringify(p));

  // The form submit IS the conversion action, so the conversion is reported on
  // a validated submit and does NOT depend on the CRM accepting the lead. A GHL
  // outage must not blank the ad account's conversion feed. Assert the ordering
  // that proves it: conversion after generate_lead, before the POST resolves.
  const order = dl2.findIndex(a=>a[0]==='event'&&a[1]==='conversion');
  const gl = dl2.findIndex(a=>a[0]==='event'&&a[1]==='generate_lead');
  if (gl !== -1 && order > gl) pass('conversion fired on a validated submit, after generate_lead');
  else fail('conversion ordering suspect');

  // ---- dedupe: resubmit in a fresh page, same session storage ----
  const page2 = page;   // same tab: sessionStorage is per-tab by design
  await page2.goto('http://localhost:8098/?utm_source=google', {waitUntil:'load'});
  await page2.fill('#nm','Alex Ramirez'); await page2.fill('#ph','7145550142');
  await page2.fill('#em','alex@example.com'); await page2.fill('#zip','92614');
  await page2.fill('#veh','2021 Toyota RAV4');
  await page2.click('.qc-submit'); await page2.waitForTimeout(600);
  const dl3 = await page2.evaluate(() => (window.dataLayer||[]).map(a=>Array.from(a)));
  const conv3 = dl3.filter(a => a[0]==='event' && a[1]==='conversion');
  /* Repeat submissions COUNT. Client's decision: every form submit is a
     conversion, including a second one from the same person. */
  if (conv3.length === 1) pass('resubmit by the same person fires a second conversion (no dedupe)');
  else fail('expected 1 conversion on resubmit, got ' + conv3.length);
  /* ...and it must carry a DIFFERENT transaction_id, or Google Ads discards it
     server-side and the browser-side result above proves nothing. */
  const t1 = p.transaction_id, t2 = conv3[0] && conv3[0][2] && conv3[0][2].transaction_id;
  if (t1 && t2 && t1 !== t2) pass('resubmit carries a fresh transaction_id (Google will not dedupe it)');
  else fail('transaction_id repeated across submissions: ' + t1 + ' / ' + t2);
  // attribution survived navigation to a different page
  const attr = await page2.evaluate(()=>JSON.parse(sessionStorage.getItem('lp_attr')||'{}'));
  if (attr.gclid === 'TEST123' && attr.utm_campaign === 'test-campaign' && attr.utm_term === 'test term')
    pass('attribution persisted across pages via sessionStorage (utm_campaign survived a URL without it)');
  else fail('attribution did not persist: ' + JSON.stringify(attr));

  /* ---- CRM outage: the conversion must still be reported ----
     The form submit is the conversion action, so a GHL failure costs the lead
     but must not cost the ad signal — that is exactly when smart bidding needs
     it. Fresh context so the dedupe store is empty, and a different phone so
     the transaction_id differs from the submissions above. */
  const ctx3 = await browser.newContext({ viewport:{width:1280,height:900} });
  await ctx3.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith('http://localhost:8098')) return route.continue();
    return route.fulfill({ status:200, contentType:'application/javascript', body:'/* stub */' });
  });
  let downCalls = 0;
  await ctx3.route('**services.leadconnectorhq.com/**', route => {
    downCalls++;
    return route.fulfill({ status:502, contentType:'text/plain', body:'Bad Gateway' });
  });
  await ctx3.route('**googletagmanager.com/**', route =>
    route.fulfill({ status:200, contentType:'application/javascript', body:'window.__gtagLoaded=true;' }));
  const page3 = await ctx3.newPage();
  await page3.goto('http://localhost:8098/?gclid=TEST999', {waitUntil:'load'});
  await page3.fill('#nm','Jordan Blake');
  await page3.fill('#ph','7145550188');
  await page3.fill('#em','jordan@example.com');
  await page3.fill('#zip','92614');
  await page3.fill('#veh','2019 Honda CR-V');
  await page3.click('.qc-submit');
  await page3.waitForTimeout(900);

  const dl4 = await page3.evaluate(() => (window.dataLayer||[]).map(a=>Array.from(a)));
  const conv4 = dl4.filter(a => a[0]==='event' && a[1]==='conversion');
  if (downCalls >= 1) pass('webhook was attempted even though it is failing');
  else fail('webhook never attempted in the outage case');
  if (conv4.length === 1) pass('CRM returned 502 — conversion STILL reported (form submit is the conversion)');
  else fail('expected exactly 1 conversion during a CRM outage, got ' + conv4.length);
  if (await page3.locator('#quoteSuccess.on').count() === 0)
    pass('CRM outage still shows the error state, not a false success');
  else fail('showed success despite the webhook failing');
  await ctx3.close();

  /* ---- the leads app is down, the CRM is fine ----
     This is the assertion the whole additive design exists for. The app post
     swallows its own errors by construction, so if it could ever reach the
     visible form the symptom would be an intermittent form failure with no
     trace of a cause — the form would break for a reason nobody would think to
     look for. Prove instead that a hard failure changes nothing: success panel,
     conversion, and CRM delivery all exactly as in the healthy case.

     route.abort() rather than a 500, deliberately. A rejected CORS preflight or
     a DNS failure surfaces as a rejected promise, which is the harsher of the
     two paths and the one a status-code stub would not exercise. */
  const ctx5 = await browser.newContext({ viewport:{width:1280,height:900} });
  await ctx5.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith('http://localhost:8098')) return route.continue();
    return route.fulfill({ status:200, contentType:'application/javascript', body:'/* stub */' });
  });
  let crmCalls5 = 0;
  await ctx5.route('**services.leadconnectorhq.com/**', route => {
    crmCalls5++;
    return route.fulfill({ status:200, contentType:'application/json', body:'{"ok":true}' });
  });
  await ctx5.route('**googletagmanager.com/**', route =>
    route.fulfill({ status:200, contentType:'application/javascript', body:'window.__gtagLoaded=true;' }));
  await ctx5.route('**glassleads.app/**', route => route.abort('failed'));
  const page5 = await ctx5.newPage();
  const errs5 = [];
  page5.on('pageerror', e => errs5.push(e.message));
  await page5.goto('http://localhost:8098/?gclid=TEST555', {waitUntil:'load'});
  await page5.fill('#nm','Sam Okafor');
  await page5.fill('#ph','7145550199');
  await page5.fill('#em','sam@example.com');
  await page5.fill('#zip','92614');
  await page5.fill('#veh','2020 Subaru Outback');
  await page5.click('.qc-submit');
  await page5.waitForTimeout(900);

  if (await page5.locator('#quoteSuccess.on').count()) pass('leads-app down — success panel still shown');
  else fail('leads-app failure broke the success screen');
  if (crmCalls5 === 1) pass('leads-app down — CRM still received the lead');
  else fail('leads-app failure changed CRM delivery: ' + crmCalls5 + ' call(s)');
  const dl5 = await page5.evaluate(() => (window.dataLayer||[]).map(a=>Array.from(a)));
  if (dl5.filter(a => a[0]==='event' && a[1]==='conversion').length === 1)
    pass('leads-app down — conversion still reported exactly once');
  else fail('leads-app failure changed conversion reporting');
  /* An unhandled rejection here would surface in the console as an error and,
     on a page with error reporting wired up, as a false alarm every submit. */
  if (!errs5.length) pass('leads-app failure raised no page error');
  else fail('leads-app failure raised page errors: ' + errs5.join('; '));
  await ctx5.close();

  if (!errs.length) pass('no page errors'); else fail('page errors: ' + errs.join('; '));
  await browser.close(); server.close();
  console.log(results.join('\n'));
  console.log(results.some(r=>r.startsWith('FAIL')) ? '\nTRACKING: FAILED' : '\nTRACKING: ALL PASS');
})();
