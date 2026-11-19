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
    },
    palava(id) {
      let vines = '';
      for (let i = 0; i < 10; i++) vines += '<path d="M' + (-40 + i * 40) + ' 204L' + (70 + i * 22) + ' 152" stroke="#5c8a3c" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 8"/>';
      return sky(id, '#a8d0ee', '#f4f1e2') +
        '<path d="M0 128L40 110L72 118L112 76L142 92L172 66L204 94L242 86L284 106L320 98V200H0Z" fill="#9fb58a"/>' +
        '<path d="M112 76L127 104L100 110ZM172 66L190 96L160 94ZM242 86L256 104L232 104Z" fill="#d3c9ae"/><path d="M112 84v18M176 74v20M246 92v10" stroke="#b5aa8c" stroke-width="2"/>' +
        '<path d="M163 68h18V54h-4v5h-3v-5h-3v5h-3v-5h-5z" fill="#8a7f6c"/>' +
        '<path d="M0 134C60 128 120 132 170 136S260 142 320 134V146H0Z" fill="#8cc3df"/>' +
        '<rect y="144" width="320" height="56" fill="#cbdc93"/>' + vines;
    },
    jested(id) {
      return sky(id, '#9ccaf0', '#eef6fb') +
        '<path d="M0 150L70 120L128 98L160 86L192 98L252 122L320 150V200H0Z" fill="#3f6b4a"/>' +
        pines([[40, 150, .8], [76, 136, .8], [104, 122, .7], [214, 124, .7], [244, 136, .8], [282, 150, .8]], '#2f5040') +
        '<path d="M0 172C80 152 140 158 200 164S290 170 320 162V200H0Z" fill="#5d8a5c"/>' +
        '<path d="M150 90C153 72 156 54 160 28C164 54 167 72 170 90Z" fill="#d3dade"/>' +
        '<path d="M160 28C164 54 167 72 170 90H160Z" fill="#aab4bb"/>' +
        '<path d="M160 28V10" stroke="#8a959c" stroke-width="2"/>' +
        '<rect x="144" y="88" width="32" height="6" rx="2" fill="#9aa4ab"/>' +
        pines([[18, 200, 1.5], [300, 200, 1.6]], '#24402f');
    },
    ostrava(id) {
      let spokes = '';
      for (let a = 0; a < 180; a += 45) {
        const r = a * Math.PI / 180;
        spokes += '<path d="M' + (262 - 11 * Math.cos(r)).toFixed(1) + ' ' + (54 - 11 * Math.sin(r)).toFixed(1) + 'L' + (262 + 11 * Math.cos(r)).toFixed(1) + ' ' + (54 + 11 * Math.sin(r)).toFixed(1) + '" stroke="#3f3f45" stroke-width="2"/>';
      }
      return sky(id, '#a9cbe6', '#f5ece0') +
        '<path d="M0 150C60 140 120 146 180 142S280 136 320 144V200H0Z" fill="#7a8f7a"/>' +
        '<rect x="18" y="98" width="96" height="54" fill="#7d6f66"/><ellipse cx="66" cy="98" rx="48" ry="9" fill="#93857b"/>' +
        '<path d="M18 112h96M18 126h96M18 140h96" stroke="#6a5d55" stroke-width="2"/>' +
        '<path d="M104 152L156 64" stroke="#5d5d63" stroke-width="5"/>' +
        '<path d="M146 152V70l8-26h16l8 26v82z" fill="#6e4b3d"/>' +
        '<path d="M150 84h24M148 104h28M148 124h28" stroke="#5a3d31" stroke-width="3"/>' +
        '<path d="M170 46c18 0 22 10 22 26v80" fill="none" stroke="#5d5d63" stroke-width="6"/>' +
        '<g fill="#ffffff" opacity=".75"><circle cx="164" cy="34" r="6"/><circle cx="172" cy="24" r="8"/><circle cx="184" cy="14" r="9"/></g>' +
        '<path d="M244 152L258 62M286 152L266 62M250 116h31M254 88h22" stroke="#3f3f45" stroke-width="4" fill="none"/>' +
        '<circle cx="262" cy="54" r="12" fill="none" stroke="#3f3f45" stroke-width="3"/>' + spokes +
        '<path d="M0 176C70 166 150 170 210 174S290 178 320 172V200H0Z" fill="#5f7a5c"/>';
    },
    karlstejn(id) {
      let wins = '';
      [[80, 104], [94, 104], [108, 104], [136, 84], [184, 64], [196, 64], [184, 90], [196, 90]].forEach((w) => { wins += '<rect x="' + w[0] + '" y="' + w[1] + '" width="6" height="9" rx="2" fill="#5d5249"/>'; });
      return sky(id, '#9fcbea', '#eef6fb') +
        '<path d="M0 142C50 122 100 112 150 106S260 114 320 126V200H0Z" fill="#5f8a5c"/>' +
        '<path d="M52 142L82 126h142l30 16z" fill="#cbbfa6"/>' +
        '<rect x="70" y="94" width="58" height="34" fill="#e8e0cd"/><path d="M66 96h66l-8-13H74z" fill="#6b5f57"/>' +
        '<rect x="128" y="74" width="26" height="54" fill="#ece4d2"/><path d="M125 76h32l-16-19z" fill="#58585f"/>' +
        '<rect x="176" y="50" width="34" height="78" fill="#efe7d6"/><path d="M172 52h42l-21-27z" fill="#4a4a52"/>' +
        wins +
        roundTrees([[30, 150, 12], [52, 156, 10], [250, 150, 12], [276, 156, 11], [300, 150, 10]], '#4f7a4a') +
        '<path d="M0 172C80 160 160 164 220 170S300 174 320 168V200H0Z" fill="#6e9a62"/>';
    },
    hluboka(id) {
      let towers = '';
      [[96, 70, 14], [150, 46, 18], [206, 64, 14], [240, 82, 12]].forEach((t) => {
        const x0 = t[0] - t[2] / 2;
        towers += '<rect x="' + x0 + '" y="' + t[1] + '" width="' + t[2] + '" height="' + (150 - t[1]) + '" fill="#f3efe6"/>' +
          '<rect x="' + (x0 - 2) + '" y="' + (t[1] - 4) + '" width="' + (t[2] + 4) + '" height="5" fill="#e2dccf"/>' +
          [0, 0.5, 1].map((k) => '<rect x="' + (x0 - 2 + k * (t[2])) + '" y="' + (t[1] - 9) + '" width="4" height="6" fill="#e2dccf"/>').join('');
      });
      let wins = '';
      for (let x = 82; x < 250; x += 16) wins += '<rect x="' + x + '" y="112" width="6" height="12" rx="3" fill="#7a8a96"/>';
      return sky(id, '#a7d1f0', '#f2f7fb') +
        '<path d="M0 156C60 140 120 134 170 134S270 142 320 152V200H0Z" fill="#6c9a5e"/>' +
        '<rect x="70" y="96" width="186" height="56" fill="#f6f2ea"/><path d="M68 96h190v-5h-4v3h-4v-3h-6v3h-4v-3h-6v3h-4v-3h-6v3h-4v-3H68z" fill="#e2dccf"/>' +
        towers + wins +
        roundTrees([[30, 164, 13], [56, 170, 11], [276, 166, 12], [300, 160, 13]], '#3f6e3c') +
        '<path d="M0 182C80 172 160 176 220 180S300 184 320 178V200H0Z" fill="#82ad6d"/>';
    },
    trebic(id) {
      let arc = '';
      for (let x = 108; x < 212; x += 13) arc += '<path d="M' + x + ' 128v-10a5 5 0 0 1 10 0v10z" fill="#9b8f80"/>';
      let houses = '';
      [[20, 150, '#e8cfa8'], [50, 146, '#f0dcc0'], [236, 148, '#ead2b2'], [268, 144, '#e4c9a0']].forEach((p) => {
        houses += '<rect x="' + p[0] + '" y="' + p[1] + '" width="28" height="' + (176 - p[1]) + '" fill="' + p[2] + '"/><path d="M' + (p[0] - 3) + ' ' + p[1] + 'l17-14 17 14z" fill="#a4553f"/>';
      });
      return sky(id, '#a6cfee', '#f1f6fa') +
        '<path d="M0 150C70 136 140 132 200 136S290 144 320 146V200H0Z" fill="#7aa267"/>' +
        '<rect x="100" y="92" width="120" height="58" fill="#cdbfa8"/><path d="M96 94h128l-12-16H108z" fill="#7d5d4b"/>' +
        '<rect x="196" y="52" width="26" height="98" fill="#c7b89f"/><path d="M192 54h34l-17-24z" fill="#5c4b40"/>' +
        '<rect x="102" y="66" width="22" height="84" fill="#c7b89f"/><path d="M98 68h30l-15-22z" fill="#5c4b40"/>' +
        arc + '<circle cx="160" cy="106" r="7" fill="#8a7d6c"/>' + houses +
        '<path d="M0 178C80 168 160 172 220 176S300 180 320 174V200H0Z" fill="#8ab274"/>';
    },
    plzen(id) {
      let houses = '';
      [[14, 132, '#e9c99c'], [46, 138, '#efd8b5'], [222, 136, '#e6cfa6'], [254, 130, '#f0dcbb'], [286, 138, '#e3c597']].forEach((p) => {
        houses += '<rect x="' + p[0] + '" y="' + p[1] + '" width="30" height="' + (178 - p[1]) + '" fill="' + p[2] + '"/><path d="M' + (p[0] - 2) + ' ' + p[1] + 'l17-13 17 13z" fill="#9c4f3a"/>' +
          '<rect x="' + (p[0] + 6) + '" y="' + (p[1] + 8) + '" width="6" height="8" fill="#6f7b84"/><rect x="' + (p[0] + 18) + '" y="' + (p[1] + 8) + '" width="6" height="8" fill="#6f7b84"/>';
      });
      return sky(id, '#a8d0ee', '#f3f7fa') +
        '<rect y="150" width="320" height="50" fill="#b9ad98"/>' +
        '<path d="M96 178V100h86v78z" fill="#d8cdb8"/><path d="M92 102h94l-10-18H102z" fill="#4f5a62"/>' +
        '<rect x="104" y="112" width="10" height="26" rx="5" fill="#7a8794"/><rect x="164" y="112" width="10" height="26" rx="5" fill="#7a8794"/>' +
        '<rect x="128" y="34" width="22" height="144" fill="#d2c6ae"/><path d="M124 36h30l-15-30z" fill="#3f4a52"/>' +
        '<rect x="134" y="52" width="10" height="20" rx="5" fill="#7a8794"/><circle cx="139" cy="88" r="6" fill="#f2efe6" stroke="#7a8794" stroke-width="2"/>' +
        houses;
    },
    zdar(id) {
      // Zelená hora: poutní kostel ve tvaru hvězdy uprostřed ambitu na zeleném kopci.
      let gates = '';
      [[86, 166], [160, 175], [234, 166]].forEach((p) => {
        gates += '<rect x="' + (p[0] - 8) + '" y="' + (p[1] - 14) + '" width="16" height="16" fill="#f3eee3"/><path d="M' + (p[0] - 10) + ' ' + (p[1] - 13) + 'l10-11 10 11z" fill="#a4553f"/>';
      });
      const star = (x, y, r) => {
        let d = '';
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r;
          d += (i ? 'L' : 'M') + (x + q * Math.cos(a)).toFixed(1) + ' ' + (y + q * Math.sin(a)).toFixed(1);
        }
        return '<path d="' + d + 'Z" fill="#e8c35a"/>';
      };
      return sky(id, '#a9d3f0', '#f4f8fb') +
        '<path d="M0 132C60 118 120 124 170 120S270 112 320 124V200H0Z" fill="#9cc48f"/>' +
        '<path d="M0 176C50 150 110 132 160 130S270 150 320 172V200H0Z" fill="#6fa25f"/>' +
        '<ellipse cx="160" cy="150" rx="120" ry="28" fill="#a4553f"/><ellipse cx="160" cy="154" rx="117" ry="25" fill="#efe8da"/>' +
        '<ellipse cx="160" cy="150" rx="101" ry="17" fill="#80b26d"/>' +
        '<path d="M112 152l9-34 11 34zM188 152l11-34 9 34z" fill="#ebe4d6"/>' +
        '<path d="M128 152V104l10-12 10 12 12-14 12 14 10-12 10 12v48z" fill="#f6f3ec" stroke="#cbc3b2" stroke-width="1.5"/>' +
        '<path d="M136 92Q160 50 184 92z" fill="#4f7468"/>' +
        '<rect x="155" y="58" width="10" height="15" fill="#f6f3ec"/><path d="M153 59Q160 48 167 59z" fill="#4f7468"/>' + star(160, 43, 7) +
        '<rect x="139" y="112" width="6" height="16" rx="3" fill="#7d8a93"/><rect x="157" y="108" width="6" height="18" rx="3" fill="#7d8a93"/><rect x="175" y="112" width="6" height="16" rx="3" fill="#7d8a93"/>' +
        '<path d="M40 150A120 28 0 0 0 280 150L261 150A101 17 0 0 1 59 150Z" fill="#efe8da"/><path d="M59 150A101 17 0 0 0 261 150" fill="none" stroke="#a4553f" stroke-width="4"/>' +
        gates + roundTrees([[18, 186, 13], [44, 190, 10], [296, 186, 13], [272, 192, 10]], '#4f8a4a');
    },
    kras(id) {
      // Moravský kras: propast Macocha s lávkou nahoře a lodičkou na podzemní říčce dole.
      const g = id + '-hloubka';
      return sky(id, '#a7cdea', '#eef5f9') +
        '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f6d64"/><stop offset="1" stop-color="#26302c"/></linearGradient></defs>' +
        '<path d="M0 66C60 56 110 62 160 58S270 54 320 62V90H0Z" fill="#86a874"/>' +
        '<path d="M126 70L204 66 180 200H146Z" fill="url(#' + g + ')"/>' +
        '<path d="M0 74C50 70 100 72 128 70L150 200H0Z" fill="#cdbfa7"/><path d="M320 70C280 68 230 66 202 66L178 200H320Z" fill="#bfb098"/>' +
        '<path d="M20 104l60 4M10 140l80 6M40 172l70 4M232 100l70-4M226 138l84-6M214 170l70 2" stroke="#a89a82" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="163" cy="188" rx="22" ry="6" fill="#4f8c8a"/><path d="M152 184h20l-3 4h-14z" fill="#7a5a3a"/><rect x="160" y="178" width="3" height="6" fill="#d9c6a0"/>' +
        pines([[16, 76, 0.9], [40, 74], [64, 73, 0.85], [92, 72], [116, 72, 0.8], [226, 68, 0.8], [252, 69], [278, 70, 0.9], [304, 72]], '#3f6b45') +
        '<path d="M196 72l34-6" stroke="#5a4632" stroke-width="3.5" stroke-linecap="round"/><path d="M200 71v-8M210 69v-8M220 67v-8M200 63l24-4" stroke="#5a4632" stroke-width="2" stroke-linecap="round"/>';
    },
    kokorin(id) {
      // Kokořín: hrad s vysokou věží na pískovcové skále a v lese skalní „pokličky“.
      const poklicka = (x, y, s) => '<path d="M' + (x - 4 * s) + ' ' + y + 'h' + (8 * s) + 'l' + (-1.6 * s) + ' ' + (-17 * s) + 'h' + (-4.8 * s) + 'z" fill="#d9c391"/>' +
        '<ellipse cx="' + x + '" cy="' + (y - 19 * s) + '" rx="' + (11 * s) + '" ry="' + (4.6 * s) + '" fill="#b4965f"/>';
      return sky(id, '#a9d1ee', '#f3f7fa') +
        '<path d="M0 118C60 98 120 108 170 102S270 94 320 108V200H0Z" fill="#86ab74"/>' +
        '<path d="M118 200V132c10-8 16-20 36-22s36 8 46 20v70z" fill="#d6be8c"/><path d="M132 150c8-4 14-4 22 0M150 172c10-4 20-4 30 0" stroke="#c0a571" stroke-width="3" fill="none"/>' +
        '<rect x="136" y="96" width="70" height="20" fill="#d3c9b6"/><path d="M136 96v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6h7v-6h7v6" fill="#d3c9b6"/>' +
        '<rect x="160" y="38" width="22" height="62" fill="#ddd4c3"/><path d="M156 40h30v-9h-4v4h-5v-4h-4v4h-4v-4h-4v4h-5v-4h-4z" fill="#c4baa7"/>' +
        '<rect x="168" y="52" width="6" height="10" rx="3" fill="#7d8790"/><rect x="146" y="102" width="6" height="8" rx="3" fill="#7d8790"/><rect x="190" y="102" width="6" height="8" rx="3" fill="#7d8790"/>' +
        pines([[18, 150], [44, 156, 0.9], [72, 152], [96, 160, 0.85], [232, 156, 0.9], [258, 150], [286, 158], [310, 152, 0.85]], '#3f6b45') +
        poklicka(60, 196, 1.2) + poklicka(262, 198, 1.4) + roundTrees([[100, 196, 10], [222, 196, 11]], '#4f8a4a');
    },
    roznov(id) {
      // Rožnov pod Radhoštěm: dřevěné roubenky Valašského muzea v přírodě pod beskydskými kopci.
      const house = (x, y, w, hh) => {
        let logs = '';
        for (let k = y + 6; k < y + hh; k += 6) logs += '<path d="M' + x + ' ' + k + 'h' + w + '" stroke="#5c3a20" stroke-width="1.5"/>';
        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" fill="#8a5a33"/>' + logs +
          '<path d="M' + (x - 6) + ' ' + y + 'l' + (w / 2 + 6) + ' ' + (-hh * 0.9) + 'l' + (w / 2 + 6) + ' ' + (hh * 0.9) + 'z" fill="#5d5650"/>' +
          '<rect x="' + (x + w * 0.38) + '" y="' + (y + hh * 0.3) + '" width="' + (w * 0.24) + '" height="' + (hh * 0.32) + '" fill="#f3ead8" stroke="#3f2a18" stroke-width="2"/>';
      };
      return sky(id, '#a8d0ee', '#f2f6f9') +
        '<path d="M0 100C40 76 80 70 120 86S200 62 240 74 300 84 320 80V200H0Z" fill="#8fa9a6"/>' +
        '<path d="M0 128C60 108 120 118 170 112S270 104 320 118V200H0Z" fill="#79a368"/>' +
        '<rect x="226" y="70" width="16" height="78" fill="#7a4e2d"/><path d="M222 72l12-30 12 30z" fill="#5d5650"/><rect x="230" y="84" width="8" height="10" fill="#2f2418"/>' +
        house(40, 128, 70, 40) + house(150, 136, 58, 34) + house(254, 132, 50, 36) +
        '<path d="M0 182C80 172 160 176 240 178S300 182 320 180V200H0Z" fill="#6c9a5a"/>' +
        roundTrees([[20, 186, 11], [128, 190, 10], [214, 192, 9], [310, 188, 11]], '#4f8a4a');
    },
    kuks(id) {
      // Kuks: barokní hospital s kostelem nad Labem a řada soch na terase.
      const statue = (x, y) => '<rect x="' + (x - 5) + '" y="' + (y - 6) + '" width="10" height="6" fill="#bdb3a3"/><path d="M' + (x - 3.5) + ' ' + (y - 6) + 'v-13c0-5 7-5 7 0v13z" fill="#d9d1c2"/><circle cx="' + x + '" cy="' + (y - 22) + '" r="3.6" fill="#d9d1c2"/>';
      let statues = '', wins = '';
      for (let x = 36; x <= 284; x += 31) statues += statue(x, 156);
      [74, 96, 118, 202, 224, 246].forEach((x) => { wins += '<rect x="' + x + '" y="96" width="8" height="14" rx="4" fill="#7d8790"/>'; });
      return sky(id, '#a6cfee', '#f2f6f9') +
        '<path d="M0 114C70 100 140 106 200 102S290 96 320 104V200H0Z" fill="#8ab274"/>' +
        '<rect x="60" y="82" width="200" height="50" fill="#efe6d4"/><path d="M54 84h212l-10-14H64z" fill="#a4553f"/>' + wins +
        '<rect x="142" y="52" width="36" height="80" fill="#f4ecdc"/><path d="M146 54q14-26 28 0z" fill="#5c7a6a"/><rect x="157" y="30" width="6" height="12" fill="#5c7a6a"/><path d="M160 22v10M156 26h8" stroke="#c9a54a" stroke-width="2"/>' +
        '<rect x="152" y="96" width="16" height="36" rx="8" fill="#7d6a55"/>' +
        '<rect x="18" y="134" width="284" height="24" fill="#d8ccb6"/>' + statues +
        '<path d="M0 176C80 168 160 172 240 174S300 176 320 174V200H0Z" fill="#6ea3c4"/>';
    },
    hradec(id) {
      // Hradec Králové: Bílá věž a dvouvěžová katedrála na Velkém náměstí, kolem první republika v cihlách.
      let houses = '';
      [[14, 128, '#c9744b'], [48, 134, '#d4895f'], [232, 132, '#c9744b'], [270, 126, '#b8653f']].forEach((p) => {
        houses += '<rect x="' + p[0] + '" y="' + p[1] + '" width="32" height="' + (176 - p[1]) + '" fill="' + p[2] + '"/>';
        for (let y = p[1] + 8; y < 168; y += 12) houses += '<rect x="' + (p[0] + 6) + '" y="' + y + '" width="20" height="6" fill="#f1e6d6"/>';
      });
      return sky(id, '#a9d0ee', '#f3f7fa') +
        '<rect y="150" width="320" height="50" fill="#c8bba6"/>' + houses +
        '<rect x="96" y="96" width="70" height="80" fill="#c46d4a"/><path d="M92 98h78l-39-26z" fill="#7a3f2e"/>' +
        '<rect x="98" y="58" width="16" height="118" fill="#c46d4a"/><path d="M96 60h20l-10-22z" fill="#4f5a5f"/><rect x="148" y="58" width="16" height="118" fill="#c46d4a"/><path d="M146 60h20l-10-22z" fill="#4f5a5f"/>' +
        '<rect x="122" y="118" width="18" height="30" rx="9" fill="#7d8790"/>' +
        '<rect x="186" y="44" width="26" height="132" fill="#f2efe6"/><path d="M182 46h34l-6-12h-22z" fill="#5c6670"/><path d="M190 34l9-16 9 16z" fill="#5c6670"/>' +
        '<rect x="194" y="62" width="10" height="14" rx="5" fill="#7d8790"/><circle cx="199" cy="96" r="6" fill="#ffffff" stroke="#7d8790" stroke-width="2"/>';
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
      fact: 'Zámek a zahrady v Kroměříži jsou od roku 1998 na seznamu UNESCO. Květnou zahradu zdobí rotunda a dlouhá kolonáda se sochami.' },
    { id: 'palava', gen: 'Pálavy', name: 'Pálava', color: '#7b2f4f', intro: ['mustek', 'koliky'],
      fact: 'Pálava je vápencové pohoří na jižní Moravě. Na jednom z vrcholů stojí zřícenina hradu Děvičky a ve svazích rostou vinice.' },
    { id: 'jested', gen: 'Ještědu', name: 'Ještěd', color: '#2d5b78', intro: ['stitky', 'polevka'],
      fact: 'Hotel a vysílač na vrcholu Ještědu navrhl architekt Karel Hubáček. Stavba byla dokončena v roce 1973 a je vidět z dalekého okolí.' },
    { id: 'ostrava', gen: 'Ostravy', name: 'Ostrava', color: '#6a4a3c', intro: ['terc', 'balonky'],
      fact: 'V Dolních Vítkovicích v Ostravě stojí bývalé vysoké pece a doly. Dnes slouží jako kulturní a vzdělávací centrum.' },
    { id: 'karlstejn', gen: 'Karlštejna', name: 'Karlštejn', color: '#8a3a3a', intro: ['smajlici', 'prelevani'],
      fact: 'Hrad Karlštejn dal postavit Karel IV. ve 14. století. Uchovávaly se tu korunovační klenoty a říšské poklady.' },
    { id: 'hluboka', gen: 'Hluboké', name: 'Hluboká', color: '#3e5f7a', intro: ['karty', 'dilek'],
      fact: 'Zámek Hluboká nad Vltavou dostal dnešní podobu v 19. století. Jeho stavitelé se inspirovali anglickým hradem Windsor.' },
    { id: 'trebic', gen: 'Třebíče', name: 'Třebíč', color: '#5d5a2e', intro: ['pravidlo', 'ulohy'],
      fact: 'Židovská čtvrť a bazilika svatého Prokopa v Třebíči jsou od roku 2003 na seznamu UNESCO.' },
    { id: 'plzen', gen: 'Plzně', name: 'Plzeň', color: '#3d5470', intro: ['kostky', 'zebrik'],
      fact: 'Věž katedrály svatého Bartoloměje v Plzni měří přes 100 metrů. Je to nejvyšší kostelní věž v Česku.' },
    { id: 'zdar', gen: 'Žďáru nad Sázavou', name: 'Žďár nad Sázavou', color: '#2f6b55', intro: ['pohled', 'stavby'],
      fact: 'Poutní kostel svatého Jana Nepomuckého na Zelené hoře u Žďáru nad Sázavou má půdorys pěticípé hvězdy. Postavil ho Jan Blažej Santini-Aichel a od roku 1994 je na seznamu UNESCO.' },
    { id: 'kras', gen: 'Moravského krasu', name: 'Moravský kras', color: '#3d6170', intro: ['krychle', 'hrnky'],
      fact: 'Propast Macocha v Moravském krasu je hluboká přes 138 metrů. Na její dno se dá doplout lodičkou po podzemní říčce Punkvě.' },
    { id: 'kokorin', gen: 'Kokořína', name: 'Kokořín', color: '#6a5a3a', intro: ['sifra', 'cikcak'],
      fact: 'Hrad Kokořín stojí na pískovcové skále nad hlubokým údolím. V okolních lesích jsou skalní „pokličky“, kameny ve tvaru hřibů.' },
    { id: 'roznov', gen: 'Rožnova pod Radhoštěm', name: 'Rožnov pod Radhoštěm', color: '#6b4a2f', intro: ['sit', 'had'],
      fact: 'Valašské muzeum v přírodě v Rožnově pod Radhoštěm založili v roce 1925. Patří k nejstarším muzeím v přírodě ve střední Evropě.' },
    { id: 'kuks', gen: 'Kuksu', name: 'Kuks', color: '#7a5a3a', intro: ['presyp', 'deleni'],
      fact: 'Barokní hospital v Kuksu nad Labem zdobí sochy Ctností a Neřestí od sochaře Matyáše Bernarda Brauna.' },
    { id: 'hradec', gen: 'Hradce Králové', name: 'Hradec Králové', color: '#8a4a32', intro: ['pocty', 'soucty'],
      fact: 'Hradci Králové se pro jeho moderní stavby z doby první republiky říká „salon republiky“.' }
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
