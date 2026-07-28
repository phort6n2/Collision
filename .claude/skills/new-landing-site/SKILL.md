---
name: new-landing-site
description: Build a new Google Ads landing site for a client from the phort6n2/landing-template generator, using la.speedywindshield.com as the layout model, or migrate a client off HighLevel landing pages without breaking their ad URLs. Use when asked to spin up a landing site for an auto glass shop or similar local service business, clone an existing client site for another client, or set up the GHL webhook, Google Ads conversion and call tracking for a new location.
---

# New client landing site

`phort6n2/landing-template` is the template: the machinery, plus a skeleton
config full of `REPLACE__` markers that the build refuses to ship.
**<https://la.speedywindshield.com>** is the reference build — use it as the
model for layout, section order, motion and density. Its full source is in
`phort6n2/speedyla`, which is the place to look when a decision here needs to be
seen in finished form rather than described.

**Start from the template repo, never by rebuilding from the live site.** If
someone says "use la.speedywindshield.com as the model", they mean the layout
and the finished look — treat the URL as a visual reference, and fetch it if a
detail is easier to see than to read. Do not reconstruct the site from its
rendered HTML: that markup is build output, and everything that makes it worth
copying is invisible from the browser — the generator, the region markers, the
config-driven content, the preflight, the four verification suites, the ads
sheet. A page rebuilt from scraped HTML looks similar and carries none of it.

Read the template repo's `README.md` first; it is the operating manual and this
skill is the judgement that goes with it.

## What is reusable and what is not

**Reuse unchanged** — `landing/build-pages.cjs` (generator),
`landing/verify.cjs`, `landing/preflight.cjs`, `landing/check-urls.cjs`,
`qa/tracking-check.cjs`, `qa/render-check.cjs`, `landing/fetch-reviews.cjs`,
`tools/make-icons.cjs`, and the machinery half of `landing/ads-sheet.cjs`.

None of these contain a client name, a city, a phone number or a slug pattern.
If you are about to type one into any of them, it belongs in the config — and
the fix is to add a token or a region, not an exception.

**Rewrite per client** — `landing/pages.config.cjs` and `landing/cities.config.cjs`
(all page content), the `:root` colour block in `landing/template.html`,
`landing/img/`, and the `GROUPS` data block in `landing/ads-sheet.cjs`.

**Re-derive per client, never copy** — `site.compliance` (the regulator line and
the banned ad-copy patterns) and both `landing/legal-*.html` pages. See
"Compliance" below. Carrying California auto-glass compliance across to a client
in another state or trade is a legal problem, not a shortcut. Preflight blocks
the build until the legal pages have been read and their
`REPLACE__REVIEW_LEGAL` marker removed.

## Architecture, in one paragraph

`landing/template.html` is a valid standalone page AND the master template.
Content is injected between region markers `<!--PAGE:NAME-->…<!--/PAGE:NAME-->`,
and `{{TOKENS}}` are substituted from `site` in `pages.config.cjs`. Asset paths
are written as `/ASSET/...` in the template and rewritten at build time, so the
template opens correctly from disk during design work. Images are content-hashed
(md5, 8 chars) and served `immutable, max-age=31536000` — never reuse a filename
and expect a change to appear.

Three things about this that have each cost a debugging session:

- `region()` fills **every** occurrence of a marker, not the first.
  `FOOTER_AREA_A` and `FOOTER_AREA_B` each appear twice, and filling only the
  first shipped empty footer columns that nobody noticed for days.
- `section()` handles `<!--SECTION:NAME-->…<!--/SECTION:NAME-->` and **deletes
  the whole band** when its content is empty — gallery, insurance, both rating
  elements. A region can only fill a hole; it cannot remove the heading above
  it, and an eyebrow over an empty grid reads as a broken page.
  A region inside a strippable section must be filled **conditionally**, or the
  build throws "missing region marker" the first time the section is dropped.
- Internal links **inside config body copy** must be written `/ASSET/slug`.
  Written as `/slug` they escape the rewrite and ship pointing at a path the
  build never created. `verify` catches it, so read what it says rather than
  assuming the link list is stale.

