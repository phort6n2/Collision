#!/usr/bin/env node
/**
 * Microsoft Clarity → a diffed digest, committed to the repo.
 *
 * WHY THIS EXISTS
 * Clarity is a manual tool. Somebody has to remember to open it, pick a date
 * range, and notice that a number moved. Nobody does that in week six. This
 * pulls the numbers on a schedule, keeps a history in git, and writes a digest
 * that says what CHANGED — which is the only part worth a human's attention.
 *
 * WHAT IT CANNOT DO
 * It cannot tell you why, and it cannot fix anything. Rage clicks on a page are
 * a pointer to a session replay, not a diagnosis. The loop is: this narrows
 * where to look, you look, and the fix goes through the normal config + verify
 * path like any other change. See docs/clarity-loop.md.
 *
 *   CLARITY_API_TOKEN=... node landing/clarity-digest.cjs
 *   node landing/clarity-digest.cjs --fixture   # offline smoke test, no network
 *
 * API notes, because they shape the design:
 *   - numOfDays accepts 1, 2 or 3. There is no arbitrary range, so a weekly job
 *     would silently miss four days out of seven. This runs DAILY with
 *     numOfDays=1 and accumulates its own history instead.
 *   - 10 requests per project per day. This uses two.
 *   - The response shape is not contractually stable, so every read below is
 *     defensive: an unexpected payload is reported, not thrown.
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'docs', 'clarity');
const HISTORY = path.join(OUT_DIR, 'history.json');
const DIGEST = path.join(OUT_DIR, 'digest.md');
const API = 'https://www.clarity.ms/export-data/api/v1/project-live-insights';

const FIXTURE = process.argv.includes('--fixture');
/* Regenerate digest.md from the existing history.json and exit. No token, no
   network, no extra API call against the daily limit. The push-retry path needs
   this: after resetting onto a new HEAD it has to rebuild the digest from the
   history it carried over, and re-fetching would both waste a call and pull a
   different day's numbers than the ones already committed. */
const REWRITE = process.argv.includes('--rewrite');

/* Metrics worth acting on, and what each one actually means. Anything not in
   this list is noise for our purposes — Clarity reports plenty we cannot act
   on from a landing page. */
const SIGNALS = {
  RageClickCount:   'Rage clicks — repeated clicks on the same spot. Something looks clickable and is not, or is slow.',
  DeadClickCount:   'Dead clicks — a click that changed nothing. Usually a non-link that reads as a link.',
  ExcessiveScroll:  'Excessive scrolling — hunting for something that should have been in reach.',
  QuickbackClick:   'Quickbacks — landed, left almost immediately, came back. Usually a mismatch with the ad.',
  ScriptErrorCount: 'Script errors — JavaScript threw. On this site that can mean the form did not bind.',
  ErrorClickCount:  'Error clicks — a click that produced a JS error.'
};

function get(url, token) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const req = https.request(url, { headers: { Authorization: 'Bearer ' + token } }, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error('HTTP ' + res.statusCode + ': ' + body.slice(0, 300)));
        }
        try { resolve(JSON.parse(body)); } catch (e) { reject(new Error('unparseable JSON: ' + body.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timed out after 30s')));
    req.end();
  });
}

/* The payload is an array of { metricName, information: [ {...dimension keys, metric values} ] }.
   Flatten to rows we can diff, tolerating a shape that does not match. */
function flatten(payload, dimension) {
  const rows = [];
  if (!Array.isArray(payload)) return rows;
  for (const block of payload) {
    const metric = block && block.metricName;
    const info = (block && block.information) || [];
    if (!metric || !Array.isArray(info)) continue;
    for (const item of info) {
      if (!item || typeof item !== 'object') continue;
      const key = item[dimension] || item.Url || item.URL || item.url || '(unknown)';
      const value = Number(item[metric] != null ? item[metric] : item.subTotal || item.Sessions || 0) || 0;
      rows.push({ metric, key, value });
    }
  }
  return rows;
}

function loadHistory() {
  try { return JSON.parse(fs.readFileSync(HISTORY, 'utf8')); } catch (e) { return { days: [] }; }
}

/* Sum a metric per dimension key across the last n days of history. */
function windowTotals(days, metric, n) {
  const totals = {};
  for (const day of days.slice(-n)) {
    for (const r of day.rows || []) {
      if (r.metric !== metric) continue;
      totals[r.key] = (totals[r.key] || 0) + r.value;
    }
  }
  return totals;
}

