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
  name: 'CAG | Windshield Replacement — Core',
  page: '/windshield-replacement',
  share: '~28%',
  paths: ['Windshield', 'Replacement'],
  note: 'Highest intent and highest value. Bid up on mobile devices — a cracked windshield is searched from the driveway, not the desk.',
  keywords: [
    '[windshield replacement portland]',
    '[windshield replacement near me]',
    '[replace windshield portland or]',
    '"windshield replacement cost"',
    '"mobile windshield replacement"',
    '"auto glass replacement portland"'
  ],
  headlines: [
    'Windshield Replacement',
    'Portland Metro Auto Glass',
    'Windshield Replacement OR',
    'We Come To You, No Charge',
    'Free Mobile Auto Glass',
    'Family Owned Since 2008',
    'ADAS Calibration Included',
    'Camera Recalibrated Onsite',
    'Two Portland Metro Shops',
    'Your Insurer Billed Direct',
    'Repair Or Replace? We Say',
    'Cedar Mill & Tualatin Shops'
  ],
  descriptions: [
    'New glass fitted properly, and the camera behind it recalibrated in the same visit.',
    'Family owned in the Portland metro since 2008. Two shops, and vans working from both.',
    'Free mobile service across the metro. We come to your home or your workplace.',
    'We bill your insurer directly. Tell us the year, make and model for a real quote.'
  ]
},
{
  name: 'CAG | Chip & Crack Repair',
  page: '/windshield-repair',
  share: '~14%',
  paths: ['Windshield', 'Repair'],
  note: 'Lower ticket than replacement but converts well and generates replacement work later. Runs hardest Nov–Mar, when studded tires are legal and the roads shed aggregate.',
  keywords: [
    '[windshield repair portland]',
    '[rock chip repair portland]',
    '[windshield chip repair near me]',
    '"windshield crack repair"',
    '"fix windshield chip"',
    '"mobile chip repair"'
  ],
  headlines: [
    'Windshield Chip Repair',
    'Rock Chip Repair Portland',
    'Windshield Crack Repair',
    'Cheaper Than New Glass',
    'We Tell You If It Is Fixable',
    'Mobile Chip Repair, Free',
    'Keep Your Factory Glass',
    'Send A Photo, Get An Answer',
    'Family Owned Since 2008',
    'Portland Metro Auto Glass',
    'Fixed Before It Spreads',
    'Chip Repair At Your Office'
  ],
  descriptions: [
    'Resin injection while the damage is still small enough for it to actually work.',
    'Send a photo with a coin for scale and we will tell you repair or replace.',
    'Keeping your original factory seal beats any replacement. Worth acting early.',
    'Free mobile service across the Portland metro. Home, office or park and ride.'
  ]
},
{
  name: 'CAG | ADAS Calibration',
  page: '/adas-calibration',
  share: '~10%',
  paths: ['ADAS', 'Calibration'],
  note: 'Differentiator group. Most local glass shops subcontract this, so the in-house angle is the whole pitch. Also catches body shops looking for a calibration partner.',
  keywords: [
    '[adas calibration portland]',
    '[windshield camera calibration]',
    '[adas calibration near me]',
    '"lane assist calibration"',
    '"forward camera recalibration"',
    '"adas calibration cost"'
  ],
  headlines: [
    'ADAS Calibration Portland',
    'Windshield Camera Aiming',
    'Calibration Done In House',
    'Not Sent To Another Shop',
    'Autel MaxiSYS Calibration',
    'Lane Assist Recalibrated',
    'One Visit, Glass And Camera',
    'Static And Dynamic Both',
    'Portland Metro Calibration',
    'We Show You The Result',
    'Family Owned Since 2008',
    'Cedar Mill & Tualatin Shops'
  ],
  descriptions: [
    'New glass means the camera behind it is looking through a new optical path.',
    'We calibrate in house on an Autel MaxiSYS. One appointment, one company answerable.',
    'Most systems cannot detect their own aim is off. No warning light is not proof.',
    'Ask any shop whether calibration happens under their roof or gets sent out.'
  ]
},
{
  name: 'CAG | Mobile Service',
  page: '/mobile-service',
  share: '~10%',
  paths: ['Mobile', 'Auto-Glass'],
  note: 'Convenience intent rather than damage intent. Works well against park-and-ride and workplace-parking searches on the Westside.',
  keywords: [
    '[mobile auto glass portland]',
    '[mobile windshield replacement]',
    '[mobile auto glass near me]',
    '"they come to you windshield"',
    '"auto glass at my house"',
    '"mobile windshield service or"'
  ],
  headlines: [
    'Mobile Auto Glass Service',
    'We Come To You, No Charge',
    'Glass Done At Your Office',
    'Free Mobile Across Metro',
    'Home, Work Or Park And Ride',
    'No Extra Cost To Come Out',
    'Portland Metro Mobile Glass',
    'Vans From Two Shops',
    'Family Owned Since 2008',
    'We Bring The Glass To You',
    'Book A Mobile Visit Today',
    'Driveway Or Car Park, Fine'
  ],
  descriptions: [
    'The van carries the glass, the urethane and the scan tool. Most jobs never see a shop.',
    'Free mobile service inside our area. It is on the van and it has been for years.',
    'We need level ground and room to open both front doors. That is genuinely it.',
    'Where a job belongs indoors we will say so and bring it in. That costs no extra.'
  ]
},
{
  name: 'CAG | Side & Door Glass',
  page: '/car-window-replacement',
  share: '~9%',
  paths: ['Side-Glass', 'Replacement'],
  note: 'Urgency group — a broken side window means an open car. Expect short lead times and higher conversion. Worth a bid uplift in the morning.',
  keywords: [
    '[car window replacement portland]',
    '[door glass replacement near me]',
    '[side window replacement]',
    '"broken car window"',
    '"car window smashed"',
    '"window regulator repair portland"'
  ],
  headlines: [
    'Car Window Replacement',
    'Door Glass Replacement',
    'Broken Side Window?',
    'We Clear The Door Cavity',
    'Portland Metro Side Glass',
    'Car Broken Into? Call Us',
    'Sealed Up Then Replaced',
    'Window Wont Go Up?',
    'Regulator And Motor Repair',
    'Family Owned Since 2008',
    'Mobile Side Glass Service',
    'Glass Vacuumed From Door'
  ],
  descriptions: [
    'Fitting the glass is the easy half. Getting the old glass out of the door is the job.',
    'Fragments block the door drains, and a door that cannot drain rusts from the inside.',
    'Broken into overnight? Say so when you call. We can get it weathertight quickly.',
    'Sometimes it is the regulator rather than the glass. We check before ordering parts.'
  ]
},
{
  name: 'CAG | Back Glass',
  page: '/back-glass-repair',
  share: '~5%',
  paths: ['Back-Glass', 'Replacement'],
  note: 'Small volume, high ticket. The defroster and antenna angle is what separates a competent quote from a cheap one.',
  keywords: [
    '[back glass replacement portland]',
    '[rear window replacement near me]',
    '[back windshield replacement]',
    '"rear window shattered"',
    '"back glass defroster replacement"'
  ],
  headlines: [
    'Back Glass Replacement',
    'Rear Window Replacement',
    'Defroster Grid Reconnected',
    'Antenna Reconnected Too',
    'Portland Metro Back Glass',
    'Rear Window Shattered?',
    'We Clear The Load Area',
    'Family Owned Since 2008',
    'Two Portland Metro Shops',
    'Bonded Glass Done Right',
    'Test It Before We Leave',
    'Mobile Or In Our Shop'
  ],
  descriptions: [
    'Your rear window usually carries the defroster grid and often the radio antenna.',
    'Both get reconnected, and you should test both with us there before we leave.',
    'Tempered glass goes everywhere. Clearing the load area takes longer than the glass.',
    'Bonded like a windshield, so it has a cure time. We often bring these into the shop.'
  ]
},
{
  name: 'CAG | GEO — Portland',
  page: '/auto-glass-repair-portland',
  share: '~8%',
  paths: ['Portland', 'Auto-Glass'],
  note: 'City-modified queries. Note we have no premises inside Portland city limits and the page says so — do not write copy implying a Portland shop.',
  keywords: [
    '[auto glass repair portland]',
    '[windshield repair portland or]',
    '[auto glass portland oregon]',
    '"portland windshield replacement"',
    '"auto glass shop portland"'
  ],
  headlines: [
    'Auto Glass Repair Portland',
    'Portland Windshield Repair',
    'Windshield Replacement PDX',
    'We Come To You In Portland',
    'Kerbside Parking Is Fine',
    'Portland Mobile Auto Glass',
    'No Driveway? Not A Problem',
    'Family Owned Since 2008',
    'Free Mobile Service',
    'ADAS Calibration In House',
    'Your Insurer Billed Direct',
    'Chip Repair Across Portland'
  ],
  descriptions: [
    'Most Portland customers have no driveway. Kerbside work is what we do most often.',
    'We need a legal space with room to open both front doors and stand at the front.',
    'Our shops are in Cedar Mill and Tualatin, and the vans come to you at no extra cost.',
    'Broken into overnight? Tell us when you call and we will get it sealed first.'
  ]
},
{
  name: 'CAG | GEO — Beaverton',
  page: '/auto-glass-repair-beaverton',
  share: '~6%',
  paths: ['Beaverton', 'Auto-Glass'],
  note: 'Closest geo to the Cedar Mill shop. Park-and-ride and apartment-lot angles convert well here.',
  keywords: [
    '[auto glass repair beaverton]',
    '[windshield replacement beaverton]',
    '[auto glass beaverton or]',
    '"beaverton windshield repair"'
  ],
  headlines: [
    'Auto Glass Beaverton OR',
    'Beaverton Windshield Repair',
    'Windshield Replacement',
    'Shop Just Off Highway 26',
    'We Come To You In Beaverton',
    'Glass Done At The Park&Ride',
    'Chips From The 217?',
    'Family Owned Since 2008',
    'Free Mobile Auto Glass',
    'ADAS Calibration In House',
    'Your Insurer Billed Direct',
    'Apartment Car Parks Fine'
  ],
  descriptions: [
    'Seven miles of commuter freeway run through this town, and our work follows it.',
    'Left at a park and ride all day? That is close to a perfect mobile appointment.',
    'Our Cedar Mill shop sits just off the Sunset Highway at the top of the 217.',
    'Check with your property manager first if the car lives in a shared apartment lot.'
  ]
},
{
  name: 'CAG | GEO — Hillsboro',
  page: '/auto-glass-repair-hillsboro',
  share: '~5%',
  paths: ['Hillsboro', 'Auto-Glass'],
  note: 'Long-shift employment means cars sit in one place for ten or twelve hours, which suits a job with a cure time. Lean on that rather than on employer names.',
  keywords: [
    '[auto glass repair hillsboro]',
    '[windshield replacement hillsboro]',
    '[auto glass hillsboro or]',
    '"hillsboro windshield repair"'
  ],
  headlines: [
    'Auto Glass Hillsboro OR',
    'Hillsboro Windshield Repair',
    'Windshield Replacement',
    'We Come To Your Car Park',
    'Done While You Are On Shift',
    'Free Mobile Auto Glass',
    'Family Owned Since 2008',
    'Chips From The Valley Roads',
    'ADAS Calibration In House',
    'Forest Grove & Cornelius Too',
    'Your Insurer Billed Direct',
    'Rural Addresses Covered'
  ],
  descriptions: [
    'A car parked in one spot for a twelve hour shift is an easy job with a cure time.',
    'Gravel shoulders west of town throw bigger, sharper material than metro pavement.',
    'We cover Hillsboro, Forest Grove, Cornelius and the rural addresses around them.',
    'Check site access first. Larger campuses often have gated or badge-only parking.'
  ]
},
{
  name: 'CAG | GEO — Tualatin',
  page: '/auto-glass-repair-tualatin',
  share: '~3%',
  paths: ['Tualatin', 'Auto-Glass'],
  note: 'Our second shop is here, so this is the one geo where in-shop is genuinely convenient. Fleet and commercial intent is worth catching.',
  keywords: [
    '[auto glass repair tualatin]',
    '[windshield replacement tualatin]',
    '[auto glass tualatin or]',
    '"tualatin windshield repair"'
  ],
  headlines: [
    'Auto Glass Tualatin OR',
    'Tualatin Windshield Repair',
    'Our Shop Is In Tualatin',
    'On SW Mohave Court',
    'Drive In Or We Come To You',
    'Windshield Replacement',
    'Family Owned Since 2008',
    'Fleet And Commercial Glass',
    'ADAS Calibration In House',
    'Free Mobile Auto Glass',
    'Sherwood & Wilsonville Too',
    'Your Insurer Billed Direct'
  ],
  descriptions: [
    'Our second shop is at 19390 SW Mohave Ct, with easy access from Interstate 5.',
    'Local enough that in shop and mobile cost you about the same in time either way.',
    'If a mobile job needs a bay, moving it indoors is a short drive rather than a delay.',
    'Vans, box trucks and light commercial are a normal part of the week here.'
  ]
},
{
  name: 'CAG | GEO — Lake Oswego',
  page: '/auto-glass-repair-lake-oswego',
  share: '~2%',
  paths: ['Lake-Oswego', 'Glass'],
  note: 'Low volume, high vehicle value. The hillside-driveway and calibration angle is honest and differentiates from shops that would just do it on the slope.',
  keywords: [
    '[auto glass repair lake oswego]',
    '[windshield replacement lake oswego]',
    '"lake oswego windshield repair"'
  ],
  headlines: [
    'Auto Glass Lake Oswego',
    'Lake Oswego Windshield',
    'Windshield Replacement',
    'Steep Driveway? We Plan It',
    'Calibration Needs Level Ground',
    'We Come To You In LO',
    'Family Owned Since 2008',
    'Free Mobile Auto Glass',
    'ADAS Calibration In House',
    'West Linn Covered Too',
    'Your Insurer Billed Direct',
    'Tualatin Shop Is Close By'
  ],
  descriptions: [
    'A static calibration needs genuinely level ground. A sloping driveway cannot give it.',
    'Equipment will often still return a result on a slope, and that is the danger.',
    'Heavy tree cover means drips and pollen landing on a bond meant to last for years.',
    'A cleared garage works well here. Level, dry, sheltered and out of the tree canopy.'
  ]
}
];

