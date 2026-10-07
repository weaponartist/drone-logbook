// DGAC flight authorizations: prepare the request, track its status and validity, keep the paper trail
// (KMZ, owner's permission letter, DGAC reply) on the device, and link flights to the approved number.

Object.assign(STR.en, {
  authsTitle: 'DGAC authorizations', newAuth: '+ New request', authPurpose: 'Purpose of the flight', authPlace: 'Place / area',
  authDate: 'Planned flight date', authTime: 'Time window', authStatus: 'Status', authNumber: 'Authorization #',
  validFrom: 'Valid from', validTo: 'Valid until', authDocs: 'Documents to attach', authFiles: 'Paper trail (saved on this phone)',
  st_draft: 'Preparing', st_sent: 'Sent — waiting', st_approved: 'Approved', st_rejected: 'Rejected',
  sendBy: (d, n) => `Send by ${d} (${n} business days before; holidays not counted)`, late: 'Too late for the usual notice — contact the DGAC',
  prepEmail: 'Prepare email to DGAC', emailNote: 'Opens your email app with a cover letter. Attach the official request form and the documents above before sending.',
  doc_form: 'Official request form', doc_registration: 'Drone registration card', doc_credential: 'Pilot credential(s)',
  doc_insurance: 'Liability insurance policy', doc_kmz: 'KMZ file of the area (Google Earth)', doc_permission: "Owner's / manager's permission letter",
  file_kmz: 'KMZ file', file_permission: 'Permission letter', file_reply: 'DGAC reply', attach: 'Attach', open: 'Open',
  authExpSoon: (n, d) => `<b>Authorization ${n} expires in ${d} days.</b>`, authSendSoon: (p, d) => `<b>Send your DGAC request for "${p}" by ${d}.</b>`,
  noAuths: 'No requests yet. Flying over a populated area? Start one at least 7 business days ahead.',
  linkAuth: 'DGAC authorization', authValidOn: 'valid on this date', authFlights: (n) => `${n} flight${n === 1 ? '' : 's'} logged under it`,
  leadNote: 'Send the request at least 7 business days before the flight (DAN 91 Annex D; DAN 151 Appendix A). Chilean holidays are not counted here.',
  confirmDelAuth: 'Delete this request and its attached files?',
  authLate: (p) => `<b>"${p}": the usual DGAC notice period has passed.</b> Send it now and contact the DGAC, or move the flight date.`,
});
Object.assign(STR.es, {
  authsTitle: 'Autorizaciones DGAC', newAuth: '+ Nueva solicitud', authPurpose: 'Objetivo del vuelo', authPlace: 'Lugar / área',
  authDate: 'Fecha del vuelo', authTime: 'Horario', authStatus: 'Estado', authNumber: 'N° de autorización',
  validFrom: 'Vigente desde', validTo: 'Vigente hasta', authDocs: 'Documentos a adjuntar', authFiles: 'Respaldo (guardado en este teléfono)',
  st_draft: 'En preparación', st_sent: 'Enviada — esperando', st_approved: 'Aprobada', st_rejected: 'Rechazada',
  sendBy: (d, n) => `Enviar antes del ${d} (${n} días hábiles antes; no cuenta feriados)`, late: 'Ya pasó el plazo habitual — contacta a la DGAC',
  prepEmail: 'Preparar correo a la DGAC', emailNote: 'Abre tu correo con una carta de presentación. Adjunta el formulario oficial y los documentos de arriba antes de enviar.',
  doc_form: 'Formulario oficial de solicitud', doc_registration: 'Tarjeta de registro del RPA', doc_credential: 'Credencial(es) del piloto',
  doc_insurance: 'Póliza de seguro de responsabilidad civil', doc_kmz: 'Archivo KMZ del área (Google Earth)', doc_permission: 'Carta de permiso del dueño / administrador',
  file_kmz: 'Archivo KMZ', file_permission: 'Carta de permiso', file_reply: 'Respuesta DGAC', attach: 'Adjuntar', open: 'Abrir',
  authExpSoon: (n, d) => `<b>La autorización ${n} vence en ${d} días.</b>`, authSendSoon: (p, d) => `<b>Envía tu solicitud DGAC "${p}" antes del ${d}.</b>`,
  noAuths: 'Aún no hay solicitudes. ¿Vas a volar sobre zona poblada? Empieza una con al menos 7 días hábiles de anticipación.',
  linkAuth: 'Autorización DGAC', authValidOn: 'vigente en esta fecha', authFlights: (n) => `${n} vuelo${n === 1 ? '' : 's'} registrado${n === 1 ? '' : 's'} con ella`,
  leadNote: 'Envía la solicitud al menos 7 días hábiles antes del vuelo (DAN 91 Anexo D; DAN 151 Apéndice A). Aquí no se descuentan los feriados chilenos.',
  confirmDelAuth: '¿Eliminar esta solicitud y sus archivos adjuntos?',
  authLate: (p) => `<b>"${p}": ya pasó el plazo habitual de la DGAC.</b> Envíala ahora y contacta a la DGAC, o cambia la fecha del vuelo.`,
});

