(function(){
"use strict";

/* ===================== SENHA DO APRESENTADOR =====================
   Guardamos só o "hash" (impressão digital) da senha, não a senha em si.
   Senha desta versão de demonstração: demo
   Para trocar: abra o site com  #gerar-senha  no final do endereço,
   digite a nova senha, copie o código gerado e cole aqui embaixo.     */
const SENHA_HASH = '2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea';
/* ================================================================= */
const app = document.getElementById('app');
const PREFIX = 'quiz-ao-vivo-v1-';
const SHAPES = [
  '<svg viewBox="0 0 32 32"><path d="M16 3 30 28H2z"/></svg>',
  '<svg viewBox="0 0 32 32"><path d="M16 1 31 16 16 31 1 16z"/></svg>',
  '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14"/></svg>',
  '<svg viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="26" rx="2"/></svg>'
];
const shape = i => '<span class="shape">'+SHAPES[i]+'</span>';
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {
  get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));

/* ---------- avatares (desenhos em js/avatars.js) ---------- */
const AVATARS = window.QUIZ_AVATARS;
const avatar = (id, cls='') => `<span class="av ${cls}">${AVATARS.get(id).svg}</span>`;
const CROWN = '<svg viewBox="0 0 64 42" aria-hidden="true"><path d="M5 37L8 10L22 23L32 5L42 23L56 10L59 37Z" fill="#ffd23f" stroke="#e0a800" stroke-width="2.5" stroke-linejoin="round"/><g fill="#ffd23f" stroke="#e0a800" stroke-width="2"><circle cx="8" cy="9" r="4"/><circle cx="32" cy="5" r="4"/><circle cx="56" cy="9" r="4"/></g><rect x="5" y="33" width="54" height="7" rx="2" fill="#e0a800"/><circle cx="32" cy="27" r="3.5" fill="#ef476f"/><circle cx="19" cy="30" r="2.5" fill="#72efdd"/><circle cx="45" cy="30" r="2.5" fill="#72efdd"/></svg>';

/* ---------- pódio (usado na tela do apresentador e no celular) ----------
   top = [1º, 2º, 3º] com {name, avatar, score}; delays = segundos até cada degrau subir */
function podiumHTML(top, delays, meRank, hidden){
  const BD = {1:.5, 2:.3, 3:.1};   // quando os degraus sobem (pódio revelado por clique)
  const order = [[top[1],2,delays[1]], [top[0],1,delays[0]], [top[2],3,delays[2]]];
  return `<div class="podium">${order.map(([p,n,d])=>`
    <div class="pod p${n} ${p && meRank===p.rank ? 'me' : ''} ${hidden ? 'wait' : ''}" style="--d:${d}s;--bd:${hidden ? BD[n] : d}s">
      ${hidden && p ? `<button class="revealbtn" data-act="reveal" data-n="${n}" disabled>🔒 ${n}º lugar</button>` : ''}
      <div class="who">${p ? `
        ${n===1 ? `<div class="crown">${CROWN}</div>` : ''}
        <div class="avwrap">${n===1 ? '<span class="burst"></span>' : ''}${avatar(p.avatar)}</div>
        <div class="nm">${esc(p.name)}</div><div class="sc">${p.score} pts</div>` : ''}
      </div>
      <div class="blk"><span class="p">${p && p.rank ? p.rank : n}º</span></div>
    </div>`).join('')}</div>`;
}

/* ---------- confete (canvas, sem biblioteca) ---------- */
function confetti(canvas, {duration=5000, burst=140, rain=4}={}){
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio||1);
  const fit = ()=>{ canvas.width = canvas.clientWidth*dpr; canvas.height = canvas.clientHeight*dpr; };
  fit(); window.addEventListener('resize', fit);
  const colors = ['#e21b3c','#1368ce','#ffd23f','#26890c','#ff8fab','#72efdd','#ffffff','#b388eb'];
  const parts = [];
  const add = (x,y,vx,vy)=>parts.push({x,y,vx,vy,w:(7+Math.random()*7)*dpr,h:(4+Math.random()*5)*dpr,
    a:Math.random()*6.28,va:(Math.random()-.5)*.3,c:colors[Math.random()*colors.length|0],round:Math.random()<.25,sway:Math.random()*6.28});
  const W = canvas.width, H = canvas.height;
  for (let i=0;i<burst;i++){ const ang = -Math.PI/2 + (Math.random()-.5)*2.2, sp = (8+Math.random()*12)*dpr;
    add(W/2, H*.42, Math.cos(ang)*sp, Math.sin(ang)*sp); }
  const t0 = performance.now();
  (function frame(now){
    if (!canvas.isConnected){ window.removeEventListener('resize', fit); return; }
    const W = canvas.width, H = canvas.height;
    if (now - t0 < duration) for (let i=0;i<rain;i++) add(Math.random()*W, -20*dpr, (Math.random()-.5)*2*dpr, (2+Math.random()*3)*dpr);
    ctx.clearRect(0,0,W,H);
    for (let i=parts.length-1;i>=0;i--){
      const p = parts[i];
      p.vy = Math.min(p.vy + .22*dpr, 5.5*dpr); p.vx *= .985; p.sway += .08;
      p.x += p.vx + Math.sin(p.sway)*.8*dpr; p.y += p.vy; p.a += p.va;
      if (p.y > H + 30*dpr){ parts.splice(i,1); continue; }
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
      if (p.round){ ctx.beginPath(); ctx.arc(0,0,p.h*.7,0,6.28); ctx.fill(); }
      else ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h*Math.abs(Math.cos(p.a*2)) + 1);
      ctx.restore();
    }
    if (parts.length || now - t0 < duration) requestAnimationFrame(frame);
    else { ctx.clearRect(0,0,W,H); window.removeEventListener('resize', fit); }
  })(t0);
}

/* ---------- códigos de sala (fixos por quiz) ---------- */
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newCode(){ let s=''; crypto.getRandomValues(new Uint8Array(5)).forEach(b=>{ s += CODE_CHARS[b % CODE_CHARS.length]; }); return s; }
const joinUrlFor = c => location.href.split('#')[0] + '#sala=' + c;

/* ---------- quiz: confere e arruma um quiz lido de arquivo ---------- */
function normalizeQuiz(d){
  if (!d || !Array.isArray(d.questions)) throw new Error('formato');
  return {
    title: String(d.title || 'Quiz').slice(0,120),
    code: cleanCode(d.code).length >= 3 ? cleanCode(d.code) : newCode(),
    questions: d.questions.map(q=>({
      text: String(q && q.text || ''),
      options: [0,1,2,3].map(j=>String((q && q.options || [])[j] || '')),
      correct: Math.min(3, Math.max(0, +(q && q.correct) || 0)),
      time: [10,20,30,45,60,90].includes(+(q && q.time)) ? +q.time : 20
    }))
  };
}

/* ---------- arquivo protegido pela senha do apresentador (AES-GCM) ----------
   Os quizzes da pasta "quizzes/" ficam embaralhados: quem abrir o arquivo
   no navegador não consegue ver as respostas sem a senha. */
