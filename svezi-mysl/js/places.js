/* Svěží mysl — cesta po Česku: zastávky, hry, které v nich přibývají, a pohlednice. */
(function () {
  'use strict';
  const SM = window.SM;

  let uid = 0;
  const sky = (id, top, bottom) =>
    '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bottom + '"/></linearGradient></defs>' +
    '<rect width="320" height="200" fill="url(#' + id + ')"/>';
  const pines = (list, color) => list.map((p) => {
    const x = p[0], y = p[1], s = p[2] || 1;
    return '<path fill="' + color + '" d="M' + x + ' ' + (y - 34 * s) + 'l' + 12 * s + ' ' + 18 * s + 'h' + -6 * s + 'l' + 9 * s + ' ' + 14 * s + 'h' + -30 * s + 'l' + 9 * s + ' ' + -14 * s + 'h' + -6 * s + 'z"/>';
  }).join('');
  const roundTrees = (list, color) => list.map((p) =>
    '<rect x="' + (p[0] - 2) + '" y="' + (p[1] - 6) + '" width="4" height="10" fill="#6b4f36"/><circle cx="' + p[0] + '" cy="' + (p[1] - 14) + '" r="' + (p[2] || 11) + '" fill="' + color + '"/>').join('');

  /* Jednoduché ilustrace pohlednic (320 × 200). */
  const SCENES = {
    praha(id) {
      let arches = '';
      for (let i = 0; i < 7; i++) {
        const x1 = -6 + i * 48, x2 = x1 + 40, mid = (x1 + x2) / 2;
        arches += '<path d="M' + x1 + ' 182 Q' + mid + ' 146 ' + x2 + ' 182Z" fill="#4f7fa3"/>';
      }
      let statues = '';
      for (let x = 14; x < 260; x += 30) statues += '<rect x="' + x + '" y="129" width="4" height="11" rx="1" fill="#4a423b"/>';
      return sky(id, '#8fb8de', '#f6d2b0') +
        '<circle cx="250" cy="66" r="18" fill="#fbe3a1" opacity=".9"/>' +
        '<path d="M0 116Q70 92 150 98T320 108V200H0Z" fill="#6b8a7a"/>' +
        '<rect x="56" y="86" width="150" height="16" fill="#ece5d3"/><rect x="56" y="82" width="150" height="5" fill="#5d6b73"/>' +
        '<rect x="148" y="72" width="40" height="16" fill="#d9d2c0"/>' +
        '<rect x="138" y="50" width="12" height="38" fill="#4d5a61"/><path d="M137 50l7-20 7 20z" fill="#3d484e"/>' +
        '<rect x="160" y="60" width="7" height="14" fill="#4d5a61"/><path d="M159 60l4.5-14 4.5 14z" fill="#3d484e"/>' +
        '<rect x="175" y="60" width="7" height="14" fill="#4d5a61"/><path d="M174 60l4.5-14 4.5 14z" fill="#3d484e"/>' +
        '<rect y="148" width="320" height="52" fill="#5f8fb4"/>' +
        '<rect x="-4" y="138" width="328" height="44" fill="#8a7f72"/>' + arches + statues +
        '<rect x="266" y="92" width="32" height="48" fill="#6d6259"/><path d="M262 92l20-32 20 32z" fill="#3f3a36"/>' +
        '<rect x="276" y="104" width="12" height="16" rx="6" fill="#3f3a36"/>' +
        '<path d="M0 190h320" stroke="#7fa9c9" stroke-width="3" opacity=".6"/>';
    },
    vary(id) {
      let cols = '';
      for (let x = 42; x <= 276; x += 18) cols += '<rect x="' + x + '" y="116" width="7" height="26" fill="#f6f2ea"/>';
      return sky(id, '#a8d4f0', '#eaf5fb') +
        '<path d="M0 104C60 66 120 88 170 78S270 56 320 82V200H0Z" fill="#4f7d5c"/>' +
        '<path d="M0 124C70 100 140 116 200 104S290 96 320 108V200H0Z" fill="#6a9a74"/>' +
        '<rect x="30" y="104" width="260" height="13" fill="#d8ccb6"/><rect x="26" y="100" width="268" height="5" fill="#bfae92"/>' +
        cols + '<rect x="30" y="141" width="260" height="11" fill="#e6dccb"/>' +
        '<rect y="152" width="320" height="48" fill="#cfc4b2"/>' +
        '<ellipse cx="160" cy="160" rx="30" ry="7" fill="#bfe3f2"/>' +
        '<g fill="#ffffff" opacity=".8"><circle cx="160" cy="138" r="9"/><circle cx="151" cy="122" r="10"/><circle cx="168" cy="108" r="9"/><circle cx="158" cy="92" r="8"/><circle cx="166" cy="78" r="6"/></g>';
    },
    krumlov(id) {
      let houses = '';
      const hx = [[20, 120], [56, 126], [92, 118], [128, 128], [236, 124], [272, 118]];
      hx.forEach((p, i) => {
        houses += '<rect x="' + p[0] + '" y="' + p[1] + '" width="34" height="' + (160 - p[1]) + '" fill="' + (i % 2 ? '#f2e6cf' : '#efd9b8') + '"/>' +
          '<path d="M' + (p[0] - 3) + ' ' + p[1] + 'l20-18 20 18z" fill="#c8553d"/>';
      });
      return sky(id, '#9fd0f2', '#eaf5fd') +
        '<path d="M0 110C80 88 160 100 230 86S300 92 320 96V200H0Z" fill="#7aa36d"/>' +
        houses +
        '<rect x="168" y="96" width="60" height="64" fill="#efe1c4"/><path d="M164 96l34-16 34 16z" fill="#b84d38"/>' +
        '<rect x="200" y="48" width="22" height="70" fill="#f1c6a6"/><rect x="196" y="58" width="30" height="12" fill="#e9d9a8"/>' +
        '<path d="M198 58Q211 26 224 58z" fill="#5a7f6e"/><rect x="210" y="22" width="2" height="12" fill="#5a7f6e"/>' +
        '<path d="M0 172C80 150 140 192 200 176S300 150 320 164V200H0Z" fill="#6fa7c9"/>';
    },
    kutna(id) {
      let rows = '';
      for (let i = 0; i < 7; i++) rows += '<path d="M' + (-20 + i * 50) + ' 200 L' + (30 + i * 50) + ' 152" stroke="#6f8a46" stroke-width="3"/>';
      let butt = '';
      for (let x = 92; x <= 246; x += 22) butt += '<path d="M' + x + ' 150V104l4-8 4 8v46z" fill="#c9bca3"/>';
      let win = '';
      for (let x = 104; x <= 232; x += 22) win += '<path d="M' + x + ' 140v-22a4 4 0 0 1 8 0v22z" fill="#8a7a66"/>';
      return sky(id, '#f4d9b0', '#fcf3e6') +
        '<rect y="150" width="320" height="50" fill="#8aa35c"/>' + rows +
        '<rect x="90" y="96" width="160" height="56" fill="#d9cdb6"/>' + butt + win +
        '<path d="M106 96l24-56 24 56z" fill="#5f5348"/><path d="M146 96l24-62 24 62z" fill="#54493f"/><path d="M186 96l24-56 24 56z" fill="#5f5348"/>' +
        '<rect x="129" y="30" width="2" height="12" fill="#5f5348"/><rect x="169" y="24" width="2" height="12" fill="#54493f"/><rect x="209" y="30" width="2" height="12" fill="#5f5348"/>';
    },
    olomouc(id) {
      const cols = ['#f2d7a6', '#e9b7a0', '#cfe0c3', '#f6e9c9', '#e7c9a9', '#d6e2ef'];
      let houses = '';
      for (let i = 0; i < 6; i++) {
        const x = i * 54 - 6;
        houses += '<rect x="' + x + '" y="104" width="52" height="56" fill="' + cols[i] + '"/><path d="M' + (x - 2) + ' 104l28-16 28 16z" fill="#a95b46"/>' +
          '<rect x="' + (x + 10) + '" y="116" width="9" height="12" fill="#6c5a4c"/><rect x="' + (x + 33) + '" y="116" width="9" height="12" fill="#6c5a4c"/>';
      }
      return sky(id, '#b9dcf3', '#eef7fd') +
        '<rect x="232" y="48" width="22" height="70" fill="#e8dcc4"/><path d="M229 48l14-26 14 26z" fill="#5d6b6f"/>' +
        houses +
        '<rect y="160" width="320" height="40" fill="#d9d2c4"/>' +
        '<rect x="118" y="146" width="56" height="16" fill="#e8e0cc"/><rect x="126" y="132" width="40" height="16" fill="#efe7d3"/>' +
        '<path d="M140 132l4-84h4l4 84z" fill="#f1eadb"/><circle cx="146" cy="44" r="7" fill="#e3b341"/>' +
        '<path d="M146 30v28M132 44h28" stroke="#e3b341" stroke-width="2"/>';
    },
    krkonose(id) {
      return sky(id, '#8ec3ea', '#e3f1fb') +
        '<path d="M0 128L60 92L110 118L170 66L212 98L262 82L320 112V200H0Z" fill="#8aa6bf"/>' +
        '<path d="M148 86L170 66L192 82L184 87L172 78L160 90Z" fill="#ffffff"/>' +
        '<rect x="165" y="59" width="10" height="8" fill="#5d6f7d"/>' +
        '<path d="M0 150C60 126 120 140 170 130S270 120 320 134V200H0Z" fill="#4f7a57"/>' +
        pines([[24, 186, 1], [54, 192, 1.2], [88, 184, .9], [232, 188, 1.1], [266, 192, 1.3], [300, 184, 1]], '#2f5a3c');
    },
    lednice(id) {
      let battl = '';
      for (let x = 72; x < 210; x += 10) battl += '<rect x="' + x + '" y="84" width="6" height="7" fill="#f2efe6"/>';
      return sky(id, '#b6dbf0', '#f1f8fc') +
        '<rect y="138" width="320" height="62" fill="#79a75f"/>' +
        '<ellipse cx="150" cy="176" rx="96" ry="13" fill="#8cc3dc"/>' +
        '<rect x="72" y="90" width="138" height="50" fill="#f2efe6"/>' + battl +
        '<rect x="64" y="68" width="18" height="72" fill="#ebe6da"/><path d="M62 68l11-14 11 14z" fill="#8a8f93"/>' +
        '<rect x="200" y="68" width="18" height="72" fill="#ebe6da"/><path d="M198 68l11-14 11 14z" fill="#8a8f93"/>' +
        '<rect x="132" y="58" width="18" height="34" fill="#ebe6da"/><path d="M130 58l11-16 11 16z" fill="#8a8f93"/>' +
        '<g fill="#7b8794"><rect x="92" y="104" width="7" height="14" rx="3"/><rect x="112" y="104" width="7" height="14" rx="3"/><rect x="164" y="104" width="7" height="14" rx="3"/><rect x="184" y="104" width="7" height="14" rx="3"/></g>' +
        '<rect x="264" y="40" width="9" height="100" fill="#e9e2d2"/><rect x="261" y="70" width="15" height="4" fill="#d4ccbb"/><rect x="261" y="96" width="15" height="4" fill="#d4ccbb"/>' +
        '<circle cx="268.5" cy="38" r="5" fill="#c9c1ad"/>' +
        roundTrees([[30, 150, 14], [236, 152, 12], [300, 150, 15]], '#4e8a4a');
    },
    telc(id) {
      const cols = ['#f6d38b', '#f2a98f', '#b9d8c2', '#f4e7c4', '#c9b7e3', '#f0c2c9'];
      let houses = '';
      for (let i = 0; i < 6; i++) {
        const x = i * 54 - 4, w = 52;
        houses += '<path d="M' + x + ' 140V86Q' + (x + 8) + ' 86 ' + (x + 10) + ' 74L' + (x + w / 2) + ' 50L' + (x + w - 10) + ' 74Q' + (x + w - 8) + ' 86 ' + (x + w) + ' 86V140Z" fill="' + cols[i] + '"/>' +
          '<rect x="' + (x + 12) + '" y="96" width="9" height="13" fill="#6c5a4c"/><rect x="' + (x + 31) + '" y="96" width="9" height="13" fill="#6c5a4c"/>' +
          '<rect x="' + x + '" y="140" width="' + w + '" height="30" fill="' + cols[i] + '"/><path d="M' + (x + 6) + ' 170v-14a10 10 0 0 1 20 0v14zM' + (x + 28) + ' 170v-14a10 10 0 0 1 20 0v14z" fill="#7b6a58"/>';
      }
      return sky(id, '#a9d5f1', '#edf7fd') + houses + '<rect y="170" width="320" height="30" fill="#d9cfbf"/>';
    },
    trebon(id) {
      let reeds = '';
      [[18, 1], [30, 1.2], [44, .9], [276, 1.1], [290, 1], [304, 1.3]].forEach((r) => {
        reeds += '<path d="M' + r[0] + ' 200V' + (200 - 46 * r[1]) + '" stroke="#4c6b3c" stroke-width="3"/><ellipse cx="' + r[0] + '" cy="' + (196 - 46 * r[1]) + '" rx="3.5" ry="9" fill="#7a5a3a"/>';
      });
      return sky(id, '#f4a87c', '#fde6c8') +
        '<circle cx="214" cy="112" r="24" fill="#fbd27a"/>' +
        '<path d="M0 124Q20 112 40 120T80 116T120 122T160 114T200 120T240 114T280 120T320 116V132H0Z" fill="#3f5e4a"/>' +
        '<rect y="130" width="320" height="70" fill="#7fa8c4"/>' +
        '<g fill="#f9d79a" opacity=".75"><rect x="190" y="140" width="48" height="3" rx="1.5"/><rect x="198" y="150" width="32" height="3" rx="1.5"/><rect x="204" y="160" width="20" height="3" rx="1.5"/></g>' +
        '<path d="M96 156h40l-6 8h-28z" fill="#5b4632"/><rect x="114" y="140" width="2" height="16" fill="#5b4632"/>' + reeds;
    },
    brno(id) {
      let roofs = '';
      for (let i = 0; i < 9; i++) roofs += '<rect x="' + (i * 36 - 4) + '" y="156" width="32" height="44" fill="' + (i % 2 ? '#e8dcc6' : '#f1e6d2') + '"/><path d="M' + (i * 36 - 6) + ' 156l18-12 18 12z" fill="#b5654c"/>';
      return sky(id, '#b3d4ee', '#eef6fc') +
        '<path d="M0 140C30 112 80 104 130 118S170 140 190 146V200H0Z" fill="#6e9a6a"/>' +
        '<path d="M150 150C180 96 230 78 280 84S320 100 320 110V200H150Z" fill="#5f8d60"/>' +
        '<rect x="66" y="98" width="46" height="30" fill="#ddd6c6"/>' +
        '<rect x="72" y="50" width="8" height="50" fill="#4b4f58"/><path d="M71 50l5-26 5 26z" fill="#3b3f47"/>' +
        '<rect x="98" y="50" width="8" height="50" fill="#4b4f58"/><path d="M97 50l5-26 5 26z" fill="#3b3f47"/>' +
        '<rect x="196" y="76" width="96" height="20" fill="#e7e1d2"/><rect x="196" y="72" width="96" height="5" fill="#9a6b4f"/>' +
        '<rect x="236" y="58" width="14" height="20" fill="#e7e1d2"/><path d="M234 58l9-10 9 10z" fill="#9a6b4f"/>' + roofs;
    },
    litomysl(id) {
      let sgr = '';
      for (let y = 88; y < 124; y += 8) for (let x = 46; x < 274; x += 12) sgr += '<rect x="' + (x + ((y / 8) % 2) * 6) + '" y="' + y + '" width="10" height="6" fill="none" stroke="#c9bb9c" stroke-width="1"/>';
      let gables = '';
      for (let i = 0; i < 6; i++) {
        const x = 46 + i * 38;
        gables += '<path d="M' + x + ' 82v-10h6v-8h6v-8h12v8h6v8h6v10z" fill="#efe6d2"/>';
      }
      let arc = '';
      for (let x = 50; x < 270; x += 22) arc += '<path d="M' + x + ' 150v-14a8 8 0 0 1 16 0v14z" fill="#8c7c63"/>';
      return sky(id, '#b8dcf2', '#f1f8fd') +
        gables + '<rect x="40" y="82" width="240" height="70" fill="#efe6d2"/>' + sgr + arc +
        '<rect y="150" width="320" height="50" fill="#8bb46c"/>' +
        roundTrees([[18, 168, 13], [302, 170, 14]], '#4e8a4a');
    },
    svycarsko(id) {
      return sky(id, '#a5d0ee', '#eaf5fc') +
        '<path d="M0 130C60 104 120 118 170 108S280 96 320 112V200H0Z" fill="#77a27a"/>' +
        '<path fill="#c98f5a" fill-rule="evenodd" d="M86 174L92 84Q98 58 132 56L226 58Q252 60 256 86L262 174ZM124 174V112Q130 84 170 84Q214 86 220 114V174Z"/>' +
        '<g stroke="#b07a49" stroke-width="2"><path d="M96 98h24M232 96h20M98 140h20M226 136h26M140 66h60"/></g>' +
        '<path d="M0 168C60 150 120 160 170 152S270 146 320 156V200H0Z" fill="#5a8a62"/>' +
        pines([[20, 196, 1.1], [48, 200, 1.3], [140, 198, 1], [196, 200, 1.2], [286, 198, 1.2], [310, 200, 1]], '#2f5a3c');
    },
    sumava(id) {
      return sky(id, '#a9cbe6', '#eef4f1') +
        '<path d="M0 96L46 74L84 88L128 62L170 80L214 66L262 86L320 70V200H0Z" fill="#8fa9a0"/>' +
        '<path d="M126 132C150 104 176 70 204 64C236 58 262 76 284 92C300 104 312 114 320 118V140H126Z" fill="#5b7868"/>' +
        '<path d="M206 70l-8 20 12 8-6 16M246 76l-4 16 10 10M276 92l-6 14" fill="none" stroke="#4a6455" stroke-width="2.5" stroke-linecap="round"/>' +
        pines([[150, 128, .8], [170, 124, .9], [190, 116, .8], [298, 124, .9], [316, 128, .8]], '#36574a') +
        '<path d="M0 118C34 108 70 110 100 118L126 132H0Z" fill="#4c6b58"/>' +
        pines([[10, 128, 1], [32, 124, 1.1], [56, 126, .9], [80, 128, 1], [104, 132, .9]], '#2f5040') +
        '<path d="M0 132H320V172H0Z" fill="#2d4c5c"/>' +
        '<path d="M150 134c20 8 40 10 70 6s50-2 70 4" fill="none" stroke="#5f8496" stroke-width="2" opacity=".55"/>' +
        '<path d="M24 146h64M120 152h96M44 162h52M236 158h56" stroke="#7da3b4" stroke-width="2" stroke-linecap="round" opacity=".55"/>' +
        '<path d="M0 170C60 162 130 164 180 170S280 174 320 166V200H0Z" fill="#5d7f4f"/>' +
        '<ellipse cx="98" cy="176" rx="15" ry="6" fill="#8b928a"/><ellipse cx="122" cy="181" rx="9" ry="4.5" fill="#9aa199"/><ellipse cx="226" cy="178" rx="12" ry="5" fill="#8b928a"/>' +
        pines([[16, 200, 1.6], [46, 204, 1.9], [282, 202, 1.7], [310, 204, 1.5]], '#24402f');
    },
    kromeriz(id) {
      let cols = '';
      for (let x = 6; x < 320; x += 15) cols += '<rect x="' + x + '" y="104" width="6" height="28" fill="#f3ecdc"/>';
      let statues = '';
      for (let x = 22; x < 320; x += 60) statues += '<rect x="' + x + '" y="90" width="5" height="10" rx="2" fill="#bfb398"/>';
      let wins = '';
      [134, 176].forEach((x) => { wins += '<rect x="' + x + '" y="108" width="10" height="24" rx="5" fill="#8c7b5a"/>'; });
      let bushes = '';
      [[26, 176], [74, 182], [246, 182], [294, 176]].forEach((b) => { bushes += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="9" fill="#3f6f3e"/>'; });
      return sky(id, '#a9d3f0', '#f1f8fc') +
        '<rect y="98" width="320" height="7" fill="#d8caa9"/>' + statues + cols + '<rect y="130" width="320" height="6" fill="#d8caa9"/>' +
        '<rect y="136" width="320" height="64" fill="#86b46f"/>' +
        '<path d="M0 154h320M160 136v64" stroke="#eadfc4" stroke-width="7"/>' +
        '<ellipse cx="160" cy="176" rx="96" ry="14" fill="none" stroke="#eadfc4" stroke-width="6"/>' +
        '<path d="M30 164h80M210 164h80M40 190h70M210 190h70" stroke="#4f8a4a" stroke-width="8" stroke-linecap="round"/>' + bushes +
        '<rect x="124" y="94" width="72" height="44" fill="#f4ecda"/>' +
        '<path d="M116 96h88l-6-7h-76z" fill="#d6c6a2"/>' +
        '<path d="M126 89a34 30 0 0 1 68 0z" fill="#5f9c8b"/>' +
        '<path d="M160 59v-3" stroke="#3f6e62" stroke-width="2"/>' +
        '<rect x="154" y="44" width="12" height="15" fill="#f4ecda"/><path d="M151 46h18l-9-11z" fill="#5f9c8b"/>' +
        wins + '<rect x="154" y="120" width="12" height="18" rx="6" fill="#6f6045"/>';
    }
  };

  const UNITS = [
    { id: 'praha', gen: 'Prahy', name: 'Praha', color: '#2f6487', intro: ['pexeso', 'jiny', 'sipky', 'prislovi'],
      fact: 'Karlův most se začal stavět v roce 1357 za vlády Karla IV. Zdobí ho 30 soch a sousoší.' },
    { id: 'vary', gen: 'Karlových Varů', name: 'Karlovy Vary', color: '#6d5290', intro: ['hodiny', 'nakup', 'sber'],
      fact: 'Vřídlo je nejteplejší karlovarský pramen. Voda z něj tryská s teplotou kolem 73 °C.' },
    { id: 'krumlov', gen: 'Českého Krumlova', name: 'Český Krumlov', color: '#9c432c', intro: ['blesk', 'protiklady', 'placeni'],
      fact: 'Historické centrum Českého Krumlova je od roku 1992 na seznamu UNESCO. Nad městem se tyčí barevná zámecká věž.' },
    { id: 'kutna', gen: 'Kutné Hory', name: 'Kutná Hora', color: '#6f5629', intro: ['okna', 'barvy', 'rada'],
      fact: 'Chrám svaté Barbory je zasvěcený patronce horníků. Kutná Hora zbohatla díky stříbrným dolům.' },
    { id: 'olomouc', gen: 'Olomouce', name: 'Olomouc', color: '#2a6d5d', intro: ['jmena', 'kolik', 'presmycky'],
      fact: 'Sloup Nejsvětější Trojice v Olomouci je vysoký asi 35 metrů. Od roku 2000 patří k památkám UNESCO.' },
    { id: 'krkonose', gen: 'Krkonoš', name: 'Krkonoše', color: '#35628f', intro: ['telefon', 'poradi', 'tvary'],
      fact: 'Sněžka je se svými 1 603 metry nejvyšší horou Česka.' },
    { id: 'lednice', gen: 'Lednice', name: 'Lednice', color: '#44702c', intro: ['zmena', 'nepatri', 'mozaika'],
      fact: 'Zámecký park v Lednici zdobí minaret vysoký asi 60 metrů. Lednicko-valtický areál je od roku 1996 na seznamu UNESCO.' },
    { id: 'telc', gen: 'Telče', name: 'Telč', color: '#8c4f29', intro: ['retez', 'hadani'],
      fact: 'Náměstí v Telči lemují renesanční a barokní domy s podloubím. Od roku 1992 je památkou UNESCO.' },
    { id: 'trebon', gen: 'Třeboně', name: 'Třeboň', color: '#2a6370', intro: ['rodina', 'vyhodne'],
      fact: 'U Třeboně leží Rožmberk, největší rybník v Česku. V 16. století ho založil rybníkář Jakub Krčín.' },
    { id: 'brno', gen: 'Brna', name: 'Brno', color: '#7c3f50', intro: ['kulicka', 'byt'],
      fact: 'Nad Brnem se tyčí hrad Špilberk a katedrála na Petrově. Její zvony odbíjejí poledne už v 11 hodin.' },
    { id: 'litomysl', gen: 'Litomyšle', name: 'Litomyšl', color: '#5c4d80', intro: ['dvojice', 'osmismerka'],
      fact: 'V Litomyšli se v roce 1824 narodil skladatel Bedřich Smetana. Zdejší zámek zdobí tisíce sgrafit.' },
    { id: 'svycarsko', gen: 'Českého Švýcarska', name: 'České Švýcarsko', color: '#86501f', intro: ['sudoku', 'pyramida'],
      fact: 'Pravčická brána je největší přírodní pískovcová brána v Evropě.' },
    { id: 'sumava', gen: 'Šumavy', name: 'Šumava', color: '#2f5d50', intro: ['podnos', 'sumy'],
      fact: 'Černé jezero na Šumavě je největší a nejhlubší přírodní jezero v Česku. Je hluboké skoro 40 metrů.' },
    { id: 'kromeriz', gen: 'Kroměříže', name: 'Kroměříž', color: '#5d4a86', intro: ['trasa', 'cisla'],
      fact: 'Zámek a zahrady v Kroměříži jsou od roku 1998 na seznamu UNESCO. Květnou zahradu zdobí rotunda a dlouhá kolonáda se sochami.' }
  ];

  SM.places = {
    UNITS: UNITS,
    byId(id) { return UNITS.find((u) => u.id === id); },
    /** Ilustrace pohlednice jako SVG řetězec. */
    scene(id) {
      const fn = SCENES[id];
      uid++;
      return '<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustrace: ' +
        (SM.places.byId(id) || {}).name + '">' + (fn ? fn('sky-' + id + '-' + uid) : '') + '</svg>';
    }
  };
})();