In the `speedyla` reference repo the same two files are still called
`landing/speedy.html` with a `/SPEEDY/` prefix — same mechanism, older names.
That repo also predates `areaGroups`, `serviceCards`, `site.compliance` and the
`SECTION` markers, so read it for finished copy and finished layout, and read
the template for how the machinery is wired now.

Pages carry `<meta name="page-kind" content="home|service|hub|city">`. The
checkers classify by that rather than by slug pattern, so a client whose URLs
look nothing like the reference build still gets the doorway-content check
instead of silently getting nothing.

## If the client already has a landing page — do this FIRST

Before writing a single page, inventory the URLs their ads already point at.
A Google Ads final URL that 404s gets the ad disapproved for "Destination not
working", usually within hours of Google's next crawl. The ad group stops
serving, and the landing page history goes with it. This is the failure that
turns a migration into an outage.

**The authoritative list is the Ads account, not the old site.** A final URL can
be referenced by an ad without being linked anywhere crawlable, so a crawl alone
will miss URLs. Export final URLs at **keyword, ad and sitelink level**, then
also pull the old sitemap as a second source.

1. Export final URLs from Google Ads into a text file, one per line. The
   checker tolerates a pasted export — it takes the first URL-looking column.
2. **Name the new pages with the old slugs.** Exact parity, not a redirect.
   Set `slug` in `pages.config.cjs` to whatever the old URL was. If the old
   site used `/free-windshield-quote`, the new page is `/free-windshield-quote`
   — ugly slugs are cheaper than disapproved ads. Rename later, deliberately,
   after updating the final URLs in Ads first.
3. List them in `migration.preserve` so a future edit cannot silently drop one:
   `preserve: ['/free-windshield-quote', '/windshield-replacement']`
4. Check it, before the DNS cutover:
   ```
   npm run build:landing
   npm run check:urls -- --file ads-final-urls.txt
   npm run check:urls -- --sitemap https://oldsite.com/sitemap.xml
   ```
   Reports EXACT / REDIRECT ONLY / WOULD 404 and exits non-zero on anything
   that is not exact.
5. `npm run verify` then enforces it every build: a preserved slug that stops
   building, a redirect pointing at a page that does not exist, a redirect
   whose source is also a real page (so it would never fire), a duplicate
   source, or a loop.

### Redirects are the exception, not the tool

**Do not redirect anything an ad points at.** An off-domain redirect from a
final URL is a policy violation outright (destination mismatch), and even a
same-domain redirect adds a hop the crawler follows before it scores landing
page experience — cost with no benefit.

`migration.redirects` exists for legacy URLs **no ad depends on**: old organic
pages, a Google Business Profile link, a number on a van. Those are emitted as
301 into the root `vercel.json`. `check:urls` treats a redirect as a failure
unless you pass `--allow-redirects`, so use that flag only for a list you have
confirmed contains no ad final URLs.

## Harvest their existing photography before asking for any

Do this at the same time as the URL inventory — both come from the same sources.
A client who says they have no photos usually has a dozen on a site they forgot
about, at better resolution than anything they will shoot on a phone this week.

**Where to look**, in order of yield:
1. Their main website, including `/wp-content/uploads/` — WordPress keeps every
   upload. Fetch the homepage, extract `src`, `data-src`, `srcset` and CSS
   `url(...)`, then walk the service and gallery pages too.
2. The old landing page you are replacing.
3. Their Google Business Profile photos.
4. Only then ask them to shoot something.

**Take:** anything unmistakably theirs — the branded van, their premises, their
signage, work in progress, vehicles they actually serviced. Date-named uploads
(`2023-10-14.webp`) are almost always real job photos. For a mobile service
business the **van shots are the most valuable thing on the site**, because the
whole proposition is that the van comes to you.

**Do not take:**
- **Carrier or brand logos.** The reference client's own site carries GEICO,
  USAA, AAA, Farmers, State Farm and Progressive marks. Those are a trademark
  and affiliation problem and are already banned by the copy rules here. Leave
  them, and mention to the client that they carry the same exposure on the site
  they came from.
- **Manufacturer press renders** — a vehicle on a flat studio background is
  marketing imagery, not their work.
- **Stock and Wikimedia** — the tells are a resolution that beats every other
  file, a model-perfect subject, and no brand context anywhere in frame.
  Obvious stock on a local service page costs more trust than the polish gains,
  because a visitor who recognises it stops believing the reviews too.

