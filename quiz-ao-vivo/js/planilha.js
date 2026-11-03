/* =====================================================================
   PLANILHA — gera um arquivo Excel (.xlsx) direto no navegador,
   sem biblioteca externa. Usado para baixar o resultado do quiz.

   QUIZ_PLANILHA.xlsx([{ name, widths, rows, freeze, filter }]) -> Blob
   Cada célula: texto, número ou { v: valor, s: 'header'|'ok'|'bad'|'none'|'bold'|'pct'|'center' }
   ===================================================================== */
(function(){
"use strict";
const STYLE = { normal:0, header:1, ok:2, bad:3, none:4, bold:5, pct:6, center:7 };
const enc = new TextEncoder();
const xmlEsc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))
                             .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const colName = i => { let s=''; i++; while (i>0){ const m=(i-1)%26; s=String.fromCharCode(65+m)+s; i=Math.floor((i-1)/26); } return s; };

function sheetXML(sh){
  const rows = sh.rows.map((row, r)=>`<row r="${r+1}">${row.map((cell, c)=>{
    if (cell === null || cell === undefined || cell === '') return '';
    const o = (typeof cell === 'object') ? cell : {v:cell};
    const s = STYLE[o.s] || 0, ref = colName(c)+(r+1);
    return (typeof o.v === 'number' && isFinite(o.v))
      ? `<c r="${ref}" s="${s}"><v>${o.v}</v></c>`
      : `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(o.v)}</t></is></c>`;
  }).join('')}</row>`).join('');
  const ncols = Math.max(1, ...sh.rows.map(r=>r.length));
  const cols = (sh.widths||[]).map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('');
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + (sh.freeze ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' : '')
    + (cols ? `<cols>${cols}</cols>` : '')
    + `<sheetData>${rows}</sheetData>`
    + (sh.filter && sh.rows.length > 1 ? `<autoFilter ref="A1:${colName(ncols-1)}${sh.rows.length}"/>` : '')
    + '</worksheet>';
}

const STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
 + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
 + '<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font>'
 + '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'
 + '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
 + '<fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
 + '<fill><patternFill patternType="solid"><fgColor rgb="FF46178F"/><bgColor indexed="64"/></patternFill></fill>'
 + '<fill><patternFill patternType="solid"><fgColor rgb="FFC6EFCE"/><bgColor indexed="64"/></patternFill></fill>'
 + '<fill><patternFill patternType="solid"><fgColor rgb="FFFFC7CE"/><bgColor indexed="64"/></patternFill></fill>'
 + '<fill><patternFill patternType="solid"><fgColor rgb="FFEDEDED"/><bgColor indexed="64"/></patternFill></fill></fills>'
 + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
 + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
 + '<cellXfs count="8">'
 + '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
 + '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'
 + '<xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1" applyAlignment="1"><alignment horizontal="center"/></xf>'
 + '<xf numFmtId="0" fontId="0" fillId="4" borderId="0" xfId="0" applyFill="1" applyAlignment="1"><alignment horizontal="center"/></xf>'
 + '<xf numFmtId="0" fontId="0" fillId="5" borderId="0" xfId="0" applyFill="1" applyAlignment="1"><alignment horizontal="center"/></xf>'
 + '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
 + '<xf numFmtId="9" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="center"/></xf>'
 + '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center"/></xf>'
 + '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

/* ---------- ZIP simples (sem compressão), que é o "pacote" de um .xlsx ---------- */
const CRC = (()=>{ const t = new Uint32Array(256); for (let n=0;n<256;n++){ let c=n; for (let k=0;k<8;k++) c = c&1 ? 0xEDB88320^(c>>>1) : c>>>1; t[n]=c>>>0; } return t; })();
const crc32 = u8 => { let c = 0xFFFFFFFF; for (let i=0;i<u8.length;i++) c = CRC[(c^u8[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };
function zip(files){
  const parts = [], central = []; let offset = 0;
  const d = new Date(), dosTime = (d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1), dosDate = ((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
  for (const f of files){
    const name = enc.encode(f.name), data = enc.encode(f.data), crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(6,0x0800,true); h.setUint16(8,0,true);
    h.setUint16(10,dosTime,true); h.setUint16(12,dosDate,true); h.setUint32(14,crc,true);
    h.setUint32(18,data.length,true); h.setUint32(22,data.length,true); h.setUint16(26,name.length,true); h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(8,0x0800,true); c.setUint16(10,0,true);
    c.setUint16(12,dosTime,true); c.setUint16(14,dosDate,true); c.setUint32(16,crc,true);
    c.setUint32(20,data.length,true); c.setUint32(24,data.length,true); c.setUint16(28,name.length,true);
    c.setUint32(42,offset,true);
    central.push(new Uint8Array(c.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const csize = central.reduce((s,a)=>s+a.length,0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0,0x06054b50,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true);
  e.setUint32(12,csize,true); e.setUint32(16,offset,true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}

function xlsx(sheets){
  const safe = sheets.map((s,i)=>({...s, name: (String(s.name||('Planilha'+(i+1))).replace(/[\[\]:*?\/\\]/g,' ').slice(0,31)) || ('Planilha'+(i+1))}));
  const files = [
    {name:'[Content_Types].xml', data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
      + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
      + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
      + safe.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
      + '</Types>'},
    {name:'_rels/.rels', data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
    {name:'xl/workbook.xml', data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
      + safe.map((s,i)=>`<sheet name="${xmlEsc(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('') + '</sheets>'
      + (safe.some(s=>s.filter) ? '<definedNames>' + safe.map((s,i)=> s.filter && s.rows.length>1 ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xmlEsc(s.name).replace(/'/g,"''")}'!$A$1:$${colName(Math.max(...s.rows.map(r=>r.length))-1)}$${s.rows.length}</definedName>` : '').join('') + '</definedNames>' : '')
      + '</workbook>'},
    {name:'xl/_rels/workbook.xml.rels', data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + safe.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')
      + `<Relationship Id="rId${safe.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`},
    {name:'xl/styles.xml', data:STYLES},
    ...safe.map((s,i)=>({name:`xl/worksheets/sheet${i+1}.xml`, data:sheetXML(s)}))
  ];
  return zip(files);
}

window.QUIZ_PLANILHA = { xlsx };
})();
