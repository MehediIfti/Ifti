// SHARE CARDS: the dialog that draws a card in the current theme to download, copy or share. Moved out of app.js on 31 Oct 2026:
// app.js keeps the "Share quote" button that appears on a selection, and loads this file the first time a card opens (and on computers once the page is idle).
(function () {
  var SITE = window.__site.SITE, cssVar = window.__site.cssVar;
  (function () {
    var pop = document.getElementById('share-pop'), dlg = document.getElementById('sc'), cv = document.getElementById('sc-cv');
    var note = document.getElementById('sc-note'), NOTE_TXT = note.textContent;
    var q = null, size = 'wide';

    function wrap(ctx, text, maxW) {
      var words = text.split(' '), lines = [], line = '';
      words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
      if (line) lines.push(line); return lines;
    }
    // The frame, label and footer every card shares, in the current theme. Cards from shareCard() draw inside it.
    function kit(ctx, W, H) {
      var P = { bg: cssVar('--base') || '#111', ink: cssVar('--ink') || cssVar('--text') || '#eee', acc: cssVar('--accent') || '#f7cafa',
        lab: cssVar('--label') || '#888', mut: cssVar('--muted') || '#999', rule: cssVar('--rule') || '#333', mark: cssVar('--overlay1') || '#666',
        fDisp: getComputedStyle(document.querySelector('h1') || document.body).fontFamily, fMono: cssVar('--mono') || 'monospace', pad: W > H ? 72 : 88 };
      P.frame = function (label) {
        ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = P.rule; ctx.lineWidth = 2; ctx.strokeRect(P.pad / 2, P.pad / 2, W - P.pad, H - P.pad);
        ctx.strokeStyle = P.mark;
        [[P.pad / 2, P.pad / 2, 1, 1], [W - P.pad / 2, P.pad / 2, -1, 1], [P.pad / 2, H - P.pad / 2, 1, -1], [W - P.pad / 2, H - P.pad / 2, -1, -1]].forEach(function (c) {
          ctx.beginPath(); ctx.moveTo(c[0] - 12 * c[2], c[1]); ctx.lineTo(c[0] + 12 * c[2], c[1]); ctx.moveTo(c[0], c[1] - 12 * c[3]); ctx.lineTo(c[0], c[1] + 12 * c[3]); ctx.stroke();
        });
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = P.lab; ctx.font = '500 22px ' + P.fMono;
        ctx.fillText(label.toUpperCase(), P.pad, P.pad + 40);
      };
      P.foot = function (left, right) {
        ctx.fillStyle = P.acc; ctx.fillRect(P.pad, H - P.pad - 64, 40, 3);
        ctx.font = '500 22px ' + P.fMono; var room = W - P.pad * 2 - ctx.measureText(right).width - 40, fs = 24;
        ctx.font = '500 ' + fs + 'px ' + P.fDisp; while (ctx.measureText(left).width > room && fs > 17) { fs--; ctx.font = '500 ' + fs + 'px ' + P.fDisp; }
        ctx.fillStyle = P.mut; ctx.fillText(left, P.pad, H - P.pad - 20);
        ctx.fillStyle = P.acc; ctx.font = '500 22px ' + P.fMono; ctx.textAlign = 'right'; ctx.fillText(right, W - P.pad, H - P.pad - 20); ctx.textAlign = 'left';
      };
      return P;
    }
    function draw() {
      var W = size === 'wide' ? 1200 : 1080, H = size === 'wide' ? 630 : 1080, ctx = cv.getContext('2d');
      cv.width = W; cv.height = H;
      if (q.paint) return q.paint(ctx, W, H, kit(ctx, W, H));
      var bg = cssVar('--base') || '#111', ink = cssVar('--ink') || cssVar('--text') || '#eee', acc = cssVar('--accent') || '#f7cafa';
      var lab = cssVar('--label') || '#888', mut = cssVar('--muted') || '#999', rule = cssVar('--rule') || '#333', mark = cssVar('--overlay1') || '#666';
      var h1 = q.art.querySelector('h1'), title = h1 ? h1.textContent.trim() : '', no = 'N°' + q.art.id.slice(2);
      var fBody = getComputedStyle(q.art.querySelector('p') || document.body).fontFamily, fDisp = getComputedStyle(h1 || document.body).fontFamily, fMono = cssVar('--mono') || 'monospace';
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      var pad = size === 'wide' ? 72 : 88;
      // hairline frame with crop marks, like the cards on the site
      ctx.strokeStyle = rule; ctx.lineWidth = 2; ctx.strokeRect(pad / 2, pad / 2, W - pad, H - pad);
      ctx.strokeStyle = mark; ctx.lineWidth = 2;
      [[pad / 2, pad / 2, 1, 1], [W - pad / 2, pad / 2, -1, 1], [pad / 2, H - pad / 2, 1, -1], [W - pad / 2, H - pad / 2, -1, -1]].forEach(function (c) {
        ctx.beginPath(); ctx.moveTo(c[0] - 12 * c[2], c[1]); ctx.lineTo(c[0] + 12 * c[2], c[1]); ctx.moveTo(c[0], c[1] - 12 * c[3]); ctx.lineTo(c[0], c[1] + 12 * c[3]); ctx.stroke();
      });
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = lab; ctx.font = '500 22px ' + fMono;
      ctx.fillText(("IFTI'S NOTEBOOK · " + no).toUpperCase(), pad, pad + 40);
      // quote: biggest size that fits the box
      var text = q.text.length > 320 ? q.text.slice(0, 317).replace(/\s+\S*$/, '') + '…' : q.text;
      var boxW = W - pad * 2, top = pad + 96, bottom = H - pad - 92, fs = size === 'wide' ? 58 : 72, lines, lh;
      for (; fs > 24; fs -= 2) { ctx.font = '400 ' + fs + 'px ' + fBody; lh = fs * 1.3; lines = wrap(ctx, '“' + text + '”', boxW); if (lines.length * lh <= bottom - top) break; }
      ctx.fillStyle = ink; ctx.font = '400 ' + fs + 'px ' + fBody;
      var y0 = top + fs;
      lines.forEach(function (l, i) { ctx.fillText(l, pad, y0 + i * lh); });
      // footer: note title on the left, link on the right
      ctx.fillStyle = acc; ctx.fillRect(pad, H - pad - 64, 40, 3);
      ctx.fillStyle = mut; ctx.font = '500 26px ' + fDisp;
      var tl = title; while (ctx.measureText(tl).width > boxW * 0.62 && tl.length > 4) tl = tl.slice(0, -2).trim() + '…';
      ctx.fillText(tl, pad, H - pad - 20);
      ctx.fillStyle = acc; ctx.font = '500 22px ' + fMono; ctx.textAlign = 'right';
      ctx.fillText('ifti-gold.vercel.app', W - pad, H - pad - 20); ctx.textAlign = 'left';
    }
    function url() { return q.url || (q.art.id.indexOf('n-') === 0 ? SITE + 'n/' + q.art.id.slice(2) : SITE + '#' + q.art.id); }
    function head(t) { dlg.querySelector('.sc-head b').textContent = t; dlg.setAttribute('aria-label', t); }
    // Any card: { title, paint(ctx, W, H, kit), said, url, file }. Used by the reaction test and the achievements list.
    window.shareCard = function (card) {
      q = card; pop.hidden = true; note.textContent = '';
      head(card.title);
      document.getElementById('sc-x').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(card.said) + '&url=' + encodeURIComponent(card.url);
      document.getElementById('sc-li').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(card.url);
      var fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      fonts.then(function () { draw(); if (!dlg.open) dlg.showModal(); });
    };
    function open(s) {
      q = { text: s.text, art: s.art }; pop.hidden = true; note.textContent = NOTE_TXT; head('Share a quote');
      var tweet = '“' + (q.text.length > 200 ? q.text.slice(0, 197).replace(/\s+\S*$/, '') + '…' : q.text) + '”';
      document.getElementById('sc-x').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet) + '&url=' + encodeURIComponent(url());
      document.getElementById('sc-li').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url());
      var fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      fonts.then(function () { draw(); if (!dlg.open) dlg.showModal(); if (window.unlock) unlock('share'); });
    }
    function blob(cb) { cv.toBlob(cb, 'image/png'); }
    function fname() { return q.file || 'ifti-' + q.art.id + '-quote.png'; }
    document.getElementById('sc-dl').addEventListener('click', function () {
      blob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = fname(); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); });
    });
    document.getElementById('sc-copy').addEventListener('click', function () {
      blob(function (b) {
        try { navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]).then(function () { note.textContent = 'Copied. Paste it into your post.'; }, function () { note.textContent = "Couldn't copy. Download it instead."; }); }
        catch (e) { note.textContent = "Couldn't copy. Download it instead."; }
      });
    });
    var shareBtn = document.getElementById('sc-share');
    if (navigator.canShare) shareBtn.hidden = false;
    shareBtn.addEventListener('click', function () {
      blob(function (b) {
        var f = new File([b], fname(), { type: 'image/png' }), data = { files: [f], text: q.said || '“' + q.text + '”', url: url() };
        if (navigator.canShare && navigator.canShare(data)) navigator.share(data).catch(function () {});
        else note.textContent = "This browser can't share images. Download it instead.";
      });
    });
    dlg.querySelectorAll('[data-size]').forEach(function (b) {
      b.addEventListener('click', function () {
        size = b.getAttribute('data-size');
        dlg.querySelectorAll('[data-size]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        draw();
      });
    });
    document.getElementById('sc-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    window.shareQuote = function (text, art) { open({ text: text, art: art }); };
  })();
})();
