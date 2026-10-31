// TERMINAL: press ~ or click the Terminal button. Moved out of app.js on 31 Oct 2026 so phones don't load it with the page:
// app.js loads this file the first time the terminal opens, and on computers once the page is idle. Commands live in CMDS.
(function () {
  var S = window.__site, esc = S.esc, F1 = S.F1, f1When = S.f1When, THEMES = S.THEMES, THEME_DEFAULT = S.THEME_DEFAULT,
    pickTheme = S.pickTheme, lightsOut = S.lightsOut, STATS = S.STATS;
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
        if (!a) { print(THEMES.map(function (t) { return (t.id === S.cur ? '<span class="g">* ' : '  ') + t.id + (t.id === S.cur ? '</span>' : '') + '  <span class="c">' + esc((t.id === THEME_DEFAULT ? 'Today' : t.week) + ' · ' + t.note) + '</span>'; }).join('\n') + '\n<span class="c">theme &lt;name&gt; to switch</span>'); return; }
        var t = THEMES.filter(function (x) { return x.id === a || x.name.toLowerCase() === a.toLowerCase(); })[0];
        if (!t) { line('theme: no theme ' + a + '. Try theme.', 'r'); return; }
        var was = S.cur; pickTheme(t.id); line('Switched to ' + t.name + '.', 'g'); if (t.id === 'lightsout' && was !== t.id) { close(); setTimeout(lightsOut, 250); }
      },
      book: function () { window.open(S.bookHref, '_blank', 'noopener'); line('Opening my calendar in a new tab.', 'g'); },
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
        if (/^hire( ifti)?$/i.test(raw)) { line('Permission granted. Opening my calendar.', 'g'); window.open(S.bookHref, '_blank', 'noopener'); }
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
    window.termToggle = function () { term.hidden ? open() : close(); }; // app.js calls this from the button and the ~ key
    window.addEventListener('hashchange', function () { if (!term.hidden) { ps.textContent = here() + ' $'; setTimeout(function () { input.focus({ preventScroll: true }); }, 0); } });
  })();
})();
