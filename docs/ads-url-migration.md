# Cutover: taking over `collisionglass.co`

**The site keeps the domain it is replacing.** This is not a launch on a new
host with a redirect from the old one — it is a DNS change on `collisionglass.co`
that swaps GoHighLevel out and this build in.

That changes the shape of the job considerably, and mostly in our favour.

## What this means for Google Ads

Every live final URL already points at `collisionglass.co/<path>`. The host is
not changing, so **most of the account needs no edit at all.**

**11 paths — no Ads work whatsoever**

`/` · `/windshield-replacement` · `/windshield-repair` · `/adas-calibration` ·
`/auto-glass-repair-portland` · `/auto-glass-repair-beaverton` ·
`/auto-glass-repair-hillsboro` · `/auto-glass-repair-tualatin` ·
`/auto-glass-repair-lake-oswego` · `/privacy` · `/terms`

Same domain, same path, real page. Those ads keep serving through the cutover
without anybody touching them.

**11 paths — 301'd, and editable at leisure**

| Old path | Now redirects to |
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

Checked against every path the old site served:

```
$ node landing/check-urls.cjs --file old-urls.txt
EXACT (11) · REDIRECT ONLY (11) · MISSING (0)
```

**Zero missing.** Nothing 404s on cutover day whether or not a single final URL
is edited.

## About that consolidation — the trade-off moved

The fourteen service URLs became seven because four paths answered one customer
question and three more did the same for side glass. Near-duplicate pages
compete with each other in the same auction and read as thin.

When the plan was a new subdomain, that consolidation was **free**: every final
URL had to be edited for the host anyway, so a better slug cost nothing.

Staying on `collisionglass.co` removes that argument. Those eleven paths would
have needed no edit at all under strict parity, and now they either get edited
or they serve through a redirect hop.

**The recommendation is still to keep it**, for three reasons:

1. The near-duplicate problem is the main thing the rebuild exists to fix.
   Re-splitting `/windshield-repair` back into four thin pages to avoid eleven
   form edits is the wrong trade.
2. Nothing breaks in the meantime. The 301s hold indefinitely, so this can be
   tidied whenever it is convenient rather than on cutover day.
3. A same-domain 301 costs a crawler hop before landing page experience is
   scored. That is a real but small cost, and it is reversible by editing the
   URL — unlike shipping seven near-duplicate pages, which is not.

So: **cut over first, edit the eleven when you have a quiet hour.** If you would
rather not edit them at all, that is a defensible choice too — just know the hop
is there.

## The cutover itself is the risky part now

A subdomain launch is reversible: the old site keeps serving while the new one
is tested. **This is not.** The moment `collisionglass.co` repoints, GoHighLevel
stops answering and this build starts, for every visitor and every ad click at
once. There is no overlap window and no rollback except pointing DNS back and
waiting for it to propagate.

So the order matters:

1. **Get preflight green first.** Right now the build carries
   `REPLACE__AW-0000000000` in a live script tag and a placeholder GHL webhook.
   Cutting over in that state means live ad traffic hitting a page that reports
   no conversions and posts leads nowhere.
2. **Deploy and test on the Vercel URL** before touching DNS. Click every page,
   submit the form, confirm the lead lands in the CRM.
3. **Snapshot the GHL site before you dismantle anything.** Export or screenshot
   the funnel. Once DNS moves you cannot see it at that address again, and it is
   the only record of what the ads were pointing at.
4. **Then move DNS**, and watch the first conversions land rather than assuming.
5. **Do not delete the GHL funnel for a while.** It costs nothing to leave it
   sitting there, and it is the only rollback that does not involve rebuilding.

## One thing to check before cutover day

The Google Ads final-URL export, at **keyword, ad and sitelink level**. The crawl
found 22 paths, but a final URL can be referenced by an ad without being linked
anywhere crawlable — and on the same domain a stray path that neither exists nor
redirects is a 404 the moment DNS moves.

```
npm run check:urls -- --file ads-final-urls.txt
```

Anything it reports as missing needs a page or a redirect before you repoint.
