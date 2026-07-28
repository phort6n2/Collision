# Collision Auto Glass & Calibration — research dossier

Everything gathered before writing copy. Anything not in here is not established,
and must not appear on a page. The rule from the skill applies: the test is not
"is this plausible for a business like this" but "did the client tell me this, or
is it on their own property".

---

## Business

| | |
|---|---|
| Legal / trading name | Collision Auto Glass & Calibration |
| Main site | <https://collisionautoglass.com> (WordPress) |
| Current ad landing site | <https://collisionglass.co> (GoHighLevel) — **being replaced** |
| New landing site | subdomain of `collisionautoglass.com` — **exact host TBC** |
| Trade | Auto glass + ADAS calibration |
| Market | Portland metro, Oregon |
| Founded | 2008 ("EST. 2008" on the logo, "Locally Owned & Operated Since 2008" on the storefront) |

### Locations

| | Portland | Tualatin |
|---|---|---|
| Address | 14201 NW Science Park Dr, Portland, OR 97229 | 19390 SW Mohave Ct, Tualatin, OR 97062 |
| Phone | (503) 656-3500 — **primary, confirmed by client** | (503) 678-9910 |
| Hours | Mon–Fri 7:30am–4:30pm, closed Sat/Sun | Mon–Fri 7:30am–4:30pm, closed Sat/Sun |
| Google CID | `13824994568758034170` | not yet resolved |

Google Place IDs for both still need resolving via the Places API. Ratings must
not be published until `check:placeid` confirms each resolves to the right
business — a wrong Place ID returns perfectly plausible numbers.

---

## Substantiated claims

These are safe because they come from the client's own property. The Tualatin
storefront window (photo `EAT02677`, cropped and read directly) lists, verbatim:

- ADAS Calibration Specialist
- WindShield Replacement
- Door Glass Replacement
- Rock-Chip Repair
- **Free** Mobile Service
- Lifetime **No Leak** Guarantee
- Locally Owned & Operated Since 2008

From their own website:

- Services: windshield replacement, windshield repair, side window replacement,
  back window replacement, auto glass repair, ADAS calibration, RV window replacement
- Warranty: "Lifetime no-leak guarantee — for as long as you own the vehicle"
- Certified through SIKA and DOW Automotive (urethane manufacturers)
- "AGRSS-compliant on every install"
- Autel MaxiSYS ADAS calibration system, in-house
- Works with 300+ insurance companies; direct billing
- Named staff: Gene (owner), Stacy (co-founder, accounting), Brandon (admin),
  Brad (GM, NW Portland, 30+ yrs), Scott (Tualatin manager), Riley (certified
  technician, ADAS specialist)
- Service area: Portland, Tualatin, Beaverton, Aloha, Tigard, Lake Oswego,
  Hillsboro, Wilsonville, Sherwood, Cornelius, West Linn, Newberg

### Claims that must NOT be carried across

| Claim | Why |
|---|---|
| GEICO / USAA / AAA / Farmers / State Farm / Progressive logos | Trademark + implied affiliation. On their main site today; not coming here. |
| "Preferred provider for 300+ insurance companies" (directory listings) | Reads as carrier affiliation. Use "we bill your insurer directly, including through Safelite Solutions and Lynx" instead. |
| "Highest-rated auto glass shop in Portland metro" | Unqualified superlative — banned in ad copy, unsupportable on page without evidence. |
| Anything about languages spoken, technician headcount, response times | Never stated by the client. Do not infer. |

### Still unverified — do not use until confirmed

- Whether the lifetime guarantee is workmanship-only, and what it excludes
- Same-day service availability (claimed on their site, but unqualified)
- Whether the SIKA/DOW certification is current
- Whether they hold any Oregon registration or licence number

---

## Oregon compliance — first pass

The reference build's rules are Californian and **none of the citations carry
over**. Re-derived starting points:

