/**
 * ============================================================================
 *  ALL CLIENT CONTENT LIVES HERE. NOTHING CLIENT-SPECIFIC BELONGS ANYWHERE ELSE.
 * ============================================================================
 *
 * Every REPLACE__ token in this file (and in cities.config.cjs) is a build
 * blocker: `npm run verify` walks the whole config recursively and refuses to
 * pass while one survives. That is deliberate. The failure this repo exists to
 * prevent is a copied site going live with the previous client's phone number,
 * webhook or conversion ID — nothing looks wrong, and it is found weeks later
 * by a client asking where their leads went.
 *
 * ---------------------------------------------------------------------------
 * HTML vs PLAIN TEXT — this distinction has produced a real bug
 * ---------------------------------------------------------------------------
 * These fields are emitted as HTML, so they may carry entities (&amp;) and
 * inline markup, and they are NOT escaped:
 *   every page's eyebrow / h1 / sub / body, every faq q and a,
 *   serviceArea.*, footerBlurb, notFoundNote, serviceCards.*, insurance.*,
 *   the services[].card fields, areaGroups[].label
 *
 * These are plain text and ARE escaped, so writing &amp; in one renders the
 * five characters "&amp;" on the page:
 *   site.name, legalName, brandShort, the address, trust[].label / .sub,
 *   gallery[].alt / .caption, every title and desc
 *
 * verify.cjs fails the build on any double-escaped entity, which is what a
 * plain-text field containing &amp; produces.
 *
 * ---------------------------------------------------------------------------
 * COMPLIANCE — OREGON. Re-derived for this client; do not reinstate the
 * California citations this template shipped with.
 * ---------------------------------------------------------------------------
 *  1. NO offer to discount, waive or offset an insurance deductible. Oregon has
 *     no direct analogue of California Penal Code § 551(b), but this stays a
 *     hard rule: it is exposure under ORS 746.230 / 746.240 (unfair and
 *     deceptive practices in insurance) and under insurance fraud generally,
 *     and it buys nothing worth that risk. Clients ask for it. The answer is no.
 *
 *  2. NO claim that Oregon law makes glass work free or zero-deductible.
 *     Florida, Kentucky and South Carolina mandate zero-deductible glass.
 *     OREGON DOES NOT. Secondary sources say otherwise and they are wrong —
 *     nothing of this shape goes on the page without a statute cite.
 *
 *  3. NO invented prices. No verified price floor was supplied, so no page and
 *     no ad says "from $X".
 *
 *  4. NO third-party logos and no "approved / preferred / authorized" claims.
 *     Directory listings describe this client as a "preferred provider for 300+
 *     insurance companies" and their main site carries GEICO, USAA, AAA,
 *     Farmers, State Farm and Progressive marks. Neither comes here. Insurer
 *     names appear only as a factual billing list with a non-affiliation line.
 *
 *  5. NO unqualified time promises. Safe drive-away time is set by the urethane
 *     manufacturer's spec and the weather, not by us.
 *
 *  6. The lifetime no-leak guarantee is defined in full, on-page, beside every
 *     mention of it.
 *
 *  7. Do NOT invent facts about the business. Everything asserted on this site
 *     traces to the client's own website, or to their own storefront and van
 *     signage photographed in landing/img/. Not staffing levels, not languages
 *     spoken, not response times. See docs/client-research.md.
 *
 *  Useful and true, so it appears on the page:
 *    ORS 746.280 — an insurer may not require you to use a particular shop.
 *    ORS 815.220 — driving with an obstructed windshield is unlawful.
 */