const AUTH_LEAD_DAYS = 7;
const AUTH_DOCS = ['form', 'registration', 'credential', 'insurance', 'kmz', 'permission'];
const AUTH_FILES = ['kmz', 'permission', 'reply'];
const auths = () => (state.auths ||= []);

// ---------- attachments in IndexedDB (localStorage is too small for files) ----------
const fileStore = (() => {
  let dbp;
  const db = () => dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open('dlb-files', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('files');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const run = async (mode, fn) => {
    const d = await db();
    return new Promise((res, rej) => {
      const tx = d.transaction('files', mode), req = fn(tx.objectStore('files'));
      tx.oncomplete = () => res(req?.result); tx.onerror = () => rej(tx.error);
    });
  };
  return {
    put: (k, v) => run('readwrite', s => s.put(v, k)),
    get: k => run('readonly', s => s.get(k)),
    del: k => run('readwrite', s => s.delete(k)),
    keys: () => run('readonly', s => s.getAllKeys()),
  };
})();
const blobToDataURL = b => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });

// Used by backup/restore in app.js so attachments travel with the logbook.
window.backupFiles = async () => {
  const out = {};
  try { for (const k of await fileStore.keys()) { const v = await fileStore.get(k); if (v) out[k] = { name: v.name, data: await blobToDataURL(v.blob) }; } } catch {}
  return out;
};
window.restoreFiles = async files => {
  for (const [k, v] of Object.entries(files || {})) {
    try { await fileStore.put(k, { name: v.name, blob: await (await fetch(v.data)).blob() }); } catch {}
  }
};