const toB64 = u8 => { let s=''; for (let i=0;i<u8.length;i++) s += String.fromCharCode(u8[i]); return btoa(s); };
const fromB64 = s => Uint8Array.from(atob(s), c=>c.charCodeAt(0));
const isLocked = d => !!(d && d.formato === 'quiz-ao-vivo-protegido' && d.data && d.iv && d.salt);
async function quizKey(pw, salt){
  if (!(window.crypto && crypto.subtle)) throw new Error('sem-cripto');
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:150000, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
}
async function lockQuiz(quiz, pw){
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await quizKey(pw, salt);
  const data = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, new TextEncoder().encode(JSON.stringify(quiz)));
  return {formato:'quiz-ao-vivo-protegido', versao:1, code:quiz.code, salt:toB64(salt), iv:toB64(iv), data:toB64(new Uint8Array(data))};
}
async function unlockQuiz(file, pw){
  const key = await quizKey(pw, fromB64(file.salt));
  let plain;
  try { plain = await crypto.subtle.decrypt({name:'AES-GCM', iv:fromB64(file.iv)}, key, fromB64(file.data)); }
  catch(e){ throw new Error('senha'); }
  return JSON.parse(new TextDecoder().decode(plain));
}
async function readQuizFile(d, pw){ return normalizeQuiz(isLocked(d) ? await unlockQuiz(d, pw) : d); }
const errText = e => !e ? '' :
  e.message === 'senha' ? 'Não consegui abrir: esse quiz foi protegido com outra senha.' :
  e.message === 'sem-cripto' ? 'Este navegador não abre quizzes protegidos aqui. Abra pelo site publicado (https).' :
  e.message === 'formato' ? 'Esse arquivo não é um quiz válido.' : '';

/* ---------- baixar arquivos ---------- */
function download(name, href){ const a=document.createElement('a'); a.href=href; a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
function downloadJSON(name, obj){ const u = URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)], {type:'application/json'})); download(name, u); setTimeout(()=>URL.revokeObjectURL(u), 5000); }

const qrSVG = c => { const q = qrcode(0,'M'); q.addData(joinUrlFor(c)); q.make(); return q.createSvgTag({scalable:true, margin:1}); };
/* ---------- imagem PNG do QR code (para colocar nos slides) ---------- */
function qrPNG(url, code, title){
  const qr = qrcode(0,'M'); qr.addData(url); qr.make();
  const n = qr.getModuleCount(), cell = 14, pad = 4*cell, size = n*cell + pad*2, extra = 150;
  const c = document.createElement('canvas'); c.width = size; c.height = size + extra;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0,0,c.width,c.height);
  g.fillStyle = '#1a1530';
  for (let r=0;r<n;r++) for (let k=0;k<n;k++) if (qr.isDark(r,k)) g.fillRect(pad+k*cell, pad+r*cell, cell, cell);
  g.textAlign = 'center';
  g.font = '900 64px Nunito, Arial, sans-serif'; g.fillText(code, size/2, size+62);
  g.fillStyle = '#6b6880'; g.font = '700 30px Nunito, Arial, sans-serif'; g.fillText(String(title).slice(0,42), size/2, size+112);
  return c.toDataURL('image/png');
}

/* ---------- leitor de QR code pela câmera (biblioteca carregada só quando precisa) ---------- */
function loadScript(src){
  return new Promise((ok, fail)=>{
    if (window.jsQR) return ok();
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ()=>fail(new Error('script'));
    document.head.appendChild(s);
  });
}
function codeFromText(t){
  t = String(t||'').trim();
  const m = t.match(/[#&?]sala=([A-Za-z0-9]+)/); if (m) return cleanCode(m[1]);
  return /^[A-Za-z0-9]{3,8}$/.test(t) ? cleanCode(t) : '';
}
async function scanQR(){
  await loadScript('js/lib/jsQR.min.js');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('sem-camera');
  const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}, audio:false});
  return new Promise(resolve=>{
    const ov = document.createElement('div'); ov.className = 'scan';
    ov.innerHTML = `<div class="scanbox"><video playsinline muted autoplay></video><span class="scanframe"></span></div>
      <p>Aponte a câmera para o QR code do quiz</p><button class="btn ghost" type="button">Cancelar</button>`;
    document.body.appendChild(ov);
    const video = ov.querySelector('video'); video.srcObject = stream;
    const cv = document.createElement('canvas'), g = cv.getContext('2d', {willReadFrequently:true});
    let done = false;
    const stop = val=>{ if (done) return; done = true; stream.getTracks().forEach(t=>t.stop()); ov.remove(); resolve(val); };
    ov.querySelector('button').onclick = ()=>stop(null);
    const tick = ()=>{
      if (done) return;
      if (video.readyState >= 2 && video.videoWidth){
        const w = 480, h = Math.round(video.videoHeight * w / video.videoWidth);
        cv.width = w; cv.height = h; g.drawImage(video, 0, 0, w, h);
        const res = window.jsQR(g.getImageData(0,0,w,h).data, w, h, {inversionAttempts:'attemptBoth'});
        const c = res && codeFromText(res.data);
        if (c) return stop(c);
      }
      requestAnimationFrame(tick);
    };
    video.play().catch(()=>{}); tick();
  });
}

/* SHA-256 (funciona até abrindo o arquivo direto do computador) */
function sha256(str){
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const bytes=new TextEncoder().encode(str), l=bytes.length;
  const n=((l+9+63)>>6)<<6, m=new Uint8Array(n); m.set(bytes); m[l]=0x80;
  const dv=new DataView(m.buffer); dv.setUint32(n-4,(l*8)>>>0); dv.setUint32(n-8,Math.floor(l/0x20000000));
  let h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const w=new Uint32Array(64), r=(x,k)=>(x>>>k)|(x<<(32-k));
  for(let o=0;o<n;o+=64){
    for(let i=0;i<16;i++) w[i]=dv.getUint32(o+i*4);
    for(let i=16;i<64;i++){ const a=w[i-15],b=w[i-2]; w[i]=(w[i-16]+(r(a,7)^r(a,18)^(a>>>3))+w[i-7]+(r(b,17)^r(b,19)^(b>>>10)))>>>0; }
    let [a,b,c,d,e,f,g,hh]=h;
    for(let i=0;i<64;i++){
      const t1=(hh+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0;
      const t2=((r(a,2)^r(a,13)^r(a,22))+((a&b)^(a&c)^(b&c)))>>>0;
      hh=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
    }
    h=h.map((x,i)=>(x+[a,b,c,d,e,f,g,hh][i])>>>0);
  }
  return h.map(x=>x.toString(16).padStart(8,'0')).join('');
}

const hash = new URLSearchParams(location.hash.slice(1));
const cleanCode = s => String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);
if (hash.get('sala')) player(cleanCode(hash.get('sala')));
else if (hash.has('apresentar')) lockScreen(host);
else if (hash.has('gerar-senha')) passwordGenerator();
else enterCode();
window.addEventListener('hashchange', ()=>location.reload());

