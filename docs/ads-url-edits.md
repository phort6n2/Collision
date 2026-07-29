# Google Ads final-URL edits after the `collisionglass.co` cutover

Generated from the ad, keyword and asset-group exports for **29 Jun – 28 Jul 2026**.

**Nothing here is urgent and nothing here breaks.** Every path below resolves
through a 301 to a real page, so ads keep serving through the cutover untouched.
Each one costs a crawler hop before Google scores landing page experience — a
real but small cost, and the only reason to fix it.

The one genuinely important thing was `/mobile-windshield-replacement`, which
would have been a hard 404. That is already fixed in the build: the page now
lives at that exact slug, so **that ad needs no edit**.

---

## Do this one first — it is 80% of the total

| | |
|---|---|
| **Old URL** | `https://collisionglass.co/auto-glass-repair` |
| **Change to** | `https://collisionglass.co/` |
| **30-day spend** | **$4,363 · 96 conversions** |
| **Where** | Campaign **AGMP PMAX** → Asset group **Asset Group 1** → Final URL |
| | Campaign **AGMP Lead Gen** → the ad(s) using this URL |

This is the single largest spend in the account and it is one field in one asset
group. Performance Max reports spend at asset-group level, not on the ad, which
is why it looks like $0 in an ad-level export — easy to overlook.

---

## Then these four, in this order

All are in **AGMP Lead Gen**, at ad level.

| Old URL | Change to | 30-day spend |
|---|---|---|
| `/car-window-repair` | `/side-window-replacement` | $693 · 11 conv |
| `/auto-glass-replacement` | `/` | $522 · 4 conv |
| `/car-window-replacement` | `/side-window-replacement` | $443 · 4 conv |
| `/door-glass-repair` | `/side-window-replacement` | $258 · 3 conv |

---

## Whenever — zero spend, zero impressions

Their ads are **enabled**, so they are still worth correcting eventually. A
dormant ad routes through the hop the day someone re-enables it.

| Old URL | Change to |
|---|---|
| `/rock-chip-repair` | `/windshield-repair` |
| `/windshield-chip-repair` | `/windshield-repair` |
| `/windshield-crack-repair` | `/windshield-repair` |
| `/mobile-windshield-repair` | `/mobile-windshield-replacement` |

---

## Do NOT touch these — they are exact matches already

Editing any of these would break a working URL for no reason.

| URL | 30-day spend |
|---|---|
| `/windshield-replacement` | $3,037 |
| `/mobile-windshield-replacement` | $2,235 |
| `/windshield-repair` | $798 |
| `/auto-glass-repair-hillsboro` | $662 |
| `/auto-glass-repair-tualatin` | $582 |
| `/auto-glass-repair-beaverton` | $283 |
| `/auto-glass-repair-portland` | $168 |
| `/` | $8 |

Also unaffected: campaign **Google_PMax_Competitor_July2026** points at
`https://collisionautoglass.com/` — the main site, a different domain. The DNS
change does not touch it.

---

## Two things to check in Performance Max after cutover

1. **Final URL expansion.** If it is on, PMax can send traffic to any page it
   has crawled on the domain, regardless of the asset group's final URL. That is
   fine now — every page exists — but it means the asset group URL is a
   preference, not a guarantee, and it explains traffic landing on pages you did
   not nominate.

2. **Give it a few days before reading performance.** Changing a final URL
   resets some of the learning on that asset group. Make the edits in one sitting
   rather than trickling them out.

---

## Re-checking

The export used here is saved at `docs/ads-final-urls.txt`. After making edits,
re-export and re-run:

```
npm run check:urls -- --file docs/ads-final-urls.txt
```

Target state is **0 missing**. Everything reported as REDIRECT ONLY is a
tidy-up, not a fault — the goal is to shrink that list, not to empty it before
launch.
