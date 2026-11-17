/* Svěží mysl — jemné zvuky (Web Audio, bez souborů) a předčítání pokynů česky. */
(function () {
  'use strict';
  var SM = window.SM;
  var A = (SM.sound = {});
  var ctx = null;

  function enabled() { return SM.store.settings().sound !== false; }

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* nic */ } }
    return ctx;
  }

  // iOS pustí zvuk až po dotyku: odemkneme Web Audio při prvním doteku.
  function unlock() {
    if (!enabled()) return;
    var c = audio();
    if (c && c.state === 'running') {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    }
  }
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);

  function tone(freq, dur, opt) {
    if (!enabled()) return;
    var c = audio();
    if (!c) return;
    opt = opt || {};
    var t0 = c.currentTime + (opt.delay || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = opt.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    var peak = opt.gain || 0.16;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  A.correct = function () { tone(659, 0.16); tone(880, 0.26, { delay: 0.09 }); };
  A.wrong = function () { tone(233, 0.32, { type: 'triangle', gain: 0.14 }); };
  A.tap = function () { tone(523, 0.07, { gain: 0.08 }); };
  A.flip = function () { tone(392, 0.06, { gain: 0.06, type: 'triangle' }); };
  A.done = function () { [523, 659, 784].forEach(function (f, i) { tone(f, 0.3, { delay: i * 0.11 }); }); };
  A.levelUp = function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.32, { delay: i * 0.1 }); }); };
  // Pentatonika: každé okno v domě má svůj tón (pomáhá zapamatovat si pořadí).
  var SCALE = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093];
  A.note = function (i) { tone(SCALE[i % SCALE.length], 0.35, { gain: 0.12 }); };

  /* ----- Předčítání (Web Speech API, česky) ----- */
  var synth = window.speechSynthesis;
  A.canSpeak = !!(synth && typeof window.SpeechSynthesisUtterance !== 'undefined');
  var voice = null;
  function pickVoice() {
    if (!A.canSpeak) return null;
    var voices = synth.getVoices() || [];
    var cs = voices.filter(function (v) { return /^cs/i.test(v.lang); });
    if (!cs.length) return null;
    var better = cs.filter(function (v) { return /premium|enhanced|vylepšen/i.test(v.name); });
    return (better[0] || cs[0]);
  }
  if (A.canSpeak) {
    voice = pickVoice();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', function () { voice = pickVoice(); });
  }
  A.speak = function (text) {
    if (!A.canSpeak) return;
    try {
      synth.cancel();
      var u = new window.SpeechSynthesisUtterance(text);
      u.lang = 'cs-CZ';
      if (voice) u.voice = voice;
      u.rate = 0.9;
      synth.speak(u);
    } catch (e) { /* předčítání není k dispozici */ }
  };
  A.stopSpeaking = function () {
    if (!A.canSpeak) return;
    try { synth.cancel(); } catch (e) { /* nic */ }
  };
})();
