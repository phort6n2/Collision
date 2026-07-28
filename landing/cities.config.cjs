/**
 * City pages.
 *
 * DOORWAY-PAGE WARNING — read this before writing the first one.
 *
 * One template with the city name swapped is close to Google's own definition
 * of a doorway page, and it risks an "insufficient original content"
 * disapproval across the whole ad account, not just the page. `npm run verify`
 * measures 5-gram shingle overlap across every city and hub body and FAILS the
 * build at 5% or above. Re-run it after every edit.
 *
 * The way to pass that check is not paraphrasing. It is to build each page on a
 * hook that is genuinely specific to that city — and to let the section
 * headings differ page to page, because identical headings are half the
 * overlap on their own. Things that have worked:
 *
 *   · the freeways and arterials that actually run through it, and what kind of
 *     traffic they carry
 *   · the housing stock, which decides whether the job happens in a driveway,
 *     a subterranean garage or a street bay
 *   · what the local employers are, and therefore where the cars sit all day
 *   · the crime or weather pattern that drives the local job mix
 *   · construction projects with real start and end dates
 *
 * RESEARCH DISCIPLINE. Every specific claim on these pages is a factual claim
 * on a paid landing page. On the build this template came from, the following
 * were all things a plausible-sounding first draft got WRONG: which company's
 * headquarters is still in the city, whether a road is still a state route,
 * whether a freeway enters the city limits, whether the city has rail. Check
 * each one, and leave a note here when you do so nobody "corrects" it back.
 *
 * DO NOT INVENT FACTS ABOUT THE BUSINESS. Languages spoken, staffing,
 * certifications, response times, coverage — if the client has not said it and
 * it is not on their own site, it does not go on the page, however well it
 * would fit the local demographics.
 *
 * `area` must match an id in areaGroups in pages.config.cjs.
 */

module.exports = [

  /* ============================== AREA A ============================== */

  {
    slug: 'REPLACE__service-city-one',
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
    navLabel: 'REPLACE__City One',
    shortLabel: 'REPLACE__City One',
    title: 'REPLACE__Service + City One | Brand',
    desc: 'REPLACE__155 characters naming districts or landmarks a local would recognise.',
    eyebrow: 'REPLACE__City One, ST',
    h1: 'REPLACE__Service in City One',
    sub: '<p>REPLACE__One or two sentences that could only have been written about this city.</p>',
    svcValue: 'REPLACE__service-value',
    body: `
<h2>REPLACE__A heading naming this city's specific situation</h2>
<p>REPLACE__The hook. What is different about driving, parking or living here,
and why that changes the work. Cite real roads, real employers, real numbers you
have checked.</p>

<h2>REPLACE__A second heading, different in shape from the other city pages</h2>
<p>REPLACE__Where the work actually happens here — driveways, garages, street
bays, office lots — and what that means for the appointment.</p>

<div class="callout">
  <h3>REPLACE__The local complication worth calling out</h3>
  <p>REPLACE__Something a customer in this city specifically needs to know.</p>
</div>

<h2>REPLACE__Where we work in this city</h2>
<p>REPLACE__Named districts and corridors, and what is needed on site.</p>
`,
    faq: [
      { q: 'REPLACE__A question specific to this city, not a reused one',
        a: '<p>REPLACE__Answer.</p>' },
      { q: 'REPLACE__A second local question',
        a: '<p>REPLACE__Answer.</p>' }
    ]
  },

  /* ============================== AREA B ============================== */

  {
    slug: 'REPLACE__service-city-two',
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
    navLabel: 'REPLACE__City Two',
    shortLabel: 'REPLACE__City Two',
    title: 'REPLACE__Service + City Two | Brand',
    desc: 'REPLACE__155 characters, different in construction from the page above.',
    eyebrow: 'REPLACE__City Two, ST',
    h1: 'REPLACE__Service in City Two',
    sub: '<p>REPLACE__A hook with nothing in common with City One\'s.</p>',
    svcValue: 'REPLACE__service-value',
    body: `
<h2>REPLACE__A heading with a different shape again</h2>
<p>REPLACE__Nothing in this paragraph should echo the sentence construction used
on the page above. Different subject, different rhythm, different evidence.</p>

<h3>REPLACE__A subheading the other page does not have</h3>
<ul>
  <li>REPLACE__A concrete local detail</li>
  <li>REPLACE__Another one</li>
</ul>

<h2>REPLACE__Access and parking here</h2>
<p>REPLACE__What the built environment means for getting the work done.</p>
`,
    faq: [
      { q: 'REPLACE__A question specific to this city',
        a: '<p>REPLACE__Answer.</p>' }
    ]
  }
];