Strip EXIF on the way in (`Image.convert('RGB')` drops it), and check for GPS
before publishing anything shot at a private address.

**Captions carry technical detail, not description.** "Retention tape stays on
while the urethane cures" earns more than "our team at work". And if a photo
shows premises in a different city from the one the page sells to, say so in
the caption — see the storefront entry in `pages.config.cjs`.

## The warranty badge is reusable, with one condition

`landing/img/warranty-badge.png` carries no business name, so it works on any
client site. Two rules before reusing it:

1. **Only if that client genuinely offers a lifetime workmanship warranty**, and
   only where the page defines what it covers and excludes directly beside it.
   The badge is honest because it is self-issued and substantiated. On a client
   who does not offer the warranty it is a fabricated credential.
2. **Confirm the licence.** It came from the reference client's site and may be
   purchased or stock artwork their designer licensed for one business. Reusing
   it across a portfolio is a licensing question worth asking before it appears
   on five sites.

Never restyle it, or anything else, to imply third-party accreditation.

## Illustrate every page, from two separate pools

`gallery` is the six-up grid at the bottom of every page. `bodyPhotos` is a
separate pool of process and detail shots that sit beside the prose. **They must
not overlap** — a body figure that names a gallery photo is dropped from that
page's grid, and the grid stops being six-up.

Every page carries figures, not only the service pages. A hub or a city page
without them reads as a wall of text beside pages that alternate text and image.
Two per page at chapters 0 and 2 matches the rest of the site.

Photos repeat across pages and that is correct. Nobody reads two city pages, and
a real photograph reused beats a stock one that is not this business. A client
will rarely supply enough for one photo per chapter — a site of this shape has
around a hundred — so the layout is built so the chapters without one lose
nothing.

## Gallery symmetry is automatic

The gallery grid is six columns with each photo spanning two, and CSS rules
handle an incomplete final row: a lone last photo spans the full width at 21:9,
and a last pair takes half each. Every count from 1 to 8 fills its rows with no
stranded photo beside empty cells. Add as many photos as the client has without
counting them into threes.

**Symmetry is the client's most frequent note.** Any repeating block needs to
divide evenly at every column count it reaches, or fill the last row
deliberately. The same rule already covers the insurance radios (two halves and
a full-width third, all three stacked below 360px) and the stat band. When a
label is the thing breaking a row — one caption wrapping to two lines while its
neighbours fit — shorten the label rather than adjusting the grid.

## What the page carries beyond text

These exist on the reference build and are worth keeping. All of them are
generated, so they cost nothing per client beyond real data.

| Element | Where | Notes |
|---|---|---|
| Google mark + score | hero chip, sticky header, map card | `<span>`, never a link in the header — the call button is the only tap target there |
| Star rows | hero, section heads, review cards | pop in on a stagger |
| Stat band | after the three steps | figures **derived**, never authored; counts up on view |
| Step timeline | how-it-works | connector joining the numbered discs, draws in on view |
| Warranty badge | warranty section | self-issued, see above |
| Photo watermarks | gallery | anchored to the image, not the figure |
| Review cards | reviews section | avatar disc, name, relative date, Google mark |

### Motion rules — all three are load-bearing

1. **Additive, never required.** The default state must be the finished state.
   A class the script adds (`.js-anim`) turns the *start* state on, so no JS and
   no `prefers-reduced-motion` both leave the real content on screen. Getting
   this backwards means a decoration failure removes the thing it decorates —
   the step connector shipped that way until it was caught.
2. **Counted numbers keep their final value in the HTML.** `data-count` drives
   the animation; the element's own text is already the formatted result, and
   the script restores that exact string when it finishes. Verify with
   `javaScriptEnabled:false` and `reducedMotion:'reduce'`.
3. **Two observers, not one.** Entry fires early (root bottom shrunk 30%, so the
   block reaches the upper two thirds before it counts); exit fires only when
   the block leaves the viewport completely. Without that hysteresis the
   animation retriggers while the section is half on screen. A single
   `threshold` also fires off the bottom edge on tall blocks — the animation
   plays where nobody can see it.

## Build order for a new client

