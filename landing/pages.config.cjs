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
 * The page BODIES are briefs, not copy. Do not paste another client's prose in
 * here. Two shops in the same trade and the same state running identical page
 * text compete with each other in the same auction and both read as thin.
 * Write each client's pages from what is actually true about that client.
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
 * VERTICAL
 * ---------------------------------------------------------------------------
 * The page set below is shaped for mobile auto glass, because that is what it
 * was built from. For a different trade, change:
 *   - site.schemaType          (schema.org LocalBusiness subtype)
 *   - the `services` array     (slugs, labels, briefs)
 *   - the `insurance` block    (or empty its `cards` to drop the band entirely)
 *   - the service <select> options in landing/template.html
 *   - landing/ads-sheet.cjs    (keywords, headlines, negatives)
 *   - landing/legal-*.html     (both are worked examples, not boilerplate)
 * Everything else — layout, tracking, form, verification — is trade-agnostic.
 *
 * ---------------------------------------------------------------------------
 * COMPLIANCE — read before writing a single line of copy
 * ---------------------------------------------------------------------------
 * These rules came out of a live California auto glass build. Check each one
 * against the client's state and trade rather than assuming it carries over.
 *
 *  1. NO offer to discount, waive or offset an insurance deductible. California
 *     Penal Code § 551(b) makes it unlawful for an automotive repair dealer to
 *     "knowingly offer or give any discount intended to offset a deductible
 *     required by a policy of insurance." Many states have an equivalent. A "$300
 *     off your deductible" banner is the single most common violation in this
 *     trade and clients will ask for it — the answer is no.
 *
 *  2. NO claim that state law makes the work free. Florida, Kentucky and South
 *     Carolina mandate zero-deductible glass. Most states, California included,
 *     do not. Check before writing anything of this shape.
 *
 *  3. NO invented prices. If no verified price floor was supplied, no page and
 *     no ad says "from $X". When one is supplied, the page and the ad must show
 *     the same figure or the ad is misleading.
 *
 *  4. NO third-party logos and no "approved / preferred / authorized" claims
 *     about a relationship the client does not have in writing. Insurer or
 *     manufacturer names may appear as a factual billing list, always with a
 *     non-affiliation disclaimer.
 *
 *  5. NO unqualified time promises where the real figure is set by a spec or a
 *     supplier (safe drive-away time, cure time, permit turnaround).
 *
 *  6. A "lifetime warranty" is defined on-page, in full, next to the claim.
 *
 *  7. Do NOT invent facts about the business. Not staffing, not languages
 *     spoken, not certifications, not years in business, not coverage. If the
 *     client has not stated it and it is not on their own site, it does not go
 *     on the page. This one has bitten before.
 */

