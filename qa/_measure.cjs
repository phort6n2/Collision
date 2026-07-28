/* Measure chapter geometry + real per-line reading measure. */
const { chromium } = require('playwright');
const fs = require('fs');

function chromePath() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers'].filter(Boolean);
  for (const root of roots) {
    let entries = [];
    try { entries = fs.readdirSync(root); } catch (e) { continue; }
    for (const name of entries.filter((n) => n.startsWith('chromium')).sort().reverse()) {
      for (const rel of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome']) {
        const p = require('path').join(root, name, rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return undefined;
}

const URL = process.argv[2] || 'http://127.0.0.1:8941/';
const WIDTHS = (process.argv[3] || '1440,1280,1024,768,390').split(',').map(Number);

const EVAL = () => {
  const out = { };
  const wrap = document.querySelector('.chaps') && document.querySelector('.chaps').closest('.wrap');
  const wr = wrap ? wrap.getBoundingClientRect() : null;
  const wcs = wrap ? getComputedStyle(wrap) : null;
  out.container = wr ? {
    left: Math.round(wr.left), width: Math.round(wr.width),
    padL: wcs.paddingLeft, padR: wcs.paddingRight,
    inner: Math.round(wr.width - parseFloat(wcs.paddingLeft) - parseFloat(wcs.paddingRight)),
    innerLeft: Math.round(wr.left + parseFloat(wcs.paddingLeft)),
  } : null;

  // real per-line measure using Range rects
  function lineMeasure(p) {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const lines = [];
    let n;
    while ((n = walker.nextNode())) {
      const txt = n.nodeValue;
      if (!txt.trim()) continue;
      const r = document.createRange();
      // group characters by line box top
      let curTop = null, curStart = 0, count = 0;
      for (let i = 0; i < txt.length; i++) {
        r.setStart(n, i); r.setEnd(n, i + 1);
        const rects = r.getClientRects();
        if (!rects.length) { count++; continue; }
        const top = Math.round(rects[0].top);
        if (curTop === null) { curTop = top; curStart = i; count = 1; continue; }
        if (Math.abs(top - curTop) > 3) {
          lines.push({ top: curTop, chars: i - curStart, w: null });
          curTop = top; curStart = i; count = 1;
        } else count++;
      }
      if (curTop !== null) lines.push({ top: curTop, chars: txt.length - curStart });
    }
    // merge lines that share a top (inline elements split text nodes)
    const byTop = new Map();
    for (const l of lines) {
      const k = l.top;
      byTop.set(k, (byTop.get(k) || 0) + l.chars);
    }
    return [...byTop.values()];
  }

  out.chaps = [...document.querySelectorAll('.pchap')].map((c) => {
    const h2 = c.querySelector('h2');
    const prose = c.querySelector('.prose');
    const fig = c.querySelector('figure');
    const cr = c.getBoundingClientRect();
    const hr = h2 ? h2.getBoundingClientRect() : null;
    const pr = prose ? prose.getBoundingClientRect() : null;
    const fr = fig ? fig.getBoundingClientRect() : null;
    // gather line char counts from the paragraphs of this chapter
    let all = [];
    for (const p of prose ? prose.querySelectorAll('p, li') : []) {
      all = all.concat(lineMeasure(p));
    }
    // drop last line of each block (always short) is not done: report full + trimmed
    const full = all.filter((n) => n > 0);
    const sorted = [...full].sort((a, b) => a - b);
    const med = sorted.length ? sorted[Math.floor(sorted.length * 0.5)] : 0;
    const p90 = sorted.length ? sorted[Math.floor(sorted.length * 0.9)] : 0;
    const max = sorted.length ? sorted[sorted.length - 1] : 0;
    return {
      cls: c.className,
      heading: h2 ? h2.textContent.slice(0, 48) : '',
      chapLeft: Math.round(cr.left), chapW: Math.round(cr.width),
      h2Left: hr ? Math.round(hr.left) : null, h2W: hr ? Math.round(hr.width) : null,
      proseLeft: pr ? Math.round(pr.left) : null, proseW: pr ? Math.round(pr.width) : null,
      figLeft: fr ? Math.round(fr.left) : null, figW: fr ? Math.round(fr.width) : null,
      lines: full.length, medCPL: med, p90CPL: p90, maxCPL: max,
    };
  });
  return out;
};

(async () => {
  const browser = await chromium.launch({ executablePath: chromePath() });
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 1000 } });
    await page.goto(URL, { waitUntil: 'networkidle' });
    const r = await page.evaluate(EVAL);
    console.log('\n===== ' + w + 'px  ' + URL);
    console.log('container: left=' + r.container.left + ' width=' + r.container.width +
      ' pad=' + r.container.padL + '/' + r.container.padR +
      ' innerLeft=' + r.container.innerLeft + ' inner=' + r.container.inner);
    const ci = r.container.innerLeft, cw = r.container.inner;
    console.log(
      'h2L'.padStart(5) + 'proseL'.padStart(7) + 'proseW'.padStart(7) +
      'figL'.padStart(6) + 'figW'.padStart(6) +
      ' gapL'.padStart(6) + ' gapR'.padStart(6) +
      ' med/p90/max cpl'.padStart(17) + '  heading');
    for (const c of r.chaps) {
      const gl = c.chapLeft - ci;
      const gr = (ci + cw) - (c.chapLeft + c.chapW);
      console.log(
        String(c.h2Left).padStart(5) + String(c.proseLeft).padStart(7) + String(c.proseW).padStart(7) +
        String(c.figLeft === null ? '-' : c.figLeft).padStart(6) +
        String(c.figW === null ? '-' : c.figW).padStart(6) +
        String(Math.round(gl)).padStart(6) + String(Math.round(gr)).padStart(6) +
        (' ' + c.medCPL + '/' + c.p90CPL + '/' + c.maxCPL + ' (' + c.lines + 'L)').padStart(17) +
        '  ' + c.heading);
    }
    await page.close();
  }
  await browser.close();
})();
