// REACTION TEST: the start lights, timed, and the challenge card. Moved out of app.js on 31 Oct 2026 so phones don't load it:
// app.js loads this file the first time the lights are asked for (terminal, search, the F1 pop-up, a ?beat= link), and on computers once the page is idle.
(function () {
  var SITE = window.__site.SITE;
  (function () {
    if (matchMedia('(max-width: 760px)').matches) return;
    var o = null, timers = [], state = '', t0 = 0, beat = 0;
    function best() { try { return +localStorage.getItem('rx-best') || 0; } catch (e) { return 0; } }
    function say(msg, sub, jump) {
      var m = o.querySelector('.rx-msg'); m.className = 'rx-msg' + (jump ? ' jump' : ''); m.innerHTML = msg;
      o.querySelector('.rx-sub').innerHTML = sub || '';
    }
    // The best time sits under the lights the whole time; it turns green and pulses when you beat it.
    // On a challenge, a second pill shows the time to beat.
    function showBest(isNew, won) {
      var b = best(), el = o.querySelector('.rx-best');
      el.className = 'rx-best' + (isNew ? ' new' : '');
      el.innerHTML = b ? '<small>' + (isNew ? 'New best' : 'Your best') + '</small><b>' + b + ' ms</b>' : '<small>Your best</small><b>—</b>';
      var tb = o.querySelector('.rx-beat'); tb.hidden = !beat;
      if (beat) { tb.className = 'rx-best rx-beat' + (won ? ' won' : ''); tb.innerHTML = '<small>' + (won ? 'Beaten' : 'To beat') + '</small><b>' + beat + ' ms</b>'; }
    }
    var keysLine = '<kbd>Space</kbd> to go again · <kbd>S</kbd> to share · <kbd>Esc</kbd> to close';
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function ready() {
      state = 'ready'; showBest(false, false);
      say('<b>' + beat + ' ms</b>Someone sent you a challenge. Beat their start.', 'Press <kbd>Space</kbd> or click to bring the lights up.');
    }
    function run() {
      clear(); state = 'on';
      var cols = o.querySelectorAll('.f1-rig span');
      cols.forEach(function (c) { c.classList.remove('on'); }); showBest(false, false);
      say('Wait for the lights to go out.', 'Click or press <kbd>Space</kbd> when they do.');
      // One light a beat, like a real start, then a hold you can't predict.
      cols.forEach(function (c, i) { timers.push(setTimeout(function () { c.classList.add('on'); }, 500 + i * 600)); });
      timers.push(setTimeout(function () {
        cols.forEach(function (c) { c.classList.remove('on'); });
        state = 'go'; t0 = performance.now();
      }, 500 + 4 * 600 + 600 + Math.round(400 + Math.random() * 2000)));
    }
    function hit() {
      if (state === 'ready') { run(); return; }
      if (state === 'on') {
        clear(); state = 'done';
        o.querySelectorAll('.f1-rig span').forEach(function (c) { c.classList.remove('on'); });
        say('<b>Jump start</b>You went before the lights went out.', 'In a race, that\'s a penalty. <kbd>Space</kbd> to go again · <kbd>Esc</kbd> to close', true);
        return;
      }
      if (state === 'go') {
        var ms = Math.round(performance.now() - t0), b = best(), isNew = !b || ms < b, won = beat && ms < beat;
        state = 'done';
        if (isNew) try { localStorage.setItem('rx-best', ms); } catch (e) {}
        if (ms < 250 && window.unlock) unlock('reaction');
        showBest(isNew, won);
        var line = beat ? (won ? 'You beat ' + beat + ' ms by ' + (beat - ms) + ' ms. Send it back.' : '+' + (ms - beat) + ' ms off the challenge.')
          : isNew ? 'F1 drivers usually react in about 200 ms.' : '+' + (ms - b) + ' ms off your best.';
        say('<b>' + ms + ' ms</b>' + line, '<button type="button" class="rx-share">Share ' + best() + ' ms</button>' + keysLine);
        return;
      }
      if (state === 'done') run();
    }
    function share() {
      var b = best(); if (!b || !window.shareCard) return;
      end(); setTimeout(function () { window.shareCard(timeCard(b)); }, 280);
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
      else if ((e.key === 's' || e.key === 'S') && state === 'done' && best()) { e.preventDefault(); share(); }
    }
    window.reactionTest = function (toBeat) {
      if (o) return;
      beat = toBeat || 0;
      o = document.createElement('div'); o.className = 'f1-lights rx'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Reaction test');
      o.innerHTML = '<div class="rx-box"><div class="f1-rig" aria-hidden="true">' + '<span><i></i><i></i></span>'.repeat(5) + '</div>' +
        '<div class="rx-pills"><p class="rx-best"></p><p class="rx-best rx-beat" hidden></p></div><p class="rx-msg" aria-live="polite"></p><p class="rx-sub"></p></div>';
      document.body.appendChild(o);
      o.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.rx-share')) { e.stopPropagation(); return; }
        if (e.button === 0) hit();
      });
      o.addEventListener('click', function (e) { if (e.target.closest('.rx-share')) share(); });
      document.addEventListener('keydown', key, true);
      if (document.activeElement) document.activeElement.blur();
      if (beat) ready(); else run();
    };

    // The challenge card: the best time, big, under a lit rig. Drawn by the share dialog's canvas in the current theme.
    function timeCard(ms) {
      var link = SITE + '?beat=' + ms;
      return {
        title: 'Share your time', file: 'ifti-start-' + ms + 'ms.png', url: link,
        said: ms + ' ms off the line on Ifti\'s start lights. Beat it.',
        paint: function (ctx, W, H, P) {
          P.frame('Ifti\'s notebook · Start lights');
          var wide = W > H, r = wide ? 26 : 34, gap = wide ? 14 : 18, colW = r * 2 + 16, rigW = 5 * colW + 4 * gap + 24, rigH = 2 * (r * 2) + 10 + 32;
          var rx = wide ? W - P.pad - rigW : P.pad, ry = wide ? P.pad + 80 : P.pad + 90;
          // the rig: five columns of two reds, all lit
          ctx.fillStyle = '#111'; ctx.fillRect(rx, ry, rigW, rigH);
          for (var c = 0; c < 5; c++) {
            var cx = rx + 12 + c * (colW + gap);
            ctx.fillStyle = '#050505'; ctx.fillRect(cx, ry + 12, colW, rigH - 24);
            for (var k = 0; k < 2; k++) {
              var x = cx + colW / 2, y = ry + 16 + r + 4 + k * (r * 2 + 10);
              ctx.save(); ctx.shadowColor = 'rgba(225, 6, 0, 0.7)'; ctx.shadowBlur = r;
              var g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
              g.addColorStop(0, '#ff6b5e'); g.addColorStop(0.6, '#e10600'); g.addColorStop(1, '#8f0400');
              ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            }
          }
          var ty = wide ? P.pad + 330 : ry + rigH + 300, fs = wide ? 200 : 230;
          ctx.fillStyle = P.ink; ctx.font = 'italic 700 ' + fs + 'px ' + P.fDisp; ctx.fillText(String(ms), P.pad - 6, ty);
          var nw = ctx.measureText(String(ms)).width;
          ctx.font = 'italic 700 ' + Math.round(fs * 0.36) + 'px ' + P.fDisp; ctx.fillText('ms', P.pad + nw + 10, ty);
          ctx.fillStyle = P.mut; ctx.font = '500 ' + (wide ? 34 : 40) + 'px ' + P.fDisp; ctx.fillText('off the line. Can you beat it?', P.pad, ty + (wide ? 62 : 80));
          P.foot('F1 drivers usually react in about 200 ms.', link.replace('https://', '').replace(/\/$/, ''));
        }
      };
    }
  })();
})();