/* ---------- tela de senha do apresentador ---------- */
function lockScreen(next){
  const KEY = 'quizaovivo.pw';
  try{ const saved = sessionStorage.getItem(KEY); if (saved && sha256(saved)===SENHA_HASH) return next(saved); }catch(e){}
  app.innerHTML = `<div class="pscreen">
    <div class="brand" style="font-size:30px">Quiz <b>ao Vivo</b></div>
    <p>Área do apresentador</p>
    <input class="field" id="pw" type="password" placeholder="Senha" autocomplete="current-password">
    <button class="btn primary" id="go" style="width:100%;max-width:360px">Entrar</button>
    <p id="msg" style="color:#ffd0d0;min-height:1.4em"></p></div>`;
  const pw=document.getElementById('pw'); pw.focus();
  let tries=0;
  const go=()=>{
    if (sha256(pw.value)===SENHA_HASH){ const v = pw.value; try{ sessionStorage.setItem(KEY, v); }catch(e){} next(v); }
    else { tries++; pw.value=''; pw.focus(); document.getElementById('msg').textContent='Senha incorreta.';
      if (tries>=5){ const b=document.getElementById('go'); b.disabled=true; setTimeout(()=>{b.disabled=false;tries=0;},10000); } }
  };
  document.getElementById('go').onclick=go;
  pw.onkeydown=e=>{ if(e.key==='Enter') go(); };
}
function passwordGenerator(){
  app.innerHTML = `<div class="pscreen">
    <h2>Gerar nova senha</h2>
    <p>Digite a nova senha. Copie o código e cole em <b>SENHA_HASH</b>, no começo do arquivo <b>js/app.js</b>.</p>
    <input class="field" id="pw" type="text" placeholder="Nova senha">
    <code id="out" style="background:rgba(0,0,0,.3);padding:12px;border-radius:10px;word-break:break-all;max-width:420px;font-size:14px;user-select:all"></code>
  </div>`;
  const pw=document.getElementById('pw'), out=document.getElementById('out');
  pw.oninput=()=>{ out.textContent = pw.value ? sha256(pw.value) : ''; };
}

function enterCode(){
  app.innerHTML = `<div class="pscreen">
    <div class="brand" style="font-size:30px">Quiz <b>ao Vivo</b></div>
    <p>Digite o código que aparece na tela</p>
    <input class="field" id="cd" maxlength="8" placeholder="CÓDIGO" autocapitalize="characters" autocomplete="off" style="letter-spacing:6px">
    <button class="btn primary" id="go" style="width:100%;max-width:360px">Entrar</button>
    <div style="flex:1"></div>
    <a href="#apresentar" style="color:rgba(255,255,255,.55);font-weight:700;font-size:14px">Sou o apresentador</a></div>`;
  const go = ()=>{ const c = cleanCode(document.getElementById('cd').value); if (c) location.hash = 'sala='+c; };
  document.getElementById('go').onclick = go;
  document.getElementById('cd').onkeydown = e=>{ if(e.key==='Enter') go(); };
}

