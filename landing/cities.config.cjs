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
 * THE SITE THIS ONE REPLACES FAILED EXACTLY THIS TEST. collisionglass.co's five
 * city pages were byte-for-byte identical in length, differing only in the city
 * name in the title, the H1 and one paragraph. That is the specific thing this
 * rebuild exists to fix — so if a future edit starts sanding these pages toward
 * a common shape, stop and find a new hook instead.
 *
 * Each page below is built on something that is true of that city and of
 * nowhere else on this site:
 *
 *   Portland     — street parking in a city where our shop is not, in fact, located
 *   Beaverton    — the OR-217 corridor and the park-and-ride day
 *   Hillsboro    — the edge of town where the metro becomes farmland
 *   Tualatin     — the shop is here; freight, flat lots and short waits
 *   Lake Oswego  — hillside driveways and what a slope does to a calibration
 *
 * RESEARCH DISCIPLINE — what was checked, so nobody "corrects" it back:
 *
 *   · 14201 NW Science Park Dr is in Cedar Mill, WASHINGTON COUNTY, with a
 *     Portland postal address. It is NOT inside Portland city limits. Confirmed
 *     via OpenStreetMap, which returns the business by name at that address with
 *     "Marlene Village, Portland, Washington County, Oregon" attached.
 *   · OR-217 is the Beaverton–Tigard Freeway, 7.7 miles, joining US-26 (Sunset
 *     Highway) at the north end to I-5 at the south. Verified.
 *   · Studded tires are legal in Oregon 1 Nov – 31 Mar; outside that window it
 *     is a Class C violation. A 2014 ODOT study estimated roughly $8.5m a year
 *     in damage to state highways alone. Verified — but this belongs to the
 *     Portland & Westside HUB page. Do not repeat it here.
 *   · Intel is Oregon's largest for-profit employer, ~20,000 in state, with its
 *     Gordon Moore Park at Ronler Acres campus in Hillsboro. Verified — and it
 *     is used on the HUB page, so the Hillsboro page deliberately takes a
 *     different angle to keep the shingle overlap down.
 *
 * DO NOT INVENT FACTS ABOUT THE BUSINESS. No response times, no crime
 * statistics dressed up as our call mix, no staffing or language claims.
 * Everything asserted traces to the client's own site or their own signage.
 *
 * `area` must match an id in areaGroups in pages.config.cjs.
 */

