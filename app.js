// The site's main script, moved out of index.html on 18 Oct 2026 so the page stays small and browsers can keep a copy.
// Every UPDATE block the README mentions as "in the script" lives here. Loaded by a plain <script src> at the end of index.html, so it runs in the same place it always did.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var navs = document.querySelectorAll('a.nav');


  // ACTIVITY UPDATE: meetings per day, oldest first, one row per week starting Sunday. Counts only: no titles, no names.
  // The page swaps in live counts from api/activity.js for the days the calendar link covers (from 19 Aug 2026 on), so
  // this block only fills older days now and needs no more updates; it's also what shows if the live call fails.
  var ACTIVITY = {
    from: '2026-06-14',
    counts: [
      7, 9, 10, 11, 9, 0, 1,
      9, 11, 8, 9, 8, 1, 1,
      5, 10, 8, 5, 14, 1, 0,
      9, 9, 13, 8, 8, 1, 0,
      3, 4, 17, 8, 4, 0, 1,
      4, 6, 6, 14, 3, 0, 0,
      2, 9, 5, 5, 2, 0, 0,
      4, 7, 5, 7, 7, 3, 0,
      5, 7, 13, 3, 10, 1, 0,
      4, 6, 6, 6, 3, 0, 0,
      3, 3, 8, 6, 15, 1, 0,
      3, 5, 6, 5, 3, 3, 0,
      4, 4, 6, 9, 2, 2, 0,
      1, 4, 2, 3, 6, 1, 0,
      2, 6, 5, 7, 5, 1, 0,
      2, 6, 7, 2, 4, 1, 0,
      7, 3, 7, 9, 3, 1, 0,
      6, 13, 4, 2, 1, 1, 0
    ]
  };
  function activityHTML() {
    if (activityHTML.c) return activityHTML.c;
    var c = ACTIVITY.counts, start = new Date(ACTIVITY.from + 'T00:00:00'), w = Math.ceil(c.length / 7);
    var day = function (i) { var d = new Date(start); d.setDate(d.getDate() + i); return d; };
    var fmt = function (d, noDay) { return (noDay ? '' : 'SunMonTueWedThuFriSat'.substr(d.getDay() * 3, 3) + ' ') + d.getDate() + ' ' + 'JanFebMarAprMayJunJulAugSepOctNovDec'.substr(d.getMonth() * 3, 3); };
    var lvl = function (v) { return v === 0 ? 0 : v <= 2 ? 1 : v <= 5 ? 2 : v <= 8 ? 3 : 4; };
    var total = c.reduce(function (t, v) { return t + v; }, 0);
    var months = '', last = -1;
    for (var k = 0; k < w; k++) {
      var m = day(k * 7).getMonth();
      months += '<span>' + (m !== last && k < w - 1 ? 'JanFebMarAprMayJunJulAugSepOctNovDec'.substr(m * 3, 3) : '') + '</span>';
      last = m;
    }
    var cells = c.map(function (v, i) {
      return '<i class="l' + lvl(v) + '" data-d="' + fmt(day(i)) + '" data-n="' + v + '"></i>';
    }).join('');
    var sum = total + ' meetings · ' + w + ' wks';
    return activityHTML.c = '<div class="act"><div class="act-m" style="--w:' + w + '" aria-hidden="true">' + months + '</div>' +
      '<div class="act-g" style="--w:' + w + '" role="img" aria-label="Calendar activity: ' + total + ' meetings over the last ' + w + ' weeks">' + cells + '</div>' +
      '<div class="act-k"><span class="act-r" data-sum="' + sum + '">' + sum + '</span>' +
      '<span class="act-l" aria-hidden="true">less<i></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i>more</span></div>' +
      '<div class="act-src">From my calendar, to ' + fmt(day(c.length - 1), true) + '</div></div>';
  }
  document.getElementById('act-inline').innerHTML = activityHTML();
  // Live counts from api/activity.js for the days the calendar link covers; the hand-kept ACTIVITY block fills the
  // earlier days (Google's link only reaches back a couple of months). If the call fails, the hand-kept grid stays.
  setTimeout(function () {
    fetch('/api/activity').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.configured || !d.counts || !d.counts.length) return;
      var dayMs = 864e5, t = function (s) { return Date.parse(s + 'T00:00:00Z'); }, hand0 = t(ACTIVITY.from), live0 = t(d.from), since = t(d.since || d.from);
      ACTIVITY = { from: d.from, counts: d.counts.map(function (v, i) {
        var day = live0 + i * dayMs, h = Math.round((day - hand0) / dayMs);
        return day >= since ? v : (h >= 0 && h < ACTIVITY.counts.length ? ACTIVITY.counts[h] : 0);
      }) };
      activityHTML.c = null;
      document.querySelectorAll('.act').forEach(function (el) { el.outerHTML = activityHTML(); });
    }, function () {});
  }, 1800);
  // hover a day to read it; leave the grid to see the total again
  document.addEventListener('mouseover', function (e) {
    var cell = e.target.closest && e.target.closest('.act-g i');
    document.querySelectorAll('.act-r').forEach(function (r) {
      if (cell && r.closest('.act') === cell.closest('.act')) {
        var n = +cell.getAttribute('data-n');
        r.textContent = cell.getAttribute('data-d') + ' · ' + n + (n === 1 ? ' meeting' : ' meetings');
      } else r.textContent = r.getAttribute('data-sum');
    });
  });

  // Notes open like a note in Obsidian: a tab, back/forward, breadcrumbs, a properties block, callouts and a status bar.
  var ICON = {
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    tags: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    graph: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="10" cy="18" r="2.5"/><path d="M8.4 6.5l7.2.9M6.9 8.4l2.2 7.2M16.5 10.1l-4.9 6.1"/>',
    right: '<path d="m9 18 6-6-6-6"/>'
  };
  function icon(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; }
  var noteEls = Array.prototype.slice.call(document.querySelectorAll('article.page[id^="n-"]'));
  function tagsOf(n) { return (n.getAttribute('data-tags') || '').split(/\s+/).filter(Boolean); }
  function related(n) {
    var mine = tagsOf(n);
    return noteEls.filter(function (o) { return o !== n; })
      .map(function (o) { return { note: o, shared: tagsOf(o).filter(function (t) { return mine.indexOf(t) >= 0; }) }; })
      .filter(function (r) { return r.shared.length; });
  }
  function noteTitle(n) { return n.querySelector('h1').textContent; }
  noteEls.forEach(function (a, i) {
    var labels = a.querySelectorAll('.note-head .label');
    var no = labels[0].textContent.replace('N°', ''), date = labels[1].textContent, title = noteTitle(a), tags = tagsOf(a);
    var back = a.querySelector('.back'); if (back) back.parentNode.remove();
    a.querySelector('.note-head').remove();
    var view = document.createElement('div'); view.className = 'obs-view';
    while (a.firstChild) view.appendChild(a.firstChild);
    var text = view.textContent.replace(/\s+/g, ' ').trim(), words = text.split(' ').length;
    var row = function (ic, k, v) { return '<dt>' + icon(ic) + k + '</dt><dd>' + v + '</dd>'; };
    view.querySelector('h1').insertAdjacentHTML('afterend', '<div class="obs-props"><h5>Properties</h5><dl>' +
      row('calendar', 'created', esc(date)) + row('hash', 'number', esc(no)) +
      row('tags', 'tags', tags.map(function (t) { return '<a class="obs-tag" href="#notes">#' + esc(t) + '</a>'; }).join('')) +
      row('clock', 'reading', Math.max(1, Math.round(words / 230)) + ' min') + '</dl></div>');
    var older = noteEls[i + 1], newer = noteEls[i - 1];
    view.insertAdjacentHTML('beforeend', '<nav class="page-next note-next" aria-label="More notes">' +
      (older ? '<a href="#' + older.id + '"><small>Previous note</small><b>← ' + esc(noteTitle(older)) + '</b></a>' : '<span></span>') +
      '<a class="all" href="#notes"><small>&nbsp;</small><b>All notes</b></a>' +
      (newer ? '<a class="nx" href="#' + newer.id + '"><small>Next note</small><b>' + esc(noteTitle(newer)) + ' →</b></a>' : '<span></span>') + '</nav>');
    var arrow = function (n, ic, label) {
      return n ? '<a class="obs-arrow" href="#' + n.id + '" title="' + label + ': ' + esc(noteTitle(n)) + '" aria-label="' + label + ' note">' + icon(ic) + '</a>'
               : '<span class="obs-arrow" aria-disabled="true">' + icon(ic) + '</span>';
    };
    var links = related(a).length;
    a.innerHTML =
      '<div class="obs-tabs" role="tablist" aria-label="Open notes"></div>' +
      '<div class="obs-nav">' + arrow(older, 'left', 'Older') + arrow(newer, 'right', 'Newer') +
      '<span class="obs-crumb"><a href="#index">Notebook</a><i>/</i><a href="#notes">Notes</a><i>/</i><b>' + esc(title) + '</b></span><span class="obs-mode">reading</span><button type="button" class="obs-arrow obs-graph" data-graph="' + a.id + '" title="Graph view" aria-label="Open graph view">' + icon('graph') + '</button></div>';
    a.appendChild(view);
    a.insertAdjacentHTML('beforeend', '<div class="obs-status"><span>' + links + (links === 1 ? ' linked note' : ' linked notes') + '</span><span>' + words + ' words</span><span>' + text.length + ' characters</span></div>');
    a.classList.add('obs');
  });
  // Tabs: a note opens in the current tab; + opens another note in a new tab, up to MAX_TABS. Kept for this browser session.
  var MAX_TABS = 4, tabs = [], activeTab = null;
  try { tabs = JSON.parse(sessionStorage.getItem('obs-tabs')) || []; } catch (e) {}
  tabs = tabs.filter(function (id) { return /^n-/.test(id) && document.getElementById(id); }).slice(0, MAX_TABS);
  function saveTabs() { try { sessionStorage.setItem('obs-tabs', JSON.stringify(tabs)); } catch (e) {} }
  function openInTab(id) {
    if (tabs.indexOf(id) < 0) {
      var i = tabs.indexOf(activeTab);
      if (i < 0) { if (tabs.length >= MAX_TABS) tabs.pop(); tabs.push(id); } else tabs[i] = id;
    }
    activeTab = id; saveTabs();
  }
  function newTab(id) {
    if (tabs.indexOf(id) < 0) {
      if (tabs.length >= MAX_TABS) return;
      tabs.splice(tabs.indexOf(activeTab) + 1, 0, id); saveTabs();
    }
    location.hash = id;
  }
  function renderTabs(a) {
    var bar = a.querySelector('.obs-tabs');
    bar.innerHTML = tabs.map(function (id) {
      var n = document.getElementById(id), on = id === a.id;
      return '<div class="obs-tab' + (on ? ' on' : '') + '"><a href="#' + id + '" role="tab" aria-selected="' + on + '" title="' + esc(noteTitle(n)) + '">' + icon('file') + '<span>' + esc(noteTitle(n)) + '</span></a>' +
        '<button type="button" class="obs-x" data-close="' + id + '" aria-label="Close ' + esc(noteTitle(n)) + '" title="Close">×</button></div>';
    }).join('') +
      '<button type="button" class="obs-new" aria-haspopup="true" aria-expanded="false"' + (tabs.length >= MAX_TABS ? ' disabled title="Up to ' + MAX_TABS + ' tabs. Close one to open another."' : ' title="Open another note in a new tab"') + ' aria-label="New tab">+</button>';
  }
  function tabMenu(bar, btn) {
    var old = bar.querySelector('.obs-menu');
    if (old) { old.remove(); btn.setAttribute('aria-expanded', 'false'); return; }
    var list = noteEls.map(function (n) {
      var open = tabs.indexOf(n.id) >= 0;
      return '<a href="#' + n.id + '" data-new="' + n.id + '" role="menuitem"><small>N°' + n.id.slice(2) + '</small><span>' + esc(noteTitle(n)) + '</span><small>' + (open ? 'open' : '') + '</small></a>';
    }).join('');
    bar.insertAdjacentHTML('beforeend', '<div class="obs-menu" role="menu"><h6>Open in new tab</h6>' + list + '<p>' + tabs.length + ' of ' + MAX_TABS + ' tabs open</p></div>');
    var m = bar.querySelector('.obs-menu');
    m.style.setProperty('--mx', Math.max(8, Math.min(btn.offsetLeft, bar.clientWidth - m.offsetWidth - 8)) + 'px');
    btn.setAttribute('aria-expanded', 'true');
    m.querySelector('a').focus();
  }
  document.addEventListener('click', function (e) {
    var bar = e.target.closest && e.target.closest('.obs-tabs');
    document.querySelectorAll('.obs-menu').forEach(function (m) { if (!bar || !bar.contains(m)) { m.remove(); } });
    if (!bar) return;
    var plus = e.target.closest('.obs-new'), close = e.target.closest('[data-close]'), pick = e.target.closest('[data-new]');
    if (plus && !plus.disabled) tabMenu(bar, plus);
    if (pick) { e.preventDefault(); newTab(pick.getAttribute('data-new')); }
    if (close) {
      var id = close.getAttribute('data-close'), i = tabs.indexOf(id);
      tabs.splice(i, 1); saveTabs();
      if (id === activeTab) { activeTab = null; location.hash = tabs[i] || tabs[i - 1] || 'notes'; }
      else renderTabs(document.getElementById(activeTab));
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var m = document.querySelector('.obs-menu'); if (!m) return;
    var btn = m.parentNode.querySelector('.obs-new'); m.remove(); btn.setAttribute('aria-expanded', 'false'); btn.focus();
  });

  // Local graph for the right column: this note, its tags, and the notes that share them.
  function graphSVG(n) {
    var tags = tagsOf(n), rel = related(n), cx = 110, cy = 96, ang = {}, lines = '', nodes = '';
    var pos = function (a, r) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    var xy = function (p, k) { return k + 'x="' + p[0].toFixed(1) + '" ' + k + 'y="' + p[1].toFixed(1) + '"'; };
    var line = function (p, q) { return '<line x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"/>'; };
    // label centred on its node, above it in the top half and below it in the bottom half, so it stays inside the column
    var label = function (p, t) { return '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] < cy ? p[1] - 8 : p[1] + 15).toFixed(1) + '" text-anchor="middle">' + t + '</text>'; };
    tags.forEach(function (t, k) {
      var a = -Math.PI / 2 + (k + 0.5) * 2 * Math.PI / tags.length - Math.PI / tags.length; ang[t] = a;
      lines += line([cx, cy], pos(a, 44));
      nodes += '<g class="tag"><circle ' + xy(pos(a, 44), 'c') + ' r="3.5"/>' + label(pos(a, 44), '#' + esc(t)) + '</g>';
    });
    rel.forEach(function (r, k) {
      // sits between the tags it shares (circular mean of their angles)
      var vx = 0, vy = 0; r.shared.forEach(function (t) { vx += Math.cos(ang[t]); vy += Math.sin(ang[t]); });
      var a = Math.atan2(vy, vx) + (rel.length > 1 ? (k % 2 ? 0.3 : -0.3) : 0), p = pos(a, 80);
      r.shared.forEach(function (t) { lines += line(pos(ang[t], 44), p); });
      nodes += '<g><circle ' + xy(p, 'c') + ' r="4.5"/>' + label(p, 'N°' + r.note.id.slice(2)) + '</g>';
    });
    nodes += '<g class="me"><circle cx="' + cx + '" cy="' + cy + '" r="6"/><text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle">N°' + n.id.slice(2) + '</text></g>';
    return '<svg class="graph" viewBox="0 0 220 200" role="img" aria-label="Local graph: this note, its tags and ' + rel.length + ' related notes">' + lines + nodes + '</svg>';
  }
  function noteMeta(n) {
    var rel = related(n);
    return '<section><h4>Local graph</h4><button type="button" class="graph-open" data-graph="' + n.id + '" aria-label="Open graph view">' + graphSVG(n) + '<span class="hint">⤢ expand</span></button></section>' +
      '<section><h4>Linked mentions</h4>' + (rel.length ? '<div class="mentions">' + rel.map(function (r) {
        return '<a href="#' + r.note.id + '">' + esc(noteTitle(r.note)) + '<small>via ' + r.shared.map(function (t) { return '#' + esc(t); }).join(' ') + '</small></a>';
      }).join('') + '</div>' : '<p>No linked notes yet.</p>') + '</section>';
  }

  // Graph view pop-up: the whole vault or this note's neighbourhood, laid out with a small force simulation.
  var gv = document.getElementById('gv'), gvSvg = document.getElementById('gv-svg'), gvPeek = document.getElementById('gv-peek'), gvNote = null, gvScope = 'local';
  function graphData(scope, n) {
    var notes = scope === 'all' ? noteEls : [n].concat(related(n).map(function (r) { return r.note; }));
    var nodes = [], edges = [], seen = {};
    notes.forEach(function (o) { nodes.push({ id: o.id, kind: 'note' }); seen[o.id] = 1; });
    notes.forEach(function (o) {
      tagsOf(o).forEach(function (t) {
        if (scope === 'local' && o !== n && tagsOf(n).indexOf(t) < 0) return;
        if (!seen['#' + t]) { nodes.push({ id: '#' + t, kind: 'tag' }); seen['#' + t] = 1; }
        edges.push([o.id, '#' + t]);
      });
    });
    return { nodes: nodes, edges: edges };
  }
  function layout(g, W, H) {
    var N = g.nodes.length, idx = {};
    g.nodes.forEach(function (v, i) { idx[v.id] = i; var a = i * 2.39996; v.x = W / 2 + Math.cos(a) * 30 * Math.sqrt(i + 1); v.y = H / 2 + Math.sin(a) * 30 * Math.sqrt(i + 1); });
    for (var it = 0; it < 400; it++) {
      var cool = 1 - it / 400;
      g.nodes.forEach(function (v) { v.fx = (W / 2 - v.x) * 0.01; v.fy = (H / 2 - v.y) * 0.01; });
      for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
        var a = g.nodes[i], b = g.nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = Math.max(dx * dx + dy * dy, 25), f = (a.kind === 'note' && b.kind === 'note' ? 30000 : 9000) / d2, d = Math.sqrt(d2);
        a.fx += dx / d * f; a.fy += dy / d * f; b.fx -= dx / d * f; b.fy -= dy / d * f;
      }
      g.edges.forEach(function (e) {
        var a = g.nodes[idx[e[0]]], b = g.nodes[idx[e[1]]], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - 110) * 0.05;
        a.fx += dx / d * f; a.fy += dy / d * f; b.fx -= dx / d * f; b.fy -= dy / d * f;
      });
      g.nodes.forEach(function (v) { v.x += Math.max(-20, Math.min(20, v.fx)) * cool; v.y += Math.max(-20, Math.min(20, v.fy)) * cool; });
    }
    // fit into the view with room for labels
    var xs = g.nodes.map(function (v) { return v.x; }), ys = g.nodes.map(function (v) { return v.y; });
    var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
    var k = Math.min((W - 180) / Math.max(x1 - x0, 1), (H - 90) / Math.max(y1 - y0, 1), 1.6);
    g.nodes.forEach(function (v) { v.x = W / 2 + (v.x - (x0 + x1) / 2) * k; v.y = H / 2 + (v.y - (y0 + y1) / 2) * k; });
    return idx;
  }
  function short(t) { return t.length > 30 ? t.slice(0, 28) + '…' : t; }
  function drawGraph() {
    var W = 640, H = 440, g = graphData(gvScope, gvNote), idx = layout(g, W, H);
    var h = g.edges.map(function (e) { var a = g.nodes[idx[e[0]]], b = g.nodes[idx[e[1]]];
      return '<line data-a="' + e[0] + '" data-b="' + e[1] + '" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"/>'; }).join('');
    h += g.nodes.map(function (v) {
      var note = v.kind === 'note', me = v.id === gvNote.id, r = note ? (me ? 10 : 8) : 5;
      var lbl = note ? short(noteTitle(document.getElementById(v.id))) : v.id;
      return '<g class="n ' + v.kind + (me ? ' me sel' : '') + '" data-id="' + v.id + '" tabindex="0" role="button" aria-label="' + esc(note ? noteTitle(document.getElementById(v.id)) : 'Tag ' + v.id) + '">' +
        '<circle cx="' + v.x.toFixed(1) + '" cy="' + v.y.toFixed(1) + '" r="' + r + '"/><text x="' + v.x.toFixed(1) + '" y="' + (v.y + r + 14).toFixed(1) + '" text-anchor="middle">' + esc(lbl) + '</text></g>';
    }).join('');
    gvSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    gvSvg.innerHTML = h;
    gv.querySelectorAll('[data-scope]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-scope') === gvScope)); });
    peek(gvNote.id);
  }
  function peek(id) {
    gvSvg.querySelectorAll('.n').forEach(function (n) { n.classList.toggle('sel', n.getAttribute('data-id') === id); });
    if (id.charAt(0) === '#') {
      var withTag = noteEls.filter(function (n) { return tagsOf(n).indexOf(id.slice(1)) >= 0; });
      gvPeek.innerHTML = '<span class="k">Tag</span><h3>' + esc(id) + '</h3><p>' + withTag.length + (withTag.length === 1 ? ' note' : ' notes') + ' with this tag.</p><ul>' +
        withTag.map(function (n) { return '<li><a href="#' + n.id + '" data-go="' + n.id + '">' + esc(noteTitle(n)) + '</a></li>'; }).join('') + '</ul>';
      return;
    }
    var n = document.getElementById(id), view = n.querySelector('.obs-view');
    var paras = Array.prototype.slice.call(view.querySelectorAll(':scope > p')).map(function (p) {
      var c = p.cloneNode(true); c.querySelectorAll('.sn, .sn-ref').forEach(function (x) { x.remove(); }); return c.textContent.trim(); }).filter(Boolean);
    var excerpt = paras.join(' '); if (excerpt.length > 320) excerpt = excerpt.slice(0, 318).replace(/\s+\S*$/, '') + '…';
    var props = view.querySelectorAll('.obs-props dd');
    var full = tabs.indexOf(id) < 0 && tabs.length >= MAX_TABS;
    gvPeek.innerHTML = '<span class="k">N°' + id.slice(2) + ' · ' + esc(props[0].textContent) + '</span><h3>' + esc(noteTitle(n)) + '</h3>' +
      '<div>' + tagsOf(n).map(function (t) { return '<span class="obs-tag">#' + esc(t) + '</span>'; }).join('') + '</div><p>' + esc(excerpt) + '</p>' +
      '<div class="acts">' + (id === gvNote.id && tabs.indexOf(id) >= 0 && activeTab === id ? '' : '<a class="go" href="#' + id + '" data-go="' + id + '">Open</a>') +
      '<button type="button" data-tab="' + id + '"' + (full ? ' disabled title="Up to ' + MAX_TABS + ' tabs"' : '') + '>Open in new tab</button></div>';
  }
  function openGraph(id) {
    gvNote = document.getElementById(id); gvScope = 'local';
    if (gv.showModal) gv.showModal(); else gv.setAttribute('open', '');
    drawGraph();
  }
  if (gv) {
    gv.addEventListener('click', function (e) {
      if (e.target === gv) { gv.close(); return; }
      var s = e.target.closest('[data-scope]'), node = e.target.closest('.n'), go = e.target.closest('[data-go]'), tb = e.target.closest('[data-tab]'), x = e.target.closest('.gv-close');
      if (x) gv.close();
      if (s) { gvScope = s.getAttribute('data-scope'); drawGraph(); }
      if (node) peek(node.getAttribute('data-id'));
      if (go) { e.preventDefault(); gv.close(); location.hash = go.getAttribute('data-go'); }
      if (tb && !tb.disabled) { gv.close(); newTab(tb.getAttribute('data-tab')); }
    });
    gvSvg.addEventListener('keydown', function (e) { var node = e.target.closest('.n'); if (node && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); peek(node.getAttribute('data-id')); } });
    // hover a node to light up its links and fade the rest
    gvSvg.addEventListener('mouseover', function (e) {
      var node = e.target.closest('.n'); gvSvg.classList.toggle('hov', !!node); if (!node) return;
      var id = node.getAttribute('data-id'), near = {}; near[id] = 1;
      gvSvg.querySelectorAll('line').forEach(function (l) {
        var hit = l.getAttribute('data-a') === id || l.getAttribute('data-b') === id;
        if (hit) { near[l.getAttribute('data-a')] = 1; near[l.getAttribute('data-b')] = 1; }
        l.classList.toggle('dim', !hit);
      });
      gvSvg.querySelectorAll('.n').forEach(function (n) { n.classList.toggle('dim', !near[n.getAttribute('data-id')]); });
    });
    gvSvg.addEventListener('mouseleave', function () { gvSvg.classList.remove('hov'); });
  }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-graph]'); if (b) openGraph(b.getAttribute('data-graph')); });

  // BOOKING: paste the Calendly link here. Until then, Book a call opens an email.
  var CALENDLY = 'https://calendar.app.google/hLuo2fyWcoeTghbM6';
  if (CALENDLY) document.querySelectorAll('[data-book]').forEach(function (a) { a.href = CALENDLY; a.target = '_blank'; a.rel = 'noopener'; });
  document.querySelector('.skip').addEventListener('click', function (e) { e.preventDefault(); document.getElementById('content').focus(); });

  // CALENDAR STATUS: under my name on every page (rail) and in the phone top bar. api/status.js reads free/busy only, at any
  // hour (no working hours). Hidden until the calendar is connected (README → Calendar status).
  // Times show in the visitor's own time zone. Add ?status=free or busy to the address to preview it.
  (function () {
    var els = document.querySelectorAll('[data-avail]');
    function clock(iso) { return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(':00', '').toLowerCase(); }
    function when(iso) { var d = new Date(iso); return d.toDateString() === new Date().toDateString() ? 'at ' + clock(iso) : d.toLocaleDateString([], { weekday: 'short' }) + ' ' + clock(iso); }
    function show(d) {
      var ok = !!(d && d.configured && d.state);
      els.forEach(function (el) {
        el.hidden = !ok; if (!ok) return;
        el.setAttribute('data-state', d.state);
        el.querySelector('b').textContent = d.state === 'free' ? "Door's open" : d.state === 'busy' ? 'In a meeting' : 'Off the clock';
        el.title = d.state === 'busy' ? 'Free at ' + clock(d.until) + ', your time' : d.state === 'off' ? 'Back ' + when(d.back) + ', your time' : 'Free right now. Book a call.';
        if (el.tagName === 'A') { if (d.state === 'free' && CALENDLY) el.href = CALENDLY; else el.removeAttribute('href'); }
        var s = el.querySelector('span'); if (!s) return;
        if (d.state === 'free') s.innerHTML = '<a href="' + CALENDLY + '" target="_blank" rel="noopener">Book a call</a>';
        else s.textContent = d.state === 'busy' ? 'free at ' + clock(d.until) : 'back ' + when(d.back);
      });
    }
    function load() {
      if (document.hidden) return;
      var demo = (location.search.match(/[?&]status=(free|busy|off)/) || [])[1];
      if (demo) return show({ configured: true, state: demo, until: new Date(Date.now() + 40 * 60e3).toISOString(), back: new Date(Date.now() + 15 * 36e5).toISOString() });
      fetch('/api/status').then(function (r) { return r.json(); }).then(show, function () { show(null); });
    }
    load(); setInterval(load, 120000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
  })();

  // DHAKA RIGHT NOW: the date and time there, ticking each minute, and the weather from api/weather.js (kept 30 minutes per visit).
  (function () {
    var box = document.getElementById('here'); if (!box) return;
    var d = box.querySelector('.here-d'), t = box.querySelector('.here-t'), w = box.querySelector('.here-w');
    function tick() {
      var now = new Date();
      d.textContent = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', weekday: 'short', day: 'numeric', month: 'short' });
      t.textContent = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit' }).toLowerCase();
    }
    function weather(x) { if (x && typeof x.temp === 'number') w.textContent = x.temp + '°C' + (x.sky ? ', ' + x.sky : ''); }
    tick(); setInterval(tick, 15000);
    var cached = null; try { cached = JSON.parse(sessionStorage.getItem('dhaka-weather') || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.at < 30 * 60e3) weather(cached);
    else setTimeout(function () {
      fetch('/api/weather').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d) return; weather(d);
        try { d.at = Date.now(); sessionStorage.setItem('dhaka-weather', JSON.stringify(d)); } catch (e) {}
      }, function () {});
    }, 1200);
  })();

  // SOCIALS UPDATE: one entry per profile: [name, url, icon]. Rendered wherever a [data-socials] box appears.
  var SOCIALS = [
    ['LinkedIn', 'https://www.linkedin.com/in/mehedihasanifti/', 'in'],
    ['X', 'https://x.com/mehedi_ifti', 'x'],
    ['Substack', 'https://substack.com/@mehediifti', 'ss'],
    ['Spotify', 'https://open.spotify.com/user/21cq757g3mlgyweevd5rnbzka', 'sp'],
    ['GitHub', 'https://github.com/MehediIfti', 'gh'],
    ['ResearchGate', 'https://www.researchgate.net/profile/Mehedi-Ifti', 'rg'],
    ['Email', 'mailto:mh.hasan884@gmail.com', 'em'],
    ['Work email', 'mailto:mehedi.ifti@musemind.agency', 'em']
  ];
  var SOCIAL_ICON = {
    in: '<path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.55c0-1.32-.02-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.92V21H9z"/>',
    x: '<path fill="currentColor" d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3zm-1.08 16.2h1.7L7.4 4.72H5.58l11.09 14.48z"/>',
    ss: '<path fill="currentColor" d="M4 3h16v2.6H4zM4 7.2h16v2.6H4zM4 11.4h16V21l-8-4.5L4 21z"/>',
    sp: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path class="cut" d="M7 9.4c3.6-1 7.2-.7 10.2 1M7.6 12.6c3-.8 5.9-.5 8.4.9M8.3 15.6c2.3-.6 4.5-.4 6.3.7" fill="none" stroke-width="1.7" stroke-linecap="round"/>',
    gh: '<path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/>',
    rg: '<rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor"/><text class="cut-t" x="12" y="16.3" text-anchor="middle" font-size="10.5" font-weight="700" font-family="Arial, sans-serif">RG</text>',
    em: '<path d="M3 6.5h18v11H3z M3.5 7l8.5 6.5L20.5 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'
  };
  function renderSocials(scope) {
    (scope || document).querySelectorAll('[data-socials]').forEach(function (box) {
      box.innerHTML = SOCIALS.map(function (x) {
        var ext = x[1].indexOf('mailto:') !== 0;
        return '<a class="soc" data-net="' + x[2] + '" href="' + x[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' aria-label="' + x[0] + '" title="' + x[0] + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + SOCIAL_ICON[x[2]] + '</svg><span>' + x[0] + '</span></a>';
      }).join('');
    });
  }
  renderSocials(document);

  // Right column: contents, page details, what I'm on right now, prev/next note.
  var meta = document.getElementById('meta');
  var tocItems = [];
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  // Every page ends by pointing to the next one, so the site reads in order
  function pageNext(page, id) {
    // page order is the rail's order, so dragging rail links changes Previous/Next too
    var ORDER = Array.prototype.map.call(document.querySelectorAll('.rail a.nav'), function (a) { return a.getAttribute('href').slice(1); });
    var old = page.querySelector(':scope > .page-next'); if (old) old.remove();
    var i = ORDER.indexOf(id); if (i < 0) return;
    var name = function (k) { var a = document.querySelector('.rail a.nav[href="#' + k + '"]'); return a ? a.textContent.replace(/^\d/, '').trim() : k; };
    var prev = ORDER[i - 1], next = ORDER[i + 1];
    page.insertAdjacentHTML('beforeend', '<nav class="page-next" aria-label="Keep reading">' +
      (prev ? '<a href="#' + prev + '"><small>Previous</small><b>← ' + esc(name(prev)) + '</b></a>' : '<span></span>') +
      (next ? '<a class="nx" href="#' + next + '"><small>Next</small><b>' + esc(name(next)) + ' →</b></a>' : '') + '</nav>');
  }
  function buildMeta(page, id) {
    var html = '';
    var heads = Array.prototype.slice.call(page.querySelectorAll('h2'));
    if (heads.length >= 3) {
      html += '<section class="m-toc"><h4>On this page</h4><ol class="toc">' + heads.map(function (h, i) {
        return '<li><button type="button" data-i="' + i + '">' + esc(h.textContent) + '</button></li>';
      }).join('') + '</ol></section>';
    }
    // calendar activity sits high on the index so it gets seen
    if (id === 'index') html += '<section class="m-hide"><h4>Activity</h4>' + activityHTML() + '</section>';
    var words = page.textContent.trim().split(/\s+/).length; // textContent: innerText skips content-visibility sections
    var isNote = id.indexOf('n-') === 0;
    var now = document.getElementById('now');
    var pick = function (h2text) {
      var h = Array.prototype.find.call(now.querySelectorAll('h2, h3'), function (x) { return x.textContent === h2text; });
      var el = h; while (el && !(el.classList && el.classList.contains('log'))) el = el.nextElementSibling;
      var t = el && el.querySelector('.t');
      return t ? t.childNodes[0].textContent.trim() : '';
    };
    if (id !== 'now' && !isNote) {
      html += '<section class="m-hide"><h4>Right now</h4><ul class="cur">' +
        [['reading', pick('Reading')], ['watching', pick('Watching')], ['listening', pick('Listening')], ['exploring', pick('Exploring')]].filter(function (r) { return r[1]; })
        .map(function (r) { return '<li><span class="k">' + r[0] + '</span><span class="v">' + esc(r[1]) + '</span></li>'; }).join('') +
        '</ul><p style="margin-top:0.6rem"><a href="#now">full log →</a></p></section>';
    }
    // Page details come after Right now
    if (isNote) html += noteMeta(page);
    html += '<section class="m-hide"><h4>Find me</h4><div class="socials rail-socials" data-socials></div></section>';
    meta.innerHTML = html;
    renderSocials(meta);
    stereoFor(id);
    tocItems = heads;
    meta.querySelectorAll('.toc button').forEach(function (b) {
      b.addEventListener('click', function () { heads[+b.getAttribute('data-i')].scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    });
    spy();
  }
  // SPOTIFY: the stereo section under the right column on every page but the homepage (#stereo), and a compact one (#stereo-m) where that column isn't shown. api/now-playing.js asks Spotify what I'm playing.
  // It stays hidden until Spotify is connected (README → Spotify). Add ?player=demo to the address to preview it.
  var ST = { el: document.getElementById('stereo'), m: document.getElementById('stereo-m'), poll: 0, tick: 0, d: null, at: 0 };
  function stBoth(sel, fn) { [ST.el, ST.m].forEach(function (x) { x.querySelectorAll(sel).forEach(fn); }); }
  function stTime(ms) { var s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function stAgo(iso) {
    var m = Math.round((Date.now() - new Date(iso)) / 60000);
    return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' d ago';
  }
  function stDeck(name) {
    ST.el.setAttribute('data-deck', name);
    ST.el.querySelectorAll('.st-pick button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-deck') === name)); });
    stFit();
  }
  // The right column's details make room for the player, so the two never overlap.
  function stFit() { root.classList.toggle('has-stereo', !ST.el.hidden); root.classList.toggle('has-stereo-m', !ST.m.hidden); root.style.setProperty('--stereo-h', ST.el.offsetHeight + 'px'); }
  function stDismissed() { try { return sessionStorage.getItem('st-hide') === '1'; } catch (e) { return false; } }
  function stLoad() {
    if (document.hidden) return;
    if (/[?&]player=demo/.test(location.search)) return stShow({ configured: true, playing: true, kind: 'track', title: 'Track title goes here', artist: 'Artist name', progress: 42000, duration: 201000, url: 'https://open.spotify.com/', art: null });
    fetch('/api/now-playing').then(function (r) { return r.json(); }).then(stShow, function () { stShow(null); });
  }
  function stShow(d) {
    var el = ST.el;
    if (!ST.poll) return; // went to the homepage while waiting
    if (!d || !d.configured || !d.title) { el.hidden = ST.m.hidden = true; stFit(); return; }
    ST.d = d; ST.at = Date.now(); el.hidden = false; ST.m.hidden = stDismissed();
    [el, ST.m].forEach(function (x) { x.setAttribute('data-state', d.playing ? 'live' : 'last'); });
    stBoth('.st-st', function (t) { t.textContent = d.playing ? 'On air' : d.playedAt ? 'Last played' : 'Paused'; });
    stBoth('.st-title', function (t) { t.textContent = d.title; t.title = d.title; });
    stBoth('.st-artist', function (t) { t.textContent = d.artist || (d.kind === 'episode' ? 'Podcast' : ''); });
    stBoth('.st-art', function (img) { if (d.art) { if (img.getAttribute('src') !== d.art) img.src = d.art; img.hidden = false; } else img.hidden = true; });
    stBoth('.st-open', function (a) { if (d.url) a.href = d.url; else a.removeAttribute('href'); });
    el.querySelector('.st-open').hidden = !d.url;
    stTick(); stFit();
  }
  function stTick() {
    var d = ST.d, el = ST.el; if (!d) return;
    var p = d.playing ? Math.min(d.duration, d.progress + (Date.now() - ST.at)) : d.playedAt ? d.duration : (d.progress || 0);
    var f = d.duration ? p / d.duration : 0, reels = el.querySelectorAll('.st-deck .cas-reel');
    el.querySelector('.st-clock').textContent = !d.playing && d.playedAt ? stAgo(d.playedAt) : stTime(p) + ' / ' + stTime(d.duration);
    reels[0].style.setProperty('--tape', (1 + 6 * (1 - f)).toFixed(1) + 'px'); reels[1].style.setProperty('--tape', (1 + 6 * f).toFixed(1) + 'px');
    if (d.playing && p >= d.duration && Date.now() - ST.at > 3000) { ST.at = Date.now(); setTimeout(stLoad, 1500); } // song ended: ask again
  }
  function stereoFor(id) {
    clearInterval(ST.poll); clearInterval(ST.tick); ST.poll = ST.tick = 0;
    if (id === 'index') { ST.el.hidden = ST.m.hidden = true; stFit(); return; } // the homepage has its own story; the stereo is everywhere else
    if (ST.d) { ST.el.hidden = false; ST.m.hidden = stDismissed(); stFit(); } // keep showing the last answer while the next one loads
    ST.poll = setInterval(stLoad, 30000); ST.tick = setInterval(stTick, 1000); stLoad();
  }
  try { if (localStorage.getItem('st-deck') === 'cassette') stDeck('cassette'); } catch (e) {}
  ST.el.querySelector('.st-pick').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    stDeck(b.getAttribute('data-deck'));
    try { localStorage.setItem('st-deck', b.getAttribute('data-deck')); } catch (err) {}
  });
  ST.m.querySelector('.sm-x').addEventListener('click', function () { ST.m.hidden = true; stFit(); try { sessionStorage.setItem('st-hide', '1'); } catch (e) {} });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && ST.poll) stLoad(); });
  window.addEventListener('resize', stFit);
  function spy() {
    if (!tocItems.length) return;
    var cur = 0;
    tocItems.forEach(function (h, i) { if (h.getBoundingClientRect().top < window.innerHeight * 0.3) cur = i; });
    meta.querySelectorAll('.toc button').forEach(function (b, i) { b.classList.toggle('on', i === cur); });
  }
  window.addEventListener('scroll', spy, { passive: true });
  // STATS UPDATE: one row per skill: [chart label, full name, strength, interest], scores 0–100. Five to eight rows read best.
  var STATS = [
    ['Negotiation', 'Negotiation', 74, 92],
    ['Alignment', 'Stakeholder alignment', 88, 78],
    ['Discovery', 'Discovery & questions', 82, 86],
    ['Design sense', 'Design literacy', 70, 80],
    ['Writing', 'Client writing', 80, 72],
    ['AI tools', 'AI tooling', 58, 95]
  ];
  var radarPlay = (function () {
    var fig = document.getElementById('radar');
    if (!fig) return null;
    var svg = fig.querySelector('svg'), list = document.getElementById('rd-list');
    var n = STATS.length, R = 118, cx = 200, cy = 145;
    function pt(i, r) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    function pts(f) { return STATS.map(function (s, i) { return pt(i, f(s)).map(function (v) { return v.toFixed(1); }).join(','); }).join(' '); }

    var h = '';
    [0.25, 0.5, 0.75, 1].forEach(function (k) { h += '<polygon class="rd-ring" points="' + pts(function () { return R * k; }) + '"/>'; });
    STATS.forEach(function (s, i) {
      var e = pt(i, R), l = pt(i, R + 14);
      var anchor = Math.abs(l[0] - cx) < 4 ? 'middle' : (l[0] > cx ? 'start' : 'end');
      var dy = l[1] < cy - 4 ? -2 : (l[1] > cy + 4 ? 11 : 4);
      h += '<line class="rd-spoke" data-i="' + i + '" x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) + '"/>';
      h += '<text class="rd-lbl" data-i="' + i + '" x="' + l[0].toFixed(1) + '" y="' + (l[1] + dy).toFixed(1) + '" text-anchor="' + anchor + '">' + s[0] + '</text>';
    });
    h += '<polygon class="rd-area rd-int"/><polygon class="rd-area rd-str"/>';
    STATS.forEach(function (s, i) { h += '<circle class="rd-dot rd-int" data-i="' + i + '" r="3.5"/><circle class="rd-dot rd-str" data-i="' + i + '" r="3.5"/>'; });
    STATS.forEach(function (s, i) {
      var a = pt(i - 0.5, R + 36), b = pt(i + 0.5, R + 36);
      h += '<path class="rd-hit" data-i="' + i + '" d="M' + cx + ',' + cy + 'L' + a.join(',') + 'L' + b.join(',') + 'Z"/>';
    });
    svg.innerHTML = h;

    list.innerHTML = STATS.map(function (s, i) {
      return '<li data-i="' + i + '" tabindex="0"><span class="nm">' + s[1] + '</span>' +
        '<span class="v"><b>' + s[2] + '</b><span class="vh"> strength,</span> · ' + s[3] + '<span class="vh"> interest</span></span>' +
        '<span class="rd-bars" aria-hidden="true"><i style="width:' + s[2] + '%"></i><i class="rd-int" style="width:' + s[3] + '%"></i></span></li>';
    }).join('');

    var best = STATS.reduce(function (a, s) { return s[2] > a[2] ? s : a; });
    var grind = STATS.reduce(function (a, s) { return s[3] - s[2] > a[3] - a[2] ? s : a; });
    document.getElementById('rd-ovr').textContent = Math.round(STATS.reduce(function (t, s) { return t + s[2]; }, 0) / n);
    document.getElementById('rd-mvp').textContent = best[1] + ' ' + best[2];
    document.getElementById('rd-grind').textContent = grind[1] + ' +' + (grind[3] - grind[2]);

    // hover or focus a skill on either side to light it up on both
    function setOn(i) {
      fig.querySelectorAll('[data-i]').forEach(function (el) { el.classList.toggle('on', el.getAttribute('data-i') === String(i)); });
    }
    fig.querySelectorAll('.rd-hit, .rd-list li').forEach(function (el) {
      var i = el.getAttribute('data-i');
      el.addEventListener('mouseenter', function () { setOn(i); });
      el.addEventListener('focus', function () { setOn(i); });
      el.addEventListener('click', function () { setOn(i); });
    });
    fig.querySelector('.rd-body').addEventListener('mouseleave', function () { setOn(-1); });
    list.addEventListener('focusout', function () { setOn(-1); });

    fig.querySelectorAll('.rd-legend button').forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on));
        fig.classList.toggle('hide-' + b.getAttribute('data-s'), !on);
      });
    });

    var area = { str: svg.querySelector('.rd-area.rd-str'), int: svg.querySelector('.rd-area.rd-int') };
    var dots = { str: svg.querySelectorAll('.rd-dot.rd-str'), int: svg.querySelectorAll('.rd-dot.rd-int') };
    function draw(key, col, t) {
      area[key].setAttribute('points', pts(function (s) { return R * s[col] / 100 * t; }));
      STATS.forEach(function (s, i) {
        var p = pt(i, R * s[col] / 100 * t);
        dots[key][i].setAttribute('cx', p[0].toFixed(1)); dots[key][i].setAttribute('cy', p[1].toFixed(1));
      });
    }
    var raf;
    return function play() {
      cancelAnimationFrame(raf);
      fig.classList.remove('in'); void fig.offsetWidth; fig.classList.add('in');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { draw('str', 2, 1); draw('int', 3, 1); return; }
      var t0 = null, ease = function (x) { x = Math.min(Math.max(x, 0), 1); return 1 - Math.pow(1 - x, 3); };
      (function step(now) {
        if (t0 === null) t0 = now;
        var p = (now - t0) / 1000;
        draw('str', 2, ease(p / 0.75)); draw('int', 3, ease((p - 0.2) / 0.8));
        if (p < 1) raf = requestAnimationFrame(step);
      })(performance.now());
    };
  })();

  // Rail groups fold open or shut (data-shut = shut by default), remember the visitor's choice, and open for the page you're on.
  var railGrps = Array.prototype.slice.call(document.querySelectorAll('.rail-grp'));
  function grpSet(g, open, save) {
    g.classList.toggle('shut', !open);
    g.querySelector('.grp-t').setAttribute('aria-expanded', String(open));
    if (save) { try { localStorage.setItem('rail-' + g.getAttribute('data-grp'), open ? 'open' : 'shut'); } catch (e) {} }
    if (window.placeApTab) placeApTab();
  }
  railGrps.forEach(function (g) {
    var saved = null; try { saved = localStorage.getItem('rail-' + g.getAttribute('data-grp')); } catch (e) {}
    grpSet(g, saved ? saved === 'open' : !g.hasAttribute('data-shut'), false);
    g.querySelector('.grp-t').addEventListener('click', function () { grpSet(g, g.classList.contains('shut'), true); });
  });

  function show() {
    var first = document.getElementById('first-page'); if (first) first.remove();
    var id = (location.hash || '#index').slice(1);
    var target = document.getElementById(id), anchor = null;
    if (target && !target.classList.contains('page') && target.closest('.page')) { anchor = target; target = target.closest('.page'); id = target.id; }
    if (!target || !target.classList.contains('page')) { target = document.getElementById('index'); id = 'index'; }
    pages.forEach(function (p) { p.classList.toggle('on', p === target); });
    var section = id.indexOf('n-') === 0 ? 'notes' : id;
    navs.forEach(function (a) {
      if (a.getAttribute('href') === '#' + section) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    railGrps.forEach(function (g) { if (g.querySelector('a[aria-current="page"]')) grpSet(g, true, false); });
    var h = target.querySelector('h1');
    document.title = (id === 'index' ? '' : (h ? h.textContent + ' · ' : '')) + "Ifti's Notebook";
    if (id.indexOf('n-') === 0) { openInTab(id); renderTabs(target); }
    buildMeta(target, id); pageNext(target, id);
    document.getElementById('m-path').innerHTML = '~/' + (id === 'index' ? '' : id.indexOf('n-') === 0 ? 'notes/<b>' + id.slice(2) + '</b>' : '<b>' + id + '</b>');
    sheetOpen(false);
    document.querySelectorAll('.m-more').forEach(function (b) { b.classList.toggle('on', ['paperclip', 'hermes', 'whiteboard', 'research', 'education'].indexOf(id) >= 0); });
    if (id === 'work' && radarPlay) radarPlay();
    var here = document.getElementById('here'); if (here && target.firstElementChild !== here) target.prepend(here); // Dhaka strip tops every page
    window.scrollTo(0, 0);
    setTimeout(function () { if (anchor) anchor.scrollIntoView(); else window.scrollTo(0, 0); }, 0);
  }
  window.addEventListener('hashchange', show);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Backstage numbers: counted from the page itself once it has loaded, so they're always current.
  window.addEventListener('load', function () {
    var box = document.getElementById('bs-stats'); if (!box) return;
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var rows = [
      ['Pages', document.querySelectorAll('.page:not(article):not(#backstage)').length],
      ['Notes', document.querySelectorAll('article.page[id^="n-"]').length],
      ['Themes', THEMES.length],
      ['Changelog', document.querySelectorAll('#changelog .cl-list > li').length + ' entries']
    ];
    if (nav && nav.encodedBodySize) rows.push(['This page', 'arrived as ' + Math.round(nav.encodedBodySize / 1024) + ' KB']);
    box.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
  });

  // Links to sections: every note heading gets its id now (the same id search gives it), so a shared #s-n-005-… link
  // opens the note at that section on a fresh visit. The # beside each heading copies that link.
  var hSlug = function (t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); };
  document.querySelectorAll('article.page[id^="n-"] h2').forEach(function (h) {
    if (!h.id) h.id = 's-' + h.closest('.page').id + '-' + hSlug(h.textContent);
    var a = document.createElement('a');
    a.className = 'h-link'; a.href = '#' + h.id; a.setAttribute('aria-label', 'Copy a link to this section'); a.title = 'Copy a link to this section';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var url = location.origin + location.pathname + '#' + h.id, done = function () { a.classList.add('copied'); setTimeout(function () { a.classList.remove('copied'); }, 1400); };
      history.replaceState(null, '', '#' + h.id);
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
    });
    h.appendChild(a);
  });
  window.addEventListener('load', function () { var t = document.getElementById((location.hash || '#index').slice(1)); if (!t || t.classList.contains('page')) setTimeout(function () { window.scrollTo(0, 0); }, 0); });
  window.addEventListener('load', function () { var a = document.getElementById(location.hash.slice(1)); if (a && !a.classList.contains('page') && a.closest('.page')) a.scrollIntoView(); else window.scrollTo(0, 0); });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  show();


  // Suggestion box. Paste your form endpoint (e.g. https://formspree.io/f/xxxx) to receive suggestions by email.
  // Suggestions are emailed to me through FormSubmit. The very first one triggers a one-time confirmation email.
  var SUGGEST_ENDPOINT = 'https://formsubmit.co/ajax/mh.hasan884@gmail.com';
  // Notes list: first sentence of each note as a one-line dek
  document.querySelectorAll('#notes .entries a[href^="#n-"]').forEach(function (a) {
    var n = document.getElementById(a.getAttribute('href').slice(1));
    var p = n && n.querySelector('h1 ~ p');
    if (!p) return;
    var m = p.textContent.trim().match(/^.+?[.?!](?=\s|$)/);
    var d = document.createElement('span'); d.className = 'dek'; d.textContent = m ? m[0] : p.textContent.trim();
    a.appendChild(d);
  });
  // links to #suggest open the collapsed form
  document.addEventListener('click', function (e) {
    var l = e.target.closest && e.target.closest('a[href="#suggest"]');
    var d = document.querySelector('.suggest-d');
    if (l && d) d.open = true;
  });
  var form = document.getElementById('suggest-form');
  var status = document.getElementById('s-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = document.getElementById('s-title');
    if (!title.value.trim()) { status.textContent = 'Add a title first.'; title.focus(); return; }
    var data = new FormData(form);
    if (!SUGGEST_ENDPOINT) { status.textContent = 'Suggestions are closed for now. Email me instead.'; return; }
    var btn = form.querySelector('button'); btn.disabled = true; status.textContent = 'Sending…';
    fetch(SUGGEST_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(); form.reset(); status.textContent = 'Got it. Thank you.'; })
      .catch(function () { status.textContent = "Couldn't send. Try again, or email me."; })
      .then(function () { btn.disabled = false; });
  });



  // Mobile: index sheet + theme buttons
  var sheet = document.getElementById('m-sheet');
  var menuBtn = document.getElementById('m-menu');
  function sheetOpen(open) {
    if (!sheet) return;
    sheet.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open));
    document.querySelectorAll('.m-more').forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { sheetOpen(sheet.hidden); });
  document.querySelectorAll('.m-more').forEach(function (b) { b.addEventListener('click', function () { sheetOpen(sheet.hidden); }); });
  document.getElementById('m-close').addEventListener('click', function () { sheetOpen(false); });
  document.getElementById('m-notecount').textContent = document.querySelectorAll('article.page[id^="n-"]').length + ' entries';
  (function () {
    var rows = document.querySelectorAll('#now .log');
    var mini = document.getElementById('m-nowmini'); var html = '';
    [['exploring', 0], ['watching', 1], ['reading', 2], ['listening', 3]].forEach(function (r) {
      var t = rows[r[1]] && rows[r[1]].querySelector('.t');
      if (t) html += '<div>' + r[0] + '<b>' + esc(t.childNodes[0].textContent.trim()) + '</b></div>';
    });
    mini.innerHTML = html;
  })();

  // Appearance. A theme is a named bundle of settings (colours, background, pattern, layout, text).
  // THEME UPDATE: add next week's theme at the top of THEMES (the picker shows them in this order). What new visitors get is THEME_DAY, in the <head> script.
  // `sw` is how its card looks in the picker: background, text, accent, and the background pattern.
  var THEMES = [
    { id: 'halftone', name: 'Halftone', week: 'Week 43', note: 'Mint paper, black ink, a dithered orange sun, pixel type and heavy headlines.',
      set: { palette: 'halftone', bg: 'dots', calm: 'margins', layout: '3', type: 'mono' },
      sw: { bg: '#e3f8e7', fg: '#111311', ac: '#f05a28', pat: 'radial-gradient(circle at 82% 30%, #f05a28 0 13px, transparent 14px), linear-gradient(#111311, #111311) right 12px bottom 12px / 5px 5px no-repeat, linear-gradient(#111311, #111311) right 22px bottom 7px / 5px 5px no-repeat, repeating-conic-gradient(#111311 0 25%, transparent 0 50%) left bottom / 6px 6px repeat-x' } },
    { id: 'cropmark', name: 'Cropmark', week: 'Week 43', note: 'Hairline rules, square corners, pink selections and crop marks on every card.',
      set: { palette: 'cropmark', bg: 'plain', calm: 'margins', layout: '3', type: 'sans' },
      sw: { bg: '#121212', fg: '#ededed', ac: '#f7cafa', pat: 'linear-gradient(#6e6e6e, #6e6e6e) left 6px top 10px / 9px 1px no-repeat, linear-gradient(#6e6e6e, #6e6e6e) left 10px top 6px / 1px 9px no-repeat, linear-gradient(#6e6e6e, #6e6e6e) right 6px bottom 10px / 9px 1px no-repeat, linear-gradient(#6e6e6e, #6e6e6e) right 10px bottom 6px / 1px 9px no-repeat' } },
    { id: 'lightsout', name: 'Lights Out', week: 'Race week', note: 'Red Bull navy, F1 red and yellow, slanted type and a start-light sequence.',
      set: { palette: 'lightsout', bg: 'lines', calm: 'margins', layout: '3', type: 'sans' },
      sw: { bg: '#0b0e1a', fg: '#e9ecf5', ac: '#ffc906', pat: 'linear-gradient(90deg, #e10600 0 34%, #ffc906 34% 46%, transparent 46%) left bottom / 100% 3px no-repeat, repeating-linear-gradient(-62deg, transparent 0 14px, rgba(255,255,255,.05) 14px 15px)' } },
    { id: 'midnight-ledger', name: 'Midnight Ledger', week: 'Week 42', note: 'Black ink, a drafting grid and a spotlight on the page.',
      set: { palette: 'black', bg: 'grid', calm: 'spotlight', layout: '3', type: 'serif' },
      sw: { bg: '#0c0d10', fg: '#d4d4d8', ac: '#cba6f7', pat: 'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px) 0 0 / 14px 14px, linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px) 0 0 / 14px 14px' } }
  ];
  var THEME_DEFAULT = THEME_TODAY[0]; // what new visitors get: the theme of the day (THEME_DAY, top of the page)
  var THEME_KEYS = ['palette', 'bg', 'calm', 'layout', 'type'];
  var AP_GLOBAL = { mnav: 'tabs' };
  var tab = document.getElementById('ap-tab');
  var panel = document.getElementById('ap-panel');
  var groups = document.querySelectorAll('#ap-panel [data-attr]');
  var presets = document.getElementById('ap-presets');
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function themeById(id) { var f = function (x) { return THEMES.filter(function (t) { return t.id === x; })[0]; }; return f(id) || f(THEME_DEFAULT) || THEMES[0]; }
  function lightsOut() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var old = document.querySelector('.f1-lights'); if (old) old.remove();
    var o = document.createElement('div'); o.className = 'f1-lights'; o.setAttribute('aria-hidden', 'true');
    o.innerHTML = '<div class="f1-rig">' + '<span><i></i><i></i></span>'.repeat(5) + '</div>';
    document.body.appendChild(o);
    var cols = o.querySelectorAll('.f1-rig span'), timers = [];
    // Like a real start: five sets of reds come on one per beat, a random hold, then all go out together. No green.
    function end() { timers.forEach(clearTimeout); o.classList.add('out'); setTimeout(function () { o.remove(); }, 260); }
    cols.forEach(function (c, i) { timers.push(setTimeout(function () { c.classList.add('on'); }, 150 + i * 280)); });
    var hold = 150 + 5 * 280 + 200 + Math.round(Math.random() * 500);
    timers.push(setTimeout(function () { cols.forEach(function (c) { c.classList.remove('on'); }); }, hold));
    timers.push(setTimeout(end, hold + 350));
    o.addEventListener('click', end);
  }
  // Halftone theme: the dithered sun behind the homepage title. Drawn once into a tiny image, scaled up with crisp pixels.
  setTimeout(function () {
    var N = 60, c = document.createElement('canvas'), x = c.getContext('2d'), seed = 7;
    var B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    c.width = c.height = N; x.fillStyle = '#f05a28';
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var dx = (i + 0.5) / N * 2 - 1, dy = (j + 0.5) / N * 2 - 1, r = Math.sqrt(dx * dx + dy * dy);
      if (r > 1) continue;
      var v = 0.08 + 0.92 * Math.pow(r, 2.6); // light core, dense rim
      if (r > 0.93) v *= 0.55; // a ragged edge
      if (v * 16 + (rnd() - 0.5) * 4 > B[(j % 4) * 4 + i % 4] + 0.5) x.fillRect(i, j, 1, 1);
    }
    root.style.setProperty('--ht-sun', 'url(' + c.toDataURL() + ')');
  }, 0);
  // Picking today's theme puts the visitor back on the daily rotation; any other pick sticks.
  function pickTheme(id) { apTheme(id); store('ap-theme', cur === THEME_DEFAULT ? null : cur); if (window.achTheme) achTheme(cur); }
  function edits(id) { try { return JSON.parse(read('ap-t-' + id) || '{}') || {}; } catch (e) { return {}; } }
  var cur = themeById(read('ap-theme')).id;
  ['palette', 'bg', 'calm', 'type', 'layout'].forEach(function (k) { store('ap-' + k, null); }); // settings saved before themes existed
  function apSet(attr, val) {
    root.setAttribute('data-' + attr, val);
    document.querySelectorAll('#ap-panel [data-attr="' + attr + '"] button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-val') === val));
    });
  }
  function apTheme(id) {
    var t = themeById(id), ed = edits(t.id); cur = t.id;
    root.setAttribute('data-theme', t.id);
    var resolved = { theme: t.id };
    THEME_KEYS.forEach(function (k) { resolved[k] = ed[k] || t.set[k]; apSet(k, resolved[k]); });
    store('ap-resolved', JSON.stringify(resolved));
    presets.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-id') === t.id)); });
    document.getElementById('ap-cur').textContent = t.name;
    document.getElementById('ap-dirty').hidden = !Object.keys(ed).length;
  }
  presets.innerHTML = THEMES.map(function (t) {
    return '<button type="button" class="ap-preset" title="' + esc(t.note) + '" data-id="' + t.id + '" style="--sw-bg:' + t.sw.bg + ';--sw-fg:' + t.sw.fg + ';--sw-ac:' + t.sw.ac + ';--sw-pat:' + t.sw.pat + '">' +
      '<span class="pr-top"><b>' + esc(t.name) + '</b><em>' + esc(t.id === THEME_DEFAULT ? 'Today' : t.week) + '</em></span><small>' + esc(t.note) + '</small></button>';
  }).join('');
  presets.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var was = cur; pickTheme(b.getAttribute('data-id')); if (cur === 'lightsout' && was !== cur) lightsOut();
  });
  groups.forEach(function (g) {
    var attr = g.getAttribute('data-attr');
    if (attr in AP_GLOBAL) apSet(attr, read('ap-' + attr) || AP_GLOBAL[attr]);
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var val = b.getAttribute('data-val');
      apSet(attr, val);
      if (attr in AP_GLOBAL) { store('ap-' + attr, val); return; }
      var t = themeById(cur), ed = edits(cur);
      if (val === t.set[attr]) delete ed[attr]; else ed[attr] = val;
      store('ap-t-' + cur, Object.keys(ed).length ? JSON.stringify(ed) : null);
      document.getElementById('ap-dirty').hidden = !Object.keys(ed).length;
    });
  });
  apTheme(cur);
  function apOpen(open) {
    panel.hidden = !open; tab.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('[aria-pressed="true"]').focus();
  }
  tab.addEventListener('click', function () { apOpen(panel.hidden); });
  // Snap the theme tab to just below the rail's last line (the Updated date), so it never sits on the nav.
  // It follows the rail as groups fold, fonts load or the page scrolls; it only clamps when the screen is too short.
  var railEl = document.querySelector('.rail'), tabRaf = 0;
  window.placeApTab = function () {
    cancelAnimationFrame(tabRaf);
    tabRaf = requestAnimationFrame(function () {
      if (tab.classList.contains('free')) { if (tab.classList.contains('edge-line') && tab._apply) tab._apply(); return; }
      if (matchMedia('(max-width: 760px)').matches || !railEl.offsetHeight) { tab.classList.remove('tight'); tab.style.top = ''; return; }
      var gap = 20, top = railEl.getBoundingClientRect().bottom + gap;
      var fab = document.querySelector('.term-fab'), cof = document.getElementById('cof'), floor = fab && fab.offsetHeight && !fab.classList.contains('free') ? fab.getBoundingClientRect().top - 12 : window.innerHeight - gap;
      if (cof && cof.offsetHeight && fab && !fab.classList.contains('free')) floor = Math.min(floor, cof.getBoundingClientRect().top - 12);
      tab.classList.remove('tight');
      if (top + tab.offsetHeight > floor) tab.classList.add('tight');
      tab.style.top = Math.max(gap, Math.min(top, floor - tab.offsetHeight)) + 'px';
    });
  };
  window.addEventListener('scroll', placeApTab, { passive: true });
  window.addEventListener('resize', placeApTab);
  if (window.ResizeObserver) { var ro = new ResizeObserver(placeApTab); ro.observe(railEl); ro.observe(document.getElementById('meta')); }
  placeApTab();
  document.querySelectorAll('.ap-open').forEach(function (b) {
    b.addEventListener('click', function () { sheetOpen(false); apOpen(panel.hidden); });
  });
  document.getElementById('ap-close').addEventListener('click', function () { apOpen(false); tab.focus(); });
  document.getElementById('ap-reset').addEventListener('click', function () {
    store('ap-t-' + cur, null); apTheme(cur);
  });
  document.addEventListener('click', function (e) {
    if (!panel.hidden && !panel.contains(e.target) && !tab.contains(e.target) && !e.target.closest('.ap-open')) apOpen(false);
  });
  // ↑ ↑ ↓ ↓ ← → ← → B A: the start lights and Lights Out, for this visit only. apTheme() saves what's showing for the
  // next first paint, so the saved look is put back right after; a reload returns to the visitor's own theme.
  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], kStep = 0;
  document.addEventListener('keydown', function (e) {
    var t = e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || e.target.isContentEditable) { kStep = 0; return; }
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kStep = k === KONAMI[kStep] ? kStep + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kStep < KONAMI.length) return;
    kStep = 0;
    var saved = read('ap-resolved');
    apTheme('lightsout'); store('ap-resolved', saved);
    lightsOut(); if (window.unlock) unlock('lights');
  });
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA') return;
    if (e.key === 't' || e.key === 'T') apOpen(panel.hidden);
    if (e.key === 'Escape' && !panel.hidden) { apOpen(false); tab.focus(); }
    if (e.key === 'Escape' && !sheet.hidden) sheetOpen(false);
  });

  var keys = { '1': 'index', '2': 'now', '3': 'notes', '4': 'work', '5': 'shelf', '6': 'whiteboard', '7': 'paperclip', '8': 'hermes', '9': 'research', '0': 'education' };
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA') return;
    if (keys[e.key]) location.hash = keys[e.key];
    if ((e.key === 'r' || e.key === 'R') && !e.repeat) randomNote();
  });
  // A random note, never the one you're on. Used by the r key and search.
  function randomNote() {
    var here = (location.hash || '').slice(1), n = Array.prototype.filter.call(document.querySelectorAll('article.page[id^="n-"]'), function (a) { return a.id !== here; });
    if (n.length) location.hash = n[Math.floor(Math.random() * n.length)].id;
  }
  window.randomNote = randomNote;

  // Shortcut sheet: ? opens it. The page list comes from the number keys above and the rail's own labels.
  var keysDlg = document.getElementById('keys');
  function keysOpen() {
    var label = function (id) { var a = document.querySelector('.rail a.nav[href="#' + id + '"]') || document.querySelector('.rail a[href="#' + id + '"]:not(.name)'); return a ? a.textContent.replace(/^\s*\d\s*/, '').trim() : id; };
    var kb = function () { return Array.prototype.map.call(arguments, function (k) { return '<kbd>' + k + '</kbd>'; }).join(''); };
    var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    var rows = Object.keys(keys).sort(function (a, b) { return (a === '0' ? 10 : +a) - (b === '0' ? 10 : +b); }).map(function (k) { return [kb(k), label(keys[k])]; });
    rows.push([kb('R'), 'A random note'], [kb('T'), 'Theme'], [kb('~'), 'Terminal'], [kb(mac ? '⌘' : 'Ctrl', 'K'), 'Search'], [kb('?'), 'This list'], [kb('Esc'), 'Close whatever is open']);
    document.getElementById('keys-list').innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
    if (!keysDlg.open) keysDlg.showModal();
    if (window.unlock) unlock('keys');
  }
  window.openKeys = keysOpen;
  document.getElementById('keys-x').addEventListener('click', function () { keysDlg.close(); });
  keysDlg.addEventListener('click', function (e) { if (e.target === keysDlg) keysDlg.close(); });
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key !== '?') return;
    var t = e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || e.target.isContentEditable) return;
    e.preventDefault(); keysDlg.open ? keysDlg.close() : keysOpen();
  });

  // ============ Whiteboard: the app lives in its own repo (MehediIfti/whiteboard). Load it the first time the page opens, on computers only. ============
  (function () {
    var WB_URL = '/whiteboard/'; // same site as this one, so boards and full screen work in the frame
    function load() {
      var f = document.getElementById('wb-frame');
      if (f && !f.src && location.hash === '#whiteboard' && !matchMedia('(max-width: 760px)').matches) f.src = WB_URL + '?embed=1';
    }
    document.getElementById('wb-open').href = WB_URL;
    window.addEventListener('hashchange', load); setTimeout(load, 0);
  })();

  // ============ Off the clock pop-ups ============
  // F1 UPDATE: hand-written fallbacks. Standings, team position, wins, podiums, starts, the latest win and the next race
  // update themselves from api/f1.js a few seconds after load. Keep titles, titleYears, poles and records current by hand.
  var F1 = {
    asOf: '2026 Singapore Grand Prix', team: 'Oracle Red Bull Racing', driver: 'Max Verstappen', number: '3',
    titles: '4', titleYears: '2021, 2022, 2023, 2024', wins: '73', poles: '50', podiums: '136', starts: '250',
    pos: 'P4', pts: '221', lastWin: 'Won the Singapore Grand Prix, his latest win.', teamPos: 'Red Bull is 4th in the constructors\' table on 332.',
    table: [['1', 'Kimi Antonelli', 'Mercedes', '340'], ['2', 'George Russell', 'Mercedes', '238'], ['3', 'Lewis Hamilton', 'Ferrari', '229'], ['4', 'Max Verstappen', 'Red Bull', '221'], ['5', 'Charles Leclerc', 'Ferrari', '215']],
    records: ['Most wins in a season: 19, in 2023', 'Most wins in a row: 10', 'Youngest Grand Prix winner: 18 years, 228 days, Spain 2016', '2025: runner-up, two points behind Lando Norris']
  };
  // Live numbers, fetched once per visit after the page has settled. If the API is down, the fallbacks above stay.
  function f1When(iso) { return new Date(iso).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); }
  setTimeout(function () {
    fetch('/api/f1').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.table) return;
      var ord = function (n) { return n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th'); };
      F1.asOf = d.asOf || F1.asOf; F1.pos = 'P' + d.pos; F1.pts = d.pts; F1.table = d.table;
      F1.wins = d.wins; F1.podiums = d.podiums; F1.starts = d.starts;
      if (d.teamPos) F1.teamPos = 'Red Bull is ' + ord(+d.teamPos) + ' in the constructors\' table on ' + d.teamPts + '.';
      if (d.latestWin) F1.lastWin = d.latestWin.isLast ? 'Won the ' + d.latestWin.race + ', his latest win.' : 'Latest win: the ' + d.latestWin.season + ' ' + d.latestWin.race + '.';
      F1.next = d.next; hereF1();
      var pop = document.getElementById('pop'); if (pop && !pop.hidden && pop.querySelector('.pop-livery')) popOpen('f1'); // refresh if it's open
    }, function () {});
  }, 2500);
  // RACE WEEKEND: from three days before a Grand Prix, the Dhaka strip counts down to lights out, then says the race is on
  // for two hours. Times come from F1.next (api/f1.js); clicking opens the F1 pop-up. ?race=demo or ?race=live previews it.
  var raceDemo = (location.search.match(/[?&]race=(demo|live)/) || [])[1];
  if (raceDemo) F1.next = { race: 'United States Grand Prix', at: new Date(Date.now() + (raceDemo === 'live' ? -40 * 60e3 : (2 * 60 + 14) * 60e3)).toISOString() };
  function hereF1() {
    var box = document.querySelector('#here .here-f1'); if (!box) return;
    var n = F1.next, at = n && new Date(n.at).getTime(), left = at - Date.now();
    if (!n || isNaN(at) || left > 3 * 864e5 || left < -2 * 36e5) { box.innerHTML = ''; return; }
    var m = Math.max(1, Math.ceil(left / 60e3)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60;
    var when = left <= 0 ? 'racing now' : 'lights out in ' + (d ? d + 'd ' + h + 'h' : h ? h + 'h ' + mm + 'm' : mm + 'm');
    box.innerHTML = '<button type="button" title="' + esc(f1When(n.at)) + ' your time"><i aria-hidden="true">●</i>' + esc(n.race.replace(/ Grand Prix$/, ' GP')) + ' · ' + when + '</button>';
  }
  document.getElementById('here').addEventListener('click', function (e) { if (e.target.closest('.here-f1 button')) popOpen('f1'); });
  hereF1(); setInterval(hereF1, 15000);
  var bookHref = (document.querySelector('[data-book]') || {}).href || 'mailto:mh.hasan884@gmail.com';
  var POPS = {
    f1: function () {
      return '<p class="pop-k">Formula 1 · as of the ' + esc(F1.asOf) + '</p><h3 id="pop-t">Red Bull, and Max</h3>' +
        '<div class="pop-livery" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="pop-who"><div><span class="pop-k">My team</span><b>' + esc(F1.team) + '</b><small>' + esc(F1.teamPos) + '</small></div>' +
        '<div><span class="pop-k">My driver</span><b>' + esc(F1.driver) + ' · #' + esc(F1.number) + '</b><small>4× world champion, ' + esc(F1.titleYears) + '</small></div></div>' +
        '<dl class="pop-stats"><div><dt>Titles</dt><dd>' + F1.titles + '</dd></div><div><dt>Wins</dt><dd>' + F1.wins + '</dd></div><div><dt>Poles</dt><dd>' + F1.poles + '</dd></div><div><dt>Podiums</dt><dd>' + F1.podiums + '</dd></div><div><dt>Starts</dt><dd>' + F1.starts + '</dd></div></dl>' +
        '<div><p class="pop-k" style="margin-bottom:.4rem">2026 drivers\' standings · Max is ' + F1.pos + ' on ' + F1.pts + '</p><ol class="pop-stand">' +
        F1.table.map(function (r) { return '<li' + (r[1] === F1.driver ? ' class="me"' : '') + '><span>P' + r[0] + '</span><span>' + esc(r[1]) + ' · ' + esc(r[2]) + '</span><span>' + r[3] + '</span></li>'; }).join('') + '</ol></div>' +
        '<p class="muted">' + esc(F1.lastWin) + (F1.next ? ' Next: the ' + esc(F1.next.race) + ', ' + esc(f1When(F1.next.at)) + ' your time.' : '') + '</p>' +
        '<div><p class="pop-k" style="margin-bottom:.4rem">Records</p><ul class="pop-list">' + F1.records.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' +
        '<button type="button" class="btn pop-rx" data-rx>Test your start</button>' +
        '<p class="pop-foot">Career figures as of the ' + esc(F1.asOf) + '. <a href="https://www.formula1.com/en/results/2026/drivers" target="_blank" rel="noopener">Live standings ↗</a></p>';
    },
    music: function () {
      setTimeout(musicOpen, 0);
      return '<p class="pop-k">Music · Spotify</p><h3 id="pop-t">On the stereo</h3><div id="pop-music"></div>' +
        '<p class="pop-foot"><a href="https://open.spotify.com/user/21cq757g3mlgyweevd5rnbzka" target="_blank" rel="noopener">My Spotify ↗</a></p>';
    },
    podcasts: function () {
      return '<p class="pop-k">Podcasts</p><h3 id="pop-t">In my ears right now</h3><p><b>Huge Conversations</b> · Cleo Abram. Alexandr Wang on Muse, Meta\'s personal agent.</p>' +
        '<p><a href="#n-005">My notes on it</a> · <a href="https://www.youtube.com/watch?v=1LRvMRC_pfY" target="_blank" rel="noopener">Watch ↗</a></p><p class="muted">The full rotation is on the <a href="#now">Now page</a>.</p>';
    },
    guitar: function () {
      return '<p class="pop-k">Guitar</p><h3 id="pop-t">Guitar</h3><p>I pick it up when nobody\'s waiting on me.</p>';
    },
    football: function () {
      return '<p class="pop-k">Football</p><h3 id="pop-t">Liverpool and Brazil</h3><p>I used to play, and I used to lift. These days I watch.</p>';
    },
    travel: function () {
      var map = function (q) { return 'https://www.google.com/maps/search/' + encodeURIComponent(q); };
      return '<p class="pop-k">Travel</p><h3 id="pop-t">Bangladesh first</h3><ul class="pop-list">' +
        [['Chattogram', 'Chattogram, Bangladesh'], ["Cox's Bazar", "Cox's Bazar, Bangladesh"], ['Bhatiari waterfall', 'Bhatiari waterfall, Chattogram'], ['Himchari National Park', 'Himchari National Park']]
          .map(function (x) { return '<li><a href="' + map(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + ' ↗</a></li>'; }).join('') + '</ul>' +
        '<div><p class="pop-k" style="margin-bottom:.4rem">Coffee in Dhaka</p><p>Nerdy Bean Coffee House, Brewers Den or Arabika Coffee.</p></div>';
    }
  };
  // MUSIC POP-UP: the stereo's turntable or cassette with what I'm playing now, and the last three songs before it.
  // Same answer as the stereo (api/now-playing.js). Asked once when the homepage settles (like F1) and again on hover, so it opens ready;
  // while open it asks every 30 seconds and changes only what changed, so the record keeps turning.
  var MU = { d: null, at: 0, got: 0, poll: 0, tick: 0, rec: '' };
  function musicFetch() {
    return fetch('/api/now-playing').then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.configured && d.title) { MU.d = d; MU.at = MU.got = Date.now(); if (d.art) new Image().src = d.art; } // warm the cover too
      return d;
    });
  }
  (function (li) {
    if (!li) return;
    setTimeout(function () { MU.got = Date.now(); musicFetch().catch(function () {}); }, 3000);
    ['pointerenter', 'focus'].forEach(function (ev) { li.addEventListener(ev, function () { if (Date.now() - MU.got > 30000) { MU.got = Date.now(); musicFetch().catch(function () {}); } }); });
  })(document.querySelector('.offclock [data-pop="music"]'));
  function musicStop() { clearInterval(MU.poll); clearInterval(MU.tick); MU.poll = MU.tick = 0; }
  // Opens at full size straight away: the deck and three rows, filled now if the answer is fresh, else when it lands.
  function musicOpen() {
    var box = document.getElementById('pop-music'); if (!box) return;
    var st = ST.el.cloneNode(true);
    st.removeAttribute('id'); st.hidden = false; st.className = 'stereo pop-st'; st.setAttribute('data-state', 'last');
    st.querySelectorAll('h4, [id]').forEach(function (x) { if (x.tagName === 'H4') x.remove(); else x.removeAttribute('id'); });
    st.querySelectorAll('.st-title').forEach(function (t) { t.textContent = 'Asking Spotify…'; t.removeAttribute('title'); });
    st.querySelectorAll('.st-artist, .st-clock').forEach(function (t) { t.textContent = ''; });
    st.querySelectorAll('.st-art').forEach(function (img) { img.hidden = true; img.removeAttribute('src'); img.onload = function () { img.classList.remove('ld'); }; });
    st.querySelector('.st-open').hidden = true;
    box.innerHTML = '<div class="pop-rec"><p class="pop-k" style="margin-bottom:.4rem">Before that</p><ol class="pop-recent">' + '<li><span>&nbsp;<small>&nbsp;</small></span></li>'.repeat(3) + '</ol></div>';
    box.insertBefore(st, box.firstChild); MU.rec = '';
    if (MU.d && Date.now() - MU.at < 60000) musicShow(MU.d);
    MU.poll = setInterval(musicLoad, 30000); MU.tick = setInterval(musicTick, 1000);
    musicLoad();
  }
  function musicLoad() {
    if (!document.getElementById('pop-music')) return musicStop();
    musicFetch().then(musicShow, function () { musicShow(null); });
  }
  function musicShow(d) {
    var box = document.getElementById('pop-music'); if (!box) return musicStop();
    var st = box.querySelector('.pop-st');
    if (!d || !d.configured || !d.title) {
      if (st && st.getAttribute('data-shown')) return; // keep the last answer on screen
      box.innerHTML = '<p>' + (d && d.configured && !d.error ? 'Nothing played lately.' : 'Couldn\'t reach Spotify. Try again in a minute, or open my Spotify.') + '</p>';
      return;
    }
    if (!st) return;
    var q = function (sel, fn) { st.querySelectorAll(sel).forEach(fn); };
    st.setAttribute('data-shown', '1'); st.setAttribute('data-state', d.playing ? 'live' : 'last');
    q('.st-st', function (t) { t.textContent = d.playing ? 'On air' : d.playedAt ? 'Last played' : 'Paused'; });
    q('.st-title', function (t) { t.textContent = t.title = d.title; });
    q('.st-artist', function (t) { t.textContent = d.artist || (d.kind === 'episode' ? 'Podcast' : ''); });
    q('.st-art', function (img) { // only a new song swaps the cover, and it fades in once loaded
      if (!d.art) { img.hidden = true; return; }
      if (img.getAttribute('src') !== d.art) { img.classList.add('ld'); img.src = d.art; if (img.complete) img.classList.remove('ld'); }
      img.hidden = false;
    });
    q('.st-open', function (a) { a.hidden = !d.url; if (d.url) a.href = d.url; });
    var rec = d.recent || [], key = JSON.stringify(rec.slice(0, 3).map(function (t) { return t.url + t.playedAt; })) + d.playing;
    var wrap = box.querySelector('.pop-rec');
    if (!rec.length) { if (wrap) wrap.remove(); }
    else if (wrap && key !== MU.rec) {
      MU.rec = key;
      wrap.querySelector('.pop-k').textContent = d.playing ? 'Before this' : 'Before that';
      wrap.querySelector('ol').innerHTML = rec.slice(0, 3).map(function (t) { return '<li><span>' + (/^https:\/\//.test(t.url) ? '<a href="' + esc(t.url) + '" target="_blank" rel="noopener">' + esc(t.title) + '</a>' : esc(t.title)) + '<small>' + esc(t.artist) + '</small></span><time>' + stAgo(t.playedAt) + '</time></li>'; }).join('');
    }
    musicTick();
  }
  function musicTick() {
    var d = MU.d, c = document.querySelector('#pop-music [data-shown] .st-clock'); if (!d || !c) return;
    var p = d.playing ? Math.min(d.duration, d.progress + (Date.now() - MU.at)) : d.playedAt ? d.duration : (d.progress || 0), f = d.duration ? p / d.duration : 0;
    c.textContent = !d.playing && d.playedAt ? stAgo(d.playedAt) : stTime(p) + ' / ' + stTime(d.duration);
    var reels = document.querySelectorAll('#pop-music .cas-reel');
    if (reels.length) { reels[0].style.setProperty('--tape', (1 + 6 * (1 - f)).toFixed(1) + 'px'); reels[1].style.setProperty('--tape', (1 + 6 * f).toFixed(1) + 'px'); }
    if (d.playing && p >= d.duration && Date.now() - MU.at > 3000) { MU.at = Date.now(); setTimeout(musicLoad, 1500); } // song ended: ask again
  }
  document.getElementById('pop-body').addEventListener('click', function (e) {
    var b = e.target.closest('#pop-music .st-pick button'); if (!b) return;
    var name = b.getAttribute('data-deck');
    b.closest('.pop-st').setAttribute('data-deck', name);
    b.parentNode.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    stDeck(name); try { localStorage.setItem('st-deck', name); } catch (err) {} // the stereo on other pages follows
  });
  var pop = document.getElementById('pop'), popBody = document.getElementById('pop-body'), popFrom = null;
  function popOpen(k) {
    musicStop(); popFrom = document.activeElement; popBody.innerHTML = POPS[k](); pop.hidden = false;
    document.documentElement.style.overflow = 'hidden'; document.getElementById('pop-x').focus();
  }
  function popClose() { if (pop.hidden) return; musicStop(); pop.hidden = true; document.documentElement.style.overflow = ''; if (popFrom) popFrom.focus(); }
  document.querySelectorAll('.offclock [data-pop]').forEach(function (li) {
    li.addEventListener('click', function (e) { if (!e.target.closest('a')) popOpen(li.getAttribute('data-pop')); });
    li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); popOpen(li.getAttribute('data-pop')); } });
  });
  pop.addEventListener('click', function (e) {
    if (e.target.closest('[data-rx]')) { popClose(); window.reactionTest(); return; }
    if (e.target === pop || e.target.closest('a[href^="#"]')) popClose();
  });
  document.getElementById('pop-x').addEventListener('click', popClose);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') popClose(); });

  // ============ REACTION TEST: the start lights, timed. Five reds, a random hold, lights out, click or Space. ============
  // Computers only: opened from the terminal (reaction), search and the F1 pop-up. The best time stays in this browser (rx-best).
  (function () {
    if (matchMedia('(max-width: 760px)').matches) return;
    var o = null, timers = [], state = '', t0 = 0;
    function best() { try { return +localStorage.getItem('rx-best') || 0; } catch (e) { return 0; } }
    function say(msg, sub, jump) {
      var m = o.querySelector('.rx-msg'); m.className = 'rx-msg' + (jump ? ' jump' : ''); m.innerHTML = msg;
      o.querySelector('.rx-sub').innerHTML = sub || '';
    }
    // The best time sits under the lights the whole time; it turns green and pulses when you beat it.
    function showBest(isNew) {
      var b = best(), el = o.querySelector('.rx-best');
      el.className = 'rx-best' + (isNew ? ' new' : '');
      el.innerHTML = b ? '<small>' + (isNew ? 'New best' : 'Your best') + '</small><b>' + b + ' ms</b>' : '<small>Your best</small><b>—</b>';
    }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function run() {
      clear(); state = 'on';
      var cols = o.querySelectorAll('.f1-rig span');
      cols.forEach(function (c) { c.classList.remove('on'); }); showBest(false);
      say('Wait for the lights to go out.', 'Click or press <kbd>Space</kbd> when they do.');
      // One light a beat, like a real start, then a hold you can't predict.
      cols.forEach(function (c, i) { timers.push(setTimeout(function () { c.classList.add('on'); }, 500 + i * 600)); });
      timers.push(setTimeout(function () {
        cols.forEach(function (c) { c.classList.remove('on'); });
        state = 'go'; t0 = performance.now();
      }, 500 + 4 * 600 + 600 + Math.round(400 + Math.random() * 2000)));
    }
    function hit() {
      if (state === 'on') {
        clear(); state = 'done';
        o.querySelectorAll('.f1-rig span').forEach(function (c) { c.classList.remove('on'); });
        say('<b>Jump start</b>You went before the lights went out.', 'In a race, that\'s a penalty. <kbd>Space</kbd> to go again · <kbd>Esc</kbd> to close', true);
        return;
      }
      if (state === 'go') {
        var ms = Math.round(performance.now() - t0), b = best(), isNew = !b || ms < b;
        state = 'done';
        if (isNew) try { localStorage.setItem('rx-best', ms); } catch (e) {}
        if (ms < 250 && window.unlock) unlock('reaction');
        showBest(isNew);
        say('<b>' + ms + ' ms</b>' + (isNew ? 'F1 drivers usually react in about 200 ms.' : '+' + (ms - b) + ' ms off your best.'),
          '<kbd>Space</kbd> to go again · <kbd>Esc</kbd> to close');
        return;
      }
      if (state === 'done') run();
    }
    function end() {
      if (!o) return; clear(); state = '';
      var x = o; o = null; x.classList.add('out'); setTimeout(function () { x.remove(); }, 260);
      document.removeEventListener('keydown', key, true);
    }
    function key(e) {
      // While the lights are up they own the keyboard, so R, ? and ~ don't fire underneath.
      e.stopImmediatePropagation();
      if (e.key === 'Escape') { e.preventDefault(); end(); }
      else if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); hit(); }
    }
    window.reactionTest = function () {
      if (o) return;
      o = document.createElement('div'); o.className = 'f1-lights rx'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Reaction test');
      o.innerHTML = '<div class="rx-box"><div class="f1-rig" aria-hidden="true">' + '<span><i></i><i></i></span>'.repeat(5) + '</div>' +
        '<p class="rx-best"></p><p class="rx-msg" aria-live="polite"></p><p class="rx-sub"></p></div>';
      document.body.appendChild(o);
      o.addEventListener('pointerdown', function (e) { if (e.button === 0) hit(); });
      document.addEventListener('keydown', key, true);
      if (document.activeElement) document.activeElement.blur();
      run();
    };
  })();

  // ============ Hover previews on links to other pages and notes ============
  (function () {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var peek = document.getElementById('peek'), timer = null, link = null;
    function summary(page) {
      var isNote = page.id.indexOf('n-') === 0, h = page.querySelector('h1');
      var para = Array.prototype.find.call(page.querySelectorAll('p'), function (p) {
        return !p.closest('.note-head, .hero .cta, dl') && !p.classList.contains('label') && !p.classList.contains('pg-quote') && p.textContent.trim().length > 40;
      });
      var k = isNote ? 'Note · N°' + page.id.slice(2) : 'Page · /' + (page.id === 'index' ? '' : page.id);
      var tags = isNote ? (page.getAttribute('data-tags') || '').split(/\s+/).filter(Boolean).map(function (t) { return '#' + t; }).join(' ') : '';
      var txt = para ? para.cloneNode(true) : null;
      if (txt) txt.querySelectorAll('.sn, .sn-ref').forEach(function (x) { x.remove(); });
      return '<span class="pk-k">' + esc(k) + '</span><b>' + esc(h ? h.textContent : page.id) + '</b>' + (txt ? '<p>' + esc(txt.textContent.trim()) + '</p>' : '') + (tags ? '<span class="pk-tags">' + esc(tags) + '</span>' : '');
    }
    // a link to a section inside a page: the page, the heading, and a taste of what's under it
    function secSummary(page, sec) {
      var h1 = page.querySelector('h1'), head = sec.matches('h2, h3') ? sec : sec.querySelector('h2, h3') || sec;
      var k = 'Section · /' + page.id + ' › ' + (h1 ? h1.textContent.trim() : page.id);
      var n = head.nextElementSibling, body = '';
      while (n && !body && !n.matches('h2')) {
        if (n.matches('ul, ol')) {
          var li = Array.prototype.slice.call(n.children), names = li.slice(0, 3).map(function (x) { var t = x.querySelector('.t, b'); return t ? t.childNodes[0].textContent.trim() : x.textContent.trim().slice(0, 40); });
          body = names.join(' · ') + (li.length > 3 ? ' and ' + (li.length - 3) + ' more' : '');
        } else if (n.matches('p') && n.textContent.trim().length > 20) body = n.textContent.trim();
        else if (n.matches('details')) body = (n.querySelector('summary') || n).textContent.trim();
        n = n.nextElementSibling;
      }
      return '<span class="pk-k">' + esc(k) + '</span><b>' + esc(head.textContent.trim()) + '</b>' + (body ? '<p>' + esc(body) + '</p>' : '');
    }
    function place(a) {
      var r = a.getBoundingClientRect(), w = peek.offsetWidth, h = peek.offsetHeight;
      var x = Math.min(Math.max(12, r.left), innerWidth - w - 12), y = r.bottom + 8;
      if (y + h > innerHeight - 12) y = r.top - h - 8;
      peek.style.left = x + 'px'; peek.style.top = Math.max(12, y) + 'px';
    }
    function hide() { clearTimeout(timer); link = null; peek.classList.remove('on'); }
    document.addEventListener('mouseover', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a === link) return;
      hide();
      if (!a || a.closest('.rail, .m-tabs, .m-sheet, .obs-tabs, .ap-panel, .term, .meta .toc')) return;
      var id = a.getAttribute('href').slice(1), page = document.getElementById(id);
      if (!page) return;
      var sec = null;
      if (!page.classList.contains('page')) { sec = page; page = sec.closest('.page'); if (!page) return; }
      if (page.classList.contains('on')) return;
      link = a;
      timer = setTimeout(function () { peek.innerHTML = sec ? secSummary(page, sec) : summary(page); place(a); peek.classList.add('on'); }, 280);
    });
    document.addEventListener('scroll', hide, { passive: true });
    document.addEventListener('click', hide);
  })();

  // ============ Terminal: press ~ (or the footer link) ============
  (function () {
    var term = document.getElementById('term'), out = document.getElementById('term-out'), form = document.getElementById('term-form'), input = document.getElementById('term-i'), ps = document.getElementById('term-ps');
    var hist = [], hi = 0, booted = false, lastFortune = null;
    var pagesList = Array.prototype.filter.call(document.querySelectorAll('.page[id]'), function (p) { return p.id.indexOf('n-') !== 0 && p.id !== 'backstage'; }).map(function (p) { return p.id; });
    var notesList = Array.prototype.map.call(document.querySelectorAll('article.page[id^="n-"]'), function (n) { return n; });
    function here() { var id = (location.hash || '#index').slice(1); return id === 'index' ? '~' : id.indexOf('n-') === 0 ? '~/notes/' + id.slice(2) : '~/' + id; }
    function print(html, cls) { var d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; }
    function line(t, cls) { print(esc(t), cls); }
    function noteById(arg) {
      if (!arg) return null; arg = String(arg).replace(/^n-?/i, '').replace(/^0+/, '');
      return notesList.filter(function (n) { return n.id.slice(2).replace(/^0+/, '') === arg; })[0] || null;
    }
    function noteText(n) {
      var parts = [];
      n.querySelectorAll('h1, h2, p, li, dt, dd').forEach(function (el) {
        if (el.closest('.note-head') || el.querySelector('a.back') || el.classList.contains('back')) return;
        if (el.tagName === 'LI' && el.closest('dl')) return;
        var c = el.cloneNode(true); c.querySelectorAll('.sn, .sn-ref').forEach(function (x) { x.remove(); });
        var t = c.textContent.replace(/\s+/g, ' ').trim(); if (!t) return;
        if (el.tagName === 'H1') parts.push('<span class="b">' + esc(t) + '</span>');
        else if (el.tagName === 'H2') parts.push('\n<span class="m">## ' + esc(t) + '</span>');
        else if (el.tagName === 'LI') parts.push('  • ' + esc(t));
        else if (el.tagName === 'DT') parts.push('<span class="y">' + esc(t) + '</span>');
        else if (el.tagName === 'DD') parts.push('  ' + esc(t));
        else parts.push(esc(t));
      });
      return parts.join('\n');
    }
    var CMDS = {
      help: function () {
        print('<span class="b">Commands</span>\n' + [
          ['ls', 'list pages and notes'], ['cd <page>', 'open a page (cd work, cd ..)'], ['cat <note>', 'read a note here (cat 5)'],
          ['whoami', 'who runs this notebook'], ['now', 'what I\'m on this month'], ['f1', 'Max and Red Bull, right now'],
          ['theme [name]', 'list or switch themes'], ['book', 'book a call'], ['email [work]', 'show both emails, copy one'], ['cv', 'download my CV'],
          ['socials', 'where else to find me'], ['coffee', 'cups so far this year'], ['fortune', 'a line from my notes'],
          ['git log', 'what changed on the site'], ['top', 'what I\'m running on'], ['ping', 'check the site is up'], ['achievements', 'what you\'ve found'], ['reaction', 'the start lights, timed'],
          ['date', 'the time in Dhaka'], ['pwd', 'where you are'], ['echo <text>', 'say it back'], ['history', 'what you typed'],
          ['clear', 'clear the screen'], ['exit', 'close (or press Esc)']
        ].map(function (r) { return '  <span class="g">' + esc(r[0].padEnd(16, ' ')) + '</span>' + r[1]; }).join('\n') + '\n<span class="c">Tab completes. ↑ ↓ for history.</span>');
      },
      ls: function (a) {
        if (a === '-a' || a === '-la' || a === '-al') { print('<span class="c">.</span>   <span class="c">..</span>   <span class="m">.backstage</span>   <span class="g">' + esc(pagesList.join('   ')) + '</span>'); a = 'notes'; }
        else if (!a || a === 'pages' || a === '~') line(pagesList.join('   '), 'g');
        if (!a || a === 'notes') print(notesList.map(function (n) { return '<span class="y">' + n.id.slice(2) + '</span>  ' + esc(n.querySelector('h1').textContent); }).join('\n'));
      },
      cd: function (a) {
        if (!a || a === '~' || a === '/' || a === '..') { location.hash = 'index'; return; }
        a = a.replace(/^~?\//, '').replace(/\/$/, '');
        if (a === '.backstage' || a === 'backstage') { location.hash = 'backstage'; return; }
        var n = /^notes\/(\d+)$/.test(a) ? noteById(a.split('/')[1]) : null;
        if (n) { location.hash = n.id; return; }
        if (pagesList.indexOf(a) >= 0) { location.hash = a; return; }
        line('cd: no such page: ' + a + '. Try ls.', 'r');
      },
      cat: function (a) {
        var n = noteById(a);
        if (!n) { line(a ? 'cat: no note ' + a + '. Try ls notes.' : 'usage: cat <note number>', 'r'); return; }
        print(noteText(n)); print('<span class="c">open it: cd notes/' + n.id.slice(2) + '</span>');
      },
      whoami: function () {
        print('<span class="b">Mehedi Hasan Ifti</span> · Manager, Global Sales &amp; Partnerships at Musemind\nDhaka, Bangladesh. 35+ markets, from first-time founders to enterprise teams.\nI turn first conversations into partnerships that last.');
      },
      now: function () {
        var rows = document.querySelectorAll('#now .log');
        var get = function (i) { var t = rows[i] && rows[i].querySelector('.t'); return t ? t.childNodes[0].textContent.trim() : '—'; };
        print('<span class="y">exploring</span>  ' + esc(get(0)) + '\n<span class="y">watching</span>   ' + esc(get(1)) + '\n<span class="y">reading</span>    ' + esc(get(2)) + '\n<span class="y">listening</span>  ' + esc(get(3)));
      },
      f1: function () {
        print('<span class="b">' + esc(F1.driver) + '</span> #' + F1.number + ' · ' + esc(F1.team) + '\n' +
          F1.titles + '× world champion (' + F1.titleYears + ')\n' + F1.wins + ' wins · ' + F1.poles + ' poles · ' + F1.podiums + ' podiums · ' + F1.starts + ' starts\n' +
          '2026: <span class="y">' + F1.pos + '</span> on ' + F1.pts + ' pts. ' + esc(F1.lastWin) + '\n' +
          (F1.next ? 'Next: <span class="g">' + esc(F1.next.race) + '</span>, ' + esc(f1When(F1.next.at)) + ' your time\n' : '') + '<span class="c">as of the ' + esc(F1.asOf) + '</span>');
      },
      theme: function (a) {
        if (!a) { print(THEMES.map(function (t) { return (t.id === cur ? '<span class="g">* ' : '  ') + t.id + (t.id === cur ? '</span>' : '') + '  <span class="c">' + esc((t.id === THEME_DEFAULT ? 'Today' : t.week) + ' · ' + t.note) + '</span>'; }).join('\n') + '\n<span class="c">theme &lt;name&gt; to switch</span>'); return; }
        var t = THEMES.filter(function (x) { return x.id === a || x.name.toLowerCase() === a.toLowerCase(); })[0];
        if (!t) { line('theme: no theme ' + a + '. Try theme.', 'r'); return; }
        var was = cur; pickTheme(t.id); line('Switched to ' + t.name + '.', 'g'); if (t.id === 'lightsout' && was !== t.id) { close(); setTimeout(lightsOut, 250); }
      },
      book: function () { window.open(bookHref, '_blank', 'noopener'); line('Opening my calendar in a new tab.', 'g'); },
      email: function (a) {
        // Both addresses; email copies the personal one, email work copies the office one.
        var mine = 'mh.hasan884@gmail.com', work = 'mehedi.ifti@musemind.agency', e = /^work/i.test(a || '') ? work : mine;
        print('<span class="y">personal</span>  <a href="mailto:' + mine + '">' + mine + '</a>\n<span class="y">work</span>      <a href="mailto:' + work + '">' + work + '</a>');
        if (navigator.clipboard) navigator.clipboard.writeText(e).then(function () { line('Copied ' + e + '.' + (e === mine ? ' Type email work for the office one.' : ''), 'g'); }, function () {});
      },
      cv: function () { window.open('cv.pdf', '_blank', 'noopener'); line('Opening cv.pdf.', 'g'); },
      socials: function () {
        print(Array.prototype.map.call(document.querySelectorAll('.rail-socials .soc, .socials .soc'), function (a) { return a; })
          .filter(function (a, i, all) { return all.findIndex(function (b) { return b.href === a.href; }) === i; })
          .map(function (a) { return '<a href="' + a.href + '" target="_blank" rel="noopener">' + esc(a.textContent.trim() || a.getAttribute('aria-label') || a.href) + '</a>'; }).join('  '));
      },
      pwd: function () { line(here().replace('~', '/home/ifti')); },
      date: function () { line(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'full', timeStyle: 'short' }) + ' in Dhaka'); },
      echo: function (a, raw) { line(raw); },
      clear: function () { out.innerHTML = ''; },
      exit: function () { close(); },
      sudo: function (a, raw) {
        if (/^hire( ifti)?$/i.test(raw)) { line('Permission granted. Opening my calendar.', 'g'); window.open(bookHref, '_blank', 'noopener'); }
        else line('Nice try. This incident will be reported.', 'r');
      },
      coffee: function () {
        var c = window.coffeeNow && window.coffeeNow(); if (!c) { line('coffee: the pot is empty.', 'r'); return; }
        print('<span class="c">     ( (\n      ) )</span>\n<span class="y">   ........\n   |      |]\n   \\      /\n    `----\'</span>\n' +
          '<span class="b">' + c.cups.toLocaleString('en-US') + '</span> cups in ' + c.y + ' · ' + (c.sofar + (c.isWork ? 1 : 0)) + ' of ' + c.total + ' workdays · today: ' +
          (c.isWork ? (c.today ? c.today + (c.today === 1 ? ' cup' : ' cups') : 'first cup soon') : 'day off') + '\n<span class="c">black Americanos, counted the same way as the pill</span>');
      },
      fortune: function () {
        // A highlighted line from a note, never the same one twice in a row.
        var marks = Array.prototype.slice.call(document.querySelectorAll('article.page[id^="n-"] mark'));
        if (!marks.length) { line('fortune: nothing highlighted yet.', 'r'); return; }
        var pick, tries = 0;
        do { pick = marks[Math.floor(Math.random() * marks.length)]; } while (marks.length > 1 && pick === lastFortune && ++tries < 20);
        lastFortune = pick;
        var note = pick.closest('article.page');
        print('<span class="b">' + esc(pick.textContent.replace(/\s+/g, ' ').trim()) + '</span>\n<span class="c">— ' + 'N°' + note.id.slice(2) + ' </span><a href="#' + note.id + '">' + esc(note.querySelector('h1').textContent) + '</a>');
      },
      git: function (a) {
        if (/^status/.test(a)) { line('On branch main. Nothing to commit, working tree clean.', 'g'); return; }
        if (!/^log/.test(a)) { line('usage: git log [--all]   (or git status)', 'c'); return; }
        // The changelog, newest first, in git's one-line format. The ids are short hashes of each entry's title.
        var rows = [];
        document.querySelectorAll('#changelog .cl-list').forEach(function (ul) {
          var d = ul.previousElementSibling; while (d && !d.classList.contains('cl-d')) d = d.previousElementSibling;
          ul.querySelectorAll(':scope > li').forEach(function (li) {
            var t = li.querySelector('.t').textContent.trim(), tag = li.querySelector('.tag'), h = 5381;
            for (var i = 0; i < t.length; i++) h = (h * 33 + t.charCodeAt(i)) >>> 0;
            rows.push('<span class="y">' + ('000000' + h.toString(16)).slice(-7) + '</span> <span class="c">' + esc(d ? d.textContent.trim() : '') + '</span> <span class="m">' + esc(tag ? tag.textContent.trim().toLowerCase() : 'change') + ':</span> ' + esc(t));
          });
        });
        var all = /--all/.test(a), shown = all ? rows : rows.slice(0, 12);
        print(shown.join('\n') + (rows.length > shown.length ? '\n<span class="c">' + (rows.length - shown.length) + ' older. git log --all for everything.</span>' : ''));
      },
      top: function () {
        // The stats radar as a process list: interest is the CPU, strength is the memory.
        var rows = STATS.slice().sort(function (x, y) { return y[3] - x[3]; });
        print('<span class="b">top</span> - ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour12: false }) + ' Dhaka · ' + rows.length + ' processes · <span class="c">%CPU is interest, %MEM is strength, out of 100</span>\n' +
          '<span class="c">  PID  %CPU  %MEM  COMMAND</span>\n' + rows.map(function (r, i) {
            return '  ' + String(i + 1).padStart(3, ' ') + '  <span class="g">' + String(r[3]).padStart(4, ' ') + '</span>  ' + String(r[2]).padStart(4, ' ') + '  ' + esc(r[1]);
          }).join('\n'));
      },
      ping: function () {
        // Three real round trips to this site's own server function.
        var host = location.host || 'ifti-gold.vercel.app', times = [], n = 0;
        line('PING ' + host, 'c');
        (function one() {
          var t0 = performance.now();
          fetch('/api/ping?t=' + Date.now(), { cache: 'no-store' }).then(function (r) {
            if (!r.ok) throw 0;
            var ms = Math.round(performance.now() - t0); times.push(ms);
            print('64 bytes from ' + esc(host) + ': seq=' + n + ' time=<span class="g">' + ms + ' ms</span>');
          }).catch(function () { line('Request timeout for seq ' + n, 'r'); }).then(function () {
            if (++n < 3) return setTimeout(one, 400);
            line('--- ' + host + ' ping statistics ---', 'c');
            line(times.length + ' of 3 answered' + (times.length ? ', min ' + Math.min.apply(null, times) + ' ms, max ' + Math.max.apply(null, times) + ' ms' : ''), times.length ? 'g' : 'r');
          });
        })();
      },
      achievements: function () {
        var l = window.achList ? window.achList() : [];
        print('<span class="b">Achievements</span> <span class="c">' + l.filter(function (x) { return x.got; }).length + ' of ' + l.length + '</span>\n' + l.map(function (x) {
          return (x.got ? '  <span class="g">✓ ' + esc(x.name) + '</span>' : '  <span class="c">· ' + esc(x.name) + ' — ' + esc(x.hint) + '</span>');
        }).join('\n'));
      },
      reaction: function () {
        if (!window.reactionTest) { line('reaction: needs a computer.', 'r'); return; }
        line('Lights on in a moment. Click or press Space when they go out.', 'g'); setTimeout(function () { close(); setTimeout(window.reactionTest, 250); }, 500);
      },
      history: function () { print(hist.map(function (h, i) { return '<span class="c">' + String(i + 1).padStart(3, ' ') + '</span>  ' + esc(h); }).join('\n')); }
    };
    CMDS.open = CMDS.cd; CMDS.man = CMDS.help; CMDS['?'] = CMDS.help; CMDS.contact = CMDS.email; CMDS.hire = CMDS.book; CMDS.start = CMDS.reaction; CMDS.rm = function () { line('Nothing here gets deleted.', 'r'); };
    function run(raw) {
      raw = raw.trim(); print('<span class="g">' + esc(here()) + ' $</span> ' + esc(raw));
      if (!raw) return;
      hist.push(raw); hi = hist.length;
      var parts = raw.split(/\s+/), cmd = parts.shift().toLowerCase(), arg = parts.join(' ');
      if (Object.prototype.hasOwnProperty.call(CMDS, cmd)) CMDS[cmd](arg, arg); else line(cmd + ': command not found. Type help.', 'r');
      ps.textContent = here() + ' $';
    }
    function open() {
      term.hidden = false; requestAnimationFrame(function () { term.classList.add('on'); });
      if (window.unlock) unlock('terminal');
      if (!booted) { booted = true; print('<span class="m">ifti@notebook</span> — last login ' + new Date().toDateString() + ' from Dhaka\nType <span class="g">help</span> to see what I can do. <span class="c">Esc to close.</span>'); }
      ps.textContent = here() + ' $'; setTimeout(function () { input.focus(); }, 30);
    }
    function close() { term.classList.remove('on'); setTimeout(function () { term.hidden = true; }, 220); input.blur(); }
    form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); input.value = ''; });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = hist[--hi]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
      else if (e.key === 'Tab') {
        e.preventDefault();
        var v = input.value, sp = v.lastIndexOf(' '), head = v.slice(0, sp + 1), word = v.slice(sp + 1);
        var pool = sp < 0 ? Object.keys(CMDS) : /^(cd|open)\s/.test(v) ? pagesList : /^theme\s/.test(v) ? THEMES.map(function (t) { return t.id; }) : [];
        var hits = pool.filter(function (c) { return c.indexOf(word) === 0; });
        if (hits.length === 1) input.value = head + hits[0] + (sp < 0 ? ' ' : '');
        else if (hits.length > 1) line(hits.join('   '), 'c');
      }
    });
    document.getElementById('term-x').addEventListener('click', close);
    document.querySelectorAll('.term-open').forEach(function (b) { b.addEventListener('click', function () { term.hidden ? open() : close(); }); });
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA') return;
      if (e.key === '~' || e.key === '`') { e.preventDefault(); term.hidden ? open() : close(); }
    });
    window.addEventListener('hashchange', function () { if (!term.hidden) { ps.textContent = here() + ' $'; setTimeout(function () { input.focus({ preventScroll: true }); }, 0); } });
  })();

  // Home hero: the world as a dot grid (Natural Earth, 1.8 degree cells, run-length encoded), offices linked to Dhaka.
  // Built right after the first paint so the page shows up before the map does.
  requestAnimationFrame(function () { setTimeout(function () {
    var fig = document.getElementById('hero'); if (!fig) return;
    var RLE = '32.6x.x2.x2.x3.x17.22x44.4x15.x.9x13.3x21.|31.4x33.21x42.2x15.13x.x37.|30.12x.3x.x2.2x.2x.2x11.17x.x41.2x7.2x5.27x5.4x19.|11.4u20.x.6x4.2x2.9x.x8.16x26.5x20.3x.48x11.|8x14u94x5.8x.2x.x3.x2.2x58.|4.6x12u94x7.3x14.x59.|2x2.4x14u95x2.3x78.|5.u4.12u28x2.x3.x3.2x.x8.5x27.7x.87x.|8.14u26x9.3x13.3x27.7x2.75x2.x.5x4.|10.5u.u5.u24x8.x.4x42.8x5.70x4.x9.|12.2u10.2u22x9.8x32.g8.3x5.64x10.2x10.|11.u13.3u23x6.9x31.g7.x.2x3.65x10.4x9.|28.26x2.12x27.xg.2g5.d.d.x.65x11.2x11.|28.27x.13x26.2x.3g2.x4d70x.x7.x12.|30.37x.x28.3g.2x5d70x.x20.|30.x.30x.x4.2x29.5x3d71x22.|31.21u9xu2x6.x28.78x23.|31.23u7x2u3x33.8x.9x.8x3.47x6.x17.|31.23u2x5u2.x31.x3.5x2.2x.7x6.4x2.47x4.2x19.|31.30u34.7x5.2x2.5x2.2x3.4x3.42x28.|31.28u36.5x11.2x2.12x2.38x.3x7.x21.|32.26u37.5x8.x2.x.x.12x3.36x3.2x6.x22.|32.26u42.6x10.x.x.47x3.2x4.2x22.|33.24u39.10x14.46x4.x2.x.x24.|35.21u34.x4.13x4.x6.48x33.|35.x.4x14u40.15x.10x2s45x32.|36.x.4xux3u2.2u3.u37.x.25x6s2x.39x33.|36.2x.6xu8.u38.26x.7s2.38x33.|39.7x46.27x2.7sx.a.17xb16x34.|41.5x45.29x.8s2ax6.11x2b14x2.x32.|41.5x9.2x34.29x2.9s2x5.11xb.12x37.|13.u27.5x4.x6.2x32.30x.9sx8.8x4.7x41.|42.5x.3x8.2x30.30x2.4s4x10.6x5.7x8.x32.|45.6x35.x4.31x2.5x12.5x6.8x7.x32.|49.5x36.33x.4x13.3x10.7x6.x32.|51.3x37.34x17.3x10.6x39.|52.x6.x.x29.33x3.x14.2x13.3x40.|53.x4.2x.5x27.35x14.2x14.x41.|55.x.10x26.35x16.x10.x12.2x30.|57.13x24.7x2.24x29.x7.2x34.|57.15x33.21x27.2x.x6.2x35.|56.16x33.20x29.2x.x4.4x34.|56.16x33.19x31.3x3.4x3.x31.|55.20x30.18x33.2x3.4x.3x4.2x25.|56.22x28.16x34.3x3.3x.2x2.3x.5x21.|55.25x27.15x36.x7.x9.5x19.|56.25x26.15x36.2x.x12.x2.5x4.x13.|56.25x26.15x41.2x2.x2.x7.2x.x18.|57.23x28.14x61.x16.|57.22x29.15x51.2x3.x20.|4.x53.20x29.16x4.x42.x.4x3.x20.|59.19x29.15x3.3x41.7x3.2x19.|60.18x29.14x3.3x41.13x12.x6.|61.17x29.13x5.2x40.15x18.|61.16x31.12x4.3x37.19x17.|61.14x33.12x4.3x36.21x16.|61.13x34.11x5.2x37.22x15.|61.12x35.10x45.22x15.|60.13x36.9x46.21x15.|60.12x38.7x47.21x15.|60.11x39.6x48.7x2.12x15.|60.7x.2x40.4x50.5x6.9x16.|60.8x109.7x12.x3.|59.9x110.5x14.x2.|59.6x132.x2.|59.6x115.x16.x2.|60.5x116.x13.x4.|59.5x129.2x5.|58.4x131.x6.|59.4x137.|58.4x138.|59.3x5.x132.|59.3x138.|61.x138.';
    var STEP = 1.8, LAT0 = 76, G = 4;
    var grid = RLE.split('|').map(function (r) { var out = ''; r.replace(/(\d*)(\D)/g, function (_, n, c) { out += c.repeat(n ? +n : 1); }); return out; });
    var ROWS = grid.length, COLS = grid[0].length, W = COLS * G, H = ROWS * G;
    // [code, city, country, lat, lon, IANA zone]
    var SITES = [
      ['b', 'Dhaka', 'Bangladesh', 23.81, 90.41, 'Asia/Dhaka'],
      ['a', 'Dubai', 'UAE', 25.20, 55.27, 'Asia/Dubai'],
      ['s', 'Riyadh', 'Saudi Arabia', 24.71, 46.68, 'Asia/Riyadh'],
      ['g', 'London', 'United Kingdom', 51.51, -0.13, 'Europe/London'],
      ['d', 'Berlin', 'Germany', 52.52, 13.40, 'Europe/Berlin'],
      ['u', 'New York', 'United States', 40.71, -74.00, 'America/New_York']
    ];
    var home = SITES[0];
    function xy(lat, lon) { return [((lon + 180) / STEP) * G, ((LAT0 - lat) / STEP + 0.5) * G]; }
    function dot(x, y) { return 'M' + x + ' ' + y + 'h0'; } // a zero-length stroke with round caps draws a dot
    function km(a, b) { var R = 6371, p = Math.PI / 180, dl = (b[4] - a[4]) * p, dp = (b[3] - a[3]) * p; var h = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(a[3] * p) * Math.cos(b[3] * p) * Math.sin(dl / 2) * Math.sin(dl / 2); return Math.round(2 * R * Math.asin(Math.sqrt(h)) / 10) * 10; }

    // flat map
    var svg = document.getElementById('hm-svg'), paths = { x: '' }, land = [];
    SITES.forEach(function (st) { paths[st[0]] = ''; });
    grid.forEach(function (row, r) { for (var c = 0; c < COLS; c++) { var ch = row[c]; if (ch === '.') continue; paths[ch] += dot(c * G + G / 2, r * G + G / 2); land.push([LAT0 - r * STEP, -180 + STEP / 2 + c * STEP, ch]); } });
    var h = '<path class="hm-land" d="' + paths.x + '"/>';
    SITES.forEach(function (st) { h += '<path class="hm-c' + (st === home ? ' home' : '') + '" data-k="' + st[0] + '" d="' + paths[st[0]] + '"/>'; });
    var hp = xy(home[3], home[4]);
    SITES.slice(1).forEach(function (st) {
      var p = xy(st[3], st[4]), mx = (hp[0] + p[0]) / 2, my = (hp[1] + p[1]) / 2, d = Math.hypot(p[0] - hp[0], p[1] - hp[1]);
      h += '<path class="hm-arc" data-k="' + st[0] + '" d="M' + hp[0].toFixed(1) + ' ' + hp[1].toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + (my - d * 0.32).toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + '"/>';
    });
    SITES.forEach(function (st) {
      var p = xy(st[3], st[4]), left = st[4] < -30;
      h += '<g class="hm-pin' + (st === home ? ' home' : '') + '" data-k="' + st[0] + '"><circle class="ring" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3"/><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.2"/>' +
        '<text x="' + (p[0] + (left ? -7 : 7)).toFixed(1) + '" y="' + (p[1] - 6).toFixed(1) + '" text-anchor="' + (left ? 'end' : 'start') + '">' + st[1] + '</text><circle class="hm-hit" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="12"/></g>';
    });
    svg.setAttribute('viewBox', '0 ' + (2 * G) + ' ' + W + ' ' + (H - 2 * G));
    svg.innerHTML = h;

    // legend + clocks
    var leg = document.getElementById('hm-legend');
    leg.innerHTML = SITES.map(function (st) {
      var dist = st === home ? 'home base' : km(home, st).toLocaleString('en') + ' km from Dhaka';
      return '<li class="' + (st === home ? 'home' : '') + '"><button type="button" data-k="' + st[0] + '"><span class="hm-sm">' + st[1] + ' <time data-z="' + st[5] + '"></time></span><span class="hm-meta">' + st[1] + ' · ' + st[2] + '</span><span class="hm-big" data-z="' + st[5] + '"></span><span class="hm-meta" data-off="' + st[5] + '"></span><span class="hm-meta">' + dist + '</span></button></li>';
    }).join('');
    var fmts = {};
    function fmtFor(z, k, o) { return fmts[k + z] || (fmts[k + z] = new Intl.DateTimeFormat(k === 'h' ? 'en-GB' : 'en-US', Object.assign({ timeZone: z }, o))); }
    function hm(z) { return fmtFor(z, 'h', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); }
    function hours(z) {
      var d = new Date(), f = function (zz) { var p = fmtFor(zz, 'o', { hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(d), o = {}; p.forEach(function (x) { o[x.type] = x.value; }); return Date.UTC(o.year, o.month - 1, o.day, o.hour % 24, o.minute); };
      return Math.round((f(z) - f('Asia/Dhaka')) / 36e5 * 2) / 2;
    }
    function offset(z) {
      var diff = hours(z);
      return diff === 0 ? 'same time as Dhaka' : (diff > 0 ? '+' : '−') + Math.abs(diff) + 'h vs Dhaka';
    }
    function tick() {
      leg.querySelectorAll('[data-z]').forEach(function (e) { e.textContent = hm(e.getAttribute('data-z')); });
      leg.querySelectorAll('[data-off]').forEach(function (e) { e.textContent = offset(e.getAttribute('data-off')); });
      // the caption's spread follows daylight saving: 10h most of the year, 11h in the northern winter
      var hs = SITES.map(function (st) { return hours(st[5]); });
      document.getElementById('hm-span').textContent = (Math.max.apply(null, hs) - Math.min.apply(null, hs)) + 'h';
    }
    setTimeout(tick, 0); setInterval(tick, 20000);

    // highlight: map, legend and globe share one active office
    var tip = document.getElementById('hm-tip'), active = null, auto = null, userTouched = false;
    function setActive(k, showTip) {
      active = k;
      fig.querySelectorAll('[data-k]').forEach(function (e) { if (e.closest('.hm-legend') || e.matches('.hm-c, .hm-arc, .hm-pin')) e.classList.toggle('on', e.getAttribute('data-k') === k); });
      var st = SITES.filter(function (x) { return x[0] === k; })[0];
      if (!st || !showTip || fig.getAttribute('data-mode') === 'globe') { tip.hidden = true; return; }
      var p = xy(st[3], st[4]), vb = svg.viewBox.baseVal, rect = svg.getBoundingClientRect(), stage = svg.parentNode.getBoundingClientRect();
      tip.style.left = (rect.left - stage.left + (p[0] - vb.x) / vb.width * rect.width) + 'px';
      tip.style.top = (rect.top - stage.top + (p[1] - vb.y) / vb.height * rect.height) + 'px';
      tip.innerHTML = '<b>' + st[1] + '</b> · ' + st[2] + ' · ' + hm(st[5]) + (st === home ? ' · home base' : ' · ' + km(home, st).toLocaleString('en') + ' km');
      tip.hidden = false;
    }
    function stopAuto() { userTouched = true; clearInterval(auto); }
    fig.addEventListener('mouseover', function (e) { var t = e.target.closest('[data-k]'); if (t && !t.matches('.hm-land')) { stopAuto(); setActive(t.getAttribute('data-k'), true); } });
    fig.addEventListener('focusin', function (e) { var t = e.target.closest('[data-k]'); if (t) { stopAuto(); setActive(t.getAttribute('data-k'), true); } });
    fig.addEventListener('click', function (e) { var t = e.target.closest('[data-k]'); if (t) { stopAuto(); setActive(t.getAttribute('data-k'), true); spinTo(t.getAttribute('data-k')); } });
    svg.addEventListener('mouseleave', function () { tip.hidden = true; });
    var order = SITES.slice(1).map(function (x) { return x[0]; }), oi = 0;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) auto = setInterval(function () {
      if (!document.getElementById('index').classList.contains('on')) return;
      setActive(order[oi++ % order.length], fig.getAttribute('data-mode') === 'map'); spinTo(active);
    }, 2600);

    // globe: the same dots on an orthographic projection, drag to turn
    var cv = document.getElementById('hm-globe'), ctx = cv.getContext('2d'), lam = -70, phi = 20, target = null, drag = null, raf = null;
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches, rad = Math.PI / 180, cols = {};
    function readCols() { var cs = getComputedStyle(document.documentElement); ['--surface1', '--green', '--peach', '--surface0', '--text'].forEach(function (v) { cols[v] = cs.getPropertyValue(v).trim(); }); }
    function proj(lat, lon, R, cx, cy) {
      var f = lat * rad, l = (lon + lam) * rad, f0 = phi * rad;
      var c = Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l);
      return [cx + R * Math.cos(f) * Math.sin(l), cy - R * (Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l)), c];
    }
    function slerp(a, b, t) {
      var p1 = [Math.cos(a[3] * rad) * Math.cos(a[4] * rad), Math.cos(a[3] * rad) * Math.sin(a[4] * rad), Math.sin(a[3] * rad)];
      var p2 = [Math.cos(b[3] * rad) * Math.cos(b[4] * rad), Math.cos(b[3] * rad) * Math.sin(b[4] * rad), Math.sin(b[3] * rad)];
      var w = Math.acos(p1[0] * p2[0] + p1[1] * p2[1] + p1[2] * p2[2]), s1 = Math.sin((1 - t) * w) / Math.sin(w), s2 = Math.sin(t * w) / Math.sin(w);
      var v = [s1 * p1[0] + s2 * p2[0], s1 * p1[1] + s2 * p2[1], s1 * p1[2] + s2 * p2[2]];
      return [Math.asin(v[2]) / rad, Math.atan2(v[1], v[0]) / rad];
    }
    function drawGlobe() {
      raf = null;
      if (fig.getAttribute('data-mode') !== 'globe' || !document.getElementById('index').classList.contains('on')) return;
      var dpr = devicePixelRatio || 1, w = cv.clientWidth, hh = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, hh);
      if (!cols['--green']) readCols();
      var R = hh * 0.46, cx = w / 2, cy = hh / 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.strokeStyle = cols['--surface0']; ctx.lineWidth = 1; ctx.stroke();
      for (var i = 0; i < land.length; i++) {
        var d = land[i], p = proj(d[0], d[1], R, cx, cy); if (p[2] <= 0) continue;
        ctx.globalAlpha = 0.25 + 0.75 * p[2];
        ctx.fillStyle = d[2] === 'x' ? cols['--surface1'] : d[2] === 'b' ? cols['--green'] : cols['--peach'];
        ctx.fillRect(p[0] - 1, p[1] - 1, d[2] === 'x' ? 1.8 : 2.4, d[2] === 'x' ? 1.8 : 2.4);
      }
      ctx.globalAlpha = 1;
      SITES.slice(1).forEach(function (st) {
        ctx.beginPath(); var started = false;
        for (var t = 0; t <= 1.0001; t += 0.025) {
          var g = slerp(home, st, t), lift = 1 + 0.18 * Math.sin(Math.PI * t), p = proj(g[0], g[1], R * lift, cx, cy);
          if (p[2] > -0.15) { started ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); started = true; } else started = false;
        }
        ctx.strokeStyle = cols['--peach']; ctx.globalAlpha = st[0] === active ? 1 : 0.45; ctx.lineWidth = st[0] === active ? 1.8 : 1.1; ctx.stroke(); ctx.globalAlpha = 1;
      });
      SITES.forEach(function (st) {
        var p = proj(st[3], st[4], R, cx, cy); if (p[2] <= 0) return;
        ctx.beginPath(); ctx.arc(p[0], p[1], st[0] === active || st === home ? 4 : 3, 0, 7); ctx.fillStyle = st === home ? cols['--green'] : cols['--peach']; ctx.fill();
        if (st[0] === active || st === home) { ctx.font = '10px "IBM Plex Mono", monospace'; ctx.fillStyle = cols['--text']; ctx.fillText(st[1], p[0] + 7, p[1] - 6); }
      });
      if (target !== null) { var dl = ((target - lam + 540) % 360) - 180; lam += dl * 0.08; if (Math.abs(dl) < 0.3) target = null; }
      else if (!drag && !still) lam += 0.12;
      raf = requestAnimationFrame(drawGlobe);
    }
    function spinTo(k) { var st = SITES.filter(function (x) { return x[0] === k; })[0]; if (st) target = -st[4] + 10; }
    function kick() { if (!raf) raf = requestAnimationFrame(drawGlobe); }
    cv.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY, lam, phi]; target = null; stopAuto(); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; lam = drag[2] + (e.clientX - drag[0]) * 0.35; phi = Math.max(-60, Math.min(60, drag[3] + (e.clientY - drag[1]) * 0.25)); });
    cv.addEventListener('pointerup', function () { drag = null; });
    new MutationObserver(function () { cols = {}; kick(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-palette'] });
    window.addEventListener('hashchange', kick);

    // three views of the same data: flat map, globe, clocks
    var opt = document.getElementById('hm-opt');
    function mode(v, save) {
      fig.setAttribute('data-mode', v); tip.hidden = true;
      opt.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-v') === v)); });
      if (save) { try { localStorage.setItem('hero-mode', v); } catch (e) {} }
      kick();
    }
    opt.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) mode(b.getAttribute('data-v'), true); });
    // phones open on the globe, computers on the map; a view the visitor picked wins either way
    var m0 = matchMedia('(max-width: 760px)').matches ? 'globe' : 'map'; try { m0 = localStorage.getItem('hero-mode') || m0; } catch (e) {}
    mode(m0, false);
    setActive('a', false);
  }, 0); });

  // Intro: type the breach lines, glitch the page in, then never again this visit.
  (function () {
    if (!root.classList.contains('intro')) return;
    var lines = document.querySelectorAll('#boot p'), timers = [], done = false;
    try { localStorage.setItem('booted', '1'); } catch (e) {}
    function finish() {
      if (done) return; done = true; timers.forEach(clearTimeout);
      root.classList.add('boot-out');
      setTimeout(function () {
        root.classList.remove('intro', 'boot-out'); root.classList.add('glitch');
        setTimeout(function () { root.classList.remove('glitch'); }, 420);
      }, 260);
    }
    lines.forEach(function (l, i) { timers.push(setTimeout(function () { l.classList.add('on'); }, 60 + i * 95)); });
    timers.push(setTimeout(finish, 60 + lines.length * 95 + 160));
    ['click', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, finish, { once: true, passive: true }); });
  })();
  // Target lock: over anything clickable the cursor hides and four corners frame the target. Mouse and trackpad only.
  var lockOn = function () { return false; };
  if (matchMedia('(pointer: fine)').matches) (function () {
    var SEL = 'a[href], button:not(:disabled), [role="tab"], [role="button"], label, summary, select, input[type="range"], input[type="radio"], input[type="checkbox"], .graph-open';
    var TYPING = 'input:not([type="range"]):not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable]';
    var PAD = 5, lk = document.createElement('div'), tgt = null, mx = 0, my = 0;
    lk.className = 'lock'; lk.setAttribute('aria-hidden', 'true'); lk.innerHTML = '<i></i><i></i><i></i><i></i>';
    document.body.appendChild(lk); root.classList.add('lock-on');
    lockOn = function () { return !!tgt; };
    function drop() { tgt = null; lk.classList.remove('on', 'press'); }
    function place() {
      if (!tgt) return;
      if (!tgt.isConnected) return drop();
      // A link that wraps onto two lines gets the line under the pointer, not one big box.
      var rs = tgt.getClientRects(), r = tgt.getBoundingClientRect();
      for (var i = 0; rs.length > 1 && i < rs.length; i++) if (mx >= rs[i].left && mx <= rs[i].right && my >= rs[i].top && my <= rs[i].bottom) { r = rs[i]; break; }
      if (!r.width && !r.height) return drop();
      lk.style.transform = 'translate(' + (r.left - PAD) + 'px,' + (r.top - PAD) + 'px)';
      lk.style.width = (r.width + PAD * 2) + 'px'; lk.style.height = (r.height + PAD * 2) + 'px';
    }
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      var el = e.target, t = el.closest && !el.closest(TYPING) && !root.classList.contains('is-dragging') ? el.closest(SEL) : null;
      if (t && t.closest('.wb')) t = null;
      if (!t) return drop();
      if (t === tgt && tgt.getClientRects().length < 2) return;
      var fresh = !tgt; tgt = t;
      if (fresh) { lk.classList.add('snap'); place(); void lk.offsetWidth; lk.classList.remove('snap'); } else place();
      lk.classList.add('on');
    }, { passive: true });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) drop(); });
    // Keyboard: tabbing onto something clickable frames it the same way (the corners stand in for the focus outline).
    document.addEventListener('focusin', function (e) {
      var t = e.target;
      if (!t.matches || !t.matches(SEL) || !t.matches(':focus-visible') || t.closest('.wb')) return;
      var fresh = !tgt; tgt = t; mx = my = -1; t.classList.add('kb-locked');
      if (fresh) { lk.classList.add('snap'); place(); void lk.offsetWidth; lk.classList.remove('snap'); } else place();
      lk.classList.add('on');
    });
    document.addEventListener('focusout', function (e) { e.target.classList && e.target.classList.remove('kb-locked'); if (tgt === e.target) drop(); });
    document.addEventListener('mousedown', function (e) { if (tgt && e.button === 0) lk.classList.add('press'); });
    document.addEventListener('mouseup', function () { lk.classList.remove('press'); place(); });
    window.addEventListener('scroll', place, { passive: true, capture: true });
    window.addEventListener('resize', place);
  })();
  // Hit marker where you click, like landing a shot. On a locked target the corners squeeze instead.
  if (matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || lockOn()) return;
      var m = document.createElement('span'); m.className = 'hitmark'; m.style.left = e.clientX + 'px'; m.style.top = e.clientY + 'px';
      document.body.appendChild(m); setTimeout(function () { m.remove(); }, 340);
    });
  }

  // Paperclip: Wayne Enterprises. A preset task plays out as a simulated run through the org chart.
  (function () {
    var we = document.getElementById('we'); if (!we) return;
    var AG = { ifti: ['I', 'Ifti'], rocket: ['R', 'Rocket'], alfred: ['A', 'Alfred'], fury: ['F', 'Fury'], oracle: ['O', 'Oracle'], lucius: ['L', 'Lucius'],
               jarvis: ['J', 'Jarvis'], robin: ['R', 'Robin'], friday: ['F', 'Friday'], shuri: ['S', 'Shuri'] };
    var UP = { rocket: 'ifti', alfred: 'rocket', fury: 'rocket', oracle: 'rocket', lucius: 'rocket', jarvis: 'alfred', robin: 'fury', friday: 'oracle', shuri: 'lucius' };
    // each step: [agent, handed to (or ''), what happens]
    var RUNS = {
      call: { q: 'We just had a discovery call. What are the next actions from the recording?', steps: [
        ['ifti', 'rocket', 'Opens a ticket with the call recording attached.'],
        ['rocket', 'alfred', 'Routes it to records: the call needs to be in the CRM before anyone acts on it.'],
        ['alfred', 'jarvis', 'Has Jarvis transcribe the recording and tag decisions, objections and asks.'],
        ['jarvis', 'alfred', 'Finds 3 commitments, 2 objections (budget timing, internal approval) and 4 open questions.'],
        ['alfred', '', 'Logs the call on the account and moves the deal to discovery complete.'],
        ['alfred', 'fury', 'Hands the deal summary to sales.'],
        ['fury', '', 'Turns it into next steps: case study, a scoping workshop with their CTO, a phased budget option.'],
        ['fury', 'friday', 'Asks Friday to hold workshop slots with the CTO.'],
        ['friday', 'fury', 'Holds three slots next week and drafts the invite.'],
        ['fury', 'rocket', 'Submits the action plan and the recap email.'],
        ['rocket', 'ifti', 'Approves and sends it to you.']],
        answer: ['Next actions from the call', ['Send the relevant case study within 24 hours', 'Scoping workshop with their CTO: three slots held for next week', 'A phased budget option to answer the timing objection', 'Recap email drafted with decisions, owners, dates and the 4 open questions']] },
      closing: { q: "We have four closing calls this week. What's our action plan?", steps: [
        ['ifti', 'rocket', 'Opens a ticket: action plan for this week\'s four closing calls.'],
        ['rocket', 'fury', 'Hands it to sales.'],
        ['fury', 'lucius', 'Asks analytics where each deal really stands.'],
        ['lucius', 'shuri', 'Has Shuri pull stage, value, last contact and the stakeholder map for all four.'],
        ['shuri', 'lucius', 'Returns a one-line read on each deal, with the risk.'],
        ['lucius', 'fury', 'Ranks them: two likely, one at risk in procurement, one waiting on legal.'],
        ['fury', 'robin', 'Asks Robin for a one-page brief per call: objections, give-gets, walk-away point.'],
        ['robin', 'fury', 'Four briefs ready.'],
        ['fury', 'oracle', 'Asks Oracle to put the design lead on the at-risk call.'],
        ['oracle', 'fury', 'Design lead confirmed.'],
        ['fury', 'rocket', 'Submits the plan.'],
        ['rocket', 'ifti', 'Signs it off and sends it to you.']],
        answer: ['Close plan for the week', ['Two likely closes: confirm start dates and send the contract on the call', 'Procurement risk: offer phased payments, hold the price', 'Waiting on legal: send a summary of the redlines a day ahead', 'One brief per call with objections, give-gets and the walk-away point']] },
      board: { q: 'Board meeting on Thursday. What does our pipeline look like?', steps: [
        ['ifti', 'rocket', 'Opens a ticket: pipeline view for Thursday\'s board meeting.'],
        ['rocket', 'lucius', 'Hands it to analytics.'],
        ['lucius', 'alfred', 'Asks records for a clean CRM snapshot first.'],
        ['alfred', 'jarvis', 'Has Jarvis backfill activity from last week\'s calls.'],
        ['jarvis', 'alfred', 'Every open deal now has its latest touch logged.'],
        ['alfred', 'lucius', 'Snapshot ready: no duplicates, every deal with a stage and a next step.'],
        ['lucius', '', 'Works out weighted pipeline, coverage against target, stage conversion and slipped deals.'],
        ['lucius', 'shuri', 'Has Shuri build the board charts.'],
        ['shuri', 'lucius', 'Charts and a one-page summary done.'],
        ['lucius', 'rocket', 'Hands over the pack: what changed, what\'s at risk, what we need from the board.'],
        ['rocket', 'ifti', 'Checks it against last quarter and sends it to you.']],
        answer: ['Board pipeline pack ready', ['Weighted pipeline and coverage against the quarter\'s target', 'Stage conversion, plus every deal that slipped and why', 'Top five deals with owners and next steps', 'Three asks for the board, one slide each']] },
      scope: { q: 'A client wants more scope at the same price. How do we respond?', steps: [
        ['ifti', 'rocket', 'Opens a ticket: client asking for two more screens, same fee, same date.'],
        ['rocket', 'oracle', 'Routes it to Oracle: design, dev and finance all have a stake.'],
        ['oracle', 'lucius', 'Asks analytics to cost the change.'],
        ['lucius', 'oracle', 'Two extra screens: +6 design days, +4 dev days, about 9% on the fee.'],
        ['oracle', 'fury', 'Asks sales for the commercial position.'],
        ['fury', '', 'Sets the rule: more scope costs time or money. Nothing is added for free.'],
        ['fury', 'oracle', 'Proposes two options to put to the client.'],
        ['oracle', 'friday', 'Asks Friday to get the three leads on one call.'],
        ['friday', 'oracle', 'Books 20 minutes tomorrow and sends the agenda.'],
        ['oracle', 'rocket', 'All three leads sign off on both options.'],
        ['rocket', 'ifti', 'Sends you the options and a draft reply to the client.']],
        answer: ['Response ready', ['Option A: same fee and date, the two screens move to phase two', 'Option B: both screens now, +9% fee, launch one week later', 'Design, dev and finance have signed off on both', 'Reply to the client drafted, leading with Option A']] }
    };
    var MATCH = [['call', /call|recording|transcript|meeting notes|discovery|next action/i], ['closing', /clos|deal|negotiat|contract|this week/i],
                 ['board', /board|pipeline|forecast|quarter|management/i], ['scope', /scope|price|discount|push|change|more work/i]];
    var nodes = {}, timers = [], closed = 0, t0;
    we.querySelectorAll('.we-node').forEach(function (n) { nodes[n.getAttribute('data-a')] = n; });
    var log = document.getElementById('we-log'), ans = document.getElementById('we-answer'), run = document.getElementById('we-run');
    var q = document.getElementById('we-q'), busyEl = document.getElementById('we-busy'), doneEl = document.getElementById('we-done');
    var RT = { ifti: ['human', 'you'], rocket: ['claude', 'Claude Code'], fury: ['claude', 'Claude Code'], oracle: ['claude', 'Claude Code'], alfred: ['hermes', 'Hermes'], jarvis: ['hermes', 'Hermes'], friday: ['hermes', 'Hermes'], lucius: ['codex', 'Codex'], robin: ['codex', 'Codex'], shuri: ['codex', 'Codex'] };
    function av(a) { return '<span class="we-av" data-rt="' + RT[a][0] + '">' + AG[a][0] + '</span>'; }
    function reset() {
      timers.forEach(clearTimeout); timers = [];
      Object.keys(nodes).forEach(function (k) { nodes[k].classList.remove('working', 'done', 'link'); nodes[k].querySelector('.we-st').textContent = 'idle'; });
      we.querySelectorAll('.we-v').forEach(function (v) { v.classList.remove('on'); });
      we.querySelectorAll('.we-node.head').forEach(function (n) { n.classList.remove('link'); });
    }
    function status(a, st) { var n = nodes[a]; n.classList.toggle('working', st === 'working'); n.classList.toggle('done', st === 'done'); n.querySelector('.we-st').textContent = st; }
    // light the edges between two agents: everything on their paths up the chart that they don't share
    function path(x) { var p = []; while (UP[x]) { p.push(x); x = UP[x]; } return p; }
    function links(a, b) {
      var pa = path(a), pb = b ? path(b) : [], on = pa.filter(function (e) { return pb.indexOf(e) < 0; }).concat(pb.filter(function (e) { return pa.indexOf(e) < 0; }));
      we.querySelectorAll('.we-v[data-e]').forEach(function (v) {
        var e = v.getAttribute('data-e');
        v.classList.toggle('on', e === 'trunk' ? on.some(function (x) { return UP[x] === 'rocket'; }) : on.indexOf(e) >= 0);
      });
      ['alfred', 'fury', 'oracle', 'lucius'].forEach(function (h) { nodes[h].classList.toggle('link', on.indexOf(h) >= 0); });
    }
    function play(key) {
      var r = RUNS[key]; reset();
      we.setAttribute('data-busy', 'true'); run.hidden = false; ans.hidden = true; log.innerHTML = '';
      var rr = run.getBoundingClientRect(); if (rr.top > innerHeight - 120) run.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      q.value = r.q;
      we.querySelectorAll('.we-presets button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-s') === key)); });
      document.getElementById('we-ticket').textContent = 'WE-' + (140 + closed + Object.keys(RUNS).indexOf(key));
      var gap = matchMedia('(prefers-reduced-motion: reduce)').matches ? 500 : 1100;
      r.steps.forEach(function (st, i) {
        timers.push(setTimeout(function () {
          Object.keys(nodes).forEach(function (k) { if (nodes[k].classList.contains('working')) status(k, 'done'); });
          status(st[0], 'working'); links(st[0], st[1]);
          busyEl.textContent = st[0] === 'ifti' ? 0 : 1;
          var sec = Math.round(i * gap / 1000 * 3);
          log.insertAdjacentHTML('beforeend', '<li><time>' + String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0') + '</time>' + av(st[0]) +
            '<span data-rt="' + RT[st[0]][0] + '"><b>' + AG[st[0]][1] + '</b><span class="rt">' + RT[st[0]][1] + '</span> ' + esc(st[2]) + (st[1] ? ' <span class="to">→ ' + AG[st[1]][1] + '</span>' : '') + '</span></li>');
        }, i * gap));
      });
      timers.push(setTimeout(function () {
        reset(); Object.keys(nodes).forEach(function (k) { if (r.steps.some(function (st) { return st[0] === k; })) status(k, 'done'); });
        closed++; doneEl.textContent = closed; busyEl.textContent = 0; we.setAttribute('data-busy', 'false');
        ans.innerHTML = '<h4>Rocket · ' + esc(r.answer[0]) + '</h4><ul>' + r.answer[1].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
        ans.hidden = false;
      }, r.steps.length * gap));
    }
    we.querySelectorAll('.we-presets button').forEach(function (b) { b.addEventListener('click', function () { play(b.getAttribute('data-s')); }); });
    document.getElementById('we-ask').addEventListener('submit', function (e) {
      e.preventDefault();
      var hit = MATCH.filter(function (m) { return m[1].test(q.value); })[0];
      if (hit) { play(hit[0]); return; }
      reset(); run.hidden = false; ans.hidden = false; log.innerHTML = ''; document.getElementById('we-ticket').textContent = '';
      ans.innerHTML = '<h4>Rocket · Not one of my demo runs</h4><ul><li>This demo plays four set tasks. Pick one of the prompts above, or ask about a call, closing deals, the pipeline or a scope request.</li></ul>';
    });
    function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  })();
  // Hermes: Telegram-style preview. Picking an agent replays a short sample exchange.
  (function () {
    var tg = document.getElementById('tg'); if (!tg) return;
    // [who, text, time]; who: me | bot | sys. A photo message starts with [photo].
    var CHATS = {
      plutus: ['P', 'Plutus', [
        ['me', '[photo] Lunch with a client', '13:42'],
        ['bot', 'Logged 145 under client meals. You\'re at 62% of this month\'s eating-out budget.', '13:42'],
        ['me', 'What am I paying for subscriptions right now?', '13:45'],
        ['bot', 'Seven subscriptions, 4,350 a month. Two haven\'t been opened in 60 days: a design tool and a streaming app. Cancel both?', '13:45'],
        ['sys', 'Saved skill: subscription audit']]],
      chronos: ['C', 'Chronos', [
        ['bot', 'Morning. Today: gym at 6, the portfolio site\'s Research page, and call the bank before 3.', '07:30'],
        ['me', 'Move the gym to 7 and remind me about the bank at lunch', '07:41'],
        ['bot', 'Done. Gym is at 19:00. Bank reminder at 13:00.', '07:41'],
        ['me', 'Where am I on the website?', '07:42'],
        ['bot', '9 of 12 tasks done. Next up: the Hermes page.', '07:42']]],
      athena: ['A', 'Athena', [
        ['bot', 'Weekday brief: 2 client calls today, 3 follow-ups due, 1 proposal waiting on legal.', '08:45'],
        ['me', 'Prep me for the 3pm call', '14:20'],
        ['bot', 'Last three touchpoints, the proposal we sent on the 9th, and their open worry: timeline. Suggested opener: confirm what changed since the proposal.', '14:21'],
        ['me', 'Draft the recap after the call', '16:05'],
        ['bot', 'Draft ready: decisions, owners, dates and 2 open questions. Want it sent from your email?', '16:06'],
        ['sys', 'Saved skill: call recap']]]
    };
    var chat = document.getElementById('tg-chat'), timers = [];
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    function bubble(m) {
      if (m[0] === 'sys') return '<div class="tg-m sys">' + esc(m[1]) + '</div>';
      var photo = m[1].indexOf('[photo]') === 0, text = photo ? m[1].slice(8) : m[1];
      return '<div class="tg-m ' + m[0] + '">' + (photo ? '<span class="ph">receipt.jpg</span>' : '') + esc(text) + '<time>' + m[2] + '</time></div>';
    }
    function show(k) {
      timers.forEach(clearTimeout); timers = [];
      var c = CHATS[k];
      tg.querySelectorAll('[role="tab"]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-k') === k)); });
      document.getElementById('tg-av').textContent = c[0]; document.getElementById('tg-name').textContent = c[1];
      chat.innerHTML = '';
      if (still) { chat.innerHTML = c[2].map(bubble).join(''); return; }
      var t = 0;
      c[2].forEach(function (m) {
        if (m[0] === 'bot') {
          timers.push(setTimeout(function () { chat.insertAdjacentHTML('beforeend', '<div class="tg-typing"><i></i><i></i><i></i></div>'); }, t));
          t += 700;
        }
        timers.push(setTimeout(function () { var ty = chat.querySelector('.tg-typing'); if (ty) ty.remove(); chat.insertAdjacentHTML('beforeend', bubble(m)); }, t));
        t += m[0] === 'me' ? 650 : 900;
      });
    }
    tg.querySelectorAll('[role="tab"]').forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-k')); }); });
    var started = false;
    window.addEventListener('hashchange', function () { if (location.hash === '#hermes') show('plutus'); });
    if (location.hash === '#hermes') show('plutus'); else chat.innerHTML = CHATS.plutus[2].map(bubble).join('');
  })();
  // Hermes: learning loop, auto-advances until the visitor picks a step
  (function () {
    var loop = document.getElementById('hm-loop'); if (!loop) return;
    var tabs = loop.querySelectorAll('[role="tab"]'), paras = loop.querySelectorAll('.hm-panel p'), cur = 0, timer = null;
    function set(i) {
      cur = i;
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      paras.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    }
    function stop() { clearInterval(timer); timer = null; }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { stop(); set(k); }); });
    loop.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      stop(); set((cur + (e.key === 'ArrowRight' ? 1 : 3)) % 4); tabs[cur].focus();
    });
    set(0);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(function () { if (document.getElementById('hermes').classList.contains('on')) set((cur + 1) % 4); }, 2800);
  })();

  var SITE = 'https://ifti-gold.vercel.app/';
  var cssVar = function (k) { return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); };

  // ============ Share cards: select a line in a note, get an image of it in the current theme ============
  (function () {
    var pop = document.getElementById('share-pop'), dlg = document.getElementById('sc'), cv = document.getElementById('sc-cv');
    var note = document.getElementById('sc-note'), NOTE_TXT = note.textContent;
    var q = null, size = 'wide', timer = 0;
    function selInNote() {
      var sel = getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
      var r = sel.getRangeAt(0), n = r.commonAncestorContainer; n = n.nodeType === 1 ? n : n.parentElement;
      var art = n && n.closest('article.page.on[id^="n-"]'); if (!art || n.closest('.note-head, .obs-tabs, .note-next')) return null;
      var text = sel.toString().replace(/\s+/g, ' ').trim().replace(/^["“”'‘]+|["“”'’]+$/g, '').trim();
      if (text.length < 12) return null;
      return { text: text, art: art, rect: r.getBoundingClientRect() };
    }
    function check() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var s = selInNote(); if (!s) { pop.hidden = true; return; }
        q = s; pop.hidden = false;
        var x = Math.min(innerWidth - pop.offsetWidth - 8, Math.max(8, s.rect.left + s.rect.width / 2 - pop.offsetWidth / 2));
        var y = s.rect.top - pop.offsetHeight - 10; if (y < 8) y = s.rect.bottom + 10;
        pop.style.left = x + 'px'; pop.style.top = y + 'px';
      }, 120);
    }
    document.addEventListener('selectionchange', check);
    addEventListener('scroll', function () { if (!pop.hidden) check(); }, { passive: true });
    pop.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep the selection
    pop.addEventListener('click', function () { if (q) open(q); });

    function wrap(ctx, text, maxW) {
      var words = text.split(' '), lines = [], line = '';
      words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
      if (line) lines.push(line); return lines;
    }
    function draw() {
      var W = size === 'wide' ? 1200 : 1080, H = size === 'wide' ? 630 : 1080, ctx = cv.getContext('2d');
      cv.width = W; cv.height = H;
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
    function url() { return SITE + '#' + q.art.id; }
    function open(s) {
      q = { text: s.text, art: s.art }; pop.hidden = true; note.textContent = NOTE_TXT;
      var tweet = '“' + (q.text.length > 200 ? q.text.slice(0, 197).replace(/\s+\S*$/, '') + '…' : q.text) + '”';
      document.getElementById('sc-x').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet) + '&url=' + encodeURIComponent(url());
      document.getElementById('sc-li').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url());
      var fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      fonts.then(function () { draw(); if (!dlg.open) dlg.showModal(); if (window.unlock) unlock('share'); });
    }
    function blob(cb) { cv.toBlob(cb, 'image/png'); }
    function fname() { return 'ifti-' + q.art.id + '-quote.png'; }
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
        var f = new File([b], fname(), { type: 'image/png' }), data = { files: [f], text: '“' + q.text + '”', url: url() };
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

  // ============ Command palette: Ctrl/⌘ + K finds any page, section, note, book or theme ============
  (function () {
    var dlg = document.getElementById('pal'), input = document.getElementById('pal-q'), list = document.getElementById('pal-list');
    var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    document.querySelectorAll('.pal-key').forEach(function (k) { k.textContent = mac ? '⌘K' : 'Ctrl K'; });
    var items = [], hits = [], sel = 0;
    var slug = function (t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); };
    var title = function (pg) { var h = pg.querySelector('h1'); return h ? h.textContent.trim() : pg.id; };
    function flash(el) { if (!el) return; el.classList.remove('pal-flash'); void el.offsetWidth; el.classList.add('pal-flash'); }
    function build() {
      items = [];
      var rail = Array.prototype.map.call(document.querySelectorAll('.rail a.nav'), function (a) { return a.getAttribute('href').slice(1); });
      rail.concat(['changelog']).forEach(function (id) {
        var pg = document.getElementById(id); if (!pg) return;
        var a = document.querySelector('.rail a.nav[href="#' + id + '"]');
        items.push({ k: 'Page', t: a ? a.textContent.replace(/^\d/, '').trim() : title(pg), x: title(pg), go: '#' + id });
      });
      document.querySelectorAll('article.page[id^="n-"]').forEach(function (n) {
        items.push({ k: 'Note', t: title(n), x: 'N°' + n.id.slice(2) + ' ' + (n.getAttribute('data-tags') || ''), go: '#' + n.id });
      });
      document.querySelectorAll('.page h2').forEach(function (h) {
        var pg = h.closest('.page'); if (!pg || pg.id === 'backstage') return; // the hidden room stays hidden
        if (!h.id) h.id = 's-' + pg.id + '-' + slug(h.textContent);
        items.push({ k: 'Section', t: h.textContent.trim(), x: 'in ' + title(pg), go: '#' + h.id });
      });
      document.querySelectorAll('#shelf [data-shelf] > li').forEach(function (li) {
        var t = li.querySelector('.t'), tag = li.querySelector('.tag'), sec = li.parentElement.getAttribute('data-shelf');
        items.push({ k: tag ? tag.textContent : 'Shelf', t: t.childNodes[0].textContent.trim(), x: (t.querySelector('.by') ? t.querySelector('.by').textContent.replace('·', '').trim() + ' ' : '') + 'shelf ' + sec, go: '#shelf-' + sec, el: li });
      });
      THEMES.forEach(function (th) { items.push({ k: 'Theme', t: th.name || th.id, x: th.note || '', run: function () { apTheme(th.id); } }); });
      var book = document.querySelector('[data-book]');
      items.push({ k: 'Action', t: 'Achievements', x: 'badges unlocked progress', run: function () { setTimeout(window.openAch, 60); } });
      if (window.reactionTest) items.push({ k: 'Action', t: 'Reaction test', x: 'f1 start lights reflex game', run: function () { setTimeout(window.reactionTest, 60); } });
      if (matchMedia('(pointer: fine)').matches) items.push({ k: 'Action', t: 'Keyboard shortcuts', x: 'keys hotkeys help ?', run: function () { setTimeout(window.openKeys, 60); } });
      items.push(
        { k: 'Action', t: 'Book a call', x: 'calendar meeting', run: function () { window.open(book.href, '_blank', 'noopener'); } },
        { k: 'Action', t: 'Copy my email', x: 'mail contact personal', run: function () { var e = 'mh.hasan884@gmail.com'; if (navigator.clipboard) navigator.clipboard.writeText(e); } },
        { k: 'Action', t: 'Copy my work email', x: 'mail contact office musemind', run: function () { var e = 'mehedi.ifti@musemind.agency'; if (navigator.clipboard) navigator.clipboard.writeText(e); } },
        { k: 'Action', t: 'Take the tour', x: 'guide help new', run: function () { window.startTour(); } },
        { k: 'Action', t: 'Open the terminal', x: 'command line', run: function () { document.querySelector('.term-open').click(); } },
        { k: 'Action', t: 'Change theme', x: 'appearance colours look', run: function () { apOpen(true); } },
        { k: 'Action', t: 'Print this page', x: 'pdf save cv', run: function () { setTimeout(function () { window.print(); }, 60); } },
        { k: 'Action', t: 'Open a random note', x: 'surprise', run: function () { window.randomNote(); } }
      );
    }
    function score(it, words) {
      var t = it.t.toLowerCase(), hay = (t + ' ' + it.k + ' ' + (it.x || '')).toLowerCase(), s = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i]; if (hay.indexOf(w) < 0) return -1;
        s += t.indexOf(w) === 0 ? 30 : (' ' + t).indexOf(' ' + w) >= 0 ? 20 : t.indexOf(w) >= 0 ? 10 : 2;
      }
      return s + ({ Page: 6, Note: 5, Action: 4, Section: 3 }[it.k] || 1);
    }
    function render() {
      var v = input.value.trim().toLowerCase(), words = v.split(/\s+/).filter(Boolean);
      if (!words.length) hits = items.filter(function (it) { return it.k === 'Page' || it.k === 'Action'; });
      else hits = items.map(function (it) { return { it: it, s: score(it, words) }; }).filter(function (h) { return h.s >= 0; })
        .sort(function (a, b) { return b.s - a.s; }).slice(0, 30).map(function (h) { return h.it; });
      sel = Math.min(sel, Math.max(0, hits.length - 1));
      list.innerHTML = hits.length ? hits.map(function (it, i) {
        return '<li role="option" id="pal-' + i + '" aria-selected="' + (i === sel) + '" data-i="' + i + '"><span class="pk">' + esc(it.k) + '</span><b>' + esc(it.t) + '</b>' + (it.k === 'Section' || it.k === 'Note' ? '<small>' + esc(it.k === 'Note' ? it.x.split(' ')[0] : it.x) + '</small>' : '') + '</li>';
      }).join('') : '<li class="pal-none">Nothing matches. Try a shorter word.</li>';
      input.setAttribute('aria-activedescendant', hits.length ? 'pal-' + sel : '');
      var on = list.querySelector('[aria-selected="true"]'); if (on) on.scrollIntoView({ block: 'nearest' });
    }
    function run(it) {
      dlg.close(); if (!it) return;
      if (it.run) return it.run();
      if (location.hash === it.go) show(); else location.hash = it.go;
      if (it.el) setTimeout(function () { it.el.scrollIntoView({ block: 'center' }); flash(it.el); }, 60);
      else if (it.k === 'Section') setTimeout(function () { flash(document.getElementById(it.go.slice(1))); }, 60);
    }
    window.openPalette = function () { build(); input.value = ''; sel = 0; render(); if (!dlg.open) dlg.showModal(); input.focus(); };
    document.querySelectorAll('.pal-open').forEach(function (b) { b.addEventListener('click', function () { sheetOpen(false); openPalette(); }); });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); dlg.open ? dlg.close() : openPalette(); }
    });
    input.addEventListener('input', function () { sel = 0; render(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(hits.length - 1, sel + 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); run(hits[sel]); }
    });
    list.addEventListener('mousemove', function (e) { var li = e.target.closest('[data-i]'); if (li && +li.getAttribute('data-i') !== sel) { sel = +li.getAttribute('data-i'); render(); } });
    list.addEventListener('click', function (e) { var li = e.target.closest('[data-i]'); if (li) run(hits[+li.getAttribute('data-i')]); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  })();

  // ============ Guided tour: a spotlight walk through the site, about a minute ============
  (function () {
    var box = document.getElementById('tour'), hole = document.getElementById('tour-hole'), card = document.getElementById('tour-card');
    var palKey = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K';
    var STEPS = [
      { el: ['#index .hero h1'], h: 'This is my notebook', p: 'What I do, what I think about client work, and what I\'m into. It takes about a minute.' },
      { el: ['.rail', '.m-tabs'], h: 'Every page lives here', p: 'Notes, work, the shelf and the Playground. On a keyboard, 1 to 9 and 0 jump straight to a page.' },
      { el: ['#index .entries'], h: 'Writing', p: 'Short notes on work and what I\'m listening to. Select any line in a note to turn it into a card.' },
      { el: ['#meta'], h: 'The margin', p: 'It changes with the page: what\'s on it, and what I\'m watching, reading and listening to right now.' },
      { el: ['#ap-tab', '.m-theme-top'], h: 'Change the look', p: 'Pick a theme. On a computer you can drag this tab to any edge, and it stays there.' },
      { el: ['.rail-search', '.m-top .pal-open'], h: 'Find anything', p: 'Press ' + palKey + ' to search every page, note, book and theme.' },
      { el: ['.term-fab'], h: 'A terminal', p: 'If you like typing. Try help, now, or whoami. The square button beside it replays this tour.' },
      { el: ['#index .hero .cta .btn'], h: 'When you want to talk', p: 'Book a call. Or just keep reading. That\'s the tour.' }
    ];
    var steps = [], i = 0;
    var vis = function (sel) { var e = document.querySelector(sel); return e && e.offsetWidth && e.offsetHeight && getComputedStyle(e).visibility !== 'hidden' ? e : null; };
    function target(st) { for (var k = 0; k < st.el.length; k++) { var e = vis(st.el[k]); if (e) return e; } return null; }
    function place() {
      var st = steps[i]; if (!st) return;
      var r = st.t.getBoundingClientRect(), pad = 8;
      hole.style.left = (r.left - pad) + 'px'; hole.style.top = (r.top - pad) + 'px'; hole.style.width = (r.width + pad * 2) + 'px'; hole.style.height = (r.height + pad * 2) + 'px';
      var cw = card.offsetWidth, ch = card.offsetHeight, x, y;
      if (r.right + 16 + cw < innerWidth - 12) { x = r.right + 16; y = r.top; }
      else if (r.bottom + 16 + ch < innerHeight - 12) { x = r.left; y = r.bottom + 16; }
      else if (r.top - 16 - ch > 12) { x = r.left; y = r.top - 16 - ch; }
      else { x = r.left - 16 - cw; y = r.top; }
      card.style.left = Math.max(12, Math.min(x, innerWidth - cw - 12)) + 'px';
      card.style.top = Math.max(12, Math.min(y, innerHeight - ch - 12)) + 'px';
    }
    function go(n) {
      i = n; var st = steps[i]; if (!st) return end();
      card.innerHTML = '<small>' + (i + 1) + ' of ' + steps.length + '</small><b>' + esc(st.h) + '</b><p>' + esc(st.p) + '</p><div class="tour-acts">' +
        (i ? '<button type="button" data-t="back">Back</button>' : '<button type="button" data-t="end">Skip</button>') +
        '<button type="button" class="btn" data-t="next">' + (i === steps.length - 1 ? 'Done' : 'Next') + '</button></div>';
      var r = st.t.getBoundingClientRect();
      if (r.top < 60 || r.bottom > innerHeight - 60) st.t.scrollIntoView({ block: r.height > innerHeight * 0.7 ? 'start' : 'center' });
      requestAnimationFrame(place);
      card.querySelector('[data-t="next"]').focus();
    }
    function end() { box.hidden = true; document.documentElement.classList.remove('touring'); removeEventListener('resize', place); removeEventListener('scroll', place); }
    window.startTour = function () {
      if (location.hash && location.hash !== '#index') location.hash = 'index';
      setTimeout(function () {
        window.scrollTo(0, 0);
        steps = STEPS.map(function (st) { return { h: st.h, p: st.p, t: target(st) }; }).filter(function (st) { return st.t; });
        box.hidden = false; document.documentElement.classList.add('touring');
        addEventListener('resize', place); addEventListener('scroll', place, { passive: true });
        go(0);
      }, 80);
    };
    card.addEventListener('click', function (e) {
      var b = e.target.closest('[data-t]'); if (!b) return;
      var t = b.getAttribute('data-t'); if (t === 'next') go(i + 1); else if (t === 'back') go(i - 1); else end();
    });
    box.addEventListener('click', function (e) { if (e.target === box || e.target === hole) end(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') end(); else if (e.key === 'ArrowRight') go(i + 1); else if (e.key === 'ArrowLeft' && i) go(i - 1);
    });
    document.querySelectorAll('.tour-start').forEach(function (b) { b.addEventListener('click', function () { window.startTour(); }); });
  })();

  // ============ ACHIEVEMENTS: small badges for exploring. Stored only in this browser; no network, no tracking. ============
  // Each row is [id, name, how to get it]. The hints stay vague on purpose for the last two.
  (function () {
    var ACH = [
      ['terminal', 'Found the terminal', 'Press ~, or open it from search.'],
      ['keys', 'Knows the keys', 'Press ? on a computer.'],
      ['themes', 'Theme hopper', 'Pick three different themes.'],
      ['notes', 'Read every note', 'Open each note in the notebook.'],
      ['tour', 'Took the tour', 'Start the tour.'],
      ['share', 'Shared a line', 'Turn a line from a note into a share card.'],
      ['backstage', 'Found the hidden room', 'It isn\'t on the map. The terminal knows the way.'],
      ['lights', 'Lights out', 'A very old cheat code.'],
      ['reaction', 'Quick off the line', 'Under 250 ms on the start lights. Try reaction in the terminal.']
    ];
    function get(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }
    function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    var got = get('ach', {}), queue = [], showing = false;
    function toast() {
      if (showing || !queue.length) return; showing = true;
      var t = document.createElement('div'); t.className = 'ach-toast'; t.setAttribute('role', 'status');
      t.innerHTML = '<small>Achievement</small><b>' + esc(queue.shift()) + '</b>';
      document.body.appendChild(t); requestAnimationFrame(function () { t.classList.add('on'); });
      setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); showing = false; toast(); }, 300); }, 3200);
    }
    window.unlock = function (id) {
      var a = ACH.filter(function (x) { return x[0] === id; })[0];
      if (!a || got[id]) return;
      got[id] = Date.now(); put('ach', got); queue.push(a[1]); toast(); foot();
    };
    // The footer says how many there are, so people know to look. Click it for the list. Computers only (CSS).
    var footBtn = document.getElementById('ach-foot');
    function foot() {
      if (!footBtn) return;
      var n = ACH.filter(function (a) { return got[a[0]]; }).length;
      footBtn.textContent = n ? n + ' of ' + ACH.length + ' secrets found.' : ACH.length + ' secrets to find.';
      footBtn.hidden = footBtn.previousSibling.hidden = false;
    }
    if (footBtn) { footBtn.addEventListener('click', function () { window.openAch(); }); foot(); }
    // Themes and notes need a running list before they count.
    window.achTheme = function (id) { var l = get('ach-themes', []); if (l.indexOf(id) < 0) { l.push(id); put('ach-themes', l); } if (l.length >= 3) unlock('themes'); };
    function onPage() {
      var id = (location.hash || '').slice(1);
      if (id === 'backstage') unlock('backstage');
      if (id.indexOf('n-') === 0 && document.getElementById(id)) {
        var l = get('ach-notes', []); if (l.indexOf(id) < 0) { l.push(id); put('ach-notes', l); }
        var all = Array.prototype.map.call(document.querySelectorAll('article.page[id^="n-"]'), function (n) { return n.id; });
        if (all.every(function (n) { return l.indexOf(n) >= 0; })) unlock('notes');
      }
    }
    window.addEventListener('hashchange', onPage); onPage();
    var st = window.startTour; if (st) window.startTour = function () { unlock('tour'); return st.apply(this, arguments); };
    // The list: in search ("Achievements") and the terminal's achievements command.
    var dlg = document.getElementById('ach-dlg');
    window.achList = function () { return ACH.map(function (a) { return { name: a[1], hint: a[2], got: !!got[a[0]] }; }); };
    window.openAch = function () {
      var l = window.achList(), n = l.filter(function (x) { return x.got; }).length;
      document.getElementById('ach-n').textContent = n + ' of ' + l.length;
      document.getElementById('ach-list').innerHTML = l.map(function (x) {
        return '<li class="' + (x.got ? 'got' : '') + '"><i aria-hidden="true">' + (x.got ? '✓' : '·') + '</i><b>' + esc(x.name) + '</b><span>' + (x.got ? 'Found' : esc(x.hint)) + '</span></li>';
      }).join('');
      if (!dlg.open) dlg.showModal();
    };
    document.getElementById('ach-x').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  })();

  // ============ Print: any page prints clean; the Work page prints as a CV ============
  (function () {
    var head = document.getElementById('print-head'), opened = [];
    addEventListener('beforeprint', function () {
      var pg = document.querySelector('.page.on'), id = pg ? pg.id : 'index';
      var date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' });
      head.innerHTML = '<b>Mehedi Hasan Ifti</b><span>' + (id === 'work' ? 'Manager, Global Sales &amp; Partnerships · Musemind · Dhaka' : "Ifti's Notebook") + '</span>' +
        '<span>mh.hasan884@gmail.com · mehedi.ifti@musemind.agency · ' + esc(SITE.replace('https://', '') + (id === 'index' ? '' : '#' + id)) + '</span><span>Printed ' + esc(date) + '</span>';
      document.body.insertBefore(head, document.body.firstChild);
      document.documentElement.setAttribute('data-print', id);
      opened = Array.prototype.filter.call(document.querySelectorAll('.page.on details:not([open])'), function (d) { d.open = true; return true; });
    });
    addEventListener('afterprint', function () { opened.forEach(function (d) { d.open = false; }); opened = []; document.documentElement.removeAttribute('data-print'); });
  })();


  // ============ Coffee counter ============
  // COFFEE UPDATE: cups per workday and the workweek (0 = Sunday ... 6 = Saturday). Nothing else to update:
  // it counts from 1 January to today in Dhaka time on every visit, and refreshes itself while the page is open.
  (function () {
    var CUPS_PER_DAY = 2.5, WORKWEEK = [0, 1, 2, 3, 4], TZ = 'Asia/Dhaka';
    var box = document.getElementById('cof'), pill = document.getElementById('cof-pill');
    function dhakaToday() {
      var p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false }).formatToParts(new Date());
      var g = function (t) { return +p.filter(function (x) { return x.type === t; })[0].value; };
      return { y: g('year'), m: g('month'), d: g('day'), h: g('hour') % 24 };
    }
    // The numbers, shared with the terminal's coffee command so the two can never disagree.
    function numbers() {
      var t = dhakaToday(), total = 0, sofar = 0, isWork = false;
      for (var d = new Date(Date.UTC(t.y, 0, 1)); d.getUTCFullYear() === t.y; d.setUTCDate(d.getUTCDate() + 1)) {
        if (WORKWEEK.indexOf(d.getUTCDay()) < 0) continue;
        total++;
        var before = d.getUTCMonth() + 1 < t.m || (d.getUTCMonth() + 1 === t.m && d.getUTCDate() < t.d), today = d.getUTCMonth() + 1 === t.m && d.getUTCDate() === t.d;
        if (before) sofar++; if (today) isWork = true;
      }
      // today's cups: none before 9, the full ration by 6 in the evening
      var todayCups = isWork ? Math.round(CUPS_PER_DAY * Math.max(0, Math.min(1, (t.h - 9) / 9))) : 0;
      return { y: t.y, cups: Math.round(sofar * CUPS_PER_DAY + todayCups), sofar: sofar, total: total, isWork: isWork, today: todayCups };
    }
    // Cups brewed on this visit tick the count up; a reload puts it back.
    var session = 0;
    window.coffeeNow = function () { var n = numbers(); n.cups += session; return n; };
    function count() {
      var n = window.coffeeNow(), t = { y: n.y }, cups = n.cups, sofar = n.sofar, total = n.total, isWork = n.isWork, todayCups = n.today;
      document.getElementById('cof-n').textContent = cups.toLocaleString('en-US');
      document.getElementById('cof-l').textContent = 'cups in ' + t.y;
      document.getElementById('cof-big').textContent = cups.toLocaleString('en-US');
      document.getElementById('cof-wd').textContent = (sofar + (isWork ? 1 : 0)) + ' of ' + total;
      document.getElementById('cof-today').textContent = isWork ? (todayCups ? todayCups + (todayCups === 1 ? ' cup' : ' cups') : 'First cup soon') : 'Day off';
      document.getElementById('cof-fill').style.width = Math.round((sofar + (isWork ? 1 : 0)) / total * 100) + '%';
      pill.setAttribute('aria-label', cups + ' cups of coffee in ' + t.y + '. Show details');
      if (window.placeTourBtn) placeTourBtn();
      milestone(cups);
    }
    pill.addEventListener('click', function () { var o = !box.classList.contains('open'); box.classList.toggle('open', o); pill.setAttribute('aria-expanded', String(o)); });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) { box.classList.remove('open'); pill.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.classList.remove('open'); });
    count(); setInterval(count, 10 * 60 * 1000);

    // Click the cup to brew. A visitor's cups are theirs: saved only in this browser, never added to my count.
    var brew = document.getElementById('cof-brew'), say = document.getElementById('cof-say'), you = document.getElementById('cof-you');
    function day() { var t = dhakaToday(); return t.y + '-' + t.m + '-' + t.d; }
    function load() { var v; try { v = JSON.parse(localStorage.getItem('cof-brew') || 'null'); } catch (e) {} v = v || { d: '', today: 0, all: 0 }; if (v.d !== day()) { v.d = day(); v.today = 0; } return v; }
    function nth(n) { var t = n % 100, e = n % 10; return n + (t > 10 && t < 14 ? 'th' : e === 1 ? 'st' : e === 2 ? 'nd' : e === 3 ? 'rd' : 'th'); }
    // Every 100th cup this year gets one steam burst, the first time this browser sees it.
    function milestone(cups) {
      var m = Math.floor(cups / 100) * 100, k = dhakaToday().y + ':' + m, seen;
      if (!brew || !m || !box.offsetHeight || document.documentElement.classList.contains('intro')) return;
      try { seen = localStorage.getItem('cof-burst'); } catch (e) { return; }
      if (seen === k) return;
      try { localStorage.setItem('cof-burst', k); } catch (e) {}
      say.textContent = 'Cup ' + m.toLocaleString('en-US') + ' this year.';
      brew.classList.remove('burst'); void brew.offsetWidth; brew.classList.add('burst');
    }
    function show(v) { you.textContent = v.all ? v.today + ' today · ' + v.all.toLocaleString('en-US') + ' in all' : '0'; }
    show(load());
    brew.addEventListener('click', function () {
      var v = load(); v.today++; v.all++; session++;
      try { localStorage.setItem('cof-brew', JSON.stringify(v)); } catch (e) {}
      show(v);
      say.textContent = v.today === 1 ? 'Brewed. Your first today.' : 'Brewed. That\'s your ' + nth(v.today) + ' today.';
      brew.classList.remove('brewing'); void brew.offsetWidth; brew.classList.add('brewing');
      count();
    });
    brew.addEventListener('animationend', function (e) { if (e.animationName === 'cof-fill') brew.classList.remove('brewing'); if (e.animationName === 'cof-burst') brew.classList.remove('burst'); });
    // check for a burst now that the cup is wired up, or once the intro (which hides the pill) is gone
    setTimeout(count, document.documentElement.classList.contains('intro') ? 4200 : 0);
  })();

  // MOVE THINGS AROUND (computer only).
  // The Theme tab and Terminal button can be dragged anywhere; the spot is saved in this browser.
  // Drop one back near its old spot to put it home. Sections and rail links can be dragged too;
  // that isn't saved, so a reload puts everything back.
  (function () {
    var wide = matchMedia('(min-width: 761px)'), touch = matchMedia('(pointer: coarse)');
    var desk = { get matches() { return wide.matches && !touch.matches; }, addEventListener: function (t, f) { if (wide.addEventListener) { wide.addEventListener(t, f); touch.addEventListener(t, f); } } };
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    var fixedOrder = function () { var p = document.querySelector('.page.on'); if (p) { buildMeta(p, p.id); pageNext(p, p.id); } };

    // the column lines beside the left rail and the right rail; the Theme tab can sit in the gap next to either
    function lines() {
      var out = [], shell = document.querySelector('.shell'), half = (parseFloat(getComputedStyle(shell).columnGap) || 40) / 2;
      var rl = document.querySelector('.rail'), me = document.getElementById('meta');
      if (rl.offsetWidth && parseFloat(getComputedStyle(rl).borderRightWidth) > 0) { var a = rl.getBoundingClientRect(); out.push({ e: 'rail', x: a.right + half, top: a.top, bottom: a.bottom, alt: 'l' }); }
      if (me && me.offsetWidth && parseFloat(getComputedStyle(me).borderLeftWidth) > 0) { var b = me.getBoundingClientRect(); out.push({ e: 'meta', x: b.left - half, top: b.top, bottom: b.bottom, alt: 'r' }); }
      return out;
    }

    // floating buttons
    document.querySelectorAll('[data-float]').forEach(function (el) {
      var k = 'pos-' + el.getAttribute('data-float'), id = null, sx, sy, ox, oy, moved = false, endAt = 0;
      function saved() { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
      function save(v) { try { if (v) localStorage.setItem(k, JSON.stringify(v)); else localStorage.removeItem(k); } catch (e) {} }
      function apply() {
        var v = saved();
        if (!v || !desk.matches) {
          el.classList.remove('free', 'edge-l', 'edge-r', 'edge-t', 'edge-b', 'edge-line'); el.style.left = el.style.right = el.style.bottom = '';
          if (el === tab) { el.style.top = ''; placeApTab(); } else el.style.top = '';
          if (el !== tab) placeApTab();
          return;
        }
        if (!v.e) { save(null); return apply(); } // an old free-floating spot: start again from home
        var e = v.e, ln = null;
        if (e === 'rail' || e === 'meta') { ln = lines().filter(function (x) { return x.e === e; })[0]; if (!ln) e = e === 'rail' ? 'l' : 'r'; }
        el.classList.add('free'); el.classList.remove('tight', 'edge-l', 'edge-r', 'edge-t', 'edge-b', 'edge-line'); el.classList.add(ln ? 'edge-line' : 'edge-' + e);
        el.style.right = el.style.bottom = 'auto';
        var w = el.offsetWidth, h = el.offsetHeight, m = el === tab ? 0 : 12, W = document.documentElement.clientWidth, H = innerHeight;
        if (ln) {
          el.style.left = Math.round(ln.x - w / 2) + 'px';
          var lo = Math.max(8, ln.top), hi = Math.min(H - 8, ln.bottom) - h;
          el.style.top = (hi > lo ? clamp(v.t * H - h / 2, lo, hi) : clamp(v.t * H - h / 2, 8, H - h - 8)) + 'px';
          return;
        }
        v = { e: e, t: v.t };
        // pinned to the edge itself (right/bottom too), so hover padding never opens a gap
        el.style.left = el.style.top = 'auto';
        if (v.e === 'l' || v.e === 'r') { el.style[v.e === 'l' ? 'left' : 'right'] = m + 'px'; el.style.top = clamp(v.t * H - h / 2, 8, H - h - 8) + 'px'; }
        else { el.style[v.e === 't' ? 'top' : 'bottom'] = m + 'px'; el.style.left = clamp(v.t * W - w / 2, 8, W - w - 8) + 'px'; }
        if (el !== tab) placeApTab();
      }
      el.addEventListener('pointerdown', function (e) {
        if (!desk.matches || e.button !== 0) return;
        id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
        var r = el.getBoundingClientRect(); ox = sx - r.left; oy = sy - r.top;
      });
      window.addEventListener('pointermove', function (e) {
        if (e.pointerId !== id) return;
        if (!moved) {
          if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < 6) return;
          moved = true; el.classList.add('free', 'dragging'); el.classList.remove('tight');
          el.style.right = el.style.bottom = 'auto';
        }
        el.style.left = clamp(e.clientX - ox, 8, innerWidth - el.offsetWidth - 8) + 'px';
        el.style.top = clamp(e.clientY - oy, 8, innerHeight - el.offsetHeight - 8) + 'px';
      });
      function end(e) {
        if (e.pointerId !== id) return; id = null;
        if (!moved) return;
        el.classList.remove('dragging'); endAt = Date.now();
        // snap to the nearest edge of the screen, keeping the spot along that edge
        var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, W = document.documentElement.clientWidth, H = innerHeight;
        var d = { l: cx, r: W - cx, t: cy, b: H - cy }, e = 'l';
        // the Theme tab can also sit beside a column line
        if (el === tab) lines().forEach(function (x) { d[x.e] = Math.abs(cx - x.x); });
        Object.keys(d).forEach(function (k) { if (d[k] < d[e]) e = k; });
        var t = e === 't' || e === 'b' ? cx / W : cy / H;
        // home: the left edge for the Theme tab, the bottom-left corner for the Terminal button
        var home = el === tab ? e === 'l' : (e === 'b' && cx < 220) || (e === 'l' && cy > H - 160);
        save(home ? null : { e: e, t: t });
        apply();
      }
      window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
      el.addEventListener('click', function (e) { if (Date.now() - endAt < 250) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
      window.addEventListener('resize', apply);
      el._apply = apply;
      if (desk.addEventListener) desk.addEventListener('change', apply);
      apply();
    });

    // the tour button rides beside the Terminal button: on its right, or its left when the terminal sits on the right edge
    var fab = document.querySelector('.term-fab'), tb = document.querySelector('.tour-fab');
    window.placeTourBtn = function () {
      if (!fab || !tb || !fab.offsetWidth) return;
      var r = fab.getBoundingClientRect(), sz = Math.round(r.height), W = document.documentElement.clientWidth;
      tb.style.width = tb.style.height = sz + 'px';
      var left = fab.classList.contains('edge-r') || r.right + 8 + sz > W - 8 ? r.left - 8 - sz : r.right + 8;
      tb.style.left = Math.round(left) + 'px'; tb.style.top = Math.round(r.top) + 'px'; tb.style.bottom = 'auto';
      tb.classList.toggle('tip-below', r.top < 48);
      var cf = document.getElementById('cof');
      if (cf && cf.offsetHeight) {
        var below = fab.classList.contains('edge-t') || r.top - 8 - cf.offsetHeight < 8, onRight = fab.classList.contains('edge-r');
        cf.classList.toggle('below', below); cf.classList.toggle('right', onRight);
        cf.style.bottom = 'auto';
        cf.style.top = Math.round(below ? r.bottom + 8 : r.top - 8 - cf.offsetHeight) + 'px';
        cf.style.left = Math.round(onRight ? r.right - cf.offsetWidth : r.left) + 'px';
      }
    };
    var settle = function () { placeTourBtn(); setTimeout(placeTourBtn, 260); };
    addEventListener('resize', settle); addEventListener('pointermove', function () { if (fab.classList.contains('dragging')) placeTourBtn(); }, { passive: true });
    addEventListener('pointerup', settle);
    if (document.fonts) document.fonts.ready.then(settle);
    settle();

    // a drop line shared by sections and rail links
    var line = document.createElement('div'); line.className = 'drop-line'; line.hidden = true; document.body.appendChild(line);
    function showLine(y, r) { line.hidden = false; line.style.top = (y + scrollY) + 'px'; line.style.left = (r.left + scrollX) + 'px'; line.style.width = r.width + 'px'; }
    function nearest(slots, y) { var best = 0, d = Infinity; slots.forEach(function (s, i) { var dd = Math.abs(s.y - y); if (dd < d) { d = dd; best = i; } }); return best; }

    // sections: a grip beside each h2 that has sibling h2s
    var grip = document.createElement('button'); grip.type = 'button'; grip.className = 'sec-grip'; grip.hidden = true;
    grip.setAttribute('aria-label', 'Drag to move this section'); grip.title = 'Drag to move this section';
    document.body.appendChild(grip);
    var hover = null, drag = null;
    var heads = function (h) { return Array.prototype.filter.call(h.parentElement.children, function (c) { return c.tagName === 'H2'; }); };
    function block(h) {
      var out = [h], n = h.nextElementSibling;
      while (n && n.tagName !== 'H2' && !n.matches('.page-next, .note-next, script')) { out.push(n); n = n.nextElementSibling; }
      return out;
    }
    document.addEventListener('mouseover', function (e) {
      if (!desk.matches || drag || e.target === grip) return;
      var h = e.target.closest && e.target.closest('.page.on h2');
      if (!h || heads(h).length < 2) { if (!(e.target.closest && e.target.closest('.sec-grip'))) grip.hidden = true; return; }
      hover = h; var r = h.getBoundingClientRect();
      grip.style.top = (r.top + scrollY + r.height / 2 - 12) + 'px'; grip.style.left = (r.left + scrollX - 30) + 'px'; grip.hidden = false;
    });
    function slotsFor(h) {
      var hs = heads(h), last = block(hs[hs.length - 1]), end = last[last.length - 1];
      return hs.map(function (x) { return { y: x.getBoundingClientRect().top - 8, ref: x }; })
        .concat([{ y: end.getBoundingClientRect().bottom + 8, ref: end.nextSibling }]);
    }
    grip.addEventListener('pointerdown', function (e) {
      if (!hover || e.button !== 0) return;
      e.preventDefault(); grip.setPointerCapture(e.pointerId);
      drag = { h: hover, nodes: block(hover) };
      drag.nodes.forEach(function (n) { n.classList.add('sec-lift'); });
      document.documentElement.classList.add('is-dragging');
    });
    grip.addEventListener('pointermove', function (e) {
      if (!drag) return;
      if (e.clientY < 70) scrollBy(0, -14); else if (e.clientY > innerHeight - 70) scrollBy(0, 14);
      var slots = slotsFor(drag.h); drag.slot = slots[nearest(slots, e.clientY)];
      showLine(drag.slot.y, drag.h.parentElement.getBoundingClientRect());
      var r = drag.h.getBoundingClientRect(); grip.style.top = (e.clientY + scrollY - 12) + 'px'; grip.style.left = (r.left + scrollX - 30) + 'px';
    });
    function secEnd() {
      if (!drag) return;
      var d = drag; drag = null; line.hidden = true; grip.hidden = true;
      document.documentElement.classList.remove('is-dragging');
      d.nodes.forEach(function (n) { n.classList.remove('sec-lift'); });
      var ref = d.slot && d.slot.ref;
      if (!d.slot || ref === d.h || d.nodes.indexOf(ref) >= 0 || ref === d.nodes[d.nodes.length - 1].nextElementSibling && ref && ref.tagName === 'H2') return;
      var parent = d.h.parentElement;
      d.nodes.forEach(function (n) { parent.insertBefore(n, ref); });
      d.nodes.forEach(function (n) { n.classList.add('sec-moved'); setTimeout(function () { n.classList.remove('sec-moved'); }, 700); });
      fixedOrder();
    }
    grip.addEventListener('pointerup', secEnd); grip.addEventListener('pointercancel', secEnd);

    // rail: drag a page link to reorder the pages
    var rail = document.querySelector('.rail'), rd = null, railEnd = 0;
    rail.addEventListener('dragstart', function (e) { if (e.target.closest && e.target.closest('a.nav')) e.preventDefault(); });
    rail.addEventListener('pointerdown', function (e) {
      var a = e.target.closest('a.nav'); if (!a || !desk.matches || e.button !== 0) return;
      rd = { li: a.parentElement, a: a, id: e.pointerId, y: e.clientY, on: false };
    });
    window.addEventListener('pointermove', function (e) {
      if (!rd || e.pointerId !== rd.id) return;
      if (!rd.on) { if (Math.abs(e.clientY - rd.y) < 6) return; rd.on = true; rd.li.classList.add('sec-lift'); document.documentElement.classList.add('is-dragging'); }
      var lis = Array.prototype.filter.call(rail.querySelectorAll('ol > li'), function (l) { return l.offsetHeight; });
      var slots = [];
      lis.forEach(function (l) { var r = l.getBoundingClientRect(); slots.push({ y: r.top, ref: l, ol: l.parentElement }); });
      lis.forEach(function (l, i) { if (!lis[i + 1] || lis[i + 1].parentElement !== l.parentElement) { var r = l.getBoundingClientRect(); slots.push({ y: r.bottom, ref: null, ol: l.parentElement }); } });
      rd.slot = slots[nearest(slots, e.clientY)];
      showLine(rd.slot.y, rd.slot.ol.getBoundingClientRect());
    });
    function railStop(e) {
      if (!rd || e.pointerId !== rd.id) return;
      var d = rd; rd = null; if (!d.on) return;
      line.hidden = true; railEnd = Date.now();
      document.documentElement.classList.remove('is-dragging'); d.li.classList.remove('sec-lift');
      if (d.slot && d.slot.ref !== d.li) { d.slot.ol.insertBefore(d.li, d.slot.ref); d.li.classList.add('sec-moved'); setTimeout(function () { d.li.classList.remove('sec-moved'); }, 700); fixedOrder(); placeApTab(); }
    }
    window.addEventListener('pointerup', railStop); window.addEventListener('pointercancel', railStop);
    rail.addEventListener('click', function (e) { if (Date.now() - railEnd < 250) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  })();

  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var done = function () { b.textContent = 'copied'; setTimeout(function () { b.textContent = 'copy'; }, 1500); };
      try {
        navigator.clipboard.writeText(text).then(done, function () { select(b.previousSibling); });
      } catch (err) { select(b.previousSibling); }
    });
  });
  function select(node) {
    var r = document.createRange(); r.selectNodeContents(node);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
})();