/* Negative keyword lists, applied at campaign level. The waste list is where
   most of the saved budget is: search-terms reports on a new account are
   dominated by adjacent products, DIY intent, job seekers and trade supply.

   The geo-confusion list matters more than it looks. Nearly every US city name
   is shared with somewhere else, and a same-named city in another state will
   quietly eat budget for months.

   PORTLAND IS THE WORST CASE IN THE COUNTRY for this. Portland, Maine is a
   large, heavily-searched city with the same name, and an unnegated "auto glass
   Portland" campaign will serve there. Aloha is the second trap: it is a real
   Washington County community and also the most common word in Hawaii tourism
   queries. Both are non-optional. */
const SHARED_NEGATIVES = {
  'NEG — Global Waste': [
    'jobs', 'hiring', 'salary', 'careers', 'training', 'course', 'school', 'apprentice',
    'wholesale', 'supplier', 'distributor', 'how to', 'diy', 'kit', 'resin kit',
    'youtube', 'used', 'junkyard', 'salvage', 'pick n pull',
    'tint', 'tinting', 'ceramic coating', 'detailing', 'car wash',
    'body shop', 'paintless dent', 'bumper repair', 'collision repair', 'auto body',
    'car insurance', 'insurance quote', 'cheap insurance',
    'plexiglass', 'plate glass', 'window glass house', 'shower door', 'glazier',
    'for sale', 'rental', 'lease'
  ],
  'NEG — Geo Confusion': [
    'maine', 'portland maine', 'portland me', 'portland or maine',
    'texas', 'portland texas', 'portland tx',
    'hillsboro texas', 'hillsboro tx', 'hillsboro ohio', 'hillsboro oh',
    'beaverton michigan', 'beaverton mi',
    'sherwood arkansas', 'sherwood ar',
    'hawaii', 'honolulu', 'oahu', 'maui',
    'vancouver wa', 'washington state', 'seattle'
  ]
};