function writeDigest(history) {
  const days = history.days || [];
  const latest = days[days.length - 1];
  const L = [];
  L.push('# Clarity digest');
  L.push('');
  L.push('Generated by `landing/clarity-digest.cjs`. Do not edit — it is overwritten daily.');
  L.push('');
  L.push('This is a **pointer, not a diagnosis.** Every number below is a reason to open a');
  L.push('session replay filtered to that page, not a reason to change anything on its own.');
  L.push('');
  if (!latest) { L.push('_No data yet._'); fs.writeFileSync(DIGEST, L.join('\n') + '\n'); return; }
  L.push('- Latest pull: **' + latest.date + '**');
  L.push('- Days of history: **' + days.length + '**');
  L.push('');

  if (days.length < 8) {
    L.push('> Fewer than 8 days of history, so week-over-week comparison is not shown yet.');
    L.push('> Day-to-day noise on this traffic volume is large; wait for the trend.');
    L.push('');
  }

  for (const [metric, meaning] of Object.entries(SIGNALS)) {
    const cur = windowTotals(days, metric, 7);
    const prev = windowTotals(days.slice(0, -7), metric, 7);
    const keys = Object.keys(cur).filter((k) => cur[k] > 0)
      .sort((a, b) => cur[b] - cur[a]).slice(0, 8);
    if (!keys.length) continue;
    L.push('## ' + metric);
    L.push('');
    L.push('_' + meaning + '_');
    L.push('');
    L.push('| Page | last 7d | prior 7d | change |');
    L.push('|---|---:|---:|---:|');
    for (const k of keys) {
      const c = cur[k], p = prev[k] || 0;
      const delta = days.length >= 14 ? (p === 0 ? (c ? 'new' : '–')
        : (((c - p) / p) * 100).toFixed(0) + '%') : '–';
      L.push('| `' + k + '` | ' + c + ' | ' + (days.length >= 14 ? p : '–') + ' | ' + delta + ' |');
    }
    L.push('');
  }

  L.push('---');
  L.push('');
  L.push('## What to do with this');
  L.push('');
  L.push('See `docs/clarity-loop.md`. Short version: take the single worst row, open');
  L.push('Clarity, filter replays to that page **and** the matching `form_outcome` tag,');
  L.push('watch five sessions, and only then decide whether there is a change to make.');
  L.push('');
  L.push('Do not chase a row that moved by less than a handful of sessions. At this');
  L.push('traffic volume that is noise, and acting on it is how a site gets worse slowly.');
  fs.writeFileSync(DIGEST, L.join('\n') + '\n');
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const history = loadHistory();
  if (REWRITE) {
    writeDigest(history);
    console.log('[clarity] digest rewritten from ' + (history.days || []).length + ' days of history');
    return;
  }
  const today = new Date().toISOString().slice(0, 10);

  let rows = [];
  if (FIXTURE) {
    /* Offline smoke test. Exercises flatten(), the history append, the window
       maths and the digest writer without a token or a network call. */
    rows = flatten([
      { metricName: 'RageClickCount', information: [{ Url: '/windshield-replacement', RageClickCount: 7 },
                                                    { Url: '/', RageClickCount: 2 }] },
      { metricName: 'DeadClickCount', information: [{ Url: '/insurance-claims', DeadClickCount: 5 }] },
      { metricName: 'ScriptErrorCount', information: [{ Url: '/', ScriptErrorCount: 0 }] }
    ], 'Url');
    console.log('[clarity] fixture mode — ' + rows.length + ' rows, no network');
  } else {
    const token = process.env.CLARITY_API_TOKEN;
    if (!token) {
      console.error('CLARITY_API_TOKEN is not set. Generate one in Clarity → Settings → Data Export.');
      process.exit(1);
    }
    const byUrl = await get(API + '?numOfDays=1&dimension1=URL', token);
    rows = flatten(byUrl, 'Url');
    if (!rows.length) {
      /* Not an error — a quiet day, or a shape change. Say which, and keep the
         raw payload so the next person is not guessing. */
      console.warn('[clarity] no rows parsed. Raw payload follows so the shape can be checked:');
      console.warn(JSON.stringify(byUrl).slice(0, 1200));
    }
  }

  history.days = (history.days || []).filter((d) => d.date !== today);
  history.days.push({ date: today, rows });
  /* Keep a year. Long enough for seasonality, small enough to stay readable. */
  history.days = history.days.slice(-365);

  fs.writeFileSync(HISTORY, JSON.stringify(history, null, 2) + '\n');
  writeDigest(history);
  console.log('[clarity] ' + rows.length + ' rows for ' + today + '; history ' + history.days.length + ' days');
})().catch((e) => { console.error('[clarity] ' + e.message); process.exit(1); });