module.exports = {
  site: {
    /* Bare hostname, no scheme, no trailing slash. */
    domain: 'REPLACE__client-domain.com',

    /* Display name. legalName must match the trade registration certificate
     * EXACTLY where the client's trade requires registered-name advertising
     * (California ARD: 16 CCR § 3371.2). Verify against the certificate, not
     * against the client's letterhead. */
    name: 'REPLACE__Client Business Name',
    legalName: 'REPLACE__Client Business Name',
    /* Short conversational form, used where the full registered name reads
     * stiffly ("A {{BRAND_SHORT}} tech will call you"). */
    brandShort: 'REPLACE__Client',
    /* PWA manifest short_name — 12 characters or fewer. */
    shortName: 'REPLACE__Client',

    /* schema.org LocalBusiness subtype. AutoGlassShop, AutoRepair, Plumber,
     * Electrician, HVACBusiness, RoofingContractor, Locksmith, PestControl…
     * Pick a real one from schema.org/LocalBusiness — an invented type is
     * ignored by Google and gives you nothing. */
    schemaType: 'AutoGlassShop',

    /* Identifies this site in the CRM. Shows up on every lead record, which is
     * how you tell landing-page leads from GBP, organic and referral. */
    sourceTag: 'REPLACE__landing:client-market',

    /* Header / CTA / form-error number — THIS is the one the CRM number pool
     * swaps for dynamic number insertion. Prefer an area code local to the
     * market being advertised, not the client's head office. */
    phoneFormatted: 'REPLACE__(555) 000-0000',
    phoneE164: 'REPLACE__+15550000000',

    /* Google Ads call-asset number. Google verifies this exact number appears
     * on the site, so it is rendered in the footer and marked ghl-no-swap. If
     * DNI ever rewrote it, call-asset verification fails and the asset is
     * disapproved. It must NOT be the same number as phoneE164 above. */
    callAsset: { formatted: 'REPLACE__(555) 000-0001', e164: 'REPLACE__+15550000001' },

    email: 'REPLACE__client@example.com',

    /* The registered place of business. If the client advertises a market they
     * have no premises in, say so plainly in serviceArea.mapNote and
     * serviceArea.footerNote below — an embedded map of a city the customer
     * cannot visit is misleading on its own. */
    address: {
      street: 'REPLACE__123 Example St',
      city: 'REPLACE__City',
      region: 'REPLACE__CA',
      zip: 'REPLACE__00000'
    },
    /* Real coordinates for the address above — check them on a map, do not
     * approximate from the city centre. Emitted in LocalBusiness JSON-LD. */
    geo: { lat: 0, lng: 0 },

    hours: [
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '17:00' },
      { days: ['Saturday'], opens: '09:00', closes: '14:00' },
      { days: ['Sunday'], closed: true }
    ],

    /* ---------------------------------------------------------------------
     * Google reviews. landing/fetch-reviews.cjs pulls the live rating, count
     * and quotes weekly and bakes them into the build, so the browser never
     * touches the Places API and the key never reaches a visitor.
     *
     * The expect* guards exist because a client-supplied Place ID once resolved
     * to a DIFFERENT company two doors down, and the site published that other
     * business's rating on every page. A wrong Place ID fails completely
     * silently — the numbers it returns look perfectly plausible. Always run
     * `npm run check:placeid` first and read what comes back.
     * ------------------------------------------------------------------- */
    reviews: {
      /* From the Google Maps URL for the client's listing. Public, safe to
         commit; only the API key is secret. */
      placeId: '',
      /* Regex sources, matched case-insensitively against what Google returns.
         expectName and expectAddress must both be set or the fetch refuses to
         write. expectVertical may be '' for a trade with no reliable keyword
         in the listing name. */
      expectName: 'REPLACE__distinctive word from the business name',
      expectVertical: 'REPLACE__trade|keyword|alternatives',
      expectAddress: 'REPLACE__,\\s*ST\\b|State Name'
    },

    established: 'REPLACE__2015',
    mapsUrl: '',            /* filled from reviews.json once the Place ID is verified */
    sameAs: ['REPLACE__https://client-main-site.com/'],

    /* Filenames inside landing/img/. Ship the client's own artwork — the files
     * in this repo are placeholders and preflight refuses to build while they
     * are still in place. */
    logo: 'logo-wordmark.png',
    ogImage: 'og-image.png',
    themeColor: 'REPLACE__#0A2650',

    /* ---------------------------------------------------------------------
     * Service area. These strings appear in the utility bar, the coverage
     * band, the footer and the map card, so they are written once here.
     * ------------------------------------------------------------------- */
    serviceArea: {
      /* Full form, used in headings: "Orange County & Los Angeles County" */
      label: 'REPLACE__Area A &amp; Area B',
      /* Compact form for tight lines: "Orange County & LA County" */
      short: 'REPLACE__Area A &amp; Area B',
      /* Lead paragraph under the coverage heading. */
      coverageLead: 'REPLACE__One sentence on how coverage works and what to do if a city is not listed.',
      /* Label on the address row of the map card. "Registered address",
       * "Our shop", "Office" — whatever is honest for this client. */
      addressLabel: 'REPLACE__Registered address',
      /* Trailing qualifier on the service-area row: "mobile only", "shop and
       * mobile", or '' for none. */
      qualifier: '',
      /* Shown above the embedded map. REQUIRED whenever the registered address
       * is outside the advertised market — it is what stops the map implying
       * premises the client does not have. Set '' only when the address and
       * the market are the same place. */
      mapNote: 'REPLACE__Where the listing is, versus where the work happens.',
      /* Footer copyright sentence, after "All rights reserved." */
      footerNote: 'REPLACE__One sentence on where the client serves and where it is registered.'
    },

    /* Used in the reviews fallback when reviews.json is absent:
     * "<legalName> has been serving <regionPhrase> drivers since <established>". */
    regionPhrase: 'REPLACE__Southern California',

    /* Utility bar, above the header. Kept short: the second span is dropped
     * below 600px, so the first must stand alone on a phone. */
    utilNote: 'REPLACE__Short promise',
    utilNoteMore: 'REPLACE__ across the service area',

    /* Footer description, one or two sentences. */
    footerBlurb: 'REPLACE__What the client does and where, in one sentence.',

    /* Shown on the 404 page under "That page has moved or never existed". */
    notFoundNote: 'REPLACE__One reassuring sentence with a reason to call.',

    /* ---------------------------------------------------------------------
     * Trust cluster in the footer identity panel, beside the registered name
     * and address. The real Google rating is prepended automatically whenever
     * reviews.json exists, so leaving this empty still fills the space.
     *
     * EVERY ENTRY MUST RESTATE A CLAIM MADE FURTHER UP THE PAGE. A footer is
     * where a cautious buyer checks claims already made, not where new ones get
     * introduced — and a badge shape reads as "somebody else verified this",
     * which is exactly why a third-party accreditation, certification or
     * carrier relationship the client does not hold must never go here.
     *
     * Icon names come from ICONS in build-pages.cjs.
     * ------------------------------------------------------------------- */
    footerBadges: [
      // { icon: 'shield', label: 'REPLACE__A promise defined in full on the page',
      //   sub: 'REPLACE__The qualifier that makes it true' }
    ],

    /* ---------------------------------------------------------------------
     * Google Ads. Paste from Ads → Tools → Conversions → the action → Tag
     * setup → Use Google tag, which shows a send_to of the form
     *   AW-0000000000/AbC-D_efG-h12_34-567
     * The page builds that send_to itself and adds transaction_id, value and
     * dedupe, so Google's bare event snippet is never pasted in anywhere.
     * Empty is safe: the whole tracking block no-ops until these are filled.
     * ------------------------------------------------------------------- */
    ads: {
      conversionId: 'REPLACE__AW-0000000000',
      conversionLabel: 'REPLACE__conversion-label',
      ga4Id: '',
      /* Average booked-job value. Set it once known — it lets Smart Bidding
       * optimise toward revenue rather than raw lead count. */
      leadValue: 0
    },

    /* ---------------------------------------------------------------------
     * CRM (HighLevel). Empty webhook = the form still reports the conversion
     * and shows success, it just posts nowhere. Empty pool/location = the DNI
     * scripts are not emitted at all.
     * ------------------------------------------------------------------- */
    ghl: {
      /* Inbound Webhook (premium trigger). This URL is visible in page source —
       * unavoidable for any browser-side post. It is write-only, but anyone can
       * call it, so keep spam filtering on in the CRM. */
      webhook: 'REPLACE__https://services.leadconnectorhq.com/hooks/.../webhook-trigger/...',
      locationId: 'REPLACE__location-id',
      /* Number pool for dynamic number insertion. Swaps the primary number in
       * the header, CTAs and sticky bar so the CRM can attribute calls and
       * report call conversions back to Google Ads.
       *
       * The footer call-asset number carries ghl-no-swap and is asserted on
       * every page by verify.cjs. DNI must never rewrite it.
       *
       * Leave empty until the pool exists — half-configured DNI silently shows
       * the wrong number. */
      poolId: ''
    },

    /* ---------------------------------------------------------------------
     * Compliance. Whether the client's trade must show a registration number
     * in internet advertising is a question to answer per client, not to
     * assume. Leaving `number` empty removes the registration and registered-
     * telephone lines from the footer rather than printing a placeholder.
     * ------------------------------------------------------------------- */
    compliance: {
      registration: {
        /* e.g. 'Bureau of Automotive Repair' / 'CSLB' / 'Dept. of Agriculture' */
        authority: '',
        /* e.g. 'ARD Registration' / 'License' */
        label: '',
        /* The real number. Empty = block degrades gracefully. */
        number: '',
        /* The number on file with the regulator, if it differs from the number
         * advertised. Falls back to site.phoneE164 when empty. Never swapped
         * by DNI. */
        phoneFormatted: '',
        phoneE164: ''
      },

      /* Claims the AD COPY must never make. Enforced by landing/ads-sheet.cjs
       * against every headline and description before a sheet is written, so a
       * violation is a build failure rather than a disapproval three days into
       * a campaign.
       *
       * `banned` holds regex SOURCES (strings), matched case-insensitively.
       * `allowed` holds exact strings that trip a pattern but are defensible —
       * put the reason in a comment beside each one, because the next person to
       * read the list will otherwise assume it is a loophole.
       *
       * The set below is the California auto glass set. Re-derive it for the
       * client's state and trade; do not inherit it unexamined. */
      adClaims: {
        banned: [
          ['deductible',                        'deductible claim'],
          ['\\$\\d|\\$0',                       'a price'],
          ['free windshield',                   'free-work claim'],
          ['\\bapproved\\b|preferred provider|authorized', 'insurer affiliation'],
          ['\\bbest\\b|#1|lowest price',        'superlative'],
          ['guarantee',                         'guarantee'],
          ['\\bminutes\\b',                     'an unqualified time promise']
        ],
        allowed: [
          /* Describes the INSURER's decision, not a discount from the shop, so
             it does not engage the deductible-offset prohibition. */
          // 'Most carriers waive the deductible on chip repair.'
        ]
      }
    }
  },

  /* ==================== migration from an existing site ====================
   * Fill this in BEFORE the first deploy whenever the client is moving off an
   * existing landing page (HighLevel, Unbounce, WordPress, anything).
   *
   * The rule for anything an ad points at is EXACT PARITY: the new site serves
   * the same path the old site served. Not a redirect to it — the same path.
   *   - A final URL that 404s gets the ad disapproved for "Destination not
   *     working", usually within hours and with no warning.
   *   - A final URL redirecting off-domain is a policy violation outright.
   *   - Even a same-domain redirect adds a hop the crawler follows before it
   *     scores landing page experience, for no benefit.
   *
   * So the default posture is: name the page with the old slug. Do not rename
   * and redirect.
   *
   * The authoritative URL list is the Google Ads account, not the old site — a
   * final URL can be referenced by an ad without being linked anywhere
   * crawlable. Export final URLs at keyword, ad and sitelink level, then:
   *   npm run check:urls -- --file ads-final-urls.txt
   *
   * preserve  slugs that must exist unchanged because ads point at them.
   *           Verified to exist on every build.
   * redirects ONLY for legacy URLs no ad depends on — old organic pages, a
   *           Google Business Profile link, printed material. Emitted as 301
   *           into the root vercel.json. check:urls treats a redirect as a
   *           failure unless you pass --allow-redirects. */
  migration: {
    preserve: [],
    redirects: [
      // { from: '/old-organic-page', to: '/new-page' },
    ]
  },

  /* ======================== trust strip ========================
   * The band under the hero, and the most-read element on the page. Every item
   * must be a fact the client can substantiate on request — this is the easiest
   * place on the site to accidentally publish a claim they cannot back.
   *
   * No third-party logos, no certifications they do not hold. Icon names map to
   * the ICONS set in build-pages.cjs; add one there if none fits. */
  trust: [
    { icon: 'van',    label: 'REPLACE__Claim one',   sub: 'REPLACE__Supporting detail' },
    { icon: 'shield', label: 'REPLACE__Claim two',   sub: 'REPLACE__Supporting detail' },
    { icon: 'doc',    label: 'REPLACE__Claim three', sub: 'REPLACE__Supporting detail' },
    { icon: 'camera', label: 'REPLACE__Claim four',  sub: 'REPLACE__Supporting detail' }
  ],

  /* ======================== photo gallery ========================
   * Real photos of THIS business only. Stock photography on a local service
   * page reads as fake and costs more trust than the polish gains.
   *
   * Before asking the client for photos, harvest what already exists: their
   * main website, their old landing page, their Google Business Profile, their
   * social. w and h are required — they reserve the box and stop layout shift.
   *
   * Leave this array empty and the whole gallery band is removed rather than
   * rendering an empty grid under a heading. */
  gallery: [
    // { src: 'work-example.webp', w: 1360, h: 1020,
    //   alt: 'Description of what is actually happening in the photo',
    //   caption: 'One sentence that makes a point, not a label.' }
  ],

  /* ======================== body photography ========================
   * A SEPARATE pool from the gallery above, and keeping them apart is the
   * point: draw both from one array and every illustrated page loses a tile
   * from its grid. Same shape as `gallery`.
   *
   * These should lean toward process and detail — hands at work, the damage
   * itself, the vehicle where it actually was — because they sit beside prose
   * explaining what is happening. A vehicle beauty shot belongs in the grid.
   *
   * A page may still name a `gallery` photo in its `figures`; that photo is
   * then dropped from that page's grid, which is usually not what you want. */
  bodyPhotos: [
    // { src: 'work-detail.webp', w: 896, h: 1200,
    //   alt: 'What is actually happening in the photo',
    //   caption: 'One sentence that makes a point, not a label.' }
  ],

  /* Cities named in LocalBusiness.areaServed. Keep it to places the client
     genuinely serves — this is a claim, not a wish list. */
  areaServed: ['REPLACE__City One', 'REPLACE__City Two', 'REPLACE__Area A', 'REPLACE__Area B'],

  /* The two columns in the coverage band and the footer. `id` is matched
     against the `area` field on each hub and city page. */
  areaGroups: [
    { id: 'A', label: 'REPLACE__Area A' },
    { id: 'B', label: 'REPLACE__Area B' }
  ],

  /* ======================== insurance / money band ========================
   * Legal and pricing claims — the highest-risk copy on the site. Every card
   * here should be checkable against a statute or a policy document.
   *
   * Empty `cards` removes the entire band. For a trade where insurance is not
   * part of the buying decision, that is the right answer; do not repurpose it
   * into a generic "why us" section, which the page already has. */
  insurance: {
    eyebrow: 'Insurance',
    heading: 'REPLACE__What customers in this state actually pay',
    lead: 'REPLACE__Why this section exists, in one sentence.',
    cards: [
      { h: 'REPLACE__A misconception worth correcting',
        p: '<p>REPLACE__State the claim customers have heard, then what is actually true, with the statute named where one exists.</p>' },
      { h: 'REPLACE__So what will it cost?',
        p: '<p>REPLACE__What is generally true about coverage, without inventing a price.</p>' },
      { h: 'REPLACE__A right the customer has',
        p: '<p>REPLACE__A statutory protection worth knowing, cited.</p>' },
      { h: 'REPLACE__No insurance? That is common',
        p: '<p>REPLACE__How cash-pay works here.</p>' }
    ],
    /* Rendered under the cards. Set '' to drop the line. */
    disclaimer: 'REPLACE__Non-affiliation disclaimer naming no one the client is not actually affiliated with.'
  },

  /* ==================== service card grid heading ====================
   * The cards themselves come from the `card` block on each service below, so
   * adding a service adds a card and renaming a slug cannot orphan one. */
  serviceCards: {
    eyebrow: 'What we do',
    heading: 'REPLACE__What this business covers, in one line',
    lead: 'REPLACE__One sentence on how the work is scoped — one team, one visit, that kind of thing.'
  },

  /* Header nav — the highest-intent services plus both area hubs. Keep it
     short; the footer carries the complete link set, so nothing is orphaned.
     Slugs must exist below. This list also drives the 404 page. */
  nav: [
    'REPLACE__service-one',
    'REPLACE__service-two',
    'REPLACE__area-a-hub',
    'REPLACE__area-b-hub'
  ],

  /* ======================================================================
   * PAGES
   *
   * Every page needs: navLabel, shortLabel, title, desc, eyebrow, h1, sub,
   * svcValue, body, faq.
   *
   *   title      ≤ 60 chars or Google truncates it
   *   desc       ≤ 155 chars
   *   sub        HTML. Wrap the second half in <span class="sub-more"> to have
   *              it drop on small phones — the hero must stay above the fold.
   *   svcValue   preselects the form's service <select>; must match an
   *              <option value> in landing/template.html
   *   body       HTML. h2/h3, p, ul, and .callout blocks.
   *   faq        emitted as visible FAQ *and* FAQPage JSON-LD. Never put a
   *              claim in here you would not put in the body — it is the same
   *              publication, and it is the part Google reads most literally.
   * ==================================================================== */
  home: {
    navLabel: 'Home',
    shortLabel: 'Home',
    title: 'REPLACE__Primary service + market | Brand',
    desc: 'REPLACE__What the client does, where, and the one differentiator worth 155 characters.',
    eyebrow: 'REPLACE__Market · Positioning',
    h1: 'REPLACE__Primary service across the market',
    sub: '<p>REPLACE__The problem in the customer\'s words<span class="sub-more"> — then how this client solves it</span>.</p>',
    svcValue: 'REPLACE__service-value',
    body: `
<h2>REPLACE__Who this business is</h2>
<p>REPLACE__Two or three sentences that a competitor could not have written. Named
market, named constraints, real operating model.</p>

<h2>REPLACE__What we handle</h2>
<ul>
  <li><strong>REPLACE__Service</strong> — what it involves</li>
</ul>

<div class="callout">
  <h3>REPLACE__The honest version of the question customers are actually asking</h3>
  <p>REPLACE__The section that answers the thing competitors are vague about. This
  is the single highest-converting block on the Speedy build — do not skip it.</p>
</div>

<h2>REPLACE__Why customers pick us over the chains</h2>
<p>REPLACE__Specific, checkable differentiators.</p>
`,
    faq: [
      { q: 'REPLACE__The question every customer asks first',
        a: '<p>REPLACE__A straight answer, including the part that is inconvenient.</p>' },
      { q: 'REPLACE__The question about money',
        a: '<p>REPLACE__An answer that does not invent a price.</p>' },
      { q: 'REPLACE__The question about timing',
        a: '<p>REPLACE__An answer that does not promise a time the client does not control.</p>' }
    ]
  },

  /* ================================ SERVICES ================================
   * One page per service someone actually searches for, matched to an ad group.
   * A service with no ad group and no search volume is a footer link, not a
   * page. */
  services: [
    {
      slug: 'REPLACE__service-one',
      /* Drives one tile in the home-page card grid. Omit `card` to keep a
         service page out of the grid. Icon names come from ICONS in
         build-pages.cjs; add one there rather than reusing a near-miss. */
      card: {
        icon: 'windshield',
        title: 'REPLACE__Service one',
        blurb: 'REPLACE__Two lines on what this is and when you need it.',
        cta: 'REPLACE__See service one'
      },
      /* Photos beside the body. `chapter` is the 0-based index of the <h2> the
         photo illustrates; `src` names an entry in the `gallery` array above, so
         the alt text and caption are written once. A photo used here is dropped
         from this page's gallery — the same shot twice on one page reads as a
         thin library rather than a rich one, and verify.cjs fails on it.

         Attach one only where it genuinely illustrates that chapter. A site
         like this has ~100 h2 chapters and a client typically supplies a
         handful of usable photographs; the chapters without one get the
         heading-in-a-rail layout and are not missing anything. Recycling the
         same few photos down the page looks worse than no photos at all. */
      figures: [
        // { chapter: 0, src: 'work-example.webp' }
      ],
      navLabel: 'REPLACE__Short',
      shortLabel: 'REPLACE__Service one',
      title: 'REPLACE__Service one + market | Brand',
      desc: 'REPLACE__155 characters on service one specifically — every desc on the site must be different.',
      eyebrow: 'REPLACE__Service one',
      h1: 'REPLACE__Service one in the market',
      sub: '<p>REPLACE__One sentence that matches the search intent for this page.</p>',
      svcValue: 'REPLACE__service-value',
      body: `
<h2>REPLACE__When this service is the right answer</h2>
<p>REPLACE__Including when it is not, and which page to read instead. Linking a
visitor to the cheaper option they actually need converts better than selling
them the expensive one.</p>

<h2>REPLACE__What actually happens on the visit</h2>
<ul>
  <li>REPLACE__Step, in the order it happens</li>
</ul>

<div class="callout">
  <h3>REPLACE__The thing the customer is right to be suspicious about</h3>
  <p>REPLACE__Address it directly.</p>
</div>
`,
      faq: [
        { q: 'REPLACE__How long does it take?', a: '<p>REPLACE__</p>' },
        { q: 'REPLACE__What does it cost?', a: '<p>REPLACE__</p>' },
        { q: 'REPLACE__Is the work warranted?', a: '<p>REPLACE__Defined, not asserted.</p>' }
      ]
    },

    {
      slug: 'REPLACE__service-two',
      card: {
        icon: 'star',
        title: 'REPLACE__Service two',
        blurb: 'REPLACE__Two lines on what this is and when you need it.',
        cta: 'REPLACE__See service two'
      },
      navLabel: 'REPLACE__Short',
      shortLabel: 'REPLACE__Service two',
      title: 'REPLACE__Service two + market | Brand',
      desc: 'REPLACE__155 characters on service two, sharing no sentence with the page above.',
      eyebrow: 'REPLACE__Service two',
      h1: 'REPLACE__Service two in the market',
      sub: '<p>REPLACE__One sentence matching this page\'s search intent.</p>',
      svcValue: 'REPLACE__service-value',
      body: `
<h2>REPLACE__Heading</h2>
<p>REPLACE__Copy.</p>
`,
      faq: [
        { q: 'REPLACE__Question', a: '<p>REPLACE__Answer.</p>' }
      ]
    }
  ],

  /* ================================== HUBS ==================================
   * One per area group. These are the pages county-level and metro-level ads
   * point at, and they are where you are honest about coverage limits — a hub
   * that claims a region the client cannot service produces cancelled jobs and
   * one-star reviews. `area` must match an id in areaGroups. */
  hubs: [
    {
      slug: 'REPLACE__area-a-hub',
      /* Every page carries figures, not just the service pages — a hub or city
         page without them reads as a wall of text beside pages that alternate
         text and image. Two, at chapters 0 and 2, matches the rest of the site.
         Photos come from `bodyPhotos` and REPEAT across pages: that is fine and
         correct. Nobody reads two city pages, and a real photograph reused beats
         a stock one that is not this business. */
      figures: [
        // { chapter: 0, src: 'work-detail.webp' },
        // { chapter: 2, src: 'work-other.webp' }
      ],
      area: 'A',
      navLabel: 'REPLACE__Area A',
      shortLabel: 'REPLACE__All of Area A',
      title: 'REPLACE__Service + Area A | Brand',
      desc: 'REPLACE__155 characters on coverage of area A.',
      eyebrow: 'REPLACE__Area A',
      h1: 'REPLACE__Service in Area A',
      sub: '<p>REPLACE__What coverage of this area actually means.</p>',
      svcValue: 'REPLACE__service-value',
      body: `
<h2>REPLACE__Every city we reach, named</h2>
<p>REPLACE__List the towns that have their own page and link each one. Then list
the towns worked regularly without a dedicated page. Finish by telling a reader
whose town appears on neither list exactly how to get a yes or a no.</p>

<h2>REPLACE__The local pattern behind the phone calls</h2>
<p>REPLACE__One thing that is verifiably true of this territory and nowhere else
on the site: an employer, a corridor, a kind of housing, a season. Without it,
a regional page is a find-and-replace of the one beside it, which is precisely
what an "insufficient original content" disapproval is for.</p>
`,
      faq: [
        { q: 'REPLACE__Do you cover all of it?', a: '<p>REPLACE__Answer honestly, including the parts you do not.</p>' }
      ]
    },

    {
      slug: 'REPLACE__area-b-hub',
      /* Every page carries figures, not just the service pages — a hub or city
         page without them reads as a wall of text beside pages that alternate
         text and image. Two, at chapters 0 and 2, matches the rest of the site.
         Photos come from `bodyPhotos` and REPEAT across pages: that is fine and
         correct. Nobody reads two city pages, and a real photograph reused beats
         a stock one that is not this business. */
      figures: [
        // { chapter: 0, src: 'work-detail.webp' },
        // { chapter: 2, src: 'work-other.webp' }
      ],
      area: 'B',
      navLabel: 'REPLACE__Area B',
      shortLabel: 'REPLACE__All of Area B',
      title: 'REPLACE__Service + Area B | Brand',
      desc: 'REPLACE__155 characters on coverage of area B.',
      eyebrow: 'REPLACE__Area B',
      h1: 'REPLACE__Service in Area B',
      sub: '<p>REPLACE__What coverage of this area actually means.</p>',
      svcValue: 'REPLACE__service-value',
      body: `
<h2>REPLACE__What coverage of this region actually means</h2>
<p>REPLACE__If the client cannot service the whole of it, say which parts and
why, by name. A hub that overclaims produces cancelled jobs and one-star
reviews, and it is the single most common lie on a landing page of this kind.</p>

<ul>
  <li><strong>REPLACE__Sub-region</strong> — REPLACE__the cities in it</li>
</ul>

<h2>REPLACE__What drives the work here</h2>
<p>REPLACE__Different evidence from the other hub. Share nothing but the trade.</p>
`,
      faq: [
        { q: 'REPLACE__Do you cover all of it?', a: '<p>REPLACE__Answer.</p>' }
      ]
    }
  ],

  /* ================================= CITIES =================================
   * Kept in a separate file purely because a dozen city pages of genuinely
   * distinct local copy is a lot of text to hold in one module. */
  cities: require('./cities.config.cjs')
};