| Statute | Effect |
|---|---|
| [ORS 746.280](https://oregon.public.law/statutes/ors_746.280) | An insurer may not require the use of a particular repair shop. This is the Oregon analogue of Cal. Ins. Code § 758.5 and is the basis for the "it's your choice of shop" message. |
| [ORS 746.292](https://oregon.public.law/statutes/ors_746.292) | Motor vehicle repair shop invoices, written estimates on request, warranty and aftermarket-parts disclosure. **Caveat:** the text is written for "body and frame repair shops" — applicability to a glass-only shop needs checking before it is cited on the page. |
| [ORS 746.230](https://oregon.public.law/statutes/ors_746.230) / [ORS 746.240](https://oregon.public.law/statutes/ors_746.240) | Unfair claim settlement practices, and the Director's catch-all authority over unfair or deceptive acts in insurance. This is where deductible-inducement risk lives in Oregon. |
| [ORS 815.220](https://www.oregonlegislature.gov/bills_laws/ors/ors815.html) | Obstructed windshield — useful, accurate page content. |

**Registration line:** Oregon appears to have **no** auto-glass registration-number-in-advertising
requirement analogous to California's 16 CCR § 3371.2, and no state licensing
scheme for auto repair or glass shops. Working assumption:
`site.compliance.registration.number` stays empty and the footer block degrades
to name / phone / address. **To confirm with the client** before shipping.

**Deductible language:** Oregon has no direct analogue of Cal. Penal Code
§ 551(b). The ban on offering to pay, waive or absorb a deductible nonetheless
stays as a house rule — it is exposure under the ORS 746.230/240 unfair-practices
authority and under insurance fraud generally, and it is not worth the risk for
the copy it buys.

**Ad-copy bans carried over on their merits, with new reasoning:** no deductible
offset, no carrier affiliation or "approved/authorized" claims, no invented
prices, no unqualified drive-away or same-day time promises, no superlatives,
lifetime warranty always defined on-page.

---

## URL inventory — `collisionglass.co`

**Ads are live against this domain, and the new site sits on a different host.**
That makes exact path parity mandatory: when the final URLs are repointed, the
edit must be a pure domain swap so nothing 404s mid-flight.

Crawled 2026-07-28. All 22 return HTTP 200. Crawling every page surfaced no URL
beyond those linked from the homepage, so this list is complete *as a crawl* —
but a final URL can be referenced by an ad without being linked anywhere, so
**the Google Ads export is still authoritative and still outstanding.**

```
/                             /car-window-replacement
/adas-calibration             /door-glass-repair
/auto-glass-repair            /mobile-service
/auto-glass-replacement       /privacy
/auto-insurance               /rock-chip-repair
/back-glass-repair            /terms
/car-window-repair            /windshield-chip-repair
                              /windshield-crack-repair
/auto-glass-repair-beaverton  /windshield-repair
/auto-glass-repair-hillsboro  /windshield-replacement
/auto-glass-repair-lake-oswego
/auto-glass-repair-portland
/auto-glass-repair-tualatin
```

### The existing pages are doorway pages

Diffing `/auto-glass-repair-beaverton` against `/auto-glass-repair-hillsboro`:
identical byte length (525,811), and the only prose differences are the city
name substituted into the title, the H1 and one paragraph. Everything else in
the diff is CSS class noise. The five city pages are one template with a name
swapped — close to Google's own definition of a doorway page, and a plausible
drag on landing page experience today.

This is the strongest argument for the rebuild, and it is also the trap to avoid
repeating: `verify` fails at 5% 5-gram overlap across city and hub bodies.

### Live defect on the current site

`collisionglass.co` renders a `tel:(503) 555-5555` link alongside the real
Portland number — a placeholder that was never replaced, on a page taking paid
traffic today.

---

## Photography

Harvested from `collisionautoglass.com/wp-content/uploads/`. 20 files named
`EAT*` from a professional shoot (Sony bodies, sequential frame numbers,
2560px). No GPS in any EXIF; all metadata stripped on conversion.
`EAT02808-1-scaled` and `EAT02808-2-scaled` are byte-identical duplicates —
the 3600×2404 `EAT02808-1.jpg` is the full-resolution original of that frame.

18 unique images converted to webp in `landing/img/`:

**Range-of-work candidates** — `storefront-portland`, `storefront-tualatin`,
`van-mobile-install`, `windshield-set-bmw`, `shop-glass-prep`,
`adas-calibration-scan`

**Process and detail candidates** — `van-door-decal`, `tualatin-bay-install`,
`inspection-clipboard`, `cabin-header-trim`, `cowl-wiper-detail`,
`two-tech-set-glass`, `front-office`

**Team** — `team-gene`, `team-brandon`, `team-brad`, `team-scott`, `team-riley`

The van and both storefronts are the most valuable frames on the site: the
proposition is that the van comes to you, and the storefront shots carry the
service list and the guarantee in the client's own signage.

### Rejected

- The per-city images (`unnamed.jpg` … `unnamed-9.jpg`) are 408×544 to 532×240 —
  thumbnail-sized, no brand context, almost certainly Street View or scraped.
  Unusable and untrustworthy.
- Insurance carrier logos — see the claims table above.
- 10 images on `collisionglass.co` are served from an unrelated GoHighLevel
  account (`msgsndr/nx3qD5aZow0Op9tQZ9x1`), i.e. whoever built that site used
  generic agency stock. Not this business; not used.

---

## Brand

Sampled from the logo (`Collision-1.png`, 255,688 opaque pixels):

| Colour | Share | Role |
|---|---|---|
| `#241818` | 48.4% | near-black, warm |
| `#A81818` | 23.9% | brand red |
| `#FCFCFC` | 20.6% | white |

`#A81818` on white measures **7.55:1** — comfortably clear of the 4.5:1 body-text
floor, so unlike the reference build's cyan it can carry text as well as
furniture. Full contrast measurement still to be done against the actual
`:root` values once the palette block is written.

The circular badge ("Collision / Auto Glass & Calibration / Locally Owned &
Operated / EST. 2008") is the real mark and is the right source for the square
icon set. Best available copy is only 512×512
(`cropped-Untitled-design-41.png`), so the original high-resolution or vector
logo is still worth asking for.

### Palette — applied, every value measured

Variables renamed from the reference build's colour-specific names to
role-based ones (`--navy` → `--brand`, `--cyan*` → `--accent*`) so the template
stays honest for any future palette. Verified in Chromium: all custom
properties resolve, none empty, `qa:render` clean.

| Role | Value | Measured |
|---|---|---|
| `--brand`, `--cta` | `#A81818` | 7.5:1 on white; white text on it 7.5:1 |
| `--brand-deep`, `--cta-hover` | `#8C1212` | 9.5:1 |
| `--cta-active` | `#6E0E0E` | 12.1:1 |
| `--accent` | `#D42222` | 5.2:1 — fills and large graphics |
| `--accent-ink` | `#B01A1A` | 7.0:1 — accent red carrying small text |
| `--band-dark` | `#201414` | white 17.9:1 |
| `--band-dark-2` | `#150D0D` | white 19.2:1 |
| `--band-dark-3` | `#33201F` | white 15.4:1 |
| `--text` | `#1A1212` | 18.4:1 |
| `--border-field` | `#8A7373` | 4.4:1 (reference managed 3.3:1) |

The brand red clears 4.5:1 unaided, so unlike the reference build's cyan — which
failed at 2.62:1 and could never carry text — red here works as text, fill and
button alike. That makes red the *scarce* colour: near-black carries the
structure, red is reserved for actions. It is the logo's own hierarchy, a red
wordmark on a black badge.

### Two problems a red brand creates, and what was done

**The focus ring had nowhere safe to land.** Measured against all four surfaces
it can appear on — white, the red CTA, the dark band, the red tint — no single
colour clears 3:1 everywhere. Brand red fails on two, near-black fails on the
dark band at 1.0:1. The ring is therefore two-valued: `--ring` near-black for
light surfaces, `--ring-on-dark` white applied by
`:is(.sec-dark,.final) :focus-visible`. Note `.final` named explicitly —
per the skill's warning it is its own gradient and matches no `.sec-dark`
selector, so without it the closing CTA, the most important button on the page,
would have kept an invisible ring.

**The error colour collides with the CTA.** Both are red; the reference's
`--error` measured 1.14:1 against the new `--cta`, i.e. indistinguishable.
Darkened to `#8F2018` (8.9:1 on white) so they are at least not identical, and
errors must never be signalled by colour alone — the tint background, the border
and the message text all carry it. Worth an explicit check once the form has
real validation states.

### The logo was broken, and how it was fixed

`Collision-1.png`, the horizontal lockup used on their WordPress header, is a
**dark-background colourway**. The words "& Calibration" and the
"LOCALLY OWNED & OPERATED" tagline are drawn in white with a transparent
background, so on this site's white header they were invisible — the mark read
as "Collision Auto Glass" and nothing else. Their own site gets away with it
because that header sits on a dark band.

Three changes, all reversible if they send a better original:

1. Recoloured the white text lying to the right of the badge disc to the brand
   ink `#1A1212`. The disc itself is untouched, so "Auto Glass" and "EST. 2008"
   stay white where they belong. The disc was located by column density of
   near-black pixels rather than by a bounding box — the tagline's outline made
   the naive bbox span almost the whole image.
2. Deleted the "LOCALLY OWNED & OPERATED" micro-tagline. At header size it is
   sub-pixel noise, and the trust strip already carries "Family owned since 2008".
3. Raised `.brand img` from 44px to 52px. The reference client's mark was a
   simple wordmark; this is a badge-plus-wordmark lockup with far more detail
   and it turns to mush below about 50px. Measured in the browser.

**Worth asking the client for the original vector or a light-background export.**
What we have is a 1163×525 raster built for a dark header, and the icon set is
generated from a 512×512 badge — serviceable, but not what a designer would
hand over.

### To port back to the template repo

1. **The 404 page's palette is hardcoded inside `build-pages.cjs`** (9 hex
   values). Client colours in the generator are exactly what the skill says
   must not happen. Patched here so the 404 isn't off-brand, but the real fix
   is to lift those into config.
2. **The invisible focus ring on dark bands is a latent bug in the reference
   template**, not something this palette introduced — `--ring:#004B81` on a
   navy `--band-dark` has the same problem. The two-valued ring should go
   upstream.
3. **The legal pages duplicate the palette inline** and were hand-synced again
   here (31 values across the two files). The skill already flags this; it is
   now the third time it has been patched twice instead of once.
4. **The hero bullets were hardcoded in `template.html`**, and one of them named
   six insurance carriers — GEICO, State Farm, USAA, AAA, Farmers, Progressive —
   in the hero of a site whose own compliance rules ban naming carriers. It
   shipped because it lived in markup nobody thought of as content. Fixed here by
   adding a `HEROBULLETS` region and a `site.heroBullets` config array; that
   change belongs upstream, because every future client inherits the same trap.
5. **The form's phone and ZIP placeholders were `(714) 555-0142` and `92614`** —
   an Irvine, California area code and postcode, on a template meant for any
   market. Now Oregon values. These should be derived from the config rather
   than typed into the template at all.

---

## Outstanding

**Blocking the build**

- Google Ads final-URL export (keyword, ad and sitelink level)
- Exact subdomain for the new site
- GHL inbound webhook URL, `locationId`, `poolId` — note the current GHL site's
  assets are served from account `x7zUDmT8SJyJMQoyGE9p`, which is a **candidate**
  for the location ID and must be confirmed, never assumed
- Google Ads conversion ID, conversion label, lead value
- `GOOGLE_PLACES_API_KEY` as a GitHub secret
- Which Google Business Profile drives the rating band (Portland or Tualatin)
- Contact email for the site

**Judgement, client to decide**

- Which cities to advertise in — their site lists 12, the old landing site had 5
- Original high-resolution logo
- Warranty exclusions, in full
- Whether they hold any Oregon registration or licence number
