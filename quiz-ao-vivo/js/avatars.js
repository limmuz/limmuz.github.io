/* =====================================================================
   AVATARES — cabecinhas desenhadas em SVG, em quadrado com fundo de uma cor só (sem imagens externas).
   Para adicionar um avatar novo, copie uma linha da lista e mude:
   id (sem espaço), nome, cor de fundo e o desenho.
   ===================================================================== */
(function(){
"use strict";
const INK = '#231942';

// peças reutilizáveis
const eye   = (x,y,r=4.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x+r*.35}" cy="${y-r*.35}" r="${r*.32}" fill="#fff"/>`;
const smile = (cx,cy,w,c=INK) => `<path d="M${cx-w} ${cy}Q${cx} ${cy+w*.9} ${cx+w} ${cy}" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
const blush = (x,y) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="#ff8fab" opacity=".55"/>`;
const catMouth = (y) => `<path d="M50 ${y}q-2.5 4-6 2M50 ${y}q2.5 4 6 2" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;

const DEFS = [
  ['gato', 'Gatinho', '#ffd166', `
    <path d="M22 50L27 16L48 34Z M78 50L73 16L52 34Z" fill="#f4a259"/>
    <path d="M28 40L30 24L41 33Z M72 40L70 24L59 33Z" fill="#ffafcc"/>
    <ellipse cx="50" cy="58" rx="31" ry="27" fill="#f4a259"/>
    <path d="M50 33v8M43 34l1.5 6M57 34l-1.5 6" stroke="#d9822b" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="50" cy="66" rx="13" ry="9" fill="#fde2c4"/>
    ${eye(39,54,5)}${eye(61,54,5)}
    <path d="M46.5 61.5h7l-3.5 4z" fill="#ff7096"/>${catMouth(65.5)}
    <path d="M31 63H19M31 68l-11 3M69 63h12M69 68l11 3" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>
    ${blush(33,62)}${blush(67,62)}`],

  ['robo', 'Robô', '#8ecae6', `
    <path d="M50 28V17" stroke="#6c757d" stroke-width="3"/><circle cx="50" cy="15" r="5" fill="#ef476f"/>
    <rect x="13" y="48" width="10" height="18" rx="3" fill="#adb5bd"/><rect x="77" y="48" width="10" height="18" rx="3" fill="#adb5bd"/>
    <rect x="21" y="28" width="58" height="52" rx="12" fill="#e9ecef"/>
    <rect x="29" y="39" width="42" height="30" rx="7" fill="#1d3557"/>
    <rect x="36" y="46" width="8" height="10" rx="3" fill="#72efdd"/><rect x="56" y="46" width="8" height="10" rx="3" fill="#72efdd"/>
    <path d="M42 61q8 5 16 0" stroke="#72efdd" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g fill="#adb5bd"><circle cx="27" cy="34" r="2"/><circle cx="73" cy="34" r="2"/><circle cx="27" cy="75" r="2"/><circle cx="73" cy="75" r="2"/></g>`],

  ['ninja', 'Ninja', '#e76f51', `
    <circle cx="50" cy="55" r="31" fill="#2b2d42"/>
    <path d="M80 45L95 37L92 47Z M80 48L93 56L87 59Z" fill="#e63946"/>
    <path d="M19 43Q50 34 81 43L81 50Q50 41 19 50Z" fill="#e63946"/>
    <rect x="27" y="52" width="46" height="16" rx="8" fill="#f1c7a0"/>
    ${eye(40,60,4.5)}${eye(60,60,4.5)}
    <path d="M34 55l9 2M66 55l-9 2" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M38 77q12 5 24 0" stroke="#40435e" stroke-width="2.5" fill="none" stroke-linecap="round"/>`],

  ['cientista', 'Cientista', '#90be6d', `
    <g fill="#5e3b26"><circle cx="29" cy="40" r="10"/><circle cx="41" cy="31" r="11"/><circle cx="59" cy="31" r="11"/><circle cx="71" cy="40" r="10"/></g>
    <circle cx="24" cy="61" r="5" fill="#a86b45"/><circle cx="76" cy="61" r="5" fill="#a86b45"/>
    <circle cx="50" cy="59" r="26" fill="#a86b45"/>
    <path d="M25 52Q28 33 50 34Q72 33 75 52Q64 43 50 45Q36 43 25 52Z" fill="#5e3b26"/>
    <rect x="23" y="40" width="54" height="5" rx="2" fill="#3d405b"/>
    <circle cx="40" cy="42" r="8" fill="#bde0fe" stroke="#3d405b" stroke-width="3"/><circle cx="60" cy="42" r="8" fill="#bde0fe" stroke="#3d405b" stroke-width="3"/>
    <path d="M36 40q2-3 5-3M56 40q2-3 5-3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${eye(41,59,4.2)}${eye(59,59,4.2)}${smile(50,67,7)}${blush(35,66)}${blush(65,66)}`],

  ['astronauta', 'Astronauta', '#3d405b', `
    <g fill="#fff"><circle cx="15" cy="24" r="1.5"/><circle cx="85" cy="20" r="1.2"/><circle cx="88" cy="72" r="1.4"/><circle cx="11" cy="68" r="1"/><circle cx="78" cy="10" r="1"/></g>
    <rect x="11" y="46" width="10" height="18" rx="4" fill="#ced4da"/><rect x="79" y="46" width="10" height="18" rx="4" fill="#ced4da"/>
    <circle cx="50" cy="55" r="33" fill="#f8f9fa"/>
    <rect x="46" y="17" width="8" height="6" rx="2" fill="#ffd166"/>
    <rect x="26" y="38" width="48" height="34" rx="17" fill="#1d3557"/>
    <path d="M34 47q5-6 13-6" stroke="#fff" stroke-width="3" opacity=".55" fill="none" stroke-linecap="round"/>
    <ellipse cx="42" cy="56" rx="3.5" ry="4.5" fill="#fff"/><ellipse cx="58" cy="56" rx="3.5" ry="4.5" fill="#fff"/>
    ${smile(50,63,5,'#fff')}`],

  ['alien', 'Alienígena', '#b388eb', `
    <path d="M38 30L30 15M62 30L70 15" stroke="#57cc99" stroke-width="3" stroke-linecap="round"/>
    <circle cx="30" cy="13" r="5" fill="#ffd166"/><circle cx="70" cy="13" r="5" fill="#ffd166"/>
    <path d="M50 24C74 24 82 44 78 58C74 74 62 84 50 84C38 84 26 74 22 58C18 44 26 24 50 24Z" fill="#80ed99"/>
    <ellipse cx="38" cy="54" rx="8" ry="11" transform="rotate(-25 38 54)" fill="${INK}"/>
    <ellipse cx="62" cy="54" rx="8" ry="11" transform="rotate(25 62 54)" fill="${INK}"/>
    <circle cx="40" cy="49" r="2.5" fill="#fff"/><circle cx="64" cy="49" r="2.5" fill="#fff"/>
    ${smile(50,71,5)}`],

  ['panda', 'Panda', '#a8dadc', `
    <circle cx="27" cy="32" r="10" fill="${INK}"/><circle cx="73" cy="32" r="10" fill="${INK}"/>
    <ellipse cx="50" cy="57" rx="31" ry="28" fill="#fff"/>
    <ellipse cx="38" cy="54" rx="8" ry="10" transform="rotate(30 38 54)" fill="${INK}"/>
    <ellipse cx="62" cy="54" rx="8" ry="10" transform="rotate(-30 62 54)" fill="${INK}"/>
    <circle cx="39" cy="53" r="3.2" fill="#fff"/><circle cx="61" cy="53" r="3.2" fill="#fff"/>
    <circle cx="39.6" cy="53.4" r="1.6" fill="${INK}"/><circle cx="61.6" cy="53.4" r="1.6" fill="${INK}"/>
    <ellipse cx="50" cy="64" rx="4.5" ry="3" fill="${INK}"/>${catMouth(67)}
    ${blush(31,66)}${blush(69,66)}`],

  ['raposa', 'Raposa', '#2a9d8f', `
    <path d="M20 50L24 14L46 36Z M80 50L76 14L54 36Z" fill="#f77f00"/>
    <path d="M26 40L27 24L38 34Z M74 40L73 24L62 34Z" fill="${INK}" opacity=".7"/>
    <path d="M18 46Q50 26 82 46Q80 70 50 84Q20 70 18 46Z" fill="#f77f00"/>
    <path d="M24 56Q38 58 50 72Q62 58 76 56Q72 74 50 84Q28 74 24 56Z" fill="#fff"/>
    ${eye(38,52,4.5)}${eye(62,52,4.5)}
    <ellipse cx="50" cy="72" rx="4.5" ry="3.2" fill="${INK}"/>`],

  ['dragao', 'Dragão', '#f6bd60', `
    <path d="M32 34L24 12L42 28Z M68 34L76 12L58 28Z" fill="#fefae0"/>
    <path d="M44 28L50 15L56 28Z" fill="#2a9d8f"/>
    <ellipse cx="50" cy="55" rx="30" ry="27" fill="#52b788"/>
    <ellipse cx="50" cy="69" rx="18" ry="11" fill="#95d5b2"/>
    <ellipse cx="44" cy="66" rx="2" ry="2.8" fill="#2d6a4f"/><ellipse cx="56" cy="66" rx="2" ry="2.8" fill="#2d6a4f"/>
    ${eye(39,48,5)}${eye(61,48,5)}
    <path d="M41 74q9 5 18 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${blush(28,58)}${blush(72,58)}`],

  ['fantasma', 'Fantasma', '#4a4e69', `
    <path d="M24 88V50A26 26 0 0 1 76 50V88L67.5 81L59 88L50 81L41 88L32.5 81Z" fill="#f8f9fa"/>
    <ellipse cx="40" cy="52" rx="5" ry="7" fill="${INK}"/><ellipse cx="60" cy="52" rx="5" ry="7" fill="${INK}"/>
    <circle cx="41.8" cy="49.5" r="1.7" fill="#fff"/><circle cx="61.8" cy="49.5" r="1.7" fill="#fff"/>
    <ellipse cx="50" cy="66" rx="5" ry="6" fill="${INK}"/>
    ${blush(31,61)}${blush(69,61)}`],

  ['sapo', 'Sapo', '#ffafcc', `
    <circle cx="33" cy="35" r="13" fill="#70c1b3"/><circle cx="67" cy="35" r="13" fill="#70c1b3"/>
    <ellipse cx="50" cy="61" rx="34" ry="24" fill="#70c1b3"/>
    <circle cx="33" cy="34" r="8.5" fill="#fff"/><circle cx="67" cy="34" r="8.5" fill="#fff"/>
    ${eye(34,35,4.5)}${eye(68,35,4.5)}
    <circle cx="46" cy="54" r="1.6" fill="${INK}"/><circle cx="54" cy="54" r="1.6" fill="${INK}"/>
    <path d="M30 62Q50 78 70 62" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    ${blush(25,66)}${blush(75,66)}`],

  ['pinguim', 'Pinguim', '#48cae4', `
    <ellipse cx="50" cy="56" rx="31" ry="30" fill="#2b2d42"/>
    <path d="M50 44C42 34 24 40 26 56C28 72 40 82 50 82C60 82 72 72 74 56C76 40 58 34 50 44Z" fill="#fff"/>
    ${eye(40,55,4.5)}${eye(60,55,4.5)}
    <path d="M43 63L57 63L50 71Z" fill="#fb8500"/>
    ${blush(33,65)}${blush(67,65)}`],

  ['coruja', 'Coruja', '#cdb4db', `
    <path d="M22 42L24 16L40 31Z M78 42L76 16L60 31Z" fill="#7f5539"/>
    <ellipse cx="50" cy="57" rx="31" ry="29" fill="#7f5539"/>
    <circle cx="38" cy="52" r="12" fill="#ede0d4"/><circle cx="62" cy="52" r="12" fill="#ede0d4"/>
    <circle cx="38" cy="52" r="7.5" fill="#ffd166"/><circle cx="62" cy="52" r="7.5" fill="#ffd166"/>
    ${eye(38,52,4.5)}${eye(62,52,4.5)}
    <path d="M46 61L54 61L50 69Z" fill="#f4a261"/>
    <path d="M37 76q4 3 8 0M55 76q4 3 8 0M46 82q4 3 8 0" stroke="#5e3b26" stroke-width="2" fill="none" stroke-linecap="round"/>`],

  ['urso', 'Urso', '#ffcad4', `
    <circle cx="26" cy="32" r="11" fill="#a47148"/><circle cx="74" cy="32" r="11" fill="#a47148"/>
    <circle cx="26" cy="32" r="5.5" fill="#e6ccb2"/><circle cx="74" cy="32" r="5.5" fill="#e6ccb2"/>
    <ellipse cx="50" cy="57" rx="31" ry="28" fill="#a47148"/>
    <ellipse cx="50" cy="67" rx="13" ry="10" fill="#e6ccb2"/>
    ${eye(39,52,4.8)}${eye(61,52,4.8)}
    <ellipse cx="50" cy="63" rx="5" ry="3.5" fill="${INK}"/>${catMouth(66.5)}
    ${blush(31,63)}${blush(69,63)}`],

  ['pirata', 'Pirata', '#4361ee', `
    <circle cx="23" cy="61" r="5" fill="#e0ac69"/><circle cx="77" cy="61" r="5" fill="#e0ac69"/>
    <circle cx="50" cy="59" r="27" fill="#e0ac69"/>
    <path d="M76 45L91 41L87 51Z M76 49L88 59L80 61Z" fill="#c1121f"/>
    <path d="M22 53Q24 27 50 27Q76 27 78 53Q64 45 50 45Q36 45 22 53Z" fill="#e63946"/>
    <g fill="#fff"><circle cx="38" cy="35" r="2"/><circle cx="52" cy="32" r="2"/><circle cx="64" cy="38" r="2"/><circle cx="30" cy="44" r="2"/><circle cx="46" cy="41" r="2"/></g>
    <path d="M25 46L77 60" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="60" cy="58" rx="7.5" ry="6.5" fill="${INK}"/>
    ${eye(40,58,4.5)}${smile(50,69,7)}${blush(35,67)}`],

  ['monstro', 'Monstrinho', '#06d6a0', `
    <path d="M30 33L26 14L41 28Z M70 33L74 14L59 28Z" fill="#fefae0"/>
    <circle cx="50" cy="57" r="31" fill="#9d4edd"/>
    <g fill="#7b2cbf"><circle cx="29" cy="67" r="3"/><circle cx="72" cy="45" r="2.5"/><circle cx="70" cy="70" r="2"/><circle cx="30" cy="44" r="2"/></g>
    <circle cx="50" cy="50" r="13" fill="#fff"/>${eye(51,51,7)}
    <path d="M36 68Q50 82 64 68Z" fill="${INK}"/>
    <path d="M42 69L45 74L48 70Z M52 70L55 74L58 69Z" fill="#fff"/>`],

  ['vampiro', 'Vampiro', '#9b2226', `
    <path d="M16 96L30 68L50 82L70 68L84 96Z" fill="#3c096c"/><path d="M30 68L50 82L70 68L64 92L36 92Z" fill="#c1121f"/>
    <path d="M24 50L19 37L31 44Z M76 50L81 37L69 44Z" fill="#d8c8f0"/>
    <ellipse cx="50" cy="55" rx="25" ry="27" fill="#d8c8f0"/>
    <path d="M24 52Q22 26 50 25Q78 26 76 52L70 42Q60 37 50 48Q40 37 30 42Z" fill="#2b2d42"/>
    ${eye(41,57,4.3)}${eye(59,57,4.3)}
    <path d="M42 67Q50 73 58 67" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M44.5 68.5L46.5 74L48.5 69.5Z M51.5 69.5L53.5 74L55.5 68.5Z" fill="#fff"/>
    ${blush(34,65)}${blush(66,65)}`],

  ['mascara', 'Máscara', '#ef476f', `
    <g fill="#2ec4b6"><circle cx="30" cy="38" r="10"/><circle cx="42" cy="29" r="11"/><circle cx="58" cy="29" r="11"/><circle cx="70" cy="38" r="10"/></g>
    <circle cx="24" cy="58" r="5" fill="#c68642"/><circle cx="76" cy="58" r="5" fill="#c68642"/>
    <circle cx="50" cy="57" r="26" fill="#c68642"/>
    <path d="M26 48Q30 32 50 33Q70 32 74 48Q62 41 50 43Q38 41 26 48Z" fill="#2ec4b6"/>
    <path d="M24 52Q37 44 50 52Q63 44 76 52Q74 64 62 64Q54 64 50 58Q46 64 38 64Q26 64 24 52Z" fill="#5a189a"/>
    <ellipse cx="39" cy="55" rx="5.5" ry="4.5" fill="#fff"/><ellipse cx="61" cy="55" rx="5.5" ry="4.5" fill="#fff"/>
    <circle cx="40" cy="55.5" r="2.6" fill="${INK}"/><circle cx="62" cy="55.5" r="2.6" fill="${INK}"/>
    ${smile(50,70,7)}`],

  ['cupcake', 'Cupcake', '#bde0fe', `
    <path d="M27 58L73 58L66 90L34 90Z" fill="#ff8fab"/>
    <path d="M38 58L40 90M50 58V90M62 58L60 90" stroke="#ff6b97" stroke-width="3"/>
    <g fill="#fff0f6"><circle cx="30" cy="54" r="10"/><circle cx="44" cy="47" r="13"/><circle cx="58" cy="47" r="13"/><circle cx="71" cy="54" r="10"/><rect x="24" y="52" width="52" height="10" rx="5"/></g>
    <g><rect x="35" y="44" width="5" height="2.4" rx="1.2" fill="#3a86ff" transform="rotate(-25 37 45)"/><rect x="52" y="40" width="5" height="2.4" rx="1.2" fill="#06d6a0" transform="rotate(20 54 41)"/><rect x="64" y="50" width="5" height="2.4" rx="1.2" fill="#ffbe0b" transform="rotate(-10 66 51)"/><rect x="45" y="52" width="5" height="2.4" rx="1.2" fill="#8338ec" transform="rotate(30 47 53)"/></g>
    <path d="M51 30Q53 23 59 21" stroke="#2d6a4f" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="51" cy="33" r="6" fill="#e63946"/>
    ${eye(43,70,3.8)}${eye(57,70,3.8)}${smile(50,77,5)}`],

  ['pizza', 'Pizza', '#8338ec', `
    <path d="M18 30Q50 20 82 30L50 92Z" fill="#ffd166"/>
    <path d="M16 28Q50 16 84 28L82 36Q50 25 18 36Z" fill="#e09f3e"/>
    <g fill="#d62828"><circle cx="34" cy="44" r="5"/><circle cx="64" cy="42" r="5"/><circle cx="52" cy="74" r="4"/></g>
    ${eye(43,52,4.3)}${eye(57,52,4.3)}${smile(50,60,6)}
    ${blush(37,59)}${blush(63,59)}`],

  ['nuvem', 'Nuvem', '#219ebc', `
    <g fill="#fff"><circle cx="32" cy="58" r="15"/><circle cx="50" cy="46" r="20"/><circle cx="68" cy="58" r="15"/><rect x="22" y="56" width="56" height="20" rx="10"/></g>
    <path d="M38 55q4-5 8 0M54 55q4-5 8 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${smile(50,62,5)}${blush(34,62)}${blush(66,62)}`],

  ['polvo', 'Polvo', '#fb8500', `
    <path d="M24 60Q20 80 28 88Q32 76 36 70Q38 86 46 90Q46 76 50 70Q54 76 54 90Q62 86 64 70Q68 76 72 88Q80 80 76 60Z" fill="#ff70a6"/>
    <ellipse cx="50" cy="46" rx="28" ry="26" fill="#ff99c8"/>
    <g fill="#ff70a6"><circle cx="36" cy="32" r="3"/><circle cx="62" cy="28" r="2.5"/><circle cx="68" cy="40" r="2"/></g>
    ${eye(40,50,4.8)}${eye(60,50,4.8)}${smile(50,59,6)}${blush(32,58)}${blush(68,58)}`],

  ['leao', 'Leão', '#577590', `
    <g fill="#bc6c25"><circle cx="50" cy="22" r="11"/><circle cx="72" cy="30" r="11"/><circle cx="80" cy="52" r="11"/><circle cx="72" cy="74" r="11"/><circle cx="50" cy="82" r="11"/><circle cx="28" cy="74" r="11"/><circle cx="20" cy="52" r="11"/><circle cx="28" cy="30" r="11"/><circle cx="50" cy="52" r="30"/></g>
    <circle cx="33" cy="34" r="6" fill="#f6bd60"/><circle cx="67" cy="34" r="6" fill="#f6bd60"/>
    <circle cx="50" cy="53" r="23" fill="#f6bd60"/>
    <ellipse cx="50" cy="63" rx="11" ry="8" fill="#fefae0"/>
    ${eye(41,50,4.3)}${eye(59,50,4.3)}
    <path d="M46 58h8l-4 4.5z" fill="#6f1d1b"/>${catMouth(62.5)}`],

  ['gamer', 'Gamer', '#f72585', `
    <circle cx="50" cy="57" r="25" fill="#8d5524"/>
    <path d="M25 54Q24 31 50 31Q76 31 75 54Q70 43 60 45Q56 40 50 44Q44 39 38 44Q30 42 25 54Z" fill="#212529"/>
    <path d="M21 58Q19 22 50 21Q81 22 79 58" stroke="#4cc9f0" stroke-width="6" fill="none" stroke-linecap="round"/>
    <rect x="14" y="50" width="13" height="20" rx="6" fill="#4cc9f0"/><rect x="73" y="50" width="13" height="20" rx="6" fill="#4cc9f0"/>
    <rect x="17" y="54" width="7" height="12" rx="3" fill="#3a0ca3"/><rect x="76" y="54" width="7" height="12" rx="3" fill="#3a0ca3"/>
    <path d="M22 69Q25 79 37 77" stroke="#4cc9f0" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="38" cy="77" r="3.2" fill="#fff"/>
    ${eye(42,59,4.2)}${eye(58,59,4.2)}${smile(51,67,6)}`]
];

const list = DEFS.map(([id, nome, fundo, desenho]) => ({
  id, nome,
  svg: `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect width="100" height="100" fill="${fundo}"/>${desenho}</svg>`
}));
const map = {};
list.forEach(a => { map[a.id] = a; });

window.QUIZ_AVATARS = {
  list,
  has: id => typeof id === 'string' && Object.prototype.hasOwnProperty.call(map, id),
  get: id => map[id] || list[0],
  random: () => list[Math.floor(Math.random() * list.length)].id
};
})();