1. **Create the repo from `phort6n2/landing-template`.** New GitHub repo, new
   Vercel project.
2. **Inventory existing URLs and harvest their photography** if this is a
   migration — the two sections above. Both read the same sources, so do them
   in one pass.
3. **Fill `site` in `pages.config.cjs`.** Every field in the checklist below.
   `npm run preflight` tells you what is still missing; run it early and often
   rather than treating it as a final gate.
4. **Palette.** Replace the `:root` variables. Compute contrast — do not
   estimate it. Body text needs 4.5:1, large text 3:1, and any colour carrying a
   border or an icon needs 3:1. The reference build's cyan failed at 2.62:1 and
   could not be used for text; the orange had to darken to `#CB4E1A` to reach
   4.52:1.
5. **Artwork.** `npm run make:icons -- path/to/logo.png` writes the whole
   favicon / app-icon / OG set and copies the logo through. Preflight blocks the
   build while the shipped placeholders are still in place, by hash — so a
   forgotten logo cannot reach production.
6. **Content.** Home, service pages, area hubs, city pages. The skeleton bodies
   are briefs describing what each page must cover, not copy to paraphrase.
7. **Reviews.** Set `site.reviews.placeId` and the `expect*` guards, set the
   `GOOGLE_PLACES_API_KEY` secret, and run `npm run check:placeid` to confirm it
   resolves to the right business before trusting it.
8. **Legal pages.** Read both against what this client actually collects, then
   remove the `REPLACE__REVIEW_LEGAL` marker.
9. **Verify, then deploy.** See the gates below.

## Per-client checklist

Every one of these is wrong until changed. A site that ships with the reference
client's phone number sends leads to the wrong business.

| Where | Field |
|---|---|
| `site` | `domain`, `legalName`, `brandShort`, `email` |
| `site` | `phoneFormatted` / `phoneE164` — the DNI-swapped number |
| `site` | `shortName`, `schemaType`, `sourceTag`, `logo`, `ogImage`, `themeColor` |
| `site.serviceArea` | `label`, `short`, `coverageLead`, `mapNote`, `footerNote`, `qualifier` |
| `site` | `regionPhrase`, `utilNote`, `utilNoteMore`, `footerBlurb`, `notFoundNote` |
| `site.compliance.registration` | `authority`, `label`, `number`, registered phone — or all blank |
| `site.compliance.adClaims` | `banned` patterns, re-derived for this state and trade |
| `site` | `callAsset` — the Google call-forwarding number, excluded from DNI |
| `site` | `address`, `geo.lat` / `geo.lng` (verify these, they are easy to leave approximate) |
| `site.ads` | `conversionId` (`AW-…`), `conversionLabel`, `leadValue` |
| `site.ghl` | `webhook`, `locationId`, `poolId` |
| `site.reviews` | `placeId` and the three `expect*` guards |
| `landing/img/` | logo, OG image, favicons, photography |
| `ads-sheet.cjs` | the `GROUPS` data block and the negatives |
| `pages.config.cjs` | `trust`, `gallery`, `migration`, `areaGroups`, `serviceCards`, `insurance`, `nav` |
| `landing/img/` | `warranty-badge.png` only if that client offers the warranty |
| `landing/legal-*.html` | both, read in full, marker removed |

Do not work from this table alone — `npm run preflight` walks the entire config
recursively and fails on any surviving `REPLACE__`, including inside page bodies
and FAQ answers. The table tells you what matters most; preflight tells you what
is actually left.

## Form

The form is auto-glass shaped: vehicle, VIN, insurance, carrier, service. For
another glass client it is already correct. For a different trade the field
list, labels, validation rules and `<option>` values need to become
config-driven first — do that work **in the template repo**, do not fork it.
`svcValue` on every page must match an `<option value>`, and `qa:tracking`
asserts the preselection, so a mismatch fails the build rather than silently
sending the wrong service on every lead.

Required fields must live **outside** the collapsible drawer. A required field
inside a collapsed section means the visitor presses submit and the error lands
on something they cannot see. `verify.cjs` asserts this.

## Tracking

Report form conversions **from the page**, calls from GHL. Never both — GHL's
Ads integration is offline-import only and does not fire on Inbound Webhook,
which is exactly why the split exists. If "Add to Google Ads" is left on inside
the GHL form workflow, every lead counts twice.

