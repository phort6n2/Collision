# Google Ads final-URL migration

`collisionglass.co` → `quote.collisionautoglass.com`

The domain is changing, so every final URL in the account has to be edited
regardless. That edit should also carry the **new path** where one applies —
doing both in one pass costs nothing extra and avoids leaning on a redirect.

## Why not just change the domain

Because the old site carried fourteen service URLs for about seven services.
Four paths — `/windshield-repair`, `/rock-chip-repair`, `/windshield-chip-repair`,
`/windshield-crack-repair` — answered one customer question, and three more did
the same for side glass. Near-duplicate pages compete with each other in the
same auction and read as thin to Google, which is a landing-page-experience
problem rather than a cosmetic one.

Seven service pages now, each owning a distinct subject. Nothing was deleted:
the break typology, the crack-propagation material and the door-cavity detail
all moved into the page that absorbed them.

## The mapping

**Unchanged — edit the host only (11)**

| Final URL path | Status |
|---|---|
| `/` | unchanged |
| `/windshield-replacement` | unchanged |
| `/windshield-repair` | unchanged — now also covers rock chips, break types and cracks |
| `/adas-calibration` | unchanged |
| `/auto-glass-repair-portland` | unchanged |
| `/auto-glass-repair-beaverton` | unchanged |
| `/auto-glass-repair-hillsboro` | unchanged |
| `/auto-glass-repair-tualatin` | unchanged |
| `/auto-glass-repair-lake-oswego` | unchanged |
| `/privacy` | unchanged |
| `/terms` | unchanged |

**Changed — edit the host AND the path (11)**

| Old path | New path |
|---|---|
| `/rock-chip-repair` | `/windshield-repair` |
| `/windshield-chip-repair` | `/windshield-repair` |
| `/windshield-crack-repair` | `/windshield-repair` |
| `/car-window-repair` | `/side-window-replacement` |
| `/car-window-replacement` | `/side-window-replacement` |
| `/door-glass-repair` | `/side-window-replacement` |
| `/back-glass-repair` | `/back-window-replacement` |
| `/mobile-service` | `/mobile-auto-glass` |
| `/auto-insurance` | `/insurance-claims` |
| `/auto-glass-repair` | `/` |
| `/auto-glass-replacement` | `/` |

## The safety net, and why it is not the plan

All eleven old paths are **301'd** to their new home from the root
`vercel.json`. So an ad final URL that gets missed will redirect rather than
404 — the difference between a crawler hop and a disapproved ad.

Do not treat that as permission to skip the edit. A same-domain redirect on a
live ad destination adds a hop Google follows before scoring landing page
experience, for no benefit. The redirects exist because the Ads final-URL
export has not been supplied, so there may be a URL referenced by an ad that no
crawl of the old site could reveal.

Checked against every path the old site served:

```
$ node landing/check-urls.cjs --file old-urls.txt
EXACT (11) · REDIRECT ONLY (11) · MISSING (0)
```

**Zero missing is the number that matters** — nothing on the old site can 404
on the new one. The eleven redirect-only entries are the checker telling you to
correct those final URLs, which is exactly what the table above is for.

## Order of operations at cutover

1. Deploy to `quote.collisionautoglass.com` and confirm the 15 pages serve
2. Export final URLs from Google Ads at **keyword, ad and sitelink level**
3. Run `npm run check:urls -- --file ads-final-urls.txt` — no `--allow-redirects`
4. Fix anything it reports by correcting the final URL in Ads, using the table above
5. Re-run until it reports 0 redirect-only and 0 missing
6. Leave `collisionglass.co` serving until the change has propagated

One caution on step 2: editing an ad's final URL may reset that ad's
performance history depending on ad type, whereas keyword- and sitelink-level
final URLs edit in place. Worth checking which level your URLs are set at
before you start, so the reset is a decision rather than a surprise.