module.exports = {
  site: {
    /* The site takes over collisionglass.co itself — the SAME domain the old
     * GoHighLevel site serves today. That makes the cutover a DNS change, not a
     * parallel launch: the moment the domain repoints, GHL stops answering and
     * this site starts. There is no window where both are up, and no rollback
     * except pointing DNS back. See docs/ads-url-migration.md. */
    domain: 'collisionglass.co',

    /* Plain-text fields: a literal ampersand, never &amp;. */
    name: 'Collision Auto Glass & Calibration',
    legalName: 'Collision Auto Glass & Calibration',
    brandShort: 'Collision Auto Glass',
    shortName: 'Collision',

    schemaType: 'AutoGlassShop',

    sourceTag: 'landing:collision-portland-metro',

    /* The HighLevel tracking line, and the ONLY number on the site.
     *
     * Every call routes through it, whatever the source, and that is the point:
     * HighLevel records the call and creates the contact for ALL of them, not
     * just the ones that came from an ad.
     *
     *   ad button   -> Google forwarding number -> this line -> shop
     *   ad -> site  -> Google swaps a .gcall CTA -> forwarding -> this -> shop
     *   organic/GBP -> this line directly                      -> shop
     *
     * So it is three things at once and they must all agree: the number the
     * Google Ads call asset is configured with, the phone_conversion_number
     * Google's website swap looks for, and the number the footer shows
     * UN-swapped so asset verification can find it.
     *
     * The Cedar Mill shop line is (503) 656-3500 and is deliberately NOT shown
     * — a call to it would be recorded by nobody and attributed to nothing.
     * Keep this HighLevel number provisioned for as long as the site is live:
     * releasing it sends a returning customer to whoever gets it next. */
    phoneFormatted: '(503) 832-4376',
    phoneE164: '+15038324376',

    email: 'glass@collisionautoglass.com',

    /* Geocoded and confirmed against OpenStreetMap, which returns "Collision
     * Auto Glass, 14201, Northwest Science Park Drive, Marlene Village,
     * Portland, Washington County, Oregon, 97229" for this address.
     *
     * NOTE THE COUNTY. This is a Portland *mailing* address in Cedar Mill,
     * Washington County — it is not inside Portland city limits. That is why
     * serviceArea.mapNote exists and why the Portland city page does not claim
     * a Portland premises. */
    address: {
      street: '14201 NW Science Park Dr',
      city: 'Portland',
      region: 'OR',
      zip: '97229'
    },
    geo: { lat: 45.5277816, lng: -122.8243862 },

    hours: [
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:30', closes: '16:30' },
      { days: ['Saturday'], closed: true },
      { days: ['Sunday'], closed: true }
    ],

    /* ---------------------------------------------------------------------
     * Google reviews. There are TWO profiles — Cedar Mill/Portland and
     * Tualatin — and only one can drive the rating band. The Portland listing
     * is the larger of the two (Google CID 13824994568758034170).
     *
     * placeId is deliberately empty until `npm run check:placeid` has been run
     * against a real API key and its output read. With it empty the site still
     * builds: every numeric rating claim is stripped and aggregateRating is
     * omitted rather than guessed.
     * ------------------------------------------------------------------- */
    reviews: {
      /* Portland / Cedar Mill listing, supplied by the client 2026-07-28.
       * Place IDs are public — they appear in Maps URLs — so this is safe to
       * commit; only the API key is secret.
       *
       * NOT independently verified yet: confirming it resolves to the right
       * business needs a Places API call. The expect* guards below are what
       * actually protects us — if this ID resolves to some other shop, the
       * fetch bails and writes nothing rather than publishing a stranger's
       * rating. Run `npm run check:placeid` with the key and read the output
       * before trusting the numbers. */
      placeId: 'ChIJTX3GiaIOlVQR-v6G9E8_3L8',
      expectName: 'collision',
      expectVertical: 'auto glass|glass|windshield|calibration',
      expectAddress: ',\\s*OR\\b|Oregon'
    },

    established: '2008',
    mapsUrl: '',
    sameAs: ['https://collisionautoglass.com/'],

    logo: 'logo-wordmark.png',
    ogImage: 'og-image.png',
    themeColor: '#201414',

    serviceArea: {
      label: 'Portland, the Westside &amp; the South Metro',
      short: 'the Portland metro',
      coverageLead: 'Two shops, Cedar Mill and Tualatin, and mobile vans working out of both. If your town is not named below, call and ask — the honest answer is sometimes no, and you should get it before you book rather than after.',
      addressLabel: 'Cedar Mill shop',
      qualifier: 'shop and mobile',
      /* REQUIRED here: the registered address carries a Portland postal address
       * but sits in Washington County, and the map would otherwise imply a
       * premises inside the city. */
      mapNote: 'This is our Cedar Mill shop, just off the Sunset Highway. The postal address reads Portland, but it sits in Washington County rather than inside Portland city limits — our vans cover the city itself.',
      footerNote: 'Collision Auto Glass &amp; Calibration operates shops in Cedar Mill and Tualatin, Oregon, and mobile service across the Portland metro.'
    },

    regionPhrase: 'Portland metro',

    utilNote: 'Free mobile service',
    utilNoteMore: ' — we come to your home or workplace',

    footerBlurb: 'Windshield replacement, chip and crack repair, side and back glass, and in-house ADAS camera calibration. Family owned and operated in the Portland metro since 2008.',

    notFoundNote: 'The page has moved, but the phone has not. Tell us the year, make and model and where the car is sitting, and we can tell you whether it is a repair or a replacement.',

    /* ---------------------------------------------------------------------
     * The four bullets beside the hero form. HTML, so an em dash and inline
     * markup are fine. These used to be hardcoded in template.html, which is
     * how a previous build shipped six insurance carrier names in the hero of
     * a site whose own rules ban naming carriers. Keep them here.
     *
     * Same test as everything else on this site: every one of these is on the
     * client's own website or photographed on their own storefront and van.
     * ------------------------------------------------------------------- */
    heroBullets: [
      { lead: 'Free mobile service',
        text: '&mdash; your driveway, your office lot, the park and ride' },
      { lead: 'ADAS camera recalibration',
        text: 'on the same visit, not a second appointment across town' },
      { lead: 'We bill your insurer directly',
        text: 'including through the Safelite Solutions and Lynx networks' },
      { lead: 'Lifetime no-leak guarantee',
        text: 'on our workmanship, for as long as you own the vehicle' }
    ],

    footerBadges: [
      { icon: 'shield', label: 'Lifetime no-leak guarantee',
        sub: 'Our workmanship, for as long as you own the vehicle' },
      { icon: 'van', label: 'Free mobile service',
        sub: 'Across the Portland metro service area' },
      { icon: 'target', label: 'ADAS calibration in-house',
        sub: 'Not subcontracted to a third shop' }
    ],

    ads: {
      /* Conversion action "Submit lead form - New landing page conversion page".
       * A dedicated action rather than the one the main site uses, so smart
       * bidding on these campaigns optimises against these leads only. */
      conversionId: 'AW-954377360',
      conversionLabel: 'SRXQCJfDvdgcEJDJiscD',
      ga4Id: '',
      /* Microsoft Clarity project ID (Settings -> Overview -> Project ID).
       * Session replay and heatmaps, used to find what is BREAKING rather than
       * to A/B test — at ~96 conversions a month across the whole account a
       * split test on one page would need years to reach significance, so the
       * value here is qualitative evidence, not experiments.
       *
       * Leave empty (or REPLACE__) and no Clarity script is emitted at all.
       * Adding it means a third party records sessions on this site, so the
       * privacy policy has to say so before it goes live — see legal-privacy. */
      /* Optional, and empty rather than REPLACE__ on purpose — same treatment as
       * ga4Id above. A REPLACE__ here would make preflight fail, and preflight
       * runs inside `npm run verify`, which the weekly reviews workflow runs:
       * an optional analytics tool would have broken the review refresh every
       * Monday. Paste the ID to switch Clarity on; leave it empty and no script
       * is emitted at all. */
      /* Calls from a WEBSITE visit — a separate conversion action from the form
       * one above. Google swaps the displayed number for a forwarding number,
       * but only for visitors who arrived from an ad; everyone else sees the
       * real line and calls it directly, untracked. That is accepted here: the
       * Google Business Profile is not tracked either, so tracking organic
       * calls would measure a fraction of them and read as a decline. */
      callConversionLabel: 'HHGvCLiL6NocEJDJiscD',

      clarityId: '',
      leadValue: 0
    },

    ghl: {
      webhook: 'https://services.leadconnectorhq.com/hooks/x7zUDmT8SJyJMQoyGE9p/webhook-trigger/8xbolhw6xFlfBZtbkcMD',
      locationId: 'x7zUDmT8SJyJMQoyGE9p',
      poolId: 'KxTryNob1lTv1nAFRiiv'
    },

    compliance: {
      /* Oregon has no auto-glass registration-number-in-advertising rule.
       * California's 16 CCR § 3371.2 is unusual, and Oregon operates no state
       * licensing scheme for auto repair or glass shops at all — so there is no
       * number to print, and the whole block correctly degrades to name, phone
       * and address. Confirm with the client before launch that they hold no
       * registration they are separately required to display. */
      registration: {
        authority: '',
        label: '',
        number: '',
        phoneFormatted: '',
        phoneE164: ''
      },

      adClaims: {
        banned: [
          ['deductible',                        'deductible claim'],
          ['\\$\\d|\\$0',                       'a price'],
          ['free windshield',                   'free-work claim'],
          ['\\bapproved\\b|preferred provider|authorized', 'insurer affiliation'],
          ['\\bbest\\b|#1|lowest price|highest[ -]?rated', 'superlative'],
          ['guarantee',                         'guarantee'],
          ['\\bminutes\\b',                     'an unqualified time promise'],
          ['same[ -]?day',                      'an unqualified time promise'],
          ['zero[ -]?deductible|no deductible', 'a claim Oregon law does not support']
        ],
        allowed: [
          /* Nothing yet. The obvious candidate — "most carriers waive the
             deductible on chip repair" — is asserted all over Oregon auto-glass
             marketing and I could not trace it to a statute. Until someone
             does, it stays banned rather than allowed. */
        ]
      }
    }
  },

  /* ==================== migration from an existing site ====================
   * Moving off a GoHighLevel site at collisionglass.co onto this subdomain.
   * Ads are LIVE against the old domain, so every path below must keep
   * building. The client updates the final URLs in Google Ads to swap the
   * domain only — same paths, so the edit cannot introduce a 404.
   *
   * Crawled 2026-07-28: all 22 returned HTTP 200 and crawling every page
   * surfaced no URL beyond those linked from the homepage. Recorded in
   * docs/old-site-urls.txt. Reconcile against the Google Ads final-URL export
   * before cutover — an ad can point at a page linked nowhere:
   *   npm run check:urls -- --file ads-final-urls.txt
   *
   * No redirects. Nothing here is a legacy organic URL; every one of these is
   * a live ad destination, and a redirect on an ad destination is a cost with
   * no benefit. */
  migration: {
    /* Still served at their original path, so an ad pointing here is unchanged
       apart from the host. Verified to exist on every build. */
    preserve: [
      '/windshield-replacement',
      '/windshield-repair',
      '/adas-calibration',
      '/auto-glass-repair-portland',
      '/auto-glass-repair-beaverton',
      '/auto-glass-repair-hillsboro',
      '/auto-glass-repair-tualatin',
      '/auto-glass-repair-lake-oswego',
      /* Second-highest spend in the account ($2,235 in 30 days) and NOTHING on
       * the old site linked to it — it exists only as a final URL in the Lead
       * Gen campaign, so the crawl could not see it and only the Ads export
       * revealed it. It was going to be a hard 404 on cutover day. */
      '/mobile-windshield-replacement'
    ],

    /* The eleven paths consolidated away, 301'd to the page that absorbed them.
     *
     * These are a SAFETY NET, not the plan. Because the domain is changing, the
     * client has to edit every final URL in Google Ads regardless — and that
     * edit should name the new path directly. A redirect on a live ad
     * destination is a crawler hop before Google scores landing page
     * experience, which is a cost with no benefit.
     *
     * They exist because the Google Ads final-URL export has not been supplied
     * yet, so there may be an ad pointing at a path no crawl of the old site
     * could reveal. A redirect costs a hop; a 404 costs the ad. Once the export
     * is in hand, run:
     *   npm run check:urls -- --file ads-final-urls.txt
     * with no --allow-redirects, and fix anything it reports as REDIRECT ONLY
     * by correcting the final URL in Ads rather than by keeping the redirect. */
    redirects: [
      { from: '/auto-glass-repair',        to: '/' },
      { from: '/auto-glass-replacement',   to: '/' },
      { from: '/rock-chip-repair',         to: '/windshield-repair' },
      { from: '/windshield-chip-repair',   to: '/windshield-repair' },
      { from: '/windshield-crack-repair',  to: '/windshield-repair' },
      { from: '/car-window-repair',        to: '/side-window-replacement' },
      { from: '/car-window-replacement',   to: '/side-window-replacement' },
      { from: '/door-glass-repair',        to: '/side-window-replacement' },
      { from: '/back-glass-repair',        to: '/back-window-replacement' },
      { from: '/mobile-service',           to: '/mobile-windshield-replacement' },
      /* Zero impressions but the ads are ENABLED, so it is a live liability:
       * a paused-today ad 404s the day someone re-enables it. Mobile repair
       * is what the mobile page covers, so the hop lands somewhere honest. */
      { from: '/mobile-windshield-repair',  to: '/mobile-windshield-replacement' },
      { from: '/auto-insurance',           to: '/insurance-claims' }
    ]
  },

  /* Every one of these is either on the client's own website or photographed
     on their own storefront and van signage — see docs/client-research.md. */
  trust: [
    { icon: 'van',    label: 'Free mobile service',
      sub: 'We come to your home or workplace' },
    { icon: 'shield', label: 'Lifetime no-leak guarantee',
      sub: 'For as long as you own the vehicle' },
    { icon: 'target', label: 'ADAS calibration in-house',
      sub: 'Autel MaxiSYS, never subcontracted' },
    { icon: 'check',  label: 'Family owned since 2008',
      sub: 'Shops in Cedar Mill and Tualatin' }
  ],

  gallery: [
    { src: 'storefront-portland.webp', w: 1000, h: 668,
      alt: 'The Cedar Mill shop from the parking lot, with the red Collision Auto Glass sign above the roller door',
      caption: 'Our Cedar Mill shop, a minute off the Sunset Highway. Drop in, or stay put and we come to you.' },
    { src: 'storefront-tualatin.webp', w: 1000, h: 668,
      alt: 'Two staff outside the Tualatin shop, the window behind them listing the services offered',
      caption: 'Our second shop, in Tualatin. Two locations across the metro means a shorter wait wherever you are.' },
    { src: 'van-mobile-install.webp', w: 668, h: 1000,
      alt: 'A technician setting glass on a car parked beside the branded mobile van',
      caption: 'The van brings the glass, the adhesive and the calibration gear to your driveway. No trip, no waiting room.' },
    { src: 'windshield-set-bmw.webp', w: 1000, h: 668,
      alt: 'Two technicians lowering a windshield onto a car with suction cup setting tools',
      caption: 'Two technicians set every windshield. It takes longer, and it is why yours will not leak or whistle later.' },
    { src: 'shop-glass-prep.webp', w: 668, h: 1000,
      alt: 'A technician priming the edge of a windshield on a glass stand inside the shop',
      caption: 'Every windshield is primed before it goes near your car. It is the step that decides whether the bond lasts.' },
    { src: 'front-office.webp', w: 1000, h: 668,
      alt: 'Two staff at the front counter of the shop with framed certificates on the wall behind',
      caption: 'Call or drop in and someone will tell you honestly whether you need a repair or a full replacement.' }
  ],

  bodyPhotos: [
    { src: 'van-door-decal.webp', w: 668, h: 1000,
      alt: 'The side of the branded van listing windshield, door glass, rock chip, mobile service and the lifetime guarantee',
      caption: 'Free mobile service and a lifetime no-leak guarantee — painted on the van long before it was on a website.' },
    { src: 'tualatin-bay-install.webp', w: 1000, h: 668,
      alt: 'A technician working on a windshield in front of the Tualatin shop window',
      caption: 'When the weather is against us we bring your car indoors rather than risk the bond. It costs you nothing extra.' },
    { src: 'inspection-clipboard.webp', w: 668, h: 1000,
      alt: 'A gloved hand filling in a printed vehicle inspection diagram on a clipboard beside a car',
      caption: 'We record the damage before we start, so there is never a question about what we found or what we did.' },
    { src: 'cabin-header-trim.webp', w: 1000, h: 668,
      alt: 'A technician reaching up to the top of the windshield from inside the vehicle cabin',
      caption: 'Trim comes off from inside the cabin. That is how your paint and your mouldings come through unmarked.' },
    { src: 'cowl-wiper-detail.webp', w: 668, h: 1000,
      alt: 'A technician working at the base of the windshield where the wiper cowl meets the glass',
      caption: 'Wipers and cowl come off every single time. It is the step a rushed job skips, and where leaks begin.' },
    { src: 'two-tech-set-glass.webp', w: 1000, h: 668,
      alt: 'Two technicians positioning a windshield onto a car with the mobile van parked behind',
      caption: 'Your driveway, your office car park, your job site. Most of our work happens where your car already is.' },
    { src: 'adas-calibration-scan.webp', w: 668, h: 1000,
      alt: 'A technician operating a calibration tablet plugged into a vehicle at the dashboard',
      caption: 'Your camera is recalibrated and confirmed before we leave, so lane-keep and auto-braking work as they should.' }
  ],

  areaServed: [
    'Portland', 'Beaverton', 'Hillsboro', 'Tualatin', 'Lake Oswego',
    'Tigard', 'Aloha', 'Sherwood', 'Wilsonville', 'West Linn',
    'Cornelius', 'Newberg'
  ],

  areaGroups: [
    { id: 'A', label: 'Portland &amp; the Westside' },
    { id: 'B', label: 'the South Metro' }
  ],

  insurance: {
    eyebrow: 'Insurance',
    heading: 'What Oregon drivers actually pay, and who gets to choose',
    lead: 'Glass claims are the part of this job customers have been given the most wrong information about — including by shops. Here is what is actually true in Oregon.',
    cards: [
      { h: 'Your insurer does not get to pick the shop',
        p: '<p>Oregon law is explicit about this. <strong>ORS 746.280</strong> prohibits an insurer from requiring you to use a particular repair shop, and requires them to tell you so. If a claims line tells you that you have to use their network shop to be covered, that is not how it works — you can name us, and the claim is handled the same way.</p>' },
      { h: 'So what will it cost?',
        p: '<p>It depends entirely on your policy, and we will not pretend otherwise. Glass is generally handled under comprehensive cover rather than collision, and the deductible is whatever your policy says it is. <strong>Oregon does not mandate zero-deductible glass</strong> — a handful of states do, and Oregon is not one of them, whatever you may have read. Call with your carrier and policy and we will tell you what we see on similar claims.</p>' },
      { h: 'A chip is a different conversation from a crack',
        p: '<p>Many carriers treat a repairable chip differently from a full replacement, because a resin repair costs them a fraction of the glass. Whether yours does is a question for your policy, not for us — but it is worth asking before you assume a chip is not worth claiming. We bill carriers directly, including through the Safelite Solutions and Lynx third-party networks.</p>' },
      { h: 'No insurance? Most of our calls',
        p: '<p>Plenty of people pay cash, either because the deductible is higher than the job or because they would rather not touch the policy. You get the same glass, the same urethane, the same calibration and the same guarantee. Tell us the year, make and model and we will quote it outright.</p>' }
    ],
    disclaimer: 'We are not affiliated with, endorsed by or acting as an agent of any insurance company. Carrier and network names appear here only to describe who we bill.'
  },

  serviceCards: {
    eyebrow: 'What we do',
    heading: 'Glass, and the camera behind it',
    lead: 'One team handles the glass and the calibration in the same visit. Nothing gets driven across town to a second shop, and nothing gets billed twice.'
  },

  nav: [
    'windshield-replacement',
    'adas-calibration',
    'portland-westside-auto-glass',
    'south-metro-auto-glass'
  ],

  home: {
    /* Chapters 0 and 2, matching every other page on the site. The home page
       shipped without these once — hero, trust strip, then four unbroken
       chapters of prose while all fourteen other pages alternated text and
       image. It reads as a wall next to them, and it is the page most visitors
       see first.

       Both come from bodyPhotos, so the six-up gallery band below is untouched.
       Chapter 0 gets the van because for a mobile business the van shot is the
       most valuable image on the site — the whole proposition is that it comes
       to you — and this one has the service list and the guarantee painted on
       its own door. Chapter 2 gets the scan tool because that chapter is about
       the calibration and nothing else illustrates it. */
    figures: [
      { chapter: 0, src: 'van-door-decal.webp' },
      { chapter: 2, src: 'adas-calibration-scan.webp' }
    ],
    navLabel: 'Home',
    shortLabel: 'Home',
    title: 'Auto Glass & Windshield Repair | Portland Metro OR',
    desc: 'Windshield replacement, chip repair and in-house ADAS calibration across the Portland metro. Family owned since 2008. Free mobile service.',
    eyebrow: 'Portland Metro &middot; Family owned since 2008',
    h1: 'Auto glass and ADAS calibration across the Portland metro',
    sub: '<p>Tell us the year, make and model and where the car is sitting<span class="sub-more"> — we will tell you whether it is a repair or a replacement before anyone books anything</span>.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>Two shops, and vans working out of both</h2>
<p>We have been doing this in the Portland metro since 2008, out of a shop in
Cedar Mill just off the Sunset Highway and a second one in Tualatin. Most of the
work is not done in either of them — the vans go to driveways, office lots and
apartment parking in Portland, Beaverton, Hillsboro, Tigard, Tualatin and Lake
Oswego, and mobile service inside the area costs nothing extra.</p>

<p>What that geography actually buys you is a shorter wait. A shop in Tualatin
is not fighting the Sunset Highway to reach Wilsonville, and a shop in Cedar
Mill is not crossing the river to reach Beaverton. Where the work is genuinely
better done indoors — a wet week, a bonded back glass, a calibration that needs
a level floor and a fixed target distance — we will say so and bring the car in
instead.</p>

<h2>What we handle</h2>
<ul>
  <li><strong>Windshield replacement</strong> — including the camera calibration that modern glass requires, in the same visit</li>
  <li><strong>Chip and crack repair</strong> — resin injection, when the damage is still within the limits that make it work</li>
  <li><strong>Side and door glass</strong> — tempered glass, which breaks into pebbles and has to be vacuumed out of the door cavity</li>
  <li><strong>Back glass</strong> — usually with a defroster grid and often the radio antenna printed into it</li>
  <li><strong>ADAS calibration</strong> — on an Autel MaxiSYS, in-house, not subcontracted to a third shop</li>
  <li><strong>RV glass</strong> — a different set of sizes and seals to a car, and not every shop will touch it</li>
</ul>

<div class="callout">
  <h3>The question everybody asks and most shops dodge: repair or replace?</h3>
  <p>A chip smaller than a quarter, not directly in the driver's line of sight,
  and not running to the edge of the glass, is usually repairable. Resin gets
  injected into the break, cured, and the structural integrity comes back. It
  will still be faintly visible — anyone promising an invisible repair is
  selling you something.</p>
  <p>A crack changes the answer, and length is only part of it. A crack that has
  reached the edge of the windshield has compromised the bond line, and a crack
  sitting in the driver's primary viewing area is a replacement regardless of
  how short it is, because a cured resin line in your sightline is its own
  hazard. Damage over the camera bracket behind the mirror is a replacement too.</p>
  <p>We would rather sell you the eighty-dollar answer and see you again than
  the expensive one you did not need. Send a photo and we will tell you which
  one it is.</p>
</div>

<h2>Why the calibration matters more than it sounds</h2>
<p>If your car has lane-keep assist, adaptive cruise or automatic emergency
braking, there is a camera mounted to the windshield looking through it. Replace
the glass and that camera is looking through new glass at a fractionally
different angle. Until it is recalibrated, the car is still making steering and
braking decisions from it.</p>
<p>We do that work here, on an Autel MaxiSYS, in the same visit as the glass.
Shops without the equipment subcontract it, which means a second appointment
somewhere else and a car that is driving around uncalibrated in between. Ask
whoever you are quoting whether the calibration happens under their roof.</p>

<h2>Why people pick us over the chains</h2>
<p>We are family owned, we have been here since 2008, and the same people answer
the phone as run the shops. Our workmanship carries a lifetime no-leak guarantee
for as long as you own the vehicle — see <a href="/ASSET/windshield-replacement">what
that covers and what it does not</a> before you take our word for it.</p>
<p>You also get told when you do not need us. That is the part chains struggle
with, because the person you are speaking to is not usually the person who eats
the cost of the comeback.</p>
`,
    faq: [
      { q: 'Can you tell me if it is repairable without seeing the car?',
        a: '<p>Usually, from a photo. Put something for scale next to the damage — a coin works — and tell us where on the glass it sits. What we cannot tell from a photo is whether a crack has reached the edge under the trim, so occasionally the answer changes when we get there. We will tell you before we start, not after.</p>' },
      { q: 'How long before I can drive it?',
        a: '<p>That is set by the urethane manufacturer\'s safe drive-away time, not by us, and it moves with temperature and humidity — which in this part of Oregon moves a lot. The technician gives you the actual figure for the adhesive used on your car, on the day. Anyone quoting you a flat number before they have seen the weather is guessing.</p>' },
      { q: 'Do you come to me, and does it cost more?',
        a: '<p>We do, across the Portland metro service area, and it does not cost extra. What we need is somewhere reasonably level with room to open both front doors fully. If the weather or the specific job makes mobile a bad idea, we will tell you and bring it into Cedar Mill or Tualatin instead.</p>' },
      { q: 'Will my insurance cover it?',
        a: '<p>Glass is generally a comprehensive claim and your deductible is whatever your policy says. Oregon does not mandate zero-deductible glass. What Oregon does do, under ORS 746.280, is prohibit your insurer from requiring you to use a particular shop — so if you want us, you can name us.</p>' }
    ]
  },

  services: [
    /* ---------------------------------------------------------------------
     * CONSOLIDATED 2026-07-28, with the client's agreement.
     *
     * collisionglass.co carried fourteen service URLs for about seven actual
     * services: four paths for windshield repair, three for side glass, and two
     * generic ones. That fragmentation is what made the old site's pages read as
     * near-duplicates, and near-duplicate pages compete with each other in the
     * same auction while looking thin to Google.
     *
     * Seven pages now. Because the domain is changing anyway, repointing the
     * final URLs in Google Ads is a single edit either way — so a better slug
     * costs nothing. Every collapsed path is 301'd in `migration.redirects`
     * below as a safety net for any ad final URL that gets missed, but the
     * redirects are NOT the plan: the Ads final URLs should name the new paths
     * directly, because a redirect on an ad destination is a crawler hop that
     * buys nothing.
     *
     * Nothing was thrown away. The break typology, the crack-propagation
     * material and the door-cavity detail all moved into the surviving page
     * that owns that subject.
     * ------------------------------------------------------------------- */
    {
      slug: 'windshield-replacement',
      card: {
        icon: 'windshield',
        title: 'Windshield replacement',
        blurb: 'New glass, set by two people, with the camera behind it recalibrated in the same visit.',
        cta: 'Windshield replacement'
      },
      figures: [
        { chapter: 1, src: 'cowl-wiper-detail.webp' },
        { chapter: 3, src: 'two-tech-set-glass.webp' }
      ],
      navLabel: 'Windshields',
      shortLabel: 'Windshield replacement',
      title: 'Windshield Replacement | Portland Metro, Oregon',
      desc: 'Windshield replacement across the Portland metro with ADAS camera calibration in the same visit. Lifetime no-leak guarantee on our workmanship.',
      eyebrow: 'Windshield replacement',
      h1: 'Windshield replacement across the Portland metro',
      sub: '<p>New glass, primed and bonded properly, with the camera behind it recalibrated before the car leaves.</p>',
      svcValue: 'windshield-replacement',
      body: `
<h2>When replacement is the right answer, and when it is not</h2>
<p>Replacement is the answer when a crack has reached the edge of the glass, when
damage sits in the driver's primary viewing area, when there are more breaks than
resin can sensibly fill, or when the damage is over the camera bracket behind the
mirror. It is also the answer when a repairable chip has been left long enough to
run — which in a metro with a hard freeze most winters happens faster than people
expect.</p>
<p>It is <em>not</em> the answer for a fresh chip smaller than a quarter, sitting
away from your sightline and away from the edge. That is a
<a href="/ASSET/windshield-repair">repair</a>, it costs a fraction of this, and we
would rather do it. Send us a photo before you book a replacement.</p>

<h2>What actually happens on the job</h2>
<ul>
  <li>The damage and the surrounding trim get recorded before anything comes apart</li>
  <li>Wipers and the cowl panel come off — every time, not when there is time</li>
  <li>The header and A-pillar trim come off from inside the cabin, so nothing gets levered against the paint</li>
  <li>The old glass is cut out and the old urethane trimmed back to a thin, even bed rather than scraped to bare metal, which is what stops corrosion starting under the new bond</li>
  <li>Any bare metal that does appear gets primed, and the new glass gets primed around its black ceramic band</li>
  <li>Two people set the glass on suction cups — the one-person set is where leaks and stress cracks come from</li>
  <li>The camera is recalibrated, and the result is confirmed rather than assumed</li>
  <li>You get the urethane's safe drive-away time for that day's conditions before we leave</li>
</ul>

<div class="callout">
  <h3>What the lifetime no-leak guarantee actually covers</h3>
  <p>It covers <strong>our workmanship</strong>, for as long as you own the
  vehicle. If water comes in around glass we installed, or the moulding lifts, or
  it whistles at highway speed because of how it was set, we put it right at no
  charge.</p>
  <p>It is not insurance against new damage. A fresh rock chip is a new rock
  chip, not a warranty claim, and it does not cover glass someone else fitted,
  rust that was already in the pinch weld before we got there, or damage from a
  collision. It is a guarantee against us doing it wrong, which is the only thing
  we can honestly guarantee. It is self-issued — nobody underwrites it but us.</p>
</div>

<h2>OEM, dealer glass, and what you are actually choosing between</h2>
<p>There is more than one grade of glass for most vehicles, and the price gap is
real. What matters for a windshield with a camera behind it is the optical
quality through the camera's viewing window and whether the bracket geometry
matches, because that is what decides whether the calibration will hold. We will
tell you what we are quoting and why, and if your car is one where we would only
fit the dealer part, we will say that too rather than fitting something cheaper
and hoping.</p>
`,
      faq: [
        { q: 'How long does the whole job take?',
          a: '<p>The glass itself is usually a couple of hours. The calibration adds to that, and a static calibration needs level ground and a set distance to the target, which is why some cars have to come into the shop. The number that actually governs when you can drive is the urethane\'s safe drive-away time, which we give you on the day.</p>' },
        { q: 'Do I really need the calibration?',
          a: '<p>If the car has a camera on the windshield driving lane-keep, adaptive cruise or automatic braking, yes. The camera is aimed through the glass, and new glass means a new optical path. Skipping it leaves safety systems making decisions from an assumption. We do it in-house on an Autel MaxiSYS, so it is the same visit rather than a second appointment across town.</p>' },
        { q: 'Can you do it at my office?',
          a: '<p>Usually. We need level ground and room to open both front doors. What we cannot do outdoors is a static calibration that needs a controlled floor and target distance, or bonded work in genuinely bad weather — in either case we will bring it into Cedar Mill or Tualatin, and we will tell you which before you book.</p>' },
        { q: 'Is the work warranted?',
          a: '<p>Yes — a lifetime no-leak guarantee on our workmanship, for as long as you own the vehicle. It covers leaks, lifting mouldings and wind noise caused by how it was installed. It does not cover new rock damage, pre-existing rust in the pinch weld, or someone else\'s installation. The full terms are in the panel above.</p>' }
      ]
    },

    {
      slug: 'windshield-repair',
      card: {
        icon: 'wrench',
        title: 'Chip and crack repair',
        blurb: 'Rock chips, star breaks and cracks — resin injection while the damage is still small enough for it to work.',
        cta: 'Repair or replace?'
      },
      figures: [
        { chapter: 0, src: 'inspection-clipboard.webp' },
        { chapter: 2, src: 'van-door-decal.webp' },
        { chapter: 4, src: 'cabin-header-trim.webp' }
      ],
      navLabel: 'Repairs',
      shortLabel: 'Chip and crack repair',
      title: 'Windshield Chip & Crack Repair | Portland Metro OR',
      desc: 'Rock chip, star break and crack repair across the Portland metro. We will tell you honestly whether yours is repairable before you book anything.',
      eyebrow: 'Windshield repair',
      h1: 'Windshield chip and crack repair',
      sub: '<p>Repair is cheaper, faster and keeps your original factory seal. It also does not work on everything, and we will tell you which you have.</p>',
      svcValue: 'chip-crack-repair',
      body: `
<h2>The decision, stated plainly</h2>
<p>Repair works by injecting resin into the break under vacuum and pressure, then
curing it with ultraviolet light. It restores structural integrity and stops the
damage spreading. It does not make the damage disappear — you will still see a
faint mark if you look for it, and any shop promising invisibility is overselling.</p>
<p>What makes something repairable is a combination of size, position and age.
Broadly: smaller than a quarter, not in your primary sightline, not touching the
edge of the glass, not over the camera bracket, and not so old that the break has
filled with dirt and water. Miss any of those and you are looking at
<a href="/ASSET/windshield-replacement">replacement</a> instead.</p>
<p>Keeping the original glass is worth something in its own right. Your factory
windshield was bonded in a controlled plant, on a clean pinch weld, with no
history. Every replacement after that is a new bond on a surface that has been cut
back at least once. A good replacement is genuinely fine — we do them every day —
but if a repair will hold, the original seal is the one least likely to ever give
you trouble.</p>

<h2>Where Oregon's rock chips actually come from</h2>
<p>Chips are not evenly distributed across the year here, and the reason is
specific to this state. <strong>Studded tires are legal in Oregon from 1 November
to 31 March</strong> — outside that window they carry a Class C violation. ODOT
discourages them precisely because of what they do to road surfaces: a 2014 state
study put the damage at roughly $8.5 million a year to state highways alone,
before you count city and county roads.</p>
<p>Chewed-up pavement produces loose aggregate. Add ODOT's winter sanding on the
climb over the West Hills and the gravel that comes off construction and log
trucks year round, and the Sunset Highway becomes a reliable chip generator. The
calls follow the calendar.</p>
<p>The mechanism itself is worth understanding, because it explains the urgency. A
windshield is two sheets of glass laminated around a plastic interlayer. A stone
impact fractures the outer sheet and leaves a small cone of pulverised glass under
the point of contact, with legs radiating out. The interlayer stops it going
further — which is why you get a chip and not a hole — but that fracture is now a
stress concentrator sitting in a panel that flexes with every door slam and
expands and contracts with every temperature change.</p>

<h2>The four break types, and how each one fills</h2>
<ul>
  <li><strong>Bullseye</strong> — a clean circular cone, usually from a blunt stone hitting square on. The most predictable break there is, and the one that fills best. Resin flows into a single cavity and cures evenly.</li>
  <li><strong>Star break</strong> — short legs radiating from the impact point. Repairable, but each leg has to be filled individually, and legs are where an incomplete repair shows. This is the type most likely to keep running if it is left.</li>
  <li><strong>Half-moon</strong> — a partial cone, typically a glancing impact. Behaves much like a bullseye with a slightly less tidy edge.</li>
  <li><strong>Combination</strong> — a cone with legs coming off it, which is what most real-world damage actually is. Repairable up to a point; the honest limit is when the legs are long enough that you are effectively repairing several cracks at once.</li>
</ul>
<p>The working size rule is a chip up to about a quarter. Beyond that the resin
has too large a void to fill without shrinking as it cures, and you get a repair
that looks worse than the damage did. Position overrides size in both directions:
a small chip in the driver's primary viewing area is a replacement, because cured
resin refracts light and that belongs anywhere except directly in front of the
driver. A chip within about an inch of the edge is a replacement, because the edge
is where the glass carries its bond. And a chip over the camera bracket behind the
mirror is a replacement regardless of how neat it is.</p>

<h2>Cracks, and where repair stops being possible</h2>
<p>A chip is a contained cavity. A crack is a propagating fracture with two ends,
and one of them is doing something even when it looks stationary. Filling it
stabilises it and improves how it looks, but the repair has to hold along its
whole length rather than in one pocket — which is why the limits are tighter than
people expect, and why a shop quoting a repair on a crack running the width of the
glass is not doing you a favour.</p>
<ul>
  <li><strong>Has it reached the edge?</strong> If either end has run into the perimeter, the bond line is involved and it is a replacement. This is the one that catches people out, because the last inch is usually hidden under the trim.</li>
  <li><strong>Where does it sit?</strong> Anywhere across the driver's primary viewing area is a replacement, however short.</li>
  <li><strong>How long is it?</strong> Longer cracks are progressively less likely to give a stable result. There is no single honest number across all glass and all vehicles — length interacts with position and with age.</li>
  <li><strong>How old is it?</strong> A crack open through a wet Portland winter is contaminated along its entire length, which is a far bigger surface to fail to bond to than the inside of a chip.</li>
</ul>

<div class="callout">
  <h3>Why yours probably grew overnight</h3>
  <p>Cracks in this climate rarely spread while you are driving. They spread in
  the small hours, when the glass cools and contracts, and again in the first
  minutes of the morning when hot air from the defroster hits the inside face of
  glass that is still near freezing. The differential between the inner and outer
  sheets is what drives the fracture along.</p>
  <p>Cold morning, chip in the glass, defroster on full — that is how a great many
  repairable chips become replacements in a driveway rather than on the road. If
  you are waiting a few days for an appointment: park out of a hard frost where you
  can, warm the cabin gradually, and close the doors rather than slamming them.</p>
</div>

<h2>What we will not do</h2>
<p>We will not repair damage in the driver's primary viewing area just because it
is technically small enough. We will not repair a break that has run to the edge,
because the bond line is already compromised. And we will not repair a windshield
we can see is delaminating, because the resin has nothing sound to key into.</p>
<p>Plenty of people have been told a chip was unrepairable by a shop that only
makes real money on replacements. It is a fair thing to be wary of, and the only
useful answer is a test you can apply yourself: ask them <em>why</em>. A straight
answer names the reason — it is in your sightline, it has reached the edge, there
are five breaks not one, it is over the camera. A vague answer about it being "too
risky" is worth a second opinion. Send us a photo with a coin next to the damage
and we will give you the reason, not just the verdict.</p>
`,
      faq: [
        { q: 'Will the repair be invisible?',
          a: '<p>No. It will be much less noticeable and it will stop spreading, but there will be a faint mark where the break was. How faint depends on the break type — a clean bullseye fills better than a dirty star break that has been there through a winter. Anyone promising invisible has not told you the truth about the other things either.</p>' },
        { q: 'How soon should I get a chip looked at?',
          a: '<p>Sooner is genuinely better, and not as a sales line. Dirt and moisture get into the break and reduce how well resin bonds, and temperature swings drive cracks outward from the chip. A chip repaired in its first week comes out substantially better than the same chip three months later.</p>' },
        { q: 'The crack is only four inches. Can you fix it?',
          a: '<p>Possibly, and the length is the least important part of the answer. What matters more is whether either end has reached the edge of the glass, whether it crosses your primary sightline, and how long it has been open. A four-inch crack starting at the edge is a replacement; the same crack in the middle of the passenger side may not be.</p>' },
        { q: 'There are three chips. Is that still a repair?',
          a: '<p>Often yes. Three separate, individually repairable chips in different parts of the glass is a straightforward job. What changes the answer is clustering — several breaks close enough that their repairs interact — or one of the three sitting somewhere disqualifying, like the sightline or the edge.</p>' },
        { q: 'What does a repair cost compared with replacement?',
          a: '<p>A repair is a fraction of a replacement, and many carriers treat the two differently because a repair costs them so much less. We are not going to invent a figure on a web page — call with the year, make and model and we will quote both, so you can see the gap for your car.</p>' },
        { q: 'Is it illegal to drive with a cracked windshield in Oregon?',
          a: '<p>Oregon does not set a specific crack length in law. ORS 815.220 makes it unlawful to drive with anything obstructing the windshield that impairs the driver\'s view, which is a judgement about your specific damage rather than a measurement. A crack across the driver\'s side is the kind that attracts attention.</p>' },
        { q: 'Is a repair warranted?',
          a: '<p>Our workmanship carries the same lifetime no-leak guarantee. What a repair specifically cannot be warranted against is the break running later from a fresh impact or an extreme temperature swing — that is new damage. If a repair we did fails on its own, we credit it against the replacement.</p>' }
      ]
    },

    {
      slug: 'adas-calibration',
      card: {
        icon: 'target',
        title: 'ADAS calibration',
        blurb: 'Autel MaxiSYS, in-house. The camera behind your glass gets aimed and confirmed.',
        cta: 'ADAS calibration'
      },
      figures: [
        { chapter: 1, src: 'adas-calibration-scan.webp' },
        { chapter: 3, src: 'tualatin-bay-install.webp' }
      ],
      navLabel: 'ADAS',
      shortLabel: 'ADAS calibration',
      title: 'ADAS Calibration | Portland Metro, Oregon',
      desc: 'In-house ADAS camera calibration on an Autel MaxiSYS after windshield replacement. Same visit, same shop, never subcontracted.',
      eyebrow: 'ADAS calibration',
      h1: 'ADAS calibration, done under our own roof',
      sub: '<p>Replace the glass and the camera looking through it needs re-aiming. We do that here, in the same visit.</p>',
      svcValue: 'adas-calibration',
      body: `
<h2>What the camera is actually doing</h2>
<p>If your car has lane-keep assist, lane-departure warning, adaptive cruise
control or automatic emergency braking, a forward-facing camera is mounted to the
inside of your windshield, usually in a bracket behind the rear-view mirror. It
watches lane markings and the vehicle ahead, and the car makes steering and
braking decisions from what it sees.</p>
<p>That camera was aimed at the factory through one specific piece of glass. Its
calibration is a relationship between the sensor and the world <em>through that
glass</em> — thickness, curvature, the optical quality of the area it looks
through, and the exact position of the bracket.</p>

<h2>Why new glass breaks it</h2>
<p>Replacement glass is made to tight tolerances, but "within tolerance" is not
"identical". A fractional difference in the bracket position or the curvature in
the camera's viewing window shifts where the camera thinks the road is. The car
does not know this has happened. It carries on making decisions from a slightly
wrong picture, and it will not necessarily light a warning to tell you.</p>
<p>Recalibration re-establishes the relationship. Depending on the vehicle that
is a static procedure against a physical target at a measured distance on level
ground, a dynamic procedure driven at a specified speed on well-marked road, or
both.</p>

<div class="callout">
  <h3>The question worth asking whoever quotes you</h3>
  <p>"Does the calibration happen at your shop, or do you send it out?"</p>
  <p>A lot of glass shops do not own the equipment. They subcontract it, which
  means a second appointment somewhere else, a car driving around uncalibrated in
  between, and two businesses each able to point at the other if the result is
  wrong. We run an Autel MaxiSYS here and do it in the same visit as the glass —
  one appointment, one company answerable for the outcome.</p>
</div>

<h2>Why some cars have to come to the shop</h2>
<p>A static calibration needs a genuinely level floor, controlled lighting and a
target at a precisely measured distance and height. A sloping driveway in
Beaverton or a cambered street bay will not give a reliable result, and a
calibration that reports success from a bad setup is worse than no calibration,
because it looks finished.</p>
<p>So where the vehicle needs a static procedure, we bring it into Cedar Mill or
Tualatin. Where a dynamic procedure will do, we can often complete it mobile.
We will tell you which yours needs when you book, not when we arrive.</p>
`,
      faq: [
        { q: 'My car did not show a warning light. Do I still need it?',
          a: '<p>Yes. Most systems cannot detect that their own aim is off — they can detect a blocked or disconnected camera, which is a different fault. A camera that is working perfectly but pointed slightly wrong reports no error at all. The absence of a light is not evidence the calibration is intact.</p>' },
        { q: 'How do I know the calibration actually worked?',
          a: '<p>The procedure produces a result from the scan tool rather than a technician\'s opinion, and we confirm it before the car leaves. Ask for that confirmation from any shop — including us. "We did the calibration" and "here is the result the tool reported" are different statements.</p>' },
        { q: 'Can you calibrate glass another shop fitted?',
          a: '<p>Often, yes — bring it in. What we will do first is check the installation, because a calibration on top of a badly set windshield is building on a bad foundation. If the bracket geometry or the glass itself is the problem, calibration will not fix it and we will tell you that rather than charging you for a procedure that cannot succeed.</p>' },
        { q: 'Does the calibration cost extra on top of the glass?',
          a: '<p>It is a separate procedure with its own labour and equipment, so it is a line on the quote rather than something hidden in the glass price. We quote both up front. What you will not get from us is a cheap glass price with the calibration discovered afterwards.</p>' }
      ]
    },

    {
      slug: 'side-window-replacement',
      card: {
        icon: 'door',
        title: 'Side and door glass',
        blurb: 'Tempered glass, the pebbles inside the door, and the regulator that often broke with it.',
        cta: 'Side and door glass'
      },
      figures: [
        { chapter: 0, src: 'inspection-clipboard.webp' },
        { chapter: 2, src: 'cabin-header-trim.webp' }
      ],
      navLabel: 'Side glass',
      shortLabel: 'Side and door glass',
      title: 'Car Window & Door Glass Replacement | Portland OR',
      desc: 'Side, door and quarter glass replacement across the Portland metro, including clearing the tempered glass out of the door cavity properly.',
      eyebrow: 'Side and door glass',
      h1: 'Side and door glass, and the part that gets skipped',
      sub: '<p>Fitting the new glass is the easy half. Getting the old glass out of the door is where the difference shows.</p>',
      svcValue: 'door-side-glass',
      body: `
<h2>Why a side window cannot be repaired</h2>
<p>Your windshield is <strong>laminated</strong> — two sheets of glass bonded
around a plastic interlayer — which is why it chips rather than shattering and why
resin repair works on it. Side, door and quarter glass is <strong>tempered</strong>:
heat-treated so that when it fails it fails completely, into thousands of blunt
pebbles, by design.</p>
<p>There is nothing left to inject resin into. <em>Tempered glass cannot be
repaired.</em> Anyone offering to repair a cracked side window is either confused
or not being straight with you. The exception is worth knowing: a growing number
of vehicles use laminated door glass for cabin quietness and smash-and-grab
resistance. If yours is one, the damage looks like a cracked windshield rather than
a pile of pebbles, and a repair is occasionally possible. Send a photo and we will
tell you which you have.</p>

<h2>The job is inside the door</h2>
<p>When tempered glass lets go, some of it lands on the seat and the floor. Most
of the rest falls straight down inside the door cavity, into a space containing the
window regulator, the lock mechanism, the speaker, the wiring loom and the drain
holes at the bottom. The visible mess takes ten minutes. The glass in the door is
the job.</p>
<ul>
  <li>Fragments in the regulator track make the new window bind, judder or jam — often weeks later, once they have worked into the mechanism</li>
  <li>Glass sitting in the sill blocks the drain holes, and a door that cannot drain in Oregon rains rusts from the inside out, where nobody looks until the paint bubbles</li>
  <li>Pebbles against the speaker cone buzz at anything above moderate volume</li>
  <li>Fragments caught in the weather seal chew the new glass edge every time the window goes up</li>
</ul>
<p>Doing it properly means pulling the interior trim panel and the vapour barrier,
vacuuming the cavity out thoroughly, and checking the drains are clear before the
new glass goes near the channels. It adds real time, and it is the first thing
dropped when someone is quoting to win on price.</p>

<h2>When the glass is fine and the mechanism is not</h2>
<p>"The window won't go up" describes at least four unrelated problems, and they
cost very different amounts to put right. If your glass is intact, replacing it
fixes nothing — so we diagnose before ordering parts.</p>
<ul>
  <li><strong>The regulator</strong> — the scissor or cable mechanism carrying the glass. Cable regulators fray and bunch; the sign is a graunching noise and glass that drops crookedly or falls into the door.</li>
  <li><strong>The motor</strong> — clicks, hums, or does nothing while the switch light still works.</li>
  <li><strong>The switch or wiring</strong> — often the driver's master switch, or a loom in the door jamb that has flexed thousands of times and finally broken a core.</li>
  <li><strong>The track and seals</strong> — perished run channels let the glass wander and bind. Common on older cars and mistaken for a dying motor, because the motor is straining.</li>
</ul>
<p>These faults cause each other, which is what catches people out. A failing
regulator drops the glass where it gets broken; fragments left from a previous
break wreck a healthy regulator. So a car in front of us often needs both, and we
would rather show you why than present a bill.</p>

<div class="callout">
  <h3>If the car has been broken into</h3>
  <p>Say so when you call — it changes the order of operations. Photograph the
  damage first if there is a claim or a police report. Then the priority is getting
  the car sealed and weathertight, which we can usually do quickly even when the
  specific glass has to be ordered, so it is not standing open in the rain or
  advertising itself for a second visit.</p>
  <p>Forced entry rarely stops at the pane. Worth checking before the trim goes
  back on, because it is all in the same place: the regulator, often bent where the
  glass was levered; the run channel and weather seal; the lock rod, if entry was
  through the top of the door frame; and the vapour barrier behind the trim panel,
  frequently torn and rarely replaced, which is how doors start letting water into
  the cabin.</p>
</div>

<h2>Sourcing, and why one door is not like another</h2>
<p>Door glass varies by body style, by which door, by whether it is tinted or
acoustic, and on some cars by trim level. Front doors are usually quicker to source
than rear; quarter and vent glass are usually slower than either. Give us the VIN
and which door, and we can tell you whether it is on a shelf in the metro or coming
from further out.</p>
`,
      faq: [
        { q: 'Can you just repair the crack instead?',
          a: '<p>No, and not because we would rather sell you glass. Side windows are tempered, which means they are built to shatter completely instead of holding a crack. If yours is genuinely holding a crack rather than in pieces, you may have laminated door glass — uncommon but increasingly used. Send a photo and we will check.</p>' },
        { q: 'Will you get all the glass out of the door?',
          a: '<p>That is the part we are actually being paid for. The trim panel comes off, the cavity gets vacuumed out, and the drain holes get checked before the new glass goes in. Skipping it is what produces a window that binds a month later and a door that quietly rusts from the inside.</p>' },
        { q: 'How do I know if it is the motor or the regulator?',
          a: '<p>Listen. A motor running while nothing moves, or moving unevenly with a grinding noise, generally points at the regulator or a frayed cable. Complete silence with a working switch points at the motor, the switch or the wiring. Neither is conclusive from outside the door, which is why we look before ordering.</p>' },
        { q: 'Can you do it at my house?',
          a: '<p>Yes — door glass is not bonded, so there is no cure time and little weather sensitivity beyond keeping the interior dry while the trim is off. It is one of the more straightforward mobile jobs. We need room to open the door fully, and for mechanism work somewhere the inside will stay dry.</p>' },
        { q: 'Should I clean up the glass myself?',
          a: '<p>Photograph it first if there is a claim or a report. After that, yes — get the loose fragments off the seats and floor, because they migrate and they are unpleasant to find later. Leave the inside of the door to us; that needs the trim panel off and a vacuum, not a brush.</p>' },
        { q: 'Will my insurance cover a break-in?',
          a: '<p>Glass broken in a break-in is generally a comprehensive claim rather than collision, and your deductible applies as your policy states. Whether it is worth claiming depends on that deductible against the job. Under ORS 746.280 your insurer cannot require you to use a particular shop, so you can name us either way.</p>' }
      ]
    },

    {
      slug: 'back-window-replacement',
      card: {
        icon: 'rear',
        title: 'Back glass',
        blurb: 'Defroster grid, antenna, and several thousand pebbles in the load area.',
        cta: 'Back glass'
      },
      figures: [
        { chapter: 1, src: 'cabin-header-trim.webp' }
      ],
      navLabel: 'Back glass',
      shortLabel: 'Back glass replacement',
      title: 'Back Glass Replacement | Portland Metro, Oregon',
      desc: 'Back glass and rear window replacement in the Portland metro, including defroster grid and antenna connections done properly.',
      eyebrow: 'Back glass',
      h1: 'Back glass replacement, wiring and all',
      sub: '<p>Your rear window is usually carrying a defroster grid and often the radio antenna. Both have to work afterwards.</p>',
      svcValue: 'back-glass',
      body: `
<h2>Not just a big side window</h2>
<p>Back glass is generally tempered, so it shatters completely like a side window
— but unlike a side window it is usually <em>bonded</em> to the body with urethane
rather than riding in a channel. So it combines the worst of both: several
thousand fragments to clear, and a structural adhesive bond with a cure time.</p>
<p>It also has things printed on it. The defroster grid is baked into the glass
and connects to the loom at two tabs, and on a great many cars the radio antenna
is printed into the same surface. Get the connections wrong and you have a new
window, no rear demist and no radio.</p>

<h2>Where the fragments actually go</h2>
<p>Further than people expect. A rear window failing on a hatchback or a wagon
puts glass across the load floor, under the parcel shelf, down the seat backs and
into the spare wheel well. On a saloon it goes into the boot and into the gap
between the rear seat and the shelf, which is exactly where it stays until
somebody folds the seat down months later.</p>
<p>Clearing it is part of the job, and it takes longer than the glass does.</p>

<div class="callout">
  <h3>Check the defroster works before we leave</h3>
  <p>It is the easiest thing in this trade to discover a week later, and the
  most annoying to go back for. Run the rear demist with us there and put a hand
  on the glass — you should feel the grid warming within a minute or two.</p>
  <p>Same for the radio, if your antenna is printed into the back glass. Two
  minutes standing in the driveway is worth more than any assurance we could
  give you about it.</p>
</div>

<h2>Weather, cure time and why this one often comes indoors</h2>
<p>Because back glass is bonded, it has the same requirements as a windshield: a
clean dry bonding surface and a safe drive-away time that stretches as the
temperature drops. A steady Portland downpour is a poor environment for a
structural bond you want to last the life of the car.</p>
<p>So this is one of the jobs we will more often bring into Cedar Mill or Tualatin
rather than doing on a driveway, particularly between November and March. We will
say so when you book rather than turning up and changing the plan.</p>
`,
      faq: [
        { q: 'Will the rear defroster still work?',
          a: '<p>Yes — the new glass comes with its own grid and we reconnect it to the loom. Test it with us before we leave. What we cannot restore is a grid damaged by scraping ice off the inside of old glass; that is a different repair and it is worth mentioning if the demist was already patchy.</p>' },
        { q: 'My radio antenna is in the back window.',
          a: '<p>Common, and we reconnect it as part of the job. Worth checking reception with us there for the same reason as the defroster. If reception was already poor before the glass broke, tell us — that points at the amplifier or the feed rather than the glass, and a new window will not fix it.</p>' },
        { q: 'How long does it take?',
          a: '<p>Longer than a side window, largely because of clearing fragments out of the load area, and it carries a safe drive-away time because the bond is structural. The technician gives you the actual figure for the adhesive and the day\'s conditions before leaving.</p>' },
        { q: 'Can it be repaired instead?',
          a: '<p>Almost never — tempered glass does not hold a repairable crack, it disintegrates. If your back glass is somehow holding a crack, it may be laminated, which a small number of vehicles use. Send a photo and we will tell you which you have before booking anything.</p>' }
      ]
    },

    {
      slug: 'mobile-windshield-replacement',
      card: {
        icon: 'van',
        title: 'Mobile service',
        blurb: 'Free across the service area. What we need from the space, and when it is a bad idea.',
        cta: 'Mobile service'
      },
      figures: [
        { chapter: 1, src: 'two-tech-set-glass.webp' },
        { chapter: 3, src: 'tualatin-bay-install.webp' }
      ],
      navLabel: 'Mobile',
      shortLabel: 'Mobile service',
      title: 'Mobile Auto Glass Service | Portland Metro, Oregon',
      desc: 'Free mobile auto glass service across the Portland metro. What the van needs from your driveway or car park, and when the shop is better.',
      eyebrow: 'Mobile service',
      h1: 'Mobile service, and when we will tell you not to',
      sub: '<p>Most of our work happens where your car already is. Some of it genuinely should not.</p>',
      svcValue: 'not-sure',
      body: `
<h2>What mobile actually means here</h2>
<p>It means a van with the glass, the urethane, the primer, the trim clips and the
scan tool arrives where the car is sitting, and the job is done there. It is free
inside our service area — it is on the side of the van and it has been for years.
Home driveways, workplace car parks, apartment lots: those are the normal case,
not the exception.</p>
<p>What we need is modest: somewhere reasonably level, enough room to open both
front doors fully and walk around the front of the car, and permission to be there
if it is a managed car park. That last one is worth checking with a building
manager before the appointment rather than during it.</p>

<h2>When the shop is the better answer</h2>
<ul>
  <li><strong>A static ADAS calibration.</strong> These need a level floor, controlled light and a target at a precisely measured distance. A sloping driveway cannot deliver that, and a calibration that reports success from a bad setup is worse than none — it looks finished. <a href="/ASSET/adas-calibration">More on this here</a>.</li>
  <li><strong>Bonded glass in sustained rain.</strong> Urethane wants a clean dry surface. We can work in Oregon weather and do, but there is a point past which we are risking a bond that is supposed to outlast the car.</li>
  <li><strong>A cold snap.</strong> Safe drive-away time stretches as temperature drops. Sometimes the honest answer is that the shop will get you back on the road sooner than your own driveway will.</li>
  <li><strong>Rust in the pinch weld.</strong> If we cut the old glass out and find corrosion, that needs treating properly before new glass goes on. Discovering it in a car park is worse than discovering it in a bay.</li>
</ul>

<div class="callout">
  <h3>Two shops, and why that shortens the drive</h3>
  <p>Cedar Mill sits just off the Sunset Highway on the west side. Tualatin sits
  near the I-5 corridor at the south end. A van going to Hillsboro is not crossing
  the metro, and a van going to Wilsonville is not fighting the tunnel.</p>
  <p>It is a scheduling advantage rather than a marketing one, and it is the main
  reason we can usually offer something sooner than a single-location shop can.</p>
</div>

<h2>What to have ready</h2>
<p>The car unlocked or someone with a key, the interior reasonably clear around
the glass being worked on, and — if it is a windshield — the dash clear of
anything you would rather not have moved. If the car is in a stack or a gated lot,
tell us at booking. Mobile jobs lose more time to access than to the work.</p>
`,
      faq: [
        { q: 'Does mobile cost more than coming to your shop?',
          a: '<p>No. Free mobile service inside the service area, which is what it says on the van and the shop window. What we will not do is pretend a job is suitable for a driveway when it is not — in those cases we will bring the car in, and that does not cost extra either.</p>' },
        { q: 'Can you work in the rain?',
          a: '<p>Up to a point, and it depends on the job. A chip repair or a door glass is largely unaffected. Bonded glass — a windshield or a back glass — needs a clean dry surface for a structural bond, so in sustained rain we will suggest the shop. We would rather move you than do it badly.</p>' },
        { q: 'What if my apartment car park is tight?',
          a: '<p>Tell us at booking and describe it. What defeats a mobile job is usually not the space around the car but the clearance to get the van near it, or a low garage ceiling. A subterranean garage with limited headroom is often a shop job — better to know when you book.</p>' },
        { q: 'How far do you go?',
          a: '<p>Across the Portland metro service area — see <a href="/ASSET/portland-westside-auto-glass">Portland and the Westside</a> and <a href="/ASSET/south-metro-auto-glass">the South Metro</a> for the towns named. If yours is not on either list, call and ask. Sometimes the answer is no, and you should have it before you book rather than after.</p>' }
      ]
    },

    {
      slug: 'insurance-claims',
      /* No `card` deliberately — six cards fill a three-column grid exactly and
         seven strands one. This is the page to leave out of the grid: it is a
         claims explainer, not a service someone shops for, and every footer on
         the site links it, so nothing is orphaned by dropping the tile. */
      figures: [
        { chapter: 0, src: 'inspection-clipboard.webp' },
        { chapter: 2, src: 'van-door-decal.webp' }
      ],
      navLabel: 'Insurance',
      shortLabel: 'Insurance claims',
      title: 'Auto Glass Insurance Claims | Portland Metro, Oregon',
      desc: 'How auto glass insurance claims work in Oregon, who gets to choose the shop under ORS 746.280, and what we bill directly.',
      eyebrow: 'Insurance',
      h1: 'Auto glass insurance claims in Oregon',
      sub: '<p>The part of this job with the most misinformation attached to it, including from shops. Here is what is actually true.</p>',
      svcValue: 'not-sure',
      body: `
<h2>Your insurer does not choose your shop</h2>
<p>This is the single most useful thing on this page. <strong>ORS 746.280</strong>
prohibits an insurer from requiring you to use a particular motor vehicle repair
shop, and requires that you be told so. If a claims line tells you that you must
use their network shop for the work to be covered, that is not the law in Oregon.</p>
<p>You can name us. The claim proceeds the same way, and we handle the billing.
What sometimes differs is the rate the carrier will pay, and if there is any gap
between that and the job we will tell you the number before we start rather than
after.</p>

<h2>How the claim actually runs</h2>
<ul>
  <li>You call your carrier or their glass administrator, or you call us and we start it with you</li>
  <li>Glass is usually handled under comprehensive cover rather than collision</li>
  <li>Your deductible is whatever your policy says — see the section below</li>
  <li>We bill the carrier directly, including through the Safelite Solutions and Lynx third-party networks that several carriers use to administer glass</li>
  <li>You pay the deductible, if one applies, and nothing else</li>
</ul>

<div class="callout">
  <h3>What Oregon law does not say</h3>
  <p>You will find plenty of pages claiming Oregon mandates zero-deductible glass
  or that insurers here cannot apply a deductible to a chip repair. <strong>We
  could not trace either claim to an Oregon statute, and we are not going to
  repeat it.</strong> Florida, Kentucky and South Carolina have zero-deductible
  glass laws. Oregon does not.</p>
  <p>What <em>is</em> true is that many carriers, by their own policy rather than
  by law, treat a repairable chip differently from a full replacement, because a
  resin repair costs them a fraction as much. Whether yours does is a question
  for your policy — but it is worth asking before you assume a chip is not worth
  claiming.</p>
</div>

<h2>Whether to claim at all</h2>
<p>Sometimes the answer is no, and we will say so. If your comprehensive
deductible is higher than the cash price of the job, claiming achieves nothing
except putting a claim on your record. A chip repair in particular is often
cheaper than any deductible worth having.</p>
<p>Call with the year, make and model and your deductible, and we will quote the
cash price so you can compare the two. That is a two-minute conversation and it
occasionally saves people a claim they did not need to make.</p>

<h2>Who we are not</h2>
<p>We are not affiliated with, endorsed by or acting as an agent of any insurance
company, and we do not hold "approved" or "preferred" status with any carrier
however often that language gets used in this trade. We bill insurers. That is
the whole relationship, and it is the one worth having.</p>
`,
      faq: [
        { q: 'My insurer says I have to use their shop.',
          a: '<p>Under ORS 746.280 an insurer may not require you to use a particular repair shop, and must tell you as much. You are entitled to name us. If you are getting pushback, say that you are choosing your own shop and ask them to note it on the claim — that usually settles it.</p>' },
        { q: 'Will claiming put my premium up?',
          a: '<p>That is your carrier\'s decision and it varies by carrier and by your history, so anyone giving you a confident yes or no does not actually know. What we can do is quote the cash price so you can weigh it against the deductible and decide with real numbers rather than a guess.</p>' },
        { q: 'Do you handle the paperwork?',
          a: '<p>Yes. We bill the carrier directly, including through Safelite Solutions and Lynx where your carrier administers glass that way. What we need from you is the carrier, the policy number and the claim number if one has already been opened.</p>' },
        { q: 'Does insurance cover the ADAS calibration too?',
          a: '<p>Generally yes where it is required as part of the glass replacement, because it is not optional — the camera has to be recalibrated for the safety systems to work. It is billed as its own line. If your carrier disputes it, tell us; it is a conversation we have had before.</p>' }
      ]
    }
  ],

  hubs: [
    {
      slug: 'portland-westside-auto-glass',
      figures: [
        { chapter: 0, src: 'van-door-decal.webp' },
        { chapter: 2, src: 'cowl-wiper-detail.webp' }
      ],
      area: 'A',
      navLabel: 'Portland & Westside',
      shortLabel: 'Portland and the Westside',
      title: 'Auto Glass: Portland & the Westside | Oregon',
      desc: 'Auto glass and windshield service across Portland, Beaverton, Hillsboro, Aloha and Cornelius, from our Cedar Mill shop off the Sunset Highway.',
      eyebrow: 'Portland &amp; the Westside',
      h1: 'Auto glass across Portland and the Westside',
      sub: '<p>Run out of the Cedar Mill shop, a minute off the Sunset Highway, covering the city and the tech corridor west of it.</p>',
      svcValue: 'windshield-replacement',
      body: `
<h2>The towns this side covers</h2>
<p>Cities with their own page: <a href="/ASSET/auto-glass-repair-portland">Portland</a>,
<a href="/ASSET/auto-glass-repair-beaverton">Beaverton</a> and
<a href="/ASSET/auto-glass-repair-hillsboro">Hillsboro</a>.</p>
<p>Worked regularly without a dedicated page: Aloha, Cornelius, Cedar Mill,
Bethany, Forest Grove and the unincorporated Washington County pockets in between
— which, given where our own shop sits, is territory we know unusually well.</p>
<p>If your town is on neither list, call and ask. Sometimes the answer is no, and
you should have it before you book.</p>

<h2>US-26 is why this side generates the chip calls</h2>
<p>The Sunset Highway is the spine of this territory, and it produces damage at a
rate the rest of the metro does not. It carries the daily commute between Portland
and the Washington County tech campuses, it carries freight, and it climbs over
the West Hills through a stretch that gets sanded in winter.</p>
<p>Add Oregon's studded tire season — legal from 1 November to 31 March, and
estimated by an ODOT study at around $8.5 million a year in damage to state
highways alone — and you get a road surface that sheds aggregate for months.
Chipped windshields on this side follow the calendar closely enough that we plan
staffing around it.</p>

<h2>Where the cars actually sit during the day</h2>
<p>This is a commuter belt with very large single employers, which changes what a
mobile job looks like. Intel is Oregon's largest for-profit employer with roughly
20,000 people in the state, most of them in Washington County, and its Gordon
Moore Park at Ronler Acres campus is in Hillsboro. Columbia Sportswear's
headquarters is a few doors from our own shop on NW Science Park Drive, and Nike's
world headquarters campus sits nearby off the same corridor.</p>
<p>What that means practically: a lot of cars on this side sit in one large
surface car park from early morning until evening. That is close to ideal for
mobile work — level ground, room around the vehicle, and a full working day to
complete the job and let the urethane cure while nobody needs the car. Where
possible we would rather come to a workplace car park here than have you give up
an evening.</p>
`,
      faq: [
        { q: 'Can you come to a corporate campus car park?',
          a: '<p>Regularly, and it is often the easiest version of the job — level ground, plenty of room and the car parked all day. The one thing to sort out in advance is site access, because several of the larger campuses have gated or badge-controlled parking. Check with your facilities team before booking.</p>' },
        { q: 'Which shop would I be coming to on this side?',
          a: '<p>Cedar Mill, at 14201 NW Science Park Dr — just off the Sunset Highway. The postal address says Portland, though it sits in Washington County rather than inside the city limits. It is the closer of our two shops for anywhere west or north of the tunnel.</p>' },
        { q: 'Do you cover Forest Grove and Banks?',
          a: '<p>Forest Grove, regularly. Further west than that it depends on the day and the job, and we would rather give you a straight no than a maybe that becomes a cancelled booking. Call with your location and we will tell you what we can actually commit to.</p>' }
      ]
    },

    {
      slug: 'south-metro-auto-glass',
      figures: [
        { chapter: 0, src: 'tualatin-bay-install.webp' },
        { chapter: 2, src: 'two-tech-set-glass.webp' }
      ],
      area: 'B',
      navLabel: 'South Metro',
      shortLabel: 'The South Metro',
      title: 'Auto Glass: Tualatin, Tigard & Lake Oswego | Oregon',
      desc: 'Auto glass and windshield service across Tualatin, Tigard, Lake Oswego, Sherwood, Wilsonville and West Linn from our Tualatin shop.',
      eyebrow: 'the South Metro',
      h1: 'Auto glass across the South Metro',
      sub: '<p>Worked from the Tualatin shop on SW Mohave Court, close enough to I-5 that the southern towns are a short run rather than a cross-metro trek.</p>',
      svcValue: 'windshield-replacement',
      body: `
<h2>What coverage down here actually means</h2>
<p>Cities with their own page: <a href="/ASSET/auto-glass-repair-tualatin">Tualatin</a>
and <a href="/ASSET/auto-glass-repair-lake-oswego">Lake Oswego</a>.</p>

<ul>
  <li><strong>The I-5 corridor</strong> — Tualatin, Tigard, Durham and Wilsonville. Routine, and the quickest for us to reach from the Tualatin shop.</li>
  <li><strong>The OR-43 and river side</strong> — Lake Oswego and West Linn. Straightforward, with the access caveats that come with older hillside streets.</li>
  <li><strong>The southwest edge</strong> — Sherwood and out toward Newberg. Covered, though further out we schedule rather than promise.</li>
</ul>
<p>Where we are honest about the limit: past Newberg and into Yamhill County we
are stretching, and the far side of the Willamette into Oregon City and Canby is
not our natural territory. Ask, and expect a real answer rather than an
optimistic one.</p>

<h2>Two very different kinds of street</h2>
<p>This side splits neatly in two, and it decides how a mobile job goes.</p>
<p>Tualatin, Sherwood and Wilsonville are largely newer development: wide streets,
generous driveways, big flat industrial and business-park lots. Our own Tualatin
shop sits in exactly that kind of area off SW Mohave Court. For mobile work it is
close to ideal — level ground, room to work, nothing tight.</p>
<p>Lake Oswego and West Linn are the opposite. Older, hillier, wooded, with steep
short driveways cut into slopes, narrow streets and mature tree cover overhanging
the parking. That matters for us in two specific ways: a genuinely level surface
for a static calibration is harder to find, and glass set under dripping trees
picks up debris on a bond that needs to be clean.</p>

<h2>Which is why the shop is nearer than you would think</h2>
<p>Because the Tualatin shop sits right by the I-5 corridor, bringing a car in
from Lake Oswego or Wilsonville is a genuinely short trip rather than a
cross-metro one. When a driveway on a slope is not going to give a sound
calibration, that is an easy swap to offer instead of a compromise to accept.</p>
<p>It is also why our southern coverage does not thin out the way a single-shop
operation's does. A van working out of Tualatin is not fighting its way through
the tunnel to get here.</p>
`,
      faq: [
        { q: 'Do you cover Wilsonville and Sherwood?',
          a: '<p>Yes, both regularly — they are a short run from the Tualatin shop. Further south past Wilsonville, or west past Newberg, we schedule rather than promise. Call with the location and we will give you a straight yes or no rather than booking you and reassessing later.</p>' },
        { q: 'My driveway in Lake Oswego is on a slope. Is that a problem?',
          a: '<p>For the glass itself, usually not. For a static ADAS calibration, yes — those need a genuinely level surface and a target at a measured distance, and a sloping driveway cannot give a reliable result. In that case we bring the car into Tualatin, which from most of Lake Oswego is a short trip.</p>' },
        { q: 'Where is the Tualatin shop?',
          a: '<p>19390 SW Mohave Ct, in the industrial area off Tualatin-Sherwood Road, with easy access from I-5. It is the closer of our two shops for anywhere south of Tigard, and it is where we bring work that needs a controlled floor or shelter from the weather.</p>' }
      ]
    }
  ],

  cities: require('./cities.config.cjs')
};