/* Every targeted city and area name, phrase-negative in the service ad groups so
   that geo-modified queries route to the geo ad group and its matching page
   instead of being answered by a generic service page.

   NOTE: 'collision' is deliberately absent even though it is in the business
   name — negating it would block brand searches. It belongs in the waste list
   only as part of 'collision repair', which is a different trade. */
const ROUTING_NEGATIVES = [
  'portland', 'beaverton', 'hillsboro', 'tualatin', 'lake oswego',
  'tigard', 'aloha', 'sherwood', 'wilsonville', 'west linn',
  'cornelius', 'newberg', 'forest grove', 'cedar mill'
];

const SITELINKS = [
  ['Windshield Replacement', 'New glass, set by two people', 'Camera recalibrated too', '/windshield-replacement'],
  ['Chip & Crack Repair', 'Far cheaper than replacing', 'If it is still repairable', '/windshield-repair'],
  ['ADAS Calibration', 'Autel MaxiSYS, in our shop', 'Never sent to a third shop', '/adas-calibration'],
  ['Free Mobile Service', 'We come to your car', 'Home, work or park and ride', '/mobile-service'],
  ['Insurance Claims', 'We bill your insurer direct', 'Oregon law: you pick the shop', '/auto-insurance'],
  ['Side & Door Glass', 'Broken window sorted fast', 'Door cavity cleared properly', '/car-window-replacement']
];

const CALLOUTS = [
  'Free mobile service', 'Family owned since 2008', 'Two Portland metro shops',
  'ADAS calibration in house', 'Insurance billed direct', 'Repair or replace advice'
];

const SNIPPETS = [
  'Windshield replacement', 'Chip and crack repair', 'ADAS calibration',
  'Side and door glass', 'Back glass', 'RV glass'
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

put('### Routing negatives — add to every non-geo (service) ad group',
    '',
    'Service and geo ad groups share one campaign, so they compete for geo-modified',
    'queries. These force "windshield replacement beaverton" into the Beaverton ad',
    'group and onto the Beaverton page, which is what earns the ad relevance and',
    'landing page experience components of Quality Score.',
    '');
block(ROUTING_NEGATIVES.map((w) => '"' + w + '"'));
put('In each GEO ad group, add the OTHER cities as phrase negatives but not its own —',
    'otherwise the group cannot serve for the name it exists to answer.',
    '',
    'One deliberate omission: `"collision"` is NOT a routing negative, even though it',
    'is the first word of the business name. Negating it would block brand searches.',
    'It appears in the waste list only inside `"collision repair"`, which is a',
    'different trade and a different customer.',
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