// ---------- dates ----------
const dayMs = 864e5;
const isoDay = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
function minusBusinessDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  while (n > 0) { d.setDate(d.getDate() - 1); if (d.getDay() % 6) n--; }
  return d;
}
const fmtDay = (s, l = loc()) => s ? new Date(s + 'T12:00:00').toLocaleDateString(l, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const daysUntil = s => Math.floor((Date.parse(s + 'T23:59:59') - Date.now()) / dayMs);
const authValidOn = (a, iso) => a.status === 'approved' && a.validFrom && a.validTo && iso >= a.validFrom && iso <= a.validTo;

// ---------- alerts for the Log screen ----------
window.authAlerts = () => {
  const out = [];
  for (const a of auths()) {
    if (a.status === 'approved' && a.validTo) { const d = daysUntil(a.validTo); if (d >= 0 && d <= 14) out.push(t('authExpSoon', a.number || '', d)); }
    if (a.status === 'draft' && a.flightDate) {
      const by = minusBusinessDays(a.flightDate, AUTH_LEAD_DAYS), d = daysUntil(isoDay(by));
      if (daysUntil(a.flightDate) < 0) continue;
      if (d < 0) out.push(t('authLate', a.purpose || a.place || ''));
      else if (d <= 5) out.push(t('authSendSoon', a.purpose || a.place || '', fmtDay(isoDay(by))));
    }
  }
  return out;
};

// ---------- Rules tab section ----------
window.authsSection = c => {
  if (c !== 'CL') return '';
  const list = [...auths()].sort((a, b) => (b.flightDate || '').localeCompare(a.flightDate || ''));
  const rows = list.map(a => {
    const n = state.flights.filter(f => f.authId === a.id).length;
    let sub = t('st_' + a.status);
    if (a.status === 'approved' && a.validTo) sub += ` · ${t('validTo').toLowerCase()} ${fmtDay(a.validTo)}`;
    if (a.status === 'draft' && a.flightDate) sub += ` · ${t('authDate').toLowerCase()} ${fmtDay(a.flightDate)}`;
    if (n) sub += ` · ${t('authFlights', n)}`;
    return `<div class="row"><div style="flex:1;min-width:0"><b>${esc(a.purpose || a.place || '—')}</b>${a.number ? ` <span class="sub mono">${esc(a.number)}</span>` : ''}
      <div class="sub auth-${a.status}">${esc(sub)}</div></div><button class="btn small" data-auth="${a.id}">✎</button></div>`;
  }).join('');
  return `<section class="box"><h3>${t('authsTitle')}</h3>${rows || `<div class="sub">${esc(t('noAuths'))}</div>`}
    <div class="btns" style="margin-top:10px"><button class="btn small" data-auth="new">${t('newAuth')}</button></div></section>`;
};

// ---------- flight dialog hook: pick an approved authorization ----------
window.authSelect = f => {
  if (countryOf(f) !== 'CL') return '';
  const day = isoDay(new Date(f.start));
  const opts = auths().filter(a => a.status === 'approved' && (authValidOn(a, day) || a.id === f.authId));
  if (!opts.length) return '';
  return `<label>${t('linkAuth')}</label><select name="authId"><option value="">${t('none')}</option>${opts.map(a =>
    `<option value="${a.id}" ${a.id === f.authId ? 'selected' : ''}>${esc(a.number || '?')} — ${esc(a.purpose || a.place || '')}${authValidOn(a, day) ? ' · ' + t('authValidOn') : ''}</option>`).join('')}</select>`;
};

// ---------- request dialog ----------
async function authDialog(id) {
  const isNew = id === 'new';
  const a = isNew ? { id: uid(), status: 'draft', docs: {}, files: {}, droneId: state.drones[0]?.id || '' } : auths().find(x => x.id === id);
  // Pre-tick documents the pilot already tracks in "My documents".
  if (isNew) for (const k of ['registration', 'credential', 'insurance']) if (state.docs['CL:' + k]?.number) a.docs[k] = true;
  const pending = {};
  const opt = (v, l, sel) => `<option value="${v}" ${sel ? 'selected' : ''}>${esc(l)}</option>`;
  const sendByTxt = () => {
    const fd = $('#dlgForm').flightDate?.value; if (!fd) return '';
    const by = minusBusinessDays(fd, AUTH_LEAD_DAYS);
    return by < new Date(new Date().toDateString()) ? t('late') : t('sendBy', fmtDay(isoDay(by)), AUTH_LEAD_DAYS);
  };
  openDialog(`<h3>🇨🇱 ${t('authsTitle')}</h3>
    <label>${t('authPurpose')}</label><input name="purpose" value="${esc(a.purpose)}" placeholder="ej. Fotografía de evento, inspección de techo…" required>
    <label>${t('authPlace')}</label><input name="place" value="${esc(a.place)}">
    <div class="grid2"><div><label>${t('authDate')}</label><input type="date" name="flightDate" value="${esc(a.flightDate)}"></div>
      <div><label>${t('authTime')}</label><input name="timeWindow" value="${esc(a.timeWindow)}" placeholder="10:00–12:00"></div></div>
    <div class="note" id="sendBy" style="margin:8px 0 0">${esc(sendByTxt() || t('leadNote'))}</div>
    <div class="grid2"><div><label>${t('drone')}</label><select name="droneId">${opt('', t('none'), !a.droneId)}${state.drones.map(d => opt(d.id, d.name, d.id === a.droneId)).join('')}</select></div>
      <div><label>${t('authStatus')}</label><select name="status">${['draft', 'sent', 'approved', 'rejected'].map(s => opt(s, t('st_' + s), s === a.status)).join('')}</select></div></div>
    <label>${t('authDocs')}</label><div class="checks">${AUTH_DOCS.map(k =>
      `<label><input type="checkbox" name="doc" value="${k}" ${a.docs?.[k] ? 'checked' : ''}>${esc(t('doc_' + k))}</label>`).join('')}</div>
    <button type="button" class="btn small" id="prepEmail">✉️ ${t('prepEmail')}</button>
    <div class="sub" style="margin-top:6px">${esc(t('emailNote'))}</div>
    <div class="grid2"><div><label>${t('authNumber')}</label><input name="number" class="mono" value="${esc(a.number)}"></div><div></div></div>
    <div class="grid2"><div><label>${t('validFrom')}</label><input type="date" name="validFrom" value="${esc(a.validFrom)}"></div>
      <div><label>${t('validTo')}</label><input type="date" name="validTo" value="${esc(a.validTo)}"></div></div>
    <label>${t('authFiles')}</label>
    ${AUTH_FILES.map(k => `<div class="row"><span>${esc(t('file_' + k))}<br><span class="sub" id="fn-${k}">${esc(a.files?.[k] || '—')}</span></span>
      <span class="btns">${a.files?.[k] ? `<button type="button" class="btn small" data-open="${k}">${t('open')}</button>` : ''}
      <label class="btn small" style="margin:0;color:var(--text)">${t('attach')}<input type="file" data-file="${k}" hidden></label></span></div>`).join('')}
    <label>${t('notes')}</label><textarea name="notes">${esc(a.notes)}</textarea>`,
  fd => {
    Object.assign(a, {
      purpose: fd.get('purpose').trim(), place: fd.get('place').trim(), flightDate: fd.get('flightDate'), timeWindow: fd.get('timeWindow').trim(),
      droneId: fd.get('droneId'), status: fd.get('status'), number: fd.get('number').trim(), validFrom: fd.get('validFrom'), validTo: fd.get('validTo'),
      notes: fd.get('notes').trim(), docs: Object.fromEntries(fd.getAll('doc').map(k => [k, true])),
    });
    // A KMZ or permission letter on file counts as that document being ready.
    for (const k of ['kmz', 'permission']) if (pending[k] || a.files[k]) a.docs[k] = true;
    for (const [k, file] of Object.entries(pending)) { a.files[k] = file.name; fileStore.put(`${a.id}:${k}`, { name: file.name, blob: file }).catch(() => {}); }
    if (isNew) auths().push(a);
    // Keep linked flights showing the current number.
    if (a.number) state.flights.forEach(f => { if (f.authId === a.id) f.laanc = a.number; });
  },
  isNew ? null : () => {
    if (!confirm(t('confirmDelAuth'))) return false;
    state.auths = auths().filter(x => x !== a);
    state.flights.forEach(f => { if (f.authId === a.id) delete f.authId; });
    AUTH_FILES.forEach(k => fileStore.del(`${a.id}:${k}`).catch(() => {}));
    return true;
  });
  const form = $('#dlgForm');
  form.flightDate.onchange = () => { $('#sendBy').textContent = sendByTxt() || t('leadNote'); };
  form.querySelectorAll('[data-file]').forEach(inp => inp.onchange = () => {
    const file = inp.files[0]; if (!file) return;
    pending[inp.dataset.file] = file; $('#fn-' + inp.dataset.file).textContent = file.name;
  });
  form.querySelectorAll('[data-open]').forEach(b => b.onclick = async () => {
    const v = await fileStore.get(`${a.id}:${b.dataset.open}`).catch(() => null); if (!v) return;
    const url = URL.createObjectURL(v.blob), link = document.createElement('a');
    link.href = url; link.download = v.name; link.target = '_blank'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
  });
  $('#prepEmail').onclick = () => location.href = authEmail(a, new FormData(form));
}

function authEmail(a, fd) {
  const g = k => (fd.get(k) || '').trim();
  const dr = state.drones.find(d => d.id === g('droneId'));
  const reg = state.docs['CL:registration']?.number || dr?.reg || '[N° registro]';
  const cred = state.docs['CL:credential']?.number || '[N° credencial]';
  const day = g('flightDate') ? fmtDay(g('flightDate'), 'es-CL') : '[fecha]';
  const docs = fd.getAll('doc').length ? fd.getAll('doc') : AUTH_DOCS;
  const subject = `Solicitud de autorización de operación RPAS (DAN 151) — ${day} — ${g('place') || '[lugar]'}`;
  const body = `Sr. Director General de Aeronáutica Civil:

Junto con saludar, solicito autorización para operar un RPA sobre área poblada, conforme a la DAN 151.

• Objetivo del vuelo: ${g('purpose') || '[objetivo]'}
• Lugar / área: ${g('place') || '[lugar]'} (ver archivo KMZ adjunto)
• Fecha: ${day}${g('timeWindow') ? `, horario ${g('timeWindow')}` : ''}
• Aeronave: ${dr?.model || dr?.name || '[modelo]'}, registro N° ${reg}
• Piloto a distancia: ${state.settings.pilot || '[nombre]'}, credencial N° ${cred}

Declaro conocer y cumplir la DAN 91 "Reglas del Aire" y la DAN 151 "Operaciones de RPAS".

Adjunto:
${docs.map(k => '- ' + STR.es['doc_' + k]).join('\n')}

Saludos cordiales,
${state.settings.pilot || ''}`;
  return `mailto:registratura@dgac.gob.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

document.getElementById('v-rules').addEventListener('click', e => {
  const b = e.target.closest('[data-auth]'); if (b) authDialog(b.dataset.auth);
});