module.exports = [

  /* ============================== AREA A ============================== */

  {
    slug: 'auto-glass-repair-portland',
    figures: [
      { chapter: 0, src: 'two-tech-set-glass.webp' },
      { chapter: 2, src: 'inspection-clipboard.webp' }
    ],
    area: 'A',
    navLabel: 'Portland',
    shortLabel: 'Portland',
    title: 'Auto Glass Repair Portland OR | Collision Auto Glass',
    desc: 'Mobile auto glass and windshield service across Portland, from the inner eastside grid to the West Hills. Kerbside parking is not a problem.',
    eyebrow: 'Portland, OR',
    h1: 'Auto glass repair in Portland',
    sub: '<p>Most of our Portland customers have no driveway. That shapes everything about how the appointment works here.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>Kerbside is the normal case in this city</h2>
<p>Across most of inner Portland — the eastside grid, the Alphabet District, the
close-in southeast — the car lives on the street. There is no driveway to work
in, the space in front of the house is not reserved for you, and in the permit
districts it may not even be available to us.</p>
<p>That is not an obstacle, it is just the brief. Kerbside glass work is the
version of this job we do most often, and what it needs is a legal, reasonably
level stretch with enough room to open both front doors and stand at the front of
the car. What genuinely defeats it is a car boxed in bumper to bumper on a narrow
street with traffic moving past the working side.</p>

<h2>What to sort out before we arrive</h2>
<ul>
  <li>If you are in a permit zone, park where a visiting vehicle can legally stop nearby, or tell us and we will plan around it</li>
  <li>If the only space is on a busy arterial, consider moving the car to a side street for the appointment — safer for everyone and quicker</li>
  <li>Apartment and condo residents: tuck-under garages are frequently too low for the van, and the surface lot is usually the better answer</li>
  <li>Steep West Hills streets are workable, but a pronounced cross-slope is worth mentioning when you book</li>
</ul>

<h2>Being straight about where our shops are</h2>
<p>We do not have premises inside Portland city limits, and we are not going to
imply otherwise. Our nearest shop is in Cedar Mill on NW Science Park Drive —
it carries a Portland postal address, but it sits in Washington County, west of
the tunnel. The other is in Tualatin.</p>
<p>For anyone in the city itself that mostly does not matter, because the vans
come to you and it costs nothing extra. Where it does matter is the jobs that
have to happen indoors: a static camera calibration needing a level floor, or
bonded glass during a genuinely wet stretch. In those cases you are driving out
to Cedar Mill rather than round the corner, and you should know that going in
rather than finding out on the day.</p>

<div class="callout">
  <h3>If the car has been broken into</h3>
  <p>Say so when you call, because it changes the order of operations. A car
  sitting on a Portland street with a window out is exposed to the weather and
  conspicuous, so the priority is getting it sealed and weathertight — which we
  can usually do quickly even when the exact glass has to be ordered.</p>
  <p>Photograph the damage before you clear anything up if there is a claim or a
  report. Then get the loose fragments off the seats. The glass inside the door
  is ours to deal with, and it needs the trim panel off rather than a brush —
  <a href="/ASSET/door-glass-repair">why that matters is here</a>.</p>
</div>

<h2>Where we work across the city</h2>
<p>North and Northeast, the inner and outer Southeast, Southwest and the West
Hills, St Johns, and the industrial pockets along the river where a lot of cars
sit in fenced yards all day. If you are on the far eastern edge past the city
line, call and check rather than assume — that is the direction in which our
coverage genuinely starts to thin.</p>
`,
    faq: [
      { q: 'Can you work on a car parked on the street?',
        a: '<p>Yes, and in Portland that is the normal job rather than the exception. We need a legal spot with room to open both front doors and work at the front of the car. A vehicle wedged bumper to bumper on a narrow street with traffic passing the working side is the one situation where we will ask you to move it first.</p>' },
      { q: 'Do you have a shop in Portland?',
        a: '<p>No. The nearest is Cedar Mill, on NW Science Park Drive off the Sunset Highway — a Portland postal address but actually in Washington County. The other shop is in Tualatin. For mobile work that makes no difference; for a job that has to come indoors it means a drive out of the city, and we will tell you when that applies.</p>' },
      { q: 'My building has an underground garage. Is that workable?',
        a: '<p>Often not, because of headroom for the van rather than space around the car. If there is surface parking or a nearby street space, that is usually the easier answer. Tell us which building at booking and we can normally work it out from there without wasting a visit.</p>' },
      { q: 'Is it illegal to drive around Portland with a cracked windshield?',
        a: '<p>Oregon sets no specific crack length in law. ORS 815.220 makes it unlawful to drive with an obstruction that impairs your view, which is a judgement about your particular damage rather than a measurement. A crack running across the driver\'s side is the kind that draws attention.</p>' }
    ]
  },

  {
    slug: 'auto-glass-repair-beaverton',
    figures: [
      { chapter: 0, src: 'cowl-wiper-detail.webp' },
      { chapter: 2, src: 'adas-calibration-scan.webp' }
    ],
    area: 'A',
    navLabel: 'Beaverton',
    shortLabel: 'Beaverton',
    title: 'Auto Glass Repair Beaverton OR | Collision Auto Glass',
    desc: 'Windshield and auto glass service throughout Beaverton, from the 217 corridor to the apartment complexes off Canyon Road. Free mobile service.',
    eyebrow: 'Beaverton, OR',
    h1: 'Auto glass repair in Beaverton',
    sub: '<p>Seven and a half miles of commuter freeway run through this town, and a fair amount of our work traces back to it.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>The 217 factor</h2>
<p>Oregon Route 217 — the Beaverton–Tigard Freeway — runs 7.7 miles from the
Sunset Highway at the north end down to Interstate 5 at Tigard. It is short,
heavily used, and it is the reason a lot of Beaverton drivers spend their commute
in dense stop-start traffic at close following distances.</p>
<p>Close following distance is the mechanism that matters for glass. A stone
flicked up by the vehicle in front arrives with far more energy when you are two
car lengths back than when you are eight, and rush hour on a corridor this short
compresses everybody. It is a different damage profile from an open highway
strike: more frequent, smaller, and concentrated low on the glass where the
wipers throw grit around afterwards.</p>

<h2>Where Beaverton cars actually spend the day</h2>
<p>This town has a lot of transit parking and a lot of apartment living, and both
are good news for the way we work.</p>
<ul>
  <li><strong>Park-and-ride lots.</strong> A car left at a MAX station at eight in the morning and collected at six is parked, level and undisturbed for the entire working day — close to a perfect mobile appointment, and one that costs you no time at all.</li>
  <li><strong>Apartment and condo lots.</strong> Common throughout the town, generally flat, usually with enough room. Worth clearing with the property manager first, which is the one thing that reliably delays these bookings.</li>
  <li><strong>Business park surface lots.</strong> Same advantages, same access caveat.</li>
</ul>
<p>Tell us where the car will be sitting and for how long, and we will match the
job to it. A windshield with a cure time is a much easier proposition when the
car is not needed until evening.</p>

<div class="callout">
  <h3>The one Beaverton complication worth flagging</h3>
  <p>Shared parking is not always parking you can authorise work in. Apartment
  complexes, condo associations and business parks vary enormously in whether a
  service vehicle can operate on site, and finding out on the morning is the
  single most common way one of these appointments falls over.</p>
  <p>A message to your property manager the day before is usually all it takes.
  Where the answer is no, a nearby street or a retail lot generally works, or we
  bring the car into Cedar Mill, which from most of Beaverton is a short run.</p>
</div>

<h2>Getting to us, if it comes to that</h2>
<p>Some jobs belong indoors — a static calibration that needs a level floor and a
measured target distance, or bonded glass in a downpour. Our Cedar Mill shop is
just off the Sunset Highway at the top of the 217, which from most of Beaverton
is a short trip against the traffic rather than with it. See
<a href="/ASSET/adas-calibration">what the calibration involves</a> if your car
has a camera behind the glass.</p>
`,
    faq: [
      { q: 'Can you meet me at a park-and-ride?',
        a: '<p>Yes, and it is one of the better arrangements going. The car sits level and undisturbed all day, which suits a job with a cure time, and you lose no time to the appointment. Confirm the lot allows it — most are fine — and let us know which one and roughly where you tend to park.</p>' },
      { q: 'Do I need permission from my apartment complex?',
        a: '<p>Usually yes, and it is worth a message the day before. Complexes here differ widely on whether service vehicles can work in the lot. Where it is not allowed, a nearby street space normally works, or we bring the car into the Cedar Mill shop instead.</p>' },
      { q: 'How far is your shop from Beaverton?',
        a: '<p>Cedar Mill is at 14201 NW Science Park Dr, just off the Sunset Highway near the north end of the 217 — a short run from most of Beaverton. That is where we bring anything needing a level floor for calibration or shelter for bonded glass.</p>' },
      { q: 'I keep getting chips on the 217. Can anything be done?',
        a: '<p>Not about the road, no. What does help is dealing with each chip while it is still small, dry and clean — resin bonds far better to a fresh break than to one that has sat through a wet month. <a href="/ASSET/rock-chip-repair">Rock chip repair</a> covers the timing, which matters more than most people think.</p>' }
    ]
  },

  {
    slug: 'auto-glass-repair-hillsboro',
    figures: [
      { chapter: 0, src: 'cabin-header-trim.webp' },
      { chapter: 2, src: 'van-door-decal.webp' }
    ],
    area: 'A',
    navLabel: 'Hillsboro',
    shortLabel: 'Hillsboro',
    title: 'Auto Glass Repair Hillsboro OR | Collision Auto Glass',
    desc: 'Auto glass and windshield service across Hillsboro, where the metro runs out into Tualatin Valley farmland and the road debris changes with it.',
    eyebrow: 'Hillsboro, OR',
    h1: 'Auto glass repair in Hillsboro',
    sub: '<p>Hillsboro is where the built-up metro stops and the valley starts. The glass damage changes at that line.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>Two road environments in one town</h2>
<p>Drive east out of Hillsboro and you are on multi-lane arterials through
continuous development all the way to Portland. Drive west or north and within a
few minutes you are on two-lane county roads running between fields, with gravel
shoulders, no kerbs, and farm equipment that uses them as working routes rather
than commuting routes.</p>
<p>Those are different hazards. Metro traffic throws small aggregate off worn
pavement. Valley roads throw larger, sharper material off unbound shoulders,
kicked up by vehicles running wider and faster than the lane really allows, and
they carry seasonal traffic that sheds mud and stone directly onto the surface
during planting and harvest.</p>
<p>The practical consequence is that Hillsboro drivers who commute one way get a
steady drip of small chips, and those who drive the other way get fewer but
nastier impacts — the kind more likely to need
<a href="/ASSET/windshield-replacement">replacement</a> rather than resin.</p>

<h2>Long shifts, and what they are good for</h2>
<p>A lot of employment here runs on schedules that are not nine to five. Where a
car is going to be parked in the same spot for ten or twelve hours, a windshield
becomes a much less disruptive job than it is for someone who needs the vehicle
at lunchtime — the adhesive gets its safe drive-away time without anyone waiting
around for it.</p>
<p>If you work a compressed shift, that is worth mentioning when you book. It
usually means we can do the whole job while the car sits, rather than working
around a departure time.</p>

<div class="callout">
  <h3>Check the perimeter, not just the chip</h3>
  <p>One thing worth knowing on cars that spend time on unpaved shoulders and
  farm approaches: grit collects in the channel where the windshield meets the
  cowl, and it stays there. Every wiper cycle then drags it across the lower
  glass.</p>
  <p>It produces a hazy, scratched band low on the windshield that people put
  down to age. It is not age. If you are having glass work done anyway, that
  channel gets cleared as part of the job — and if you are not, it is worth
  flushing out yourself before the next dry spell.</p>
</div>

<h2>Coverage out this way</h2>
<p>Hillsboro itself, plus Cornelius, Forest Grove and the surrounding rural
addresses, are routine for us. Push much further west or north and we start
scheduling rather than promising — the honest limit is a drive time, not a
boundary line, and it moves with the day.</p>
<p>Give us the address and we will tell you yes or no on the phone. What we will
not do is take a booking we are not confident of keeping, because a cancelled
appointment out here costs you a great deal more time than it costs us.</p>
`,
    faq: [
      { q: 'Do you cover Forest Grove and Cornelius?',
        a: '<p>Yes, both routinely, along with the rural addresses around them. Further out toward Banks or Gaston it becomes a scheduling question rather than a straight yes — call with the address and we will give you a real answer instead of booking you and reassessing later.</p>' },
      { q: 'Can you come to the car park while I am on shift?',
        a: '<p>That is often the ideal arrangement, particularly on a longer shift, because the vehicle sits undisturbed while the adhesive cures. The thing to check first is site access — larger campuses frequently have gated or badge-controlled parking, and that needs sorting with your facilities team before the day.</p>' },
      { q: 'Why does my windshield look hazy at the bottom?',
        a: '<p>Usually grit trapped in the cowl channel at the base of the glass, dragged back and forth by the wipers. It is common on cars that spend time on gravel shoulders and unpaved approaches. Once the glass is scratched it cannot be polished out, but clearing the channel stops it getting worse.</p>' },
      { q: 'Is a chip from a farm road different from a highway chip?',
        a: '<p>Often, yes. Highway strikes tend to be small and blunt, which produces the neat bullseye that fills well with resin. Larger sharp material tends to produce star breaks with longer legs, which are repairable but less forgiving and more likely to run. <a href="/ASSET/windshield-chip-repair">The break types are set out here</a>.</p>' }
    ]
  },

  /* ============================== AREA B ============================== */

  {
    slug: 'auto-glass-repair-tualatin',
    figures: [
      { chapter: 0, src: 'tualatin-bay-install.webp' },
      { chapter: 2, src: 'cowl-wiper-detail.webp' }
    ],
    area: 'B',
    navLabel: 'Tualatin',
    shortLabel: 'Tualatin',
    title: 'Auto Glass Repair Tualatin OR | Collision Auto Glass',
    desc: 'Auto glass and windshield service in Tualatin, where our second shop sits on SW Mohave Court. In-shop or mobile, whichever suits the job.',
    eyebrow: 'Tualatin, OR',
    h1: 'Auto glass repair in Tualatin',
    sub: '<p>This is the one town on the site where you can simply drive to us, and where the wait is shortest.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>Our second shop is here</h2>
<p>19390 SW Mohave Ct, in the industrial area off Tualatin–Sherwood Road with
straightforward access from I-5. For anyone living or working in this town, that
changes the calculation in a way it does not anywhere else on this site: the
in-shop option is genuinely convenient rather than a fallback, and jobs needing a
controlled environment do not involve a trek.</p>
<p>Which matters more than it sounds. A static camera calibration needs a level
floor and a target at a measured distance. Bonded glass wants shelter in a wet
month. Being ten minutes from a bay rather than forty is the difference between
those being an easy yes and an inconvenience you have to weigh up.</p>

<h2>A town built around freight</h2>
<p>Tualatin's character is warehousing and distribution — wide roads, big
turning circles, heavy vehicles moving through all day. For glass, the relevant
part is what runs in front of you: flatbeds, tippers, container chassis and
equipment transporters, which are the vehicle categories most likely to carry
loose material or shed it off the deck and tyres.</p>
<p>The other half is where those roads have been repeatedly loaded by heavy
axles. Surfaces break up faster under that traffic, and broken surfaces produce
the loose aggregate that ends up in your windshield. It is why the roads around
an industrial district reliably generate more chips than a residential street a
mile away carrying the same number of cars.</p>

<div class="callout">
  <h3>The advantage of the shop being local, stated plainly</h3>
  <p>We can be flexible here in a way we cannot be at the far edges of the
  service area. If a mobile job turns out to need a bay — corrosion under the
  old glass, weather closing in, a calibration that will not settle on a sloping
  surface — moving it indoors is a short drive rather than a rescheduled day.</p>
  <p>So if you are in Tualatin and unsure which way to book it, book whichever
  suits you. We can change the plan without it costing you the appointment.</p>
</div>

<h2>The rest of this corner</h2>
<p>From here, Sherwood, Durham, King City and Wilsonville are all short runs, and
we work them regularly. <a href="/ASSET/auto-glass-repair-lake-oswego">Lake
Oswego</a> is close too, though the terrain there asks different questions of a
mobile job. The <a href="/ASSET/south-metro-auto-glass">South Metro page</a> sets
out how far this side genuinely extends, including where it stops.</p>
`,
    faq: [
      { q: 'Can I just drive in?',
        a: '<p>Call first so we know the vehicle and can have the right glass on hand — turning up unannounced usually means the part has to be ordered anyway. Once we know what you have, a booked slot at Mohave Court is generally the fastest route to done for anyone local.</p>' },
      { q: 'Which is better here, mobile or in-shop?',
        a: '<p>For a chip repair or door glass, mobile is fine and saves you the trip. For a windshield with a static calibration, or bonded work in a wet stretch, the shop gives a better result. Because you are close, that choice costs you very little either way — which is not true everywhere we work.</p>' },
      { q: 'Do you work on commercial vehicles and fleet?',
        a: '<p>Yes, and given where the shop sits it is a normal part of the week. Vans, box trucks and light commercial are all straightforward. Tell us the fleet size and where the vehicles are kept — several units in one yard is usually better handled on site in a single visit.</p>' },
      { q: 'How quickly can you get glass for an older vehicle?',
        a: '<p>Common vehicles are usually available locally. Anything older or less common gets ordered, and that is a matter of days rather than hours. The VIN helps considerably, because glass varies by trim and build date within a model year — so we order what your car actually takes.</p>' }
    ]
  },

  {
    slug: 'auto-glass-repair-lake-oswego',
    figures: [
      { chapter: 0, src: 'adas-calibration-scan.webp' },
      { chapter: 2, src: 'two-tech-set-glass.webp' }
    ],
    area: 'B',
    navLabel: 'Lake Oswego',
    shortLabel: 'Lake Oswego',
    title: 'Auto Glass Repair Lake Oswego OR | Collision Auto Glass',
    desc: 'Auto glass service in Lake Oswego, where hillside driveways and heavy tree cover change what a mobile windshield job can sensibly do.',
    eyebrow: 'Lake Oswego, OR',
    h1: 'Auto glass repair in Lake Oswego',
    sub: '<p>Steep, wooded and built before anyone was thinking about parking a service van. Worth planning around rather than discovering.</p>',
    svcValue: 'windshield-replacement',
    body: `
<h2>Gradient is the thing that decides the appointment</h2>
<p>Lake Oswego is built into slopes, and the driveways reflect it: short, steep,
often turning as they climb, frequently ending in a garage cut into the hill.
That is fine for the glass itself. It is a real problem for one specific part of
the job.</p>
<p>A static ADAS calibration requires the vehicle to sit on a genuinely level
surface with a target positioned at a measured distance and height. A driveway
running at a noticeable gradient cannot deliver that. What makes this worth
saying out loud is that the equipment will often still produce a result on a
slope — and a calibration that reports success from a bad setup is more dangerous
than one that fails honestly, because everyone involved believes it is done.</p>
<p>So on the hillside streets here we will frequently propose bringing the car
into Tualatin for that stage. From most of Lake Oswego that is a short drive down
to the I-5 corridor, and it is the difference between a calibration you can rely
on and one that merely says it passed.</p>

<h2>The tree canopy, which cuts both ways</h2>
<p>The mature cover this town is known for genuinely protects glass — less direct
sun, less thermal cycling, and a chip that might have run in an exposed car park
often sits stable for months under shade.</p>
<p>What it is unhelpful for is the moment of installation. Urethane needs a clean,
dry bonding surface, and working beneath established trees in this climate means
drips long after the rain has stopped, plus needles, seed and pollen settling on
an adhesive bead that is supposed to hold for the life of the vehicle. Sap on the
glass edge is worse still.</p>
<p>Where a driveway sits directly beneath heavy cover, we would rather move the
car a few metres into the open, use a garage if there is room, or bring it
indoors. It is a small adjustment that decides whether the bond is sound.</p>

<div class="callout">
  <h3>Garages here are frequently the answer</h3>
  <p>Older houses in this town often have garages that are perfectly usable for
  glass work and simply too full to use. If yours has room for the car plus a
  metre or so at the front, that is the best of both: level, dry, sheltered,
  out of the canopy.</p>
  <p>Have a look before the appointment and tell us at booking. A cleared garage
  regularly turns a job we would otherwise have moved indoors into one we can
  finish at your house.</p>
</div>

<h2>Getting around, and where we reach</h2>
<p>The lake itself divides this town more than a map suggests — routes bend
around it, and two addresses a short distance apart as the crow flies can be a
long way apart to drive. If you are giving us directions, the nearer arterial is
more useful to us than a postcode.</p>
<p>We cover Lake Oswego, West Linn and across toward Durham and Tigard as
routine. East over the river into Oregon City and Milwaukie is outside our natural
territory and we will say so rather than stretching to it.</p>
`,
    faq: [
      { q: 'My driveway is steep. Can you still do the windshield?',
        a: '<p>The glass itself, generally yes. A static camera calibration on a gradient is the part that does not work reliably, and rather than take a result we do not trust we will suggest finishing that stage at the Tualatin shop. From most of Lake Oswego that is a short drive.</p>' },
      { q: 'Can you work under the trees on my street?',
        a: '<p>Often, with a caveat. Bonded glass needs a clean dry surface, and heavy cover means drips, needles and pollen landing on the adhesive. If we can move the car into the open or use a garage we will suggest it — a few metres usually solves it entirely.</p>' },
      { q: 'Would using my garage help?',
        a: '<p>A great deal, if there is room for the car plus a little space at the front. Level, dry and sheltered is exactly what this work wants, and it removes both the gradient problem and the canopy problem at once. Worth checking whether yours has the space before you book.</p>' },
      { q: 'Do you cover West Linn as well?',
        a: '<p>Yes, routinely — it sits on the same side and raises much the same questions about slope and tree cover. Further east across the river into Oregon City and Milwaukie is beyond where we work regularly, and we would rather tell you that than take the booking.</p>' }
    ]
  }
];
