#!/usr/bin/env node
/* Emits docs/google-ads-build-sheet.md — the paste-ready version of the plan in
 * docs/google-ads-launch.md. That doc explains the reasoning; this one is just
 * blocks you copy into the Google Ads UI, ad group by ad group.
 *
 * The RSA assets live here rather than in the markdown so they can be length-
 * checked on every run. Google silently truncates nothing — it rejects the
 * asset — so an over-length headline is a build error, not a warning.
 *
 *   node landing/ads-sheet.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const cfg = require('./pages.config.cjs');

const ORIGIN = 'https://' + cfg.site.domain;
const LIM = { headline: 30, description: 90, path: 15 };

/* ------------------------------------------------------------------ content
 *
 * This is the campaign, as data. It is here rather than in the markdown so that
 * every asset gets length-checked and compliance-checked on each run — Google
 * does not truncate an over-length headline, it rejects the asset, so an
 * over-length headline is a build error rather than a warning.
 *
 * WRITE THIS PER CLIENT. Do not carry another client's headlines across: two
 * shops in the same trade and market bidding identical copy compete with each
 * other and both look generic. A full worked example — 10 ad groups, 99
 * keywords, 141 headlines — lives in the speedyla repo if you want a model for
 * the shape and the density.
 *
 * Structure per group:
 *   name         'SVC | Thing — Angle' or 'GEO | Place'. The prefix is what
 *                makes the account navigable at 20+ groups.
 *   page         final URL path. Must be a page that actually built.
 *   share        rough budget share, for the plan doc.
 *   paths        the two display-URL path segments, ≤15 chars each.
 *   note         why this group exists and how to bid it.
 *   keywords     12ish. [exact] for head terms, "phrase" for the tail.
 *   headlines    12–15, each ≤30 chars, no duplicates within the group.
 *   descriptions exactly 4, each ≤90 chars.
 */

const GROUPS = [
{
  name: 'REPLACE__SVC | Primary Service — Core',
  page: '/REPLACE__service-one',
  share: '~25%',
  paths: ['REPLACE__Path1', 'REPLACE__Path2'],
  note: 'REPLACE__Why this group exists and any bid adjustment worth making.',
  keywords: [
    '[REPLACE__head term]',
    '[REPLACE__head term near me]',
    '"REPLACE__phrase term"'
  ],
  headlines: [
    'REPLACE__Headline 1',
    'REPLACE__Headline 2',
    'REPLACE__Headline 3',
    'REPLACE__Headline 4',
    'REPLACE__Headline 5',
    'REPLACE__Headline 6',
    'REPLACE__Headline 7',
    'REPLACE__Headline 8',
    'REPLACE__Headline 9',
    'REPLACE__Headline 10',
    'REPLACE__Headline 11',
    'REPLACE__Headline 12'
  ],
  descriptions: [
    'REPLACE__Description 1, up to ninety characters.',
    'REPLACE__Description 2.',
    'REPLACE__Description 3.',
    'REPLACE__Description 4.'
  ]
}
];

/* Negative keyword lists, applied at campaign level. The waste list is where
   most of the saved budget is: search-terms reports on a new account are
   dominated by adjacent products, DIY intent, job seekers and trade supply.

   The geo-confusion list matters more than it looks. Nearly every US city name
   is shared with somewhere else, and a same-named city in another state will
   quietly eat budget for months. Check each of the client's target cities. */
const SHARED_NEGATIVES = {
  'NEG — Global Waste': [
    'REPLACE__adjacent product', 'REPLACE__diy intent', 'jobs', 'hiring', 'salary',
    'training', 'course', 'school', 'wholesale', 'supplier', 'distributor', 'how to'
  ],
  'NEG — Geo Confusion': [
    'REPLACE__same city name, other state'
  ]
};

/* Every targeted city and area name, phrase-negative in the service ad groups so
   that geo-modified queries route to the geo ad group and its matching page
   instead of being answered by a generic service page. */
const ROUTING_NEGATIVES = ['REPLACE__city', 'REPLACE__area'];

const SITELINKS = [
  ['REPLACE__Sitelink', 'REPLACE__Description line 1', 'REPLACE__Description line 2', '/REPLACE__service-one']
];

const CALLOUTS = [
  'REPLACE__Callout one', 'REPLACE__Callout two', 'REPLACE__Callout three', 'REPLACE__Callout four'
];

const SNIPPETS = [
  'REPLACE__Service one', 'REPLACE__Service two', 'REPLACE__Service three'
];

/* ------------------------------------------------------------- validation */

let failures = 0;
const bad = (m) => { console.error('FAIL ' + m); failures++; };

/* Google rejects an over-length asset outright, so treat it as a build error. */
for (const g of GROUPS) {
  const seen = new Set();
  for (const h of g.headlines) {
    if (h.length > LIM.headline) bad(`headline ${h.length}/${LIM.headline} — "${h}" (${g.name})`);
    if (seen.has(h)) bad(`duplicate headline "${h}" (${g.name})`);
    seen.add(h);
  }
  for (const d of g.descriptions) {
    if (d.length > LIM.description) bad(`description ${d.length}/${LIM.description} — "${d}" (${g.name})`);
  }
  for (const p of g.paths) {
    if (p.length > LIM.path) bad(`path ${p.length}/${LIM.path} — "${p}" (${g.name})`);
  }
  if (g.headlines.length < 12) bad(`${g.name} has only ${g.headlines.length} headlines (Google wants 12–15)`);
  if (g.descriptions.length !== 4) bad(`${g.name} has ${g.descriptions.length} descriptions, expected 4`);

  /* Every final URL must be a page that actually built. A 404 behind a live ad
     burns budget silently and tanks the landing page experience score. */
  const out = path.join(__dirname, '..', 'quote-site', g.page.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(out)) bad(`${g.name} points at ${g.page} which does not exist in quote-site/`);
}