// READING PROGRESS: on a note, a thin line along the top of the screen fills as you read, and a small label counts down the minutes left
// (230 words a minute, the same as the note's Properties). It sits under the phone's top bar and lines up with the note's right edge.
(function () {
  var bar = document.createElement('div'), mtop = document.getElementById('m-top'), queued = false;
  bar.className = 'readbar'; bar.setAttribute('aria-hidden', 'true'); bar.hidden = true; bar.innerHTML = '<i></i><span></span>';
  document.body.appendChild(bar);
  var label = bar.lastChild;
  function update() {
    queued = false;
    var note = document.querySelector('.page.obs.on'), view = note && note.querySelector('.obs-view');
    if (!view) { bar.hidden = true; return; }
    if (!view.dataset.min) view.dataset.min = Math.max(1, Math.round(view.textContent.replace(/\s+/g, ' ').trim().split(' ').length / 230));
    var top = mtop && mtop.offsetHeight ? Math.max(0, mtop.getBoundingClientRect().bottom) : 0;
    var r = view.getBoundingClientRect(), span = r.height - (innerHeight - top);
    var f = span > 0 ? Math.min(1, Math.max(0, (top - r.top) / span)) : 1;
    var left = Math.ceil(view.dataset.min * (1 - f) - 0.05);
    bar.style.setProperty('--rb', f.toFixed(4)); bar.style.setProperty('--rb-top', top + 'px');
    bar.style.setProperty('--rb-right', Math.max(8, innerWidth - note.getBoundingClientRect().right + 8) + 'px');
    label.textContent = left > 0 ? left + ' min left' : '';
    bar.hidden = false;
  }
  function soon() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  addEventListener('scroll', soon, { passive: true }); addEventListener('resize', soon);
  addEventListener('hashchange', function () { setTimeout(soon, 0); });
  soon();
})();
