# Turning Clarity into a better site

## The honest constraint, first

**You cannot A/B test this site.** That is not a tooling gap, it is arithmetic:

| Baseline conversion rate | Sessions needed **per arm** to detect a 20% lift |
|---|---|
| 0.6% | ~66,000 |
| 2.0% | ~19,600 |
| 5.0% | ~7,600 |

The whole account produced **96 conversions in 30 days**. A single page gets a
few hundred clicks a month. Split that in two and a test would need years to
say anything, and would spend the entire time serving half your traffic a
variant you believed in less.

So the loop is not experimentation. It is:

> **find what is visibly broken → fix it → confirm it stopped happening**

That is a lower ceiling than a real testing programme, and it is the honest one
at this volume. It also happens to be where nearly all the value is early on:
sites at this stage lose conversions to things that are simply wrong, not to
suboptimal button colours.

---

## What is running

**Instrumentation** (`landing/template.html`, emitted only when `site.ads.clarityId` is set)

Every session carries labels drawn from data the page already computes:

| Tag | Values | What it answers |
|---|---|---|
| `form_outcome` | `converted` · `validation_failed` · `bot_check` · `delivery_failed` | Which of the four ways a submit can end |
| `validation_field` | `nm` `ph` `em` `zip` `veh` | **Which field** stopped them |
| `bot_reason` | `honeypot` · `no_trusted_interaction` | Why the bot check fired |
| `page_kind` | `home` `service` `hub` `city` | Whether a page type behaves differently |
| `page_path`, `service` | slug, service value | Which page and which job |
| `utm_campaign`, `utm_term` | from the URL | Which ad group sends struggling traffic |
| `paid` | `yes` / `no` | Paid vs organic, without storing the click ID |

Plus events: `lead_submitted`, `form_validation_failed`, `form_dropped_bot_check`,
`form_delivery_failed`.

`validation_field` is the highest-value tag here. It converts "the form
underperforms" — which nobody can act on — into "eleven people this week were
stopped on the ZIP field", which anybody can.

**Collection** (`.github/workflows/clarity-digest.yml`, daily 08:40 UTC)

Pulls the Data Export API, appends to `docs/clarity/history.json`, rewrites
`docs/clarity/digest.md` with 7-day windows and week-over-week deltas. Commits
with `[skip ci]` so it does not trigger a production deploy every morning.

Daily rather than weekly because the API accepts `numOfDays` of only 1–3 — a
weekly job would silently miss four days in seven. Keeping our own history in
git also means the trend outlives Clarity's own retention window.

---

## The weekly pass — about twenty minutes

**1. Open `docs/clarity/digest.md`.** Take the single worst row. One, not five.

**2. Ignore anything that moved by less than a handful of sessions.** At this
volume most week-to-week movement is noise, and chasing it is how a site gets
worse slowly — each change is defensible, the sum is drift.

**3. Open Clarity and filter to that page.** Add the tag that matches the
symptom:

- Form problem → filter `form_outcome`, watch `validation_failed` sessions
- Rage or dead clicks → filter to the page, sort by rage clicks, watch
- Bad traffic → filter `utm_campaign` and compare a good campaign against a bad
  one on the same page

**4. Watch five sessions. Do not skim.** Five is enough to see a pattern and
few enough that you will actually do it. Write down what you saw in one
sentence — if you cannot, you have not seen a pattern yet.

**5. Decide what kind of finding it is.** This is the step that matters:

| It looks like | Do |
|---|---|
| Something is broken — a dead control, an error, a field rejecting valid input | Fix it. This is the whole point. |
| Copy is unclear, people hesitate in one place | Change it, once, and note the date. |
| People want something the page does not offer (a price, a timeframe) | **Ask the client first.** Do not invent it. |
| It is one person having a bad day | Nothing. |

**6. Make the change through the normal path.** Config, not markup, wherever it
can be. Then `npm run build:landing && npm run verify && npm run qa:render`.
The existing gates apply — a Clarity finding is not a licence to bypass them.

**7. Where the fix is mechanical, add an assertion.** If a dead click came from
a non-link that reads as a link, a `verify` check that the element is an anchor
stops it returning. Findings that become assertions never need finding twice.
That is the only part of this loop that compounds.

**8. Write it down.** One line in `docs/clarity/changelog.md`: date, what you
saw, what you changed. Without it you cannot tell in three months whether any
of this worked, and you will re-litigate the same decision.

---

## Measuring whether it worked

Not with a p-value. Two things, both slow:

- **Did the symptom stop?** If eleven people a week were being stopped on the
  ZIP field and next month it is zero, the fix worked. This is the reliable
  signal and it needs no statistics.
- **Did conversion rate move?** Compare **four-week windows** in Google Ads, not
  weeks. And expect ambiguity: with ~96 conversions a month, a swing from 96 to
  108 is well inside normal variation. Do not claim a win from it.

If a change cannot be justified by the first test, be sceptical of it.

---

## What this deliberately does not do

**It does not change the site automatically.** A site that edits itself from
heatmap data optimises for whatever the metric happens to measure, which is
never quite what you meant. Every change here goes through a person.

**It does not raise an alert per finding.** A daily notification that says
nothing becomes a daily notification nobody reads, and then the one that matters
gets missed too. The digest sits in the repo until you look at it.

**It does not track individuals.** No tag identifies a visitor. The form is
masked at the element, so name, email, phone and VIN never reach Clarity — and
that is enforced by `verify`, not by a dashboard setting somebody can change.

---

## Setup — two values needed

1. **Project ID** — Clarity → Settings → Overview. Goes in
   `site.ads.clarityId` in `pages.config.cjs`. Until it is set, no Clarity
   script is emitted at all and `verify` warns rather than fails.
2. **API token** — Clarity → Settings → Data Export → generate. Goes in the
   GitHub repo secret **`CLARITY_API_TOKEN`**. Until it is set, the daily job
   skips cleanly with a notice instead of failing red every morning.

Check it locally without a token or a network call:

```
node landing/clarity-digest.cjs --fixture
```

**Not yet verified against the live API.** The response shape is parsed
defensively and an unexpected payload is printed rather than thrown, but the
first real run is the first real test. Watch the first scheduled run and read
the "Show the digest" step output.