/* Compliance. The patterns live in pages.config.cjs so they move with the
   client's state and trade — a rule written for California auto glass is not a
   rule for a Texas roofer, and a checker that quietly tests the wrong thing is
   worse than no checker.
     banned  [regex source, what it is] pairs, tested against every headline and
             description in the account.
     allowed exact strings that trip a pattern but are defensible, each with a
             reason recorded in the config beside it. */
const AD = (cfg.site.compliance && cfg.site.compliance.adClaims) || {};
const ALLOWED = new Set(AD.allowed || []);
const BANNED = (AD.banned || []).map(([src, what]) => [new RegExp(src, 'i'), what]);
if (!BANNED.length) {
  console.error('FAIL site.compliance.adClaims.banned is empty — every account has ' +
                'claims it must not make. Write them before generating a sheet.');
  process.exit(1);
}
for (const g of GROUPS) {
  for (const s of g.headlines.concat(g.descriptions)) {
    if (ALLOWED.has(s)) continue;
    for (const [re, what] of BANNED) {
      if (re.test(s)) bad(`${what} in "${s}" (${g.name})`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} problem(s) — sheet not written.`);
  process.exit(1);
}

/* ---------------------------------------------------------------- emit */

const L = [];
const put = (...x) => L.push(...x);
const block = (lines) => put('```', ...lines, '```', '');

put('# Google Ads — paste sheet',
    '',
    'Generated by `landing/ads-sheet.cjs`. Every headline, description and path in here',
    'is length-checked against Google\'s limits and scanned against the ad copy rules on',
    'each run, and every final URL is checked to exist in `quote-site/`.',
    '',
    'The reasoning behind these choices is in `docs/google-ads-launch.md` — this file is',
    'just the blocks to copy.',
    '',
    '**Campaign:** `SRCH | OC+LAC | Core Glass` · Search only · $150/day · Maximize Clicks',
    'with a ~$12 CPC ceiling · Presence-only location targeting · Search Partners and',
    'Display expansion OFF.',
    '',
    '> Paste keywords into the Google Ads keyword box as-is — it reads one per line and',
    '> understands `[exact]` and `"phrase"`. Headlines and descriptions have to go in one',
    '> field at a time; they are listed in the order to enter them.',
    '',
    '---',
    '');

GROUPS.forEach((g, i) => {
  put(`## ${i + 1}. ${g.name}`,
      '',
      `**Final URL** — paste into the ad group's ad:`,
      '');
  block([ORIGIN + g.page]);
  put(`**Display path** (the two boxes after the domain): \`${g.paths[0]}\` and \`${g.paths[1]}\``,
      '',
      `**Budget share:** ${g.share}`,
      '');
  if (g.note) put('> ' + g.note, '');

  put(`### Keywords (${g.keywords.length})`, '');
  block(g.keywords);

  if (g.negatives) {
    put(`### Ad group negatives (${g.negatives.length}) — add these to THIS ad group only`, '');
    block(g.negatives);
  }

  put(`### Headlines (${g.headlines.length}) — pin #1 to position 1, pin nothing else`, '');
  block(g.headlines);

  put(`### Descriptions (${g.descriptions.length})`, '');
  block(g.descriptions);

  put('---', '');
});

put('## Shared negative lists',
    '',
    'Build each as a shared list under Tools → Shared library → Negative keyword lists,',
    'then attach all three to the campaign.',
    '');
for (const [name, words] of Object.entries(SHARED_NEGATIVES)) {
  put(`### \`${name}\` (${words.length})`, '');
  block(words);
}

put('### Routing negatives — add to all seven SVC ad groups',
    '',
    'Service and geo ad groups share one campaign, so they compete for geo-modified',
    'queries. These force "windshield replacement irvine" into the Irvine ad group and',
    'onto the Irvine page, which is what earns the ad relevance and landing page',
    'experience components of Quality Score.',
    '');
block(ROUTING_NEGATIVES.map((w) => '"' + w + '"'));
put('Also add `"irvine"` to the two county hub ad groups, so the hubs do not outbid the',
    'city page for its own name.',
    '',
    '---',
    '');

put('## Campaign assets', '', '### Sitelinks', '');
put('| Text | Description 1 | Description 2 | Final URL |', '|---|---|---|---|');
for (const [t, d1, d2, u] of SITELINKS) put(`| ${t} | ${d1} | ${d2} | \`${ORIGIN}${u}\` |`);
put('');
put('### Callouts', '');
block(CALLOUTS);
put('### Structured snippet — header "Services"', '');
block(SNIPPETS);
put(`### Call asset`, '',
    `Use **${cfg.site.callAsset.formatted}** — the Google call-forwarding number, already`,
    'in the site footer and deliberately excluded from dynamic number insertion. Schedule',
    'it to real answering hours and turn call reporting on.',
    '');

const outFile = path.join(__dirname, '..', 'docs', 'google-ads-build-sheet.md');
fs.writeFileSync(outFile, L.join('\n').replace(/\n{3,}/g, '\n\n') + '\n');

const nH = GROUPS.reduce((n, g) => n + g.headlines.length, 0);
const nD = GROUPS.reduce((n, g) => n + g.descriptions.length, 0);
const nK = GROUPS.reduce((n, g) => n + g.keywords.length, 0);
console.log(`[ads-sheet] ${GROUPS.length} ad groups, ${nK} keywords, ${nH} headlines, ${nD} descriptions`);
console.log(`[ads-sheet] all assets within limits, all final URLs exist → ${path.relative(process.cwd(), outFile)}`);