The conversion fires only after the webhook confirms delivery, and dedupes on a
`transaction_id` built from the click ID plus the last 10 digits of the phone.
Retesting from the same browser with the same phone will fire nothing.

Attribution captures 8 click IDs and 5 UTMs into `sessionStorage`. Absent
parameters are sent as empty strings so the key set stays stable — GHL builds
its mapping picker from the captured sample request, so **send one sample with
every key populated** before mapping fields, or the click IDs never appear in
the dropdown. See `docs/ghl-field-mapping.md`.

## Compliance

Re-derive from primary sources for the client's state and vertical. For the
reference build these were: California Penal Code § 551(b) (insurance
inducements — blocks deductible-offset language), 16 CCR § 3371.2 (registered
firm name, registration number and registered telephone in internet
advertising, and DNI may be treated as misleading), California Insurance Code
§ 758.5 (the insurer cannot require its own shop).

The rules encoded in `ads-sheet.cjs` — no deductible offset, no carrier
affiliation claims, no unqualified drive-away time, no invented prices, no
superlatives — are insurance/auto-glass specific. Replace them; do not inherit
them silently.

## CSS traps that produced real bugs here

Four defects on the reference build came from two root causes. Both will recur.

### 1. Source order decides, because media queries add no specificity

`a.card{display:block}` written after `@media(max-width:719px){ a.card{display:grid} }`
silently wins at every width. This bit four times: a leftover `.seal` size from
a superseded version, the card grid, `.nav + .hdr-cta{margin-left:0}` sitting
outside a media query so it cancelled an auto-margin on mobile, and a `.seal`
rule from the SVG era overriding the PNG sizes.

**Read the computed style in the browser, not the stylesheet.** Every one of
these looked right in the source. `getComputedStyle(el).display` is the only
thing that settles it.

### 2. A dark band is not always `.sec-dark`

`.final` is its own navy gradient and matches no `.sec-dark` selector. That
produced an eyebrow at **1.33:1** — invisible, not merely low — and later a call
button that stayed solid orange beside the solid orange submit so neither read
as primary. Dark-background rules now use `:is(.sec-dark,.final)`. Any new rule
written for a dark background needs both.

Note the render check cannot catch the contrast half: it reads computed CSS, and
that text sits on a gradient, so there is no single background colour to compare
against. Contrast on gradients has to be measured from rendered pixels or worked
out from the gradient stops by hand.

### 3. "Empty space" is a property of the layout, not the element

Anything absolutely positioned into a gap needs checking at every column count.
The step watermark icons were placed in an empty top-right corner that only
exists in the three-column layout; at one column that corner is the middle of a
paragraph. Moving them to the gutter then collided with the timeline, and the
480–899px band clipped them in half because their position depended on the
paragraph's height. They were eventually deleted — two faint decorations
competing in one box is worse than one clear one.

### 4. Tap targets need size AND separation

Absorbing a list's row gap into the link box hits 44px and leaves adjacent
targets touching at **0px**, which is a coin flip for a thumb on the boundary.
Keep the 44px box and give the gap back: `li{margin:0 0 8px}` with
`a{padding:8px 0;min-height:44px}`.

### 5. The legal pages carry their own stylesheet

`legal-privacy.html` and `legal-terms.html` are standalone and do not inherit
`template.html`'s media queries. Identical footer markup measured 34.8px there
against 44px on the main pages, and the reading measure was uncapped at 115
characters per line. They are hand-synced today — **factor this into a shared
partial rather than patching it twice again.**

### 6. `ch` is not a character

`.prose{max-width:72ch}` rendered **96 characters per line**. The `ch` unit is
the advance width of "0", far wider than average lowercase. 56ch lands at ~75,
which is the top of the comfortable range. Measure per line with
`Range.getBoundingClientRect()` rather than dividing by font size.

## Do not invent facts about the business

The compliance rules in this repo ban carrier logos, certifications and prices.
The same rule covers anything a visitor could rely on, and it is easy to breach
without noticing when research *feels* like evidence.