/* ============================== APRESENTADOR ============================== */
function host(pw){
  const SAMPLE = () => ({
    title: 'Meu Quiz', code: newCode(),
    questions: [
      {text:'Exemplo: qual destas é uma linguagem de programação?', options:['Python','HTML','Excel','Photoshop'], correct:0, time:20},
      {text:'Exemplo: quantos lados tem um hexágono?', options:['5','6','7','8'], correct:1, time:20},
      {text:'Exemplo: qual planeta é conhecido como planeta vermelho?', options:['Vênus','Júpiter','Marte','Saturno'], correct:2, time:20}
    ]
  });
  let quiz = null;             // quiz em uso (no editor ou na sala)
  const players = new Map();   // token -> player
  const byPeer = new Map();    // peerId -> token
  let peer = null, code = '', phase = 'panel', qi = -1, qStart = 0, ticker = null, retries = 0;
  let SID = '';                 // identifica ESTA partida: muda toda vez que a sala é aberta
  let steps = [], stepI = 0;   // revelação do pódio por clique (3º, 2º, 1º)

  // biblioteca local: quizzes já abertos neste computador (para abrir pelo código mesmo sem internet no arquivo)
  const lib = () => store.get('quizaovivo.lib') || {};
  const remember = q => { const l = lib(); l[q.code] = q; store.set('quizaovivo.lib', l); };
  const loadDraft = () => { try { return normalizeQuiz(store.get('quizaovivo.quiz')); } catch(e){ return SAMPLE(); } };
  const save = () => { store.set('quizaovivo.quiz', quiz); remember(quiz); };
  const joinUrl = () => joinUrlFor(code);
  const send = (p, m) => { try{ if (p.conn && p.conn.open) p.conn.send(m); }catch(e){} };
  const connected = () => [...players.values()].filter(p=>p.on);
  /* Ranking: mais pontos primeiro. EMPATE: vence quem gastou menos tempo somando as respostas certas.
     Se ainda assim empatar (ex.: todos com 0 pontos), dividem a mesma posição. */
  const ranked = () => [...players.values()].sort((a,b)=>b.score-a.score || a.time-b.time);

  /* ---------- painel: escolher qual sala abrir ---------- */
  function renderPanel(msg, isErr){
    phase = 'panel'; clearInterval(ticker);
    if (peer && !peer.destroyed) peer.destroy();
    peer = null;
    app.innerHTML = `
      <div class="wrap">
        <div class="row"><div class="brand">Quiz <b>ao Vivo</b></div><div class="spacer"></div>
          <button class="btn small ghost" data-act="logout">Sair</button></div>
        <h1 class="ptitle-l">Abrir uma sala</h1>
        <p class="sub">Cada quiz tem um código fixo, então o QR code da sala é sempre o mesmo.</p>
        <div class="pgrid">
          <div class="pcard">
            <div class="ptag">1</div><h3>Digitar o código</h3>
            <input class="field" id="qcode" maxlength="8" placeholder="CÓDIGO" autocapitalize="characters" autocomplete="off" spellcheck="false">
            <button class="btn primary" data-act="bycode">Abrir sala ▶</button>
          </div>
          <div class="pcard">
            <div class="ptag">2</div><h3>Ler o QR code</h3>
            <p>Use a câmera do computador para ler o QR code do quiz.</p>
            <button class="btn" data-act="scan">📷 Abrir câmera</button>
          </div>
          <div class="pcard">
            <div class="ptag">3</div><h3>Importar arquivo</h3>
            <p>Abra um arquivo de quiz (.json) salvo no computador.</p>
            <button class="btn" data-act="importopen">📂 Escolher arquivo</button>
          </div>
        </div>
        <p id="pmsg" class="pmsg ${isErr?'err':''}" role="status">${esc(msg||'')}</p>
        <div class="row" style="margin:22px 0 40px"><button class="btn ghost" data-act="editor">✏️ Criar ou editar um quiz</button></div>
        <input type="file" accept=".json,application/json" id="file" hidden>
      </div>`;
    const inp = document.getElementById('qcode');
    inp.oninput = ()=>{ const c = cleanCode(inp.value); if (c !== inp.value) inp.value = c; };
    inp.onkeydown = e=>{ if (e.key==='Enter') openByCode(inp.value); };
  }
  function panelMsg(t, err){ const el = document.getElementById('pmsg'); if (el){ el.textContent = t; el.classList.toggle('err', !!err); } }

  async function openByCode(raw){
    const c = cleanCode(raw);
    if (c.length < 3) return panelMsg('Digite o código do quiz.', true);
    panelMsg('Procurando o quiz '+c+'…');
    let q = null, why = '';
    try {
      const r = await fetch('quizzes/'+c+'.json', {cache:'no-store'});
      if (r.ok) q = await readQuizFile(await r.json(), pw);
    } catch(e){ why = errText(e); }
    if (!q && lib()[c]) { try { q = normalizeQuiz(lib()[c]); } catch(e){} }
    if (!q) return panelMsg(why || ('Não encontrei nenhum quiz com o código '+c+'.'), true);
    q.code = c;
    openRoom(q);
  }
  async function doScan(){
    try {
      const c = await scanQR();
      if (c){ const inp = document.getElementById('qcode'); if (inp) inp.value = c; openByCode(c); }
    } catch(e){
      panelMsg(e && e.name==='NotAllowedError' ? 'A câmera foi bloqueada. Libere a câmera no navegador ou digite o código.'
        : e && e.message==='script' ? 'Não consegui carregar o leitor de QR code. Digite o código.'
        : 'Não encontrei uma câmera neste computador. Digite o código.', true);
    }
  }

  /* ---------- editor ---------- */
  function renderEditor(){
    phase = 'edit';
    quiz = loadDraft(); save();
    const local = location.protocol === 'file:';
    app.innerHTML = `
      <div class="wrap">
        <div class="row"><button class="btn small ghost" data-act="panel">← Voltar</button><div class="brand">Editor de quiz</div><div class="spacer"></div>
          <button class="btn small ghost" data-act="import">Importar</button>
          <button class="btn small ghost" data-act="export">Exportar .json</button>
          <input type="file" accept=".json,application/json" id="file" hidden></div>
        ${local ? '<div class="banner">Você abriu o arquivo direto do computador. Para os celulares conseguirem entrar pelo QR code, o site precisa estar publicado na internet (ex.: Netlify).</div>' : ''}
        <div class="meta">
          <div><p class="lbl2">Título do quiz</p>
            <input class="titlein" data-f="title" value="${esc(quiz.title)}" placeholder="Ex.: HTML — início da aula"></div>
          <div><p class="lbl2">Código da sala (fixo)</p>
            <div class="row" style="gap:8px;flex-wrap:nowrap"><input class="titlein codein" data-f="code" maxlength="8" value="${esc(quiz.code)}" spellcheck="false" aria-label="Código da sala">
            <button class="btn small ghost" data-act="newcode" title="Gerar outro código">↻</button></div></div>
        </div>
        <div class="qrcard">
          <div class="qrthumb" id="qrthumb">${qrSVG(quiz.code)}</div>
          <div class="qrinfo">
            <h3>QR code da sala <span id="qrcode-lbl">${esc(quiz.code)}</span></h3>
            <p>É sempre o mesmo para este quiz. Baixe e coloque na sua apresentação.</p>
            <div class="row" style="gap:10px">
              <button class="btn small primary" data-act="qrpng">⬇ Baixar QR code (PNG)</button>
              <button class="btn small" data-act="lockfile">🔒 Gerar arquivo para o site</button>
            </div>
          </div>
        </div>
        <div id="qs">${quiz.questions.map(qCard).join('')}</div>
        <div class="row" style="margin:8px 0 40px">
          <button class="btn ghost" data-act="add">+ Adicionar pergunta</button><div class="spacer"></div>
          <button class="btn primary" data-act="open">Abrir sala ▶</button>
        </div>
      </div>`;
  }
  function qCard(q,i){
    return `<div class="qcard" data-i="${i}">
      <div class="qhead">Pergunta ${i+1}<div class="spacer"></div>
        <select data-f="time" aria-label="Tempo">${[10,20,30,45,60,90].map(t=>`<option value="${t}" ${q.time==t?'selected':''}>${t} s</option>`).join('')}</select>
        <button class="btn small" style="box-shadow:none;background:#f1eff6" data-act="up" title="Subir">↑</button>
        <button class="btn small" style="box-shadow:none;background:#f1eff6" data-act="del">Remover</button></div>
      <textarea data-f="text" placeholder="Digite a pergunta">${esc(q.text)}</textarea>
      <div class="opts">${[0,1,2,3].map(j=>`
        <div class="opt c${j}">${shape(j)}
          <input type="text" data-f="opt" data-j="${j}" value="${esc(q.options[j])}" placeholder="Resposta ${j+1}">
          <label><input type="radio" name="ok${i}" data-f="ok" data-j="${j}" ${q.correct===j?'checked':''}>certa</label>
        </div>`).join('')}</div>
    </div>`;
  }
  app.addEventListener('input', e=>{
    if (phase!=='edit') return;
    const f = e.target.dataset.f; if(!f) return;
    if (f==='title'){ quiz.title = e.target.value; save(); return; }
    if (f==='code'){ const c = cleanCode(e.target.value); if (c !== e.target.value) e.target.value = c; if (c.length >= 3){ quiz.code = c; save(); const t=document.getElementById('qrthumb'), l=document.getElementById('qrcode-lbl'); if(t) t.innerHTML=qrSVG(c); if(l) l.textContent=c; } return; }
    const card = e.target.closest('.qcard'); if(!card) return;
    const q = quiz.questions[+card.dataset.i];
    if (f==='text') q.text = e.target.value;
    if (f==='opt') q.options[+e.target.dataset.j] = e.target.value;
    if (f==='ok') q.correct = +e.target.dataset.j;
    if (f==='time') q.time = +e.target.value;
    save();
  });
  app.addEventListener('change', e=>{
    if (e.target.id==='file' && e.target.files[0]){
      const file = e.target.files[0]; e.target.value = '';
      file.text().then(t=>readQuizFile(JSON.parse(t), pw)).then(q=>{
        if (phase==='panel'){ remember(q); openRoom(q); }
        else { quiz = q; store.set('quizaovivo.quiz', quiz); renderEditor(); }
      }).catch(err=>{
        const t = errText(err) || 'Esse arquivo não é um quiz válido.';
        if (phase==='panel') panelMsg(t, true); else alert(t);
      });
      return;
    }
    const f = e.target.dataset && e.target.dataset.f; if (phase!=='edit' || !(f==='ok'||f==='time')) return;
    const q = quiz.questions[+e.target.closest('.qcard').dataset.i];
    if (f==='ok') q.correct = +e.target.dataset.j; else q.time = +e.target.value; save();
  });
  app.addEventListener('click', e=>{
    const b = e.target.closest('[data-act]'); if(!b) return;
    const act = b.dataset.act, card = b.closest('.qcard'), i = card ? +card.dataset.i : -1;
    if (act==='add'){ quiz.questions.push({text:'',options:['','','',''],correct:0,time:20}); save(); renderEditor(); window.scrollTo(0,document.body.scrollHeight); }
    else if (act==='del'){ if(confirm('Remover esta pergunta?')){ quiz.questions.splice(i,1); save(); renderEditor(); } }
    else if (act==='up' && i>0){ const q=quiz.questions.splice(i,1)[0]; quiz.questions.splice(i-1,0,q); save(); renderEditor(); }
    else if (act==='export') downloadJSON((quiz.title||'quiz').replace(/[^\w\- ]+/g,'').trim()+' - '+quiz.code+'.json', quiz);
    else if (act==='import' || act==='importopen') document.getElementById('file').click();
    else if (act==='newcode'){ if (confirm('Gerar um código novo? O QR code antigo deste quiz deixa de funcionar.')){ quiz.code = newCode(); save(); renderEditor(); } }
    else if (act==='qrpng'){
      if (location.protocol==='file:') return alert('Abra o site publicado (Netlify) para gerar o QR code com o endereço certo.');
      download('QR '+quiz.code+'.png', qrPNG(joinUrlFor(quiz.code), quiz.code, quiz.title));
    }
    else if (act==='lockfile'){
      lockQuiz(quiz, pw).then(f=>{
        downloadJSON(quiz.code+'.json', f);
        alert('Arquivo "'+quiz.code+'.json" gerado!\n\n1. Coloque-o na pasta "quizzes" do projeto.\n2. Publique de novo no Netlify.\n3. Depois é só digitar o código '+quiz.code+' (ou ler o QR code) na tela do apresentador.');
      }).catch(err=>alert(errText(err) || 'Não consegui gerar o arquivo.'));
    }
    else if (act==='open') openRoom(quiz);
    else if (act==='panel') renderPanel();
    else if (act==='editor') renderEditor();
    else if (act==='bycode') openByCode((document.getElementById('qcode')||{}).value);
    else if (act==='scan') doScan();
    else if (act==='logout'){ try{ sessionStorage.removeItem('quizaovivo.pw'); }catch(err){} location.hash = ''; }
    else if (act==='retry'){ retries = 0; phase = 'connecting'; createPeer(); }
    else if (act==='start') startQuestion(0);
    else if (act==='skip') reveal();
    else if (act==='reveal') revealNext();
    else if (act==='next') qi+1 < quiz.questions.length ? startQuestion(qi+1) : showFinal();
    else if (act==='full'){ try{ document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }catch(err){} }
    else if (act==='xlsx') downloadResults();
    else if (act==='back'){ if(confirm(phase==='final' ? 'Encerrar a sala e voltar ao painel?\n\nSe ainda não baixou o resultado, clique em Cancelar e baixe antes.' : 'Encerrar a sala e voltar ao painel?')){ location.reload(); } }
  });
  document.addEventListener('keydown', e=>{
    if (phase==='edit' || phase==='panel' || e.target.matches('input,textarea,select')) return;
    if (e.key==='Enter' || e.key===' '){ const p=app.querySelector('.btn.primary'); if(p && !p.disabled){ e.preventDefault(); p.click(); } }
  });

  /* ---------- planilha de resultado (só o apresentador vê esse botão) ---------- */
  function downloadResults(){
    const P = window.QUIZ_PLANILHA; if (!P) return alert('Não consegui gerar a planilha.');
    const qs = quiz.questions, n = qs.length, r = ranked(), total = r.length;
    const hits = p => p.hist.filter(x=>x===true).length;
    const mark = v => v===true ? {v:'Certo', s:'ok'} : v===false ? {v:'Errado', s:'bad'} : {v:'Sem resposta', s:'none'};
    const H = arr => arr.map(v=>({v, s:'header'}));
    const resultado = [
      H(['Posição','Nome', ...qs.map((_,i)=>'P'+(i+1)), 'Acertos', 'Pontuação final']),
      ...r.map(p=>[{v:rankOf(p), s:'center'}, p.name, ...qs.map((_,i)=>mark(p.hist[i])), {v:hits(p), s:'center'}, {v:p.score, s:'center'}])
    ];
    const perguntas = [
      H(['Nº','Pergunta','Resposta certa','Acertos','% de acerto']),
      ...qs.map((q,i)=>{ const ok = r.filter(p=>p.hist[i]===true).length; return [i+1, q.text, q.options[q.correct], ok, {v: total ? ok/total : 0, s:'pct'}]; })
    ];
    const now = new Date(), avgHits = total ? r.reduce((s,p)=>s+hits(p),0)/total : 0;
    const B = v => ({v, s:'bold'});
    const resumo = [
      [B('Quiz'), quiz.title], [B('Código da sala'), quiz.code],
      [B('Data'), now.toLocaleDateString('pt-BR')+' '+now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})],
      [B('Participantes'), total], [B('Perguntas'), n],
      [B('Média de acertos por aluno'), Math.round(avgHits*10)/10],
      [B('Acerto médio da turma'), {v: n ? avgHits/n : 0, s:'pct'}],
      [B('Média de pontos'), total ? Math.round(r.reduce((s,p)=>s+p.score,0)/total) : 0],
      [B('1º lugar'), r[0] ? r[0].name+' ('+r[0].score+' pts)' : '-']
    ];
    const blob = P.xlsx([
      {name:'Resultado', widths:[9,24, ...qs.map(()=>13), 10, 16], rows:resultado, freeze:true, filter:true},
      {name:'Perguntas', widths:[5,62,30,10,12], rows:perguntas, freeze:true},
      {name:'Resumo', widths:[28,44], rows:resumo}
    ]);
    const ymd = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    const u = URL.createObjectURL(blob);
    download(('Resultado - '+quiz.title+' - '+ymd).replace(/[\\/:*?"<>|]+/g,'-')+'.xlsx', u);
    setTimeout(()=>URL.revokeObjectURL(u), 5000);
  }

  /* ---------- sala ---------- */
  function openRoom(q){
    if (!q.questions.length) return alert('Esse quiz não tem perguntas.');
    const bad = q.questions.findIndex(x=>!x.text.trim() || x.options.some(o=>!o.trim()));
    if (bad>=0) return alert('Preencha o texto e as 4 respostas da pergunta '+(bad+1)+'.');
    quiz = q; remember(q); retries = 0;
    // partida nova: tudo começa do zero (participantes, pontos, respostas)
    SID = newCode() + newCode(); players.clear(); byPeer.clear(); qi = -1;
    phase = 'connecting';
    app.innerHTML = `<div class="pscreen"><div class="spin"></div><h2>Abrindo a sala ${esc(q.code)}…</h2></div>`;
    createPeer();
  }
  function roomError(t){
    app.innerHTML = `<div class="pscreen"><h2>Não consegui abrir a sala</h2><p>${esc(t)}</p>
      <div class="row" style="justify-content:center"><button class="btn primary" data-act="retry">Tentar de novo</button><button class="btn ghost" data-act="panel">Voltar</button></div></div>`;
  }
  function createPeer(){
    code = quiz.code;
    if (peer && !peer.destroyed) peer.destroy();
    peer = new Peer(PREFIX+code, {debug:0});
    peer.on('open', ()=>{ if(phase==='connecting') renderLobby(); });
    peer.on('connection', conn=>{
      conn.on('data', m=>onMsg(conn,m));
      conn.on('close', ()=>dropConn(conn));
      conn.on('error', ()=>dropConn(conn));
    });
    peer.on('disconnected', ()=>{ setTimeout(()=>{ try{ if(peer && !peer.destroyed) peer.reconnect(); }catch(e){} }, 1500); });
    peer.on('error', err=>{
      if (phase!=='connecting') return;
      if (err.type==='unavailable-id'){
        // o código é fixo: se a sala ainda estiver "presa" (aba recarregada, outra aba aberta), tenta de novo
        if (++retries <= 10){
          app.innerHTML = `<div class="pscreen"><div class="spin"></div><h2>Liberando a sala ${esc(code)}…</h2>
            <p>Ela ainda aparece aberta (em outra aba ou computador). Tentando de novo… (${retries}/10)</p>
            <button class="btn ghost" data-act="panel">Cancelar</button></div>`;
          setTimeout(()=>{ if (phase==='connecting') createPeer(); }, 3000);
        } else roomError('A sala '+code+' já está aberta em outra aba ou computador. Feche a outra e tente de novo.');
      } else roomError((err.type||err.message)+' — verifique a internet e tente de novo.');
    });
  }
  function dropConn(conn){
    const t = byPeer.get(conn.peer); byPeer.delete(conn.peer);
    const p = t && players.get(t);
    if (p && p.conn===conn){ p.on=false; if(phase==='lobby') renderLobbyPlayers(); if(phase==='question') updateAnswered(); }
  }
  function onMsg(conn, m){
    if (!m || typeof m!=='object') return;
    if (m.t==='join'){
      const token = String(m.token||'').slice(0,64); if(!token) return;
      // celular com dados de outra partida: manda escolher nome e avatar de novo
      if (!m.fresh && m.sid !== SID){ try{ conn.send({t:'reset'}); }catch(e){} return; }
      let p = players.get(token);
      if (!p){
        let name = String(m.name||'').trim().replace(/\s+/g,' ').slice(0,20) || 'Jogador';
        const names = new Set([...players.values()].map(x=>x.name.toLowerCase()));
        if (names.has(name.toLowerCase())){ let n=2; while(names.has((name+' '+n).toLowerCase())) n++; name = name+' '+n; }
        p = {token, name, avatar:AVATARS.random(), score:0, time:0, answer:null, at:0, pts:0, last:null, hist:[]};
        players.set(token, p);
      }
      if (AVATARS.has(m.avatar)) p.avatar = m.avatar;
      if (p.conn && p.conn!==conn){ try{ p.conn.close(); }catch(e){} }
      p.conn = conn; p.on = true; byPeer.set(conn.peer, token);
      send(p, {t:'welcome', name:p.name, title:quiz.title, sid:SID});
      sync(p);
      if (phase==='lobby') renderLobbyPlayers();
      if (phase==='question') updateAnswered();
      return;
    }
    const p = players.get(byPeer.get(conn.peer)); if(!p) return;
    if (m.t==='answer' && phase==='question' && m.q===qi && p.answer===null){
      const a = +m.a; if (!(a>=0 && a<4)) return;
      p.answer = a; p.at = performance.now()-qStart;
      send(p, {t:'answered'});
      updateAnswered();
      const on = connected(); if (on.length && on.every(x=>x.answer!==null)) reveal();
    }
  }
  function sync(p){
    const q = quiz.questions[qi];
    if (phase==='lobby') send(p,{t:'lobby'});
    else if (phase==='question'){
      if (p.answer!==null) send(p,{t:'answered'});
      else send(p,{t:'question', q:qi, total:quiz.questions.length, text:q.text, options:q.options, left:Math.max(0,q.time*1000-(performance.now()-qStart))});
    }
    else if (phase==='reveal') send(p, p.last || {t:'result', ok:false, pts:0, score:p.score, none:true});
    else if (phase==='final') send(p, stepI >= steps.length ? finalMsg(p, 0) : {t:'podium'});
  }
  const rankOf = p => 1 + [...players.values()].filter(q => q.score>p.score || (q.score===p.score && q.time<p.time)).length;
  const topInfo = () => ranked().slice(0,3).map(p=>({name:p.name, avatar:p.avatar, score:p.score, rank:rankOf(p)}));
  // delay: quanto tempo o celular espera para revelar (para não estragar a surpresa do pódio no telão)
  const finalMsg = (p, delay) => ({t:'final', score:p.score, rank:rankOf(p), of:players.size, top:topInfo(), delay});

  function renderLobby(){
    phase = 'lobby';
    const qr = qrcode(0,'M'); qr.addData(joinUrl()); qr.make();
    app.innerHTML = `
      <div class="wrap">
        <div class="row"><div class="brand">${esc(quiz.title)}</div><div class="spacer"></div>
          <button class="btn small ghost" data-act="qrpng">⬇ Baixar QR code</button>
          <button class="btn small ghost" data-act="full">Tela cheia</button>
          <button class="btn small ghost" data-act="back">Encerrar</button></div>
        ${location.protocol==='file:' ? '<div class="banner">Atenção: aberto como arquivo local — o QR code só funciona depois que o site estiver publicado.</div>' : ''}
        <div class="lobby">
          <div class="joinbox">
            <div class="lbl">Aponte a câmera para o QR code ou acesse</div>
            <div class="url">${esc(location.host + location.pathname)}</div>
            <div class="lbl">e digite o código da sala</div>
            <div class="code">${code}</div>
          </div>
          <div class="qr">${qr.createSvgTag({scalable:true, margin:1})}</div>
        </div>
        <div class="row"><div class="count" id="count"></div><div class="spacer"></div>
          <button class="btn primary" data-act="start" id="startBtn">Começar ▶</button></div>
        <div class="chips" id="chips"></div>
      </div>`;
    renderLobbyPlayers();
  }
  function renderLobbyPlayers(){
    const c = document.getElementById('count'), ch = document.getElementById('chips'), sb = document.getElementById('startBtn');
    if (!c) return;
    const on = connected().length;
    c.textContent = on + (on===1?' pessoa conectada':' pessoas conectadas');
    sb.disabled = on===0;
    ch.innerHTML = [...players.values()].map(p=>`<span class="chip ${p.on?'':'off'}">${avatar(p.avatar,'av-sm')}${esc(p.name)}</span>`).join('');
  }

  /* ---------- perguntas ---------- */
  function startQuestion(i){
    qi = i; phase = 'question';
    const q = quiz.questions[i];
    players.forEach(p=>{ p.answer=null; p.at=0; p.pts=0; p.last=null; });
    qStart = performance.now();
    app.innerHTML = `
      <div class="topbar"><span class="pill">Pergunta ${i+1} de ${quiz.questions.length}</span><div class="spacer"></div>
        <button class="btn small ghost" data-act="skip">Encerrar tempo</button></div>
      <div class="qtext">${esc(q.text)}</div>
      <div class="mid"><div class="timer" id="timer">${q.time}</div>
        <div class="answered"><b id="ans">0</b>respostas</div></div>
      <div class="tiles">${q.options.map((o,j)=>`<div class="tile c${j}">${shape(j)}<span>${esc(o)}</span></div>`).join('')}</div>`;
    players.forEach(p=>{ if(p.on) sync(p); });
    clearInterval(ticker);
    ticker = setInterval(()=>{
      const left = Math.ceil((q.time*1000-(performance.now()-qStart))/1000);
      const t = document.getElementById('timer'); if (t) t.textContent = Math.max(0,left);
      if (left<=0) reveal();
    }, 200);
    updateAnswered();
  }
  function updateAnswered(){
    const el = document.getElementById('ans'); if(!el) return;
    const n = [...players.values()].filter(p=>p.answer!==null).length;
    el.textContent = n + ' / ' + connected().length;
  }
  function reveal(){
    if (phase!=='question') return;
    clearInterval(ticker); phase = 'reveal';
    const q = quiz.questions[qi], lim = q.time*1000;
    const counts = [0,0,0,0];
    players.forEach(p=>{
      if (p.answer!==null){ counts[p.answer]++; if (p.answer===q.correct){ p.pts = Math.round(1000*(1-0.5*Math.min(p.at/lim,1))); p.score += p.pts; p.time += p.at; } }
      p.hist[qi] = p.answer===null ? null : p.answer===q.correct;   // para a planilha de resultado
    });
    // participantes da pergunta: quem estava conectado ou respondeu
    const total = [...players.values()].filter(p=>p.on || p.answer!==null).length;
    players.forEach(p=>{ p.last = {t:'result', ok:p.answer===q.correct, none:p.answer===null, pts:p.pts, score:p.score, correctText:q.options[q.correct]}; send(p, p.last); });
    const right = counts[q.correct], last = qi+1 >= quiz.questions.length;
    app.innerHTML = `
      <div class="topbar"><span class="pill">Pergunta ${qi+1} de ${quiz.questions.length}</span><div class="spacer"></div>
        <button class="btn primary" data-act="next">${last ? 'Ver pódio 🏆' : 'Próxima pergunta ▶'}</button></div>
      <div class="qtext">${esc(q.text)}</div>
      <div class="mid"><div class="rsum"><b>${right}</b> de ${total} ${right===1 ? 'acertou' : 'acertaram'}</div></div>
      <div class="tiles">${q.options.map((o,j)=>{
        const pct = total ? Math.round(counts[j]/total*100) : 0;
        return `<div class="tile rtile c${j} ${j===q.correct ? 'right' : ''}" data-p="${pct}">
          <span class="rfill"></span>${shape(j)}<span class="rtxt">${esc(o)}</span>
          <span class="rcount">${counts[j]} de ${total}</span>${j===q.correct ? '<span class="tick">✓</span>' : ''}</div>`;
      }).join('')}</div>`;
    // as barras enchem: fundo = cor escura do card, preenchimento = cor original
    requestAnimationFrame(()=>requestAnimationFrame(()=>app.querySelectorAll('.rtile').forEach(t=>{ t.querySelector('.rfill').style.width = t.dataset.p + '%'; })));
  }

  /* ---------- pódio: o apresentador clica para revelar 3º, 2º e 1º ---------- */
  function showFinal(){
    phase = 'final';
    const top = topInfo();
    steps = [3,2,1].filter(n=>top[n-1]); stepI = 0;
    ranked().forEach(p=>send(p, {t:'podium'}));   // celulares: "olhe para a tela"
    app.innerHTML = `
      <div class="stage">
        <div class="rays"></div><div class="spot l"></div><div class="spot r"></div>
        <canvas class="confetti" id="cf"></canvas>
        <div class="stage-inner">
          <div class="topbar"><div class="brand">${esc(quiz.title)}</div><div class="spacer"></div>
            <span id="podBtn"></span>
            <button class="btn small ghost" data-act="back">Encerrar</button></div>
          <h1 class="big stage-title">Pódio</h1>
          ${podiumHTML(top, [0,0,0], null, true)}
        </div>
      </div>`;
    podButton();
  }
  function podButton(){
    // botões em cima de cada degrau: só o próximo da ordem (3º → 2º → 1º) fica liberado
    app.querySelectorAll('.revealbtn').forEach(b=>{
      const n = +b.dataset.n, next = stepI < steps.length && steps[stepI] === n;
      b.disabled = !next;
      b.innerHTML = next ? `Revelar ${n}º lugar ${n===1 ? '🏆' : '▶'}` : `🔒 ${n}º lugar`;
      b.classList.toggle('next', next);
    });
    const el = document.getElementById('podBtn'); if (!el) return;
    el.innerHTML = stepI < steps.length
      ? `<button class="btn primary" data-act="reveal">Revelar ${steps[stepI]}º lugar ${steps[stepI]===1 ? '🏆' : '▶'}</button>`
      : `<button class="btn small primary" data-act="xlsx">⬇ Baixar resultado (planilha)</button>`;
  }
  function revealNext(){
    if (phase!=='final' || stepI >= steps.length) return;
    const n = steps[stepI++];
    const pod = app.querySelector('.pod.p'+n);
    if (pod){ pod.style.setProperty('--d','0s'); pod.classList.remove('wait'); }
    if (n===1){
      setTimeout(()=>confetti(document.getElementById('cf'), {duration:7000, burst:220, rain:5}), 1300);
      ranked().forEach(p=>send(p, finalMsg(p, 1800)));   // celulares mostram o resultado depois do 1º
    }
    podButton();
  }

  window.addEventListener('beforeunload', e=>{ if (['lobby','question','reveal'].includes(phase)){ e.preventDefault(); e.returnValue=''; } });
  renderPanel();
}

/* ============================== PARTICIPANTE ============================== */
function player(code){
  const KEY = 'quizaovivo.player.'+code;
  const me = store.get(KEY) || {token:uid(), name:''};
  if (!AVATARS.has(me.avatar)) me.avatar = AVATARS.random();
  let fresh = false;   // true = acabou de escolher nome/avatar nesta tela
  let peer = null, conn = null, joined = false, view = null, cur = null, retry = null, cdown = null, finalT = null, finalKey = '';
  const save = () => store.set(KEY, me);

  function screen(html, cls){ clearInterval(cdown); clearTimeout(finalT); app.innerHTML = `<div class="pscreen ${cls||''}">${html}</div>`; }
  const meTag = () => `<span class="metag">${avatar(me.avatar,'av-xs')}${esc(me.name)}</span>`;
  function head(){ return `<div class="phead">${meTag()}<span>Sala ${esc(code)}</span></div>`; }

  function askName(msg){
    view='name';
    app.innerHTML = `<div class="pscreen join">
      <div class="brand">Quiz <b>ao Vivo</b></div>
      <p>Sala <b>${esc(code)}</b></p>
      <div id="avbig">${avatar(me.avatar,'av-xl pop')}</div>
      <input class="field" id="nm" maxlength="20" placeholder="Seu nome" value="${esc(me.name)}" autocomplete="nickname">
      <p class="pick-lbl">Escolha seu avatar</p>
      <div class="avgrid" role="radiogroup" aria-label="Escolha seu avatar">
        ${AVATARS.list.map(a=>`<button type="button" class="avopt" role="radio" aria-checked="${a.id===me.avatar}" aria-label="${esc(a.nome)}" title="${esc(a.nome)}" data-av="${a.id}">${a.svg}</button>`).join('')}
      </div>
      <button class="btn primary" id="go" style="width:100%;max-width:360px">Entrar</button>
      ${msg?`<p style="color:#ffd0d0">${esc(msg)}</p>`:''}</div>`;
    app.querySelector('.avgrid').onclick = e=>{
      const b = e.target.closest('.avopt'); if(!b) return;
      me.avatar = b.dataset.av;
      app.querySelectorAll('.avopt').forEach(x=>x.setAttribute('aria-checked', String(x===b)));
      document.getElementById('avbig').innerHTML = avatar(me.avatar,'av-xl pop');
    };
    const go = ()=>{ const nm=document.getElementById('nm'), v=nm.value.trim(); if(!v){ nm.focus(); return; } me.name=v; save(); fresh = true; connect(); };
    document.getElementById('go').onclick = go;
    document.getElementById('nm').onkeydown = e=>{ if(e.key==='Enter') go(); };
  }

  function connect(){
    clearTimeout(retry);
    if (!joined && view!=='waiting') screen('<div class="spin"></div><h2>Entrando…</h2>');
    if (!peer || peer.destroyed){
      peer = new Peer({debug:0});
      peer.on('open', openConn);
      peer.on('disconnected', ()=>{ setTimeout(()=>{ try{ if(!peer.destroyed) peer.reconnect(); }catch(e){} },1500); });
      peer.on('error', err=>{
        if (err.type==='peer-unavailable'){
          if (joined) return scheduleRetry();
          waiting();
        } else if (['network','server-error','socket-error','socket-closed'].includes(err.type)) scheduleRetry();
      });
    } else if (peer.open) openConn();
  }
  function openConn(){
    if (conn && conn.open) return;
    conn = peer.connect(PREFIX+code, {reliable:true});
    conn.on('open', ()=>conn.send({t:'join', token:me.token, name:me.name, avatar:me.avatar, sid:me.sid||'', fresh}));
    conn.on('data', onMsg);
    // depois do pódio o jogo acabou: não reconecta nem troca a tela
    conn.on('close', ()=>{ if(joined && view!=='final'){ reconnecting(); scheduleRetry(); } });
    conn.on('error', ()=>scheduleRetry());
  }
  // QR code lido antes da hora: espera a sala abrir e entra sozinho
  function waiting(){
    if (view!=='waiting'){
      view = 'waiting';
      screen(`${avatar(me.avatar,'av-xl')}<div class="spin"></div><h2>Esperando o apresentador…</h2>
        <p>A sala <b>${esc(code)}</b> ainda não foi aberta.<br>Assim que abrir, você entra sozinho.</p>
        <a href="#" class="link-muted" id="chg">Digitei o código errado</a>`);
      document.getElementById('chg').onclick = e=>{ e.preventDefault(); location.hash = ''; };
    }
    clearTimeout(retry); retry = setTimeout(()=>{ conn = null; connect(); }, 3000);
  }
  // a sala foi reaberta (partida nova): esquece nome, avatar e pontos da partida anterior
  function resetMe(){
    try{ localStorage.removeItem(KEY); }catch(e){}
    me.token = uid(); me.name = ''; me.avatar = AVATARS.random(); delete me.sid;
    joined = false; fresh = false; clearTimeout(retry);
    const c = conn; conn = null; try{ c && c.close(); }catch(e){}
    askName('Nova partida! Escolha seu nome e avatar.');
  }
  function reconnecting(){ screen(head()+'<div class="spin"></div><h2>Reconectando…</h2><p>Não feche esta página.</p>'); }
  function scheduleRetry(){ if (view==='final') return; clearTimeout(retry); retry = setTimeout(()=>{ conn=null; connect(); }, 2000); }

  function onMsg(m){
    if (!m || typeof m!=='object') return;
    if (m.t==='welcome'){ joined=true; view='joined'; me.name=m.name; me.sid=m.sid; fresh=false; save(); return; }
    if (m.t==='reset'){ resetMe(); return; }
    if (m.t==='podium'){
      if (view!=='podiumwait' && view!=='final'){ view='podiumwait'; screen(`${avatar(me.avatar,'av-xl')}<div class="drum">🥁</div><h2>Revelando o pódio…</h2><p>Olhe para a tela! 👀</p>`); }
      return;
    }
    if (m.t==='lobby'){ view='lobby'; screen(`${avatar(me.avatar,'av-xl pop')}<h2>Você está dentro! 🎉</h2><p>Procure <b>${esc(me.name)}</b> na tela.</p><p style="opacity:.7">Aguarde o apresentador começar…</p>`); }
    else if (m.t==='question') showQuestion(m);
    else if (m.t==='answered'){ view='answered'; screen(`${head()}<div style="flex:1"></div><div class="spin"></div><h2>Resposta enviada!</h2><p>Esperando o tempo acabar…</p><div style="flex:1"></div>`); fixHead(); }
    else if (m.t==='result'){
      view='result';
      const title = m.none ? 'Sem resposta ⏱' : m.ok ? 'Acertou! ✔' : 'Errou ✘';
      screen(`${head()}<div style="flex:1"></div><h2 style="font-size:40px">${title}</h2>
        ${m.ok?`<div class="pts">+${m.pts}</div>`:`<p>Resposta certa: <b>${esc(m.correctText||'')}</b></p>`}
        <div style="flex:1"></div>
        <div class="foot"><span>Total</span><span>${m.score} pts</span></div>`, 'pres '+(m.ok?'ok':'bad'));
      fixHead();
    }
    else if (m.t==='final') showFinal(m);
  }
  function showFinal(m){
    // o mesmo resultado chegando de novo não redesenha a tela (evita a animação repetir)
    const key = JSON.stringify([m.rank, m.score, m.of, m.top]);
    if (view==='final' && key===finalKey) return;
    finalKey = key;
    const prev = view;
    view='final';
    const rank = Math.max(1, m.rank|0), of = m.of|0, score = m.score|0;
    const top = (Array.isArray(m.top) ? m.top : []).slice(0,3).map(p=>({name:String(p&&p.name||''), avatar:p&&p.avatar, score:(p&&p.score)|0, rank:Math.max(1,(p&&p.rank)|0)}));
    const render = ()=>{
      clearInterval(cdown);
      const medal = ['🥇','🥈','🥉'][rank-1] || '';
      app.innerHTML = `
        <div class="stage pstage">
          <div class="rays"></div><canvas class="confetti" id="cf"></canvas>
          <div class="stage-inner">
            <h2 class="ptitle">Pódio</h2>
            ${podiumHTML(top, [0.9, 0.5, 0.1], rank)}
            <div class="mycard ${rank===1?'gold':''}">
              ${rank===1 ? `<div class="crown">${CROWN}</div>` : ''}
              ${avatar(me.avatar,'av-lg')}
              <div class="place">${medal ? medal+' ' : ''}Você ficou em <b>${rank}º</b> lugar</div>
              <div class="of">de ${of} participantes · <b>${score} pts</b></div>
              <div class="thanks">${rank===1 ? 'Parabéns, você venceu! 🏆' : rank<=3 ? 'Mandou muito bem! 🎉' : 'Obrigado por jogar!'}</div>
            </div>
          </div>
        </div>`;
      if (rank===1) confetti(document.getElementById('cf'), {duration:6000, burst:160, rain:3});
      else if (rank<=3) confetti(document.getElementById('cf'), {duration:0, burst:90, rain:0});
      if (rank===1 && navigator.vibrate) try{ navigator.vibrate([80,60,80,60,200]); }catch(e){}
    };
    if (m.delay > 0){
      if (prev!=='podiumwait') screen(`${avatar(me.avatar,'av-xl')}<div class="drum">🥁</div><h2>Revelando o pódio…</h2><p>Olhe para a tela! 👀</p>`);
      clearTimeout(finalT); finalT = setTimeout(render, Math.min(m.delay, 10000));
    } else render();
  }
  function fixHead(){ const p=app.querySelector('.pscreen'); if(p){ p.style.padding='0'; } }
  function showQuestion(m){
    view='question'; cur=m;
    const ends = Date.now()+m.left;
    app.innerHTML = `<div class="phead"><span>${m.q+1} / ${m.total}</span><span id="pt">${Math.ceil(m.left/1000)}</span>${meTag()}</div>
      <div style="padding:12px 14px 0;font-weight:800;font-size:17px;text-align:center">${esc(m.text)}</div>
      <div class="pbtns">${m.options.map((o,j)=>`<button class="pbtn c${j}" data-a="${j}">${shape(j)}<span>${esc(o)}</span></button>`).join('')}</div>`;
    app.querySelectorAll('.pbtn').forEach(b=>b.onclick=()=>{
      if (view!=='question') return; view='sending';
      try{ conn.send({t:'answer', q:m.q, a:+b.dataset.a}); }catch(e){}
      app.querySelectorAll('.pbtn').forEach(x=>{ if(x!==b) x.style.opacity=.25; });
      if (navigator.vibrate) try{ navigator.vibrate(30); }catch(e){}
    });
    clearInterval(cdown);
    cdown = setInterval(()=>{ const el=document.getElementById('pt'); if(el) el.textContent=Math.max(0,Math.ceil((ends-Date.now())/1000)); },250);
  }

  if (me.name) connect(); else askName();
}
})();