Four city pages here shipped claiming bilingual staffing — "Spanish-speaking
staff answering the phone and on the vans", "ask for one and you will get one",
a heading reading "We speak Armenian" in Armenian, and two Spanish-language FAQs
answering "Sí. Tenemos personal que habla español." The demographics behind them
were correct and verified. **The staffing was an assumption**, and the client's
own site made no bilingual claim anywhere.

Worse than a wrong claim: those FAQs sat in the FAQPage JSON-LD, so they could
surface in Google results and bring a Spanish- or Armenian-only caller to a line
that could not serve them. A wasted paid click and a bad experience.

The test is not "is this plausible for a business like this" but "did the client
tell me this". Demographics justify *targeting* a language; only the client
justifies *claiming* one.

## Verification gates

All four must pass before deploy. They exist because each caught a real defect.

```
npm run qa            # build + verify + render + tracking, in one go
npm run build:adsheet # refuses to write if any asset breaks Google's limits
npm run check:urls -- --file old-urls.txt   # migrations only, before cutover
```

Individually: `build:landing`, then `verify` (preflight + 16 sections, must be
0 failures 0 warnings), `qa:tracking` (18 assertions in a real browser),
`qa:render` (overflow, clipped overflow, console errors, tap targets).

`npm run verify` runs `preflight.cjs` first, which refuses to build while any
client value is still a placeholder or still belongs to the previous client —
a copied repo that keeps the old GHL webhook sends the new client's leads to
someone else's CRM, and nothing about the page looks wrong when it happens.

`qa:render` flags two kinds of overflow. Content past the viewport while the
document does **not** scroll is the more dangerous one — a parent is clipping it,
so it is invisible rather than reachable, and the old scrollWidth-only test
stayed silent while a card heading wrapped one word per line off the screen.

When changing the template on an existing site, snapshot `quote-site/` first and
diff after rebuilding. An empty diff proves a refactor changed nothing.

When changing the **template repo**, the equivalent proof is to build a throwaway
copy against real content — the speedyla config mapped onto the template's field
names — and get `verify`, `qa:render` and `qa:tracking` all green on it.
Placeholder bodies are too short to exercise the checks: the city-overlap and
call-asset checks both fail on the skeleton for arithmetic reasons that have
nothing to do with whether the code works.

**Watch for double-escaped entities.** Config strings the docs describe as HTML
carry `&amp;`; passing one through `esc()` a second time renders `&amp;amp;` on
the page. `verify` fails on it now, but only because it shipped once.

**Editing the generator: never slice by index.** Finding a function's end with
`indexOf` overshot here and deleted 177 lines including seven functions and both
Google mark constants. Use exact string replacement and check `git diff --stat`
before building.

## Deployment

**Vercel production deploys from `main`.** Pushing to a feature branch produces
a preview deployment on a `*.vercel.app` URL and does **not** update the client's
domain. This has silently swallowed several rounds of fixes — if the client says
"it still isn't there", check `git log origin/main` before re-debugging the code.

Root `vercel.json` sets `outputDirectory: "quote-site"`.

## Things that look like bugs and are not

- **No conversion in Google Ads after a test submit.** Google only records
  conversions it can attribute to an ad click. A direct visit has no `gclid`, so
  the tag fires and Google discards it. Reporting also lags ~3h, and conversions
  are dated to the click, not the submit.
- **"Add the Google tag / event snippet" in the Ads UI.** A status message that
  persists until the action records attributable activity. Not a diagnosis.
- **Only 2–5 review quotes.** The Places API returns at most 5 reviews. That is
  the ceiling, not a filter bug.
- **Preflight failing on a fresh clone of the template.** That is the point.
- **The skeleton failing the city-overlap check.** Two placeholder bodies really
  are near-duplicates, and the texts are short enough that a couple of shared
  5-grams blow past 5%. It clears as soon as real copy exists.
- **A missing registration line in the footer, or no gallery band, or no rating
  anywhere.** Each of those sections removes itself when its config is empty,
  rather than rendering a heading over nothing.
- **A lead arriving with blank `service` or `insurance`.** Impossible from this
  form — both always carry a value, defaults included. It came from somewhere
  else, usually a GHL workflow whose trigger is broader than the Inbound Webhook,
  or a direct POST to the webhook URL (which is public in page source and cannot
  be defended from the page).
