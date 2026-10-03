// Drone Logbook prototype — all data stays in this browser (localStorage).
const KEY = 'dlb.v1';

// ---------- i18n ----------
const STR = {
  en: {
    appName:'Drone Logbook', tabLog:'Log', tabMap:'Map', tabFleet:'Fleet', tabMore:'More',
    logFlight:'Log flight', flights:'Flights', thisYear:'This year', airtime:'Logged air time',
    laanc:'LAANC approvals', all:'All', recreational:'Recreational', part107:'Part 107',
    airMissing:'no air time', min:'min', drones:'Drones', batteries:'Batteries',
    addDrone:'+ Add drone', addBattery:'+ Add battery', settings:'Settings', pilot:'Pilot in command',
    language:'Language', checklist:'Pre-flight checklist', newCheck:'New checklist item',
    data:'Import & export', importAP:'Import AutoPylot CSV', exportCsv:'Export CSV', printLog:'Print / PDF',
    danger:'Danger zone', reset:'Erase all data', newFlight:'New flight', editFlight:'Edit flight',
    start:'Start', airMin:'Air min', type:'Flight type', location:'Location',
    lat:'Latitude', lng:'Longitude', useGps:'Use my location', drone:'Drone', none:'— none —',
    laancCode:'LAANC reference code', airspace:'Airspace', purpose:'Purpose / mission name',
    notes:'Notes', save:'Save', cancel:'Cancel', del:'Delete', confirmDel:'Delete this flight?',
    confirmReset:'Erase every flight, drone and battery from this device?',
    name:'Name', model:'Model', serial:'Serial #', reg:'FAA registration', baseCycles:'Cycles before logging',
    cycles:'cycles', flightsShort:'flights', noFlights:'No flights yet. Tap "Log flight" to add one.',
    imported:(n,s)=>`Imported ${n} flights (${s} already in your log were skipped).`,
    airNote:(n)=>`<b>${n} flights have no real air time yet.</b> AutoPylot only records a planned 60-minute window. Import your DJI flight logs (More tab) or type the minutes in each flight.`,
    planned:'planned window', remove:'Remove', fromAP:'Imported from AutoPylot', checklistDone:'Checklist',
    distance:'Distance flown', importDJI:'Import DJI flight logs', djiParsing:'Reading DJI logs…',
    djiImported:(m,n,s,g)=>`DJI logs: ${m} flights got real air time, ${n} new flights added, ${s} already imported, ${g} power-on/ground logs ignored.`,
    djiLine:(n,km,h,v)=>`DJI: ${n} log${n>1?'s':''} · ${km} km · max ${h} m (${Math.round(h*3.281)} ft) · top ${v} m/s`,
    over400:'over 400 ft', notFlown:'Not flown', flown:'Flown', status:'Status', noLog:'no DJI log',
    noLogHint:'Your drone logged flights in the weeks around this date, but nothing on this day. If you cancelled, mark it as not flown — the LAANC approval stays on record.',
    markNotFlown:'Mark not flown', backup:'Download backup', restore:'Restore backup',
    restored:(n)=>`Restored ${n} flights from backup.`, confirmRestore:'Replace everything on this device with the backup?', badBackup:'That file is not a logbook backup.',
  },
  es: {
    appName:'Bitácora de Vuelo', tabLog:'Bitácora', tabMap:'Mapa', tabFleet:'Flota', tabMore:'Más',
    logFlight:'Registrar vuelo', flights:'Vuelos', thisYear:'Este año', airtime:'Tiempo de vuelo',
    laanc:'Autorizaciones LAANC', all:'Todos', recreational:'Recreativo', part107:'Part 107',
    airMissing:'sin tiempo', min:'min', drones:'Drones', batteries:'Baterías',
    addDrone:'+ Agregar dron', addBattery:'+ Agregar batería', settings:'Ajustes', pilot:'Piloto al mando',
    language:'Idioma', checklist:'Lista de verificación', newCheck:'Nuevo ítem',
    data:'Importar y exportar', importAP:'Importar CSV de AutoPylot', exportCsv:'Exportar CSV', printLog:'Imprimir / PDF',
    danger:'Zona de peligro', reset:'Borrar todos los datos', newFlight:'Nuevo vuelo', editFlight:'Editar vuelo',
    start:'Inicio', airMin:'Minutos', type:'Tipo de vuelo', location:'Ubicación',
    lat:'Latitud', lng:'Longitud', useGps:'Usar mi ubicación', drone:'Dron', none:'— ninguno —',
    laancCode:'Código LAANC', airspace:'Espacio aéreo', purpose:'Propósito / nombre de misión',
    notes:'Notas', save:'Guardar', cancel:'Cancelar', del:'Eliminar', confirmDel:'¿Eliminar este vuelo?',
    confirmReset:'¿Borrar todos los vuelos, drones y baterías de este dispositivo?',
    name:'Nombre', model:'Modelo', serial:'N° de serie', reg:'Registro', baseCycles:'Ciclos previos',
    cycles:'ciclos', flightsShort:'vuelos', noFlights:'Aún no hay vuelos. Toca "Registrar vuelo".',
    imported:(n,s)=>`Se importaron ${n} vuelos (${s} ya existentes se omitieron).`,
    airNote:(n)=>`<b>${n} vuelos aún no tienen tiempo de vuelo real.</b> AutoPylot solo guarda una ventana planificada de 60 minutos. Importa tus registros de DJI (pestaña Más) o escribe los minutos en cada vuelo.`,
    planned:'ventana planificada', remove:'Quitar', fromAP:'Importado de AutoPylot', checklistDone:'Lista',
    distance:'Distancia volada', importDJI:'Importar registros DJI', djiParsing:'Leyendo registros DJI…',
    djiImported:(m,n,s,g)=>`Registros DJI: ${m} vuelos recibieron tiempo real, ${n} vuelos nuevos, ${s} ya importados, ${g} registros en tierra ignorados.`,
    djiLine:(n,km,h,v)=>`DJI: ${n} registro${n>1?'s':''} · ${km} km · máx ${h} m (${Math.round(h*3.281)} ft) · máx ${v} m/s`,
    over400:'sobre 400 ft', notFlown:'No volado', flown:'Volado', status:'Estado', noLog:'sin registro DJI',
    noLogHint:'Tu dron registró vuelos en las semanas cercanas, pero nada este día. Si lo cancelaste, márcalo como no volado — la autorización LAANC queda registrada.',
    markNotFlown:'Marcar no volado', backup:'Descargar respaldo', restore:'Restaurar respaldo',
    restored:(n)=>`Se restauraron ${n} vuelos.`, confirmRestore:'¿Reemplazar todo en este dispositivo con el respaldo?', badBackup:'Ese archivo no es un respaldo de la bitácora.',
  }
};
const t = (k, ...a) => { const v = (STR[state.settings.lang] || STR.en)[k] ?? STR.en[k] ?? k; return typeof v === 'function' ? v(...a) : v; };

// ---------- state ----------
const uid = () => Math.random().toString(36).slice(2, 10);
const DEFAULT = () => ({
  flights: [],
  drones: [{ id: uid(), name: 'Avata', model: 'DJI Avata', serial: '', reg: '' }],
  batteries: [],
  checklist: ['Check airspace / LAANC', 'Weather & wind OK', 'Props secure & undamaged',
    'Batteries charged (drone + goggles)', 'SD card in, space free', 'Firmware up to date', 'Clear takeoff area'],
  settings: { lang: (navigator.language || 'en').startsWith('es') ? 'es' : 'en', pilot: '' },
  seeded: false,
});
let state;
function load() {
  try { state = JSON.parse(localStorage.getItem(KEY)) || DEFAULT(); } catch { state = DEFAULT(); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }

// ---------- AutoPylot CSV import ----------
function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
const TZ = { EDT:'-04:00', EST:'-05:00', CDT:'-05:00', CST:'-06:00', MDT:'-06:00', MST:'-07:00', PDT:'-07:00', PST:'-08:00', UTC:'Z', GMT:'Z', CLT:'-04:00', CLST:'-03:00' };
const pad = n => String(n).padStart(2, '0');
function parseAPDate(s) {
  const m = (s || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)\s*([A-Z]+)?/i);
  if (!m) return null;
  let [, mo, d, y, h, mi, ap, tz] = m;
  h = (+h % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0);
  const d0 = new Date(`${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${mi}:00${TZ[(tz || '').toUpperCase()] || ''}`);
  return isNaN(d0) ? null : d0.toISOString();
}
function parseLatLng(s) {
  const m = (s || '').match(/([\d.]+)\s*([NS])\s*,\s*([\d.]+)\s*([EW])/i);
  if (!m) return [null, null];
  return [(+m[1]) * (/s/i.test(m[2]) ? -1 : 1), (+m[3]) * (/w/i.test(m[4]) ? -1 : 1)];
}
// Contact phone/email columns are deliberately not imported.
function importAutoPylot(text) {
  const rows = parseCSV(text); const head = rows.shift().map(h => h.trim());
  const col = name => head.indexOf(name);
  const get = (r, name) => (col(name) >= 0 ? (r[col(name)] || '').trim() : '');
  const seen = new Set(state.flights.map(f => f.start + '|' + (f.lat ?? '')));
  let added = 0, skipped = 0;
  for (const r of rows) {
    const start = parseAPDate(get(r, 'Mission Start'));
    if (!start) continue;
    const [lat, lng] = parseLatLng(get(r, 'Lat / Lng'));
    const k = start + '|' + (lat ?? '');
    if (seen.has(k)) { skipped++; continue; }
    seen.add(k);
    const ft = get(r, 'Flight Type');
    state.flights.push({
      id: uid(), start, end: parseAPDate(get(r, 'Mission End')),
      plannedMin: +get(r, 'Duration (Minutes)') || null, airMin: null,
      location: get(r, 'Location'), lat, lng,
      type: /107/.test(ft) ? 'Part 107' : 'Recreational',
      laanc: get(r, 'LAANC Reference Code(s)'), airspace: get(r, 'Airspace Type(s)'),
      name: get(r, 'Mission Name'), notes: '', droneId: '', batteryIds: [], source: 'autopylot',
    });
    if (!state.settings.pilot && get(r, 'Pilot in Command')) state.settings.pilot = titleCase(get(r, 'Pilot in Command'));
    added++;
  }
  save();
  return [added, skipped];
}
// ---------- DJI log import ----------
// Uses only the unencrypted summary block of each DJI Fly log, so no DJI API key is needed.
const MIN = 6e4;
async function parseDJIFiles(files) {
  const { DJILog } = await import('./vendor/dji_log_parser_js.mjs');
  const out = [];
  for (const file of files) {
    try { out.push({ file: file.name, ...new DJILog(new Uint8Array(await file.arrayBuffer())).details }); } catch {}
  }
  return out;
}
function importDJI(list) {
  state.djiSeen = state.djiSeen || [];
  const seen = new Set(state.djiSeen);
  let skipped = 0, ground = 0;
  const logs = [];
  for (const d of list) {
    if (!d.startTime) continue;
    if (seen.has(d.startTime)) { skipped++; continue; }
    seen.add(d.startTime); state.djiSeen.push(d.startTime);
    // Logs that never left the ground (power-on, binding, short tests) don't count as flights.
    if (d.totalTime < 30 || (d.totalDistance < 0.01 && d.maxHeight <= 1)) { ground++; continue; }
    logs.push(d);
  }
  logs.sort((a, b) => a.startTime.localeCompare(b.startTime));
  // Battery swaps within 40 minutes of each other count as one flight session.
  const sessions = [];
  for (const d of logs) {
    const last = sessions.at(-1), t0 = Date.parse(d.startTime);
    if (last && t0 - last.end < 40 * MIN) { last.logs.push(d); last.end = t0 + d.totalTime * 1000; }
    else sessions.push({ logs: [d], start: t0, end: t0 + d.totalTime * 1000 });
  }
  let merged = 0, added = 0;
  for (const s of sessions) {
    const droneId = djiDrone(s.logs[0]);
    const uses = {};
    for (const d of s.logs) { const b = djiBattery(d, droneId); if (b) uses[b] = (uses[b] || 0) + 1; }
    const gps = s.logs.find(d => d.latitude && d.longitude);
    const info = {
      airMin: +(s.logs.reduce((a, d) => a + d.totalTime, 0) / 60).toFixed(1),
      distanceKm: +s.logs.reduce((a, d) => a + d.totalDistance, 0).toFixed(2),
      maxHeightM: Math.max(...s.logs.map(d => d.maxHeight)),
      maxSpeed: +Math.max(...s.logs.map(d => d.maxHorizontalSpeed)).toFixed(1),
      djiLogs: s.logs.length, droneId, batteryIds: Object.keys(uses), batteryUses: uses,
    };
    // Match an AutoPylot mission whose window (±45 min) covers this session.
    const f = state.flights.find(f => !f.djiLogs && f.source === 'autopylot' &&
      s.start >= Date.parse(f.start) - 45 * MIN && s.start <= Date.parse(f.end || f.start) + 45 * MIN);
    if (f) {
      Object.assign(f, info);
      if (f.lat == null && gps) { f.lat = +gps.latitude.toFixed(5); f.lng = +gps.longitude.toFixed(5); }
      merged++;
    } else {
      state.flights.push({ id: uid(), start: new Date(s.start).toISOString(), end: new Date(s.end).toISOString(),
        type: 'Recreational', location: '', lat: gps ? +gps.latitude.toFixed(5) : null, lng: gps ? +gps.longitude.toFixed(5) : null,
        laanc: '', airspace: '', name: '', notes: '', source: 'dji', ...info });
      added++;
    }
  }
  save();
  return [merged, added, skipped, ground];
}
function djiDrone(d) {
  let dr = state.drones.find(x => x.serial && x.serial === d.aircraftSn);
  if (!dr) {
    // Adopt the placeholder drone created on first run instead of adding a duplicate.
    dr = state.drones.find(x => !x.serial && /avata/i.test(x.model + x.name) && /avata/i.test(d.aircraftName || ''));
    if (dr) Object.assign(dr, { name: (d.aircraftName || dr.model).replace(/^DJI /, ''), model: d.aircraftName || dr.model, serial: d.aircraftSn || '' });
    else state.drones.push(dr = { id: uid(), name: (d.aircraftName || 'Drone').replace(/^DJI /, ''), model: d.aircraftName || '', serial: d.aircraftSn || '', reg: '' });
  }
  return dr.id;
}
function djiBattery(d, droneId) {
  if (!d.batterySn) return null;
  let b = state.batteries.find(x => x.serial === d.batterySn);
  if (!b) state.batteries.push(b = { id: uid(), label: `Battery ${d.batterySn.slice(-4)}`, serial: d.batterySn, droneId, baseCycles: 0 });
  return b.id;
}
const titleCase = s => s.replace(/\b\w/g, c => c.toUpperCase());

// ---------- helpers ----------
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const loc = () => state.settings.lang === 'es' ? 'es-CL' : 'en-US';
const fmtHM = m => { m = Math.round(m); return m >= 60 ? `${Math.floor(m / 60)}h ${pad(m % 60)}m` : `${m}m`; };
const toLocalInput = iso => { const d = iso ? new Date(iso) : new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); };
const shortLoc = s => (s || '').split(',').slice(0, 2).join(',');
const sorted = () => [...state.flights].sort((a, b) => b.start.localeCompare(a.start));
let filter = 'all';

// Planned missions with no DJI log while the drone was otherwise logging (within 30 days either side).
const flown = f => f.status !== 'cancelled';
function noLogSuspect(f) {
  if (f.source !== 'autopylot' || f.djiLogs || !flown(f) || !state.djiSeen?.length) return false;
  const t0 = Date.parse(f.start), win = 30 * 864e5;
  const ts = state.djiSeen.map(Date.parse);
  return ts.some(t => t < t0 && t0 - t < win) && ts.some(t => t > t0 && t - t0 < win);
}

// ---------- render ----------
function applyI18n() {
  document.documentElement.lang = state.settings.lang;
  document.querySelectorAll('[data-t]').forEach(el => el.textContent = t(el.dataset.t));
  document.querySelectorAll('[data-tp]').forEach(el => el.placeholder = t(el.dataset.tp));
  document.title = t('appName');
}
function renderStats() {
  const fl = state.flights.filter(flown);
  const air = fl.reduce((s, f) => s + (f.airMin || 0), 0), dist = fl.reduce((s, f) => s + (f.distanceKm || 0), 0);
  const cards = [
    [fl.length, t('flights')],
    [air ? fmtHM(air) : '—', t('airtime')],
    [dist ? `${dist.toFixed(1)} km` : '—', t('distance')],
    [state.flights.filter(f => f.laanc).length, t('laanc')],
  ];
  $('#stats').innerHTML = cards.map(([v, l]) => `<div class="stat"><div class="v mono">${v}</div><div class="l">${esc(l)}</div></div>`).join('');
  const missing = fl.filter(f => f.airMin == null).length;
  $('#airNote').hidden = !missing;
  $('#airNote').innerHTML = missing ? t('airNote', missing) : '';
}
function renderList() {
  $('#filters').innerHTML = [['all', t('all')], ['Recreational', t('recreational')], ['Part 107', t('part107')], ['laanc', 'LAANC'], ['cancelled', t('notFlown')]]
    .map(([k, l]) => `<button class="chip ${filter === k ? 'on' : ''}" data-f="${k}">${esc(l)}</button>`).join('');
  const fl = sorted().filter(f => filter === 'all' || (filter === 'laanc' ? f.laanc : filter === 'cancelled' ? !flown(f) : flown(f) && f.type === filter));
  if (!fl.length) { $('#list').innerHTML = `<div class="empty">${t('noFlights')}</div>`; return; }
  let html = '', month = '';
  for (const f of fl) {
    const d = new Date(f.start);
    const m = d.toLocaleDateString(loc(), { month: 'long', year: 'numeric' });
    if (m !== month) { html += `<h2 class="month">${esc(m)}</h2>`; month = m; }
    const drone = state.drones.find(x => x.id === f.droneId);
    html += `<button class="card${flown(f) ? '' : ' off'}" data-id="${f.id}">
      <div class="date"><div class="d mono">${d.getDate()}</div><div class="w">${d.toLocaleDateString(loc(), { weekday: 'short' })}</div></div>
      <div class="body"><div class="loc">${esc(f.name || shortLoc(f.location) || (f.lat != null ? `${f.lat.toFixed(4)}, ${f.lng.toFixed(4)}` : '—'))}</div>
        <div class="meta"><span>${d.toLocaleTimeString(loc(), { hour: 'numeric', minute: '2-digit' })}</span>
          <span class="badge">${esc(f.type === 'Part 107' ? 'Part 107' : t('recreational'))}</span>
          ${f.laanc ? `<span class="badge laanc mono">LAANC ${esc(f.laanc)}</span>` : ''}
          ${f.maxHeightM > 122 ? `<span class="badge warn">↑${Math.round(f.maxHeightM * 3.281)} ft</span>` : ''}
          ${drone ? `<span>${esc(drone.name)}</span>` : ''}</div></div>
      <div class="air">${!flown(f) ? `<div class="l">${t('notFlown')}</div>` : noLogSuspect(f) ? `<div class="v missing">?</div><div class="l">${t('noLog')}</div>` : f.airMin != null ? `<div class="v mono">${fmtHM(f.airMin)}</div>` : `<div class="v missing">—</div><div class="l">${t('airMissing')}</div>`}</div>
    </button>`;
  }
  $('#list').innerHTML = html;
}
let map, layer;
function renderMap() {
  if (!window.L) { $('#map').innerHTML = '<div class="empty">Map needs an internet connection.</div>'; return; }
  if (!map) {
    map = L.map('map', { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
    layer = L.layerGroup().addTo(map);
  }
  layer.clearLayers();
  const pts = [];
  for (const f of state.flights) {
    if (f.lat == null) continue;
    const isL = !!f.laanc || f.type === 'Part 107';
    L.circleMarker([f.lat, f.lng], { radius: isL ? 9 : 7, color: isL ? '#4f7a00' : '#3d4740', weight: 2, fillColor: isL ? '#9bd400' : '#7c8a80', fillOpacity: .85 })
      .bindPopup(`<b>${esc(new Date(f.start).toLocaleDateString(loc(), { dateStyle: 'medium' }))}</b><br>${esc(f.location)}${f.laanc ? `<br>LAANC ${esc(f.laanc)}` : ''}`)
      .addTo(layer);
    pts.push([f.lat, f.lng]);
  }
  setTimeout(() => { map.invalidateSize(); if (pts.length) map.fitBounds(pts, { padding: [30, 30], maxZoom: 14 }); else map.setView([25.65, -80.43], 11); }, 50);
}
function renderFleet() {
  const stat = pred => { const fl = state.flights.filter(pred); return [fl.length, fl.reduce((s, f) => s + (f.airMin || 0), 0)]; };
  $('#drones').innerHTML = state.drones.map(d => {
    const [n, m] = stat(f => f.droneId === d.id);
    return `<div class="row"><div><div><b>${esc(d.name)}</b> <span class="sub">${esc(d.model)}</span></div>
      <div class="sub">${n} ${t('flightsShort')} · ${fmtHM(m)}${d.reg ? ' · ' + esc(d.reg) : ''}</div></div>
      <button class="btn small" data-edit-drone="${d.id}">✎</button></div>`;
  }).join('') || `<div class="sub">—</div>`;
  $('#batteries').innerHTML = state.batteries.map(b => {
    const n = state.flights.reduce((s, f) => s + (f.batteryUses?.[b.id] ?? ((f.batteryIds || []).includes(b.id) ? 1 : 0)), 0);
    const d = state.drones.find(x => x.id === b.droneId);
    return `<div class="row"><div><b>${esc(b.label)}</b> <span class="sub">${esc(d ? d.name : '')}</span>
      <div class="sub mono">${(b.baseCycles || 0) + n} ${t('cycles')}</div></div>
      <button class="btn small" data-edit-battery="${b.id}">✎</button></div>`;
  }).join('') || `<div class="sub">—</div>`;
}
function renderMore() {
  $('#setPilot').value = state.settings.pilot || '';
  $('#setLang').value = state.settings.lang;
  $('#checkItems').innerHTML = state.checklist.map((c, i) =>
    `<div class="row"><span>${esc(c)}</span><button class="btn small" data-rm-check="${i}">${t('remove')}</button></div>`).join('');
}
function renderAll() {
  applyI18n();
  $('#pilotName').textContent = state.settings.pilot || '';
  renderStats(); renderList(); renderFleet(); renderMore();
  if (current === 'map') renderMap();
}

// ---------- dialogs ----------
const dlg = $('#dlg'), form = $('#dlgForm');
function openDialog(html, onSave, onDelete) {
  form.innerHTML = html + `<div class="dlg-actions">${onDelete ? `<button type="button" class="btn danger" id="dDel">${t('del')}</button>` : ''}
    <span class="spacer"></span><button type="button" class="btn" id="dCancel">${t('cancel')}</button>
    <button type="submit" class="btn primary">${t('save')}</button></div>`;
  form.onsubmit = e => { e.preventDefault(); onSave(new FormData(form)); dlg.close(); save(); renderAll(); };
  $('#dCancel').onclick = () => dlg.close();
  if (onDelete) $('#dDel').onclick = () => { if (onDelete()) { dlg.close(); save(); renderAll(); } };
  dlg.showModal();
}
function flightDialog(f) {
  const isNew = !f;
  f = f || { start: new Date().toISOString(), type: 'Recreational', airMin: null, batteryIds: [], droneId: state.drones[0]?.id || '' };
  const opt = (v, l, sel) => `<option value="${esc(v)}" ${sel ? 'selected' : ''}>${esc(l)}</option>`;
  openDialog(`<h3>${t(isNew ? 'newFlight' : 'editFlight')}</h3>
    ${f.source === 'autopylot' ? `<div class="note" style="margin:0 0 4px">${t('fromAP')}${f.plannedMin ? ` · ${f.plannedMin} ${t('min')} ${t('planned')}` : ''}</div>` : ''}
    ${noLogSuspect(f) ? `<div class="note" style="margin:4px 0">${t('noLogHint')} <button type="button" class="btn small" id="markNF">${t('markNotFlown')}</button></div>` : ''}
    ${f.djiLogs ? `<div class="note" style="margin:4px 0">${t('djiLine', f.djiLogs, f.distanceKm, f.maxHeightM, f.maxSpeed)}${f.maxHeightM > 122 ? ` · <b class="missing">${t('over400')}</b>` : ''}</div>` : ''}
    <div class="grid2"><div><label>${t('start')}</label><input type="datetime-local" name="start" value="${toLocalInput(f.start)}" required></div>
      <div><label>${t('airMin')}</label><input type="number" name="airMin" min="0" step="1" inputmode="numeric" value="${f.airMin ?? ''}"></div></div>
    <div class="grid2"><div><label>${t('type')}</label><select name="type">${opt('Recreational', t('recreational'), f.type !== 'Part 107')}${opt('Part 107', 'Part 107', f.type === 'Part 107')}</select></div>
      <div><label>${t('drone')}</label><select name="droneId">${opt('', t('none'), !f.droneId)}${state.drones.map(d => opt(d.id, d.name, d.id === f.droneId)).join('')}</select></div></div>
    <label>${t('status')}</label><select name="status">${opt('', t('flown'), flown(f))}${opt('cancelled', t('notFlown'), !flown(f))}</select>
    <label>${t('purpose')}</label><input name="name" value="${esc(f.name)}">
    <label>${t('location')}</label><input name="location" value="${esc(f.location)}">
    <div class="grid2"><div><label>${t('lat')}</label><input name="lat" inputmode="decimal" value="${f.lat ?? ''}"></div>
      <div><label>${t('lng')}</label><input name="lng" inputmode="decimal" value="${f.lng ?? ''}"></div></div>
    <button type="button" class="btn small" id="gps" style="margin-top:8px">${t('useGps')}</button>
    <div class="grid2"><div><label>${t('laancCode')}</label><input name="laanc" class="mono" value="${esc(f.laanc)}"></div>
      <div><label>${t('airspace')}</label><input name="airspace" value="${esc(f.airspace)}"></div></div>
    ${state.batteries.length ? `<label>${t('batteries')}</label><div class="checks">${state.batteries.map(b =>
      `<label><input type="checkbox" name="bat" value="${b.id}" ${(f.batteryIds || []).includes(b.id) ? 'checked' : ''}>${esc(b.label)}</label>`).join('')}</div>` : ''}
    ${isNew && state.checklist.length ? `<label>${t('checklist')}</label><div class="checks">${state.checklist.map((c, i) =>
      `<label><input type="checkbox" name="chk" value="${i}">${esc(c)}</label>`).join('')}</div>` : ''}
    <label>${t('notes')}</label><textarea name="notes">${esc(f.notes)}</textarea>`,
  fd => {
    const num = v => (v === '' || v == null || isNaN(+v)) ? null : +v;
    Object.assign(f, {
      start: new Date(fd.get('start')).toISOString(), airMin: num(fd.get('airMin')), type: fd.get('type'), status: fd.get('status') || undefined,
      droneId: fd.get('droneId'), name: fd.get('name').trim(), location: fd.get('location').trim(),
      lat: num(fd.get('lat')), lng: num(fd.get('lng')), laanc: fd.get('laanc').trim(), airspace: fd.get('airspace').trim(),
      batteryIds: fd.getAll('bat'), notes: fd.get('notes').trim(),
    });
    if (isNew) { f.id = uid(); f.source = 'manual'; f.checklist = `${fd.getAll('chk').length}/${state.checklist.length}`; state.flights.push(f); }
  },
  isNew ? null : () => { if (!confirm(t('confirmDel'))) return false; state.flights = state.flights.filter(x => x.id !== f.id); return true; });
  const nf = $('#markNF'); if (nf) nf.onclick = () => { form.status.value = 'cancelled'; form.requestSubmit(); };
  $('#gps').onclick = () => navigator.geolocation?.getCurrentPosition(p => {
    form.lat.value = p.coords.latitude.toFixed(5); form.lng.value = p.coords.longitude.toFixed(5);
  });
}
function droneDialog(d) {
  const isNew = !d; d = d || {};
  openDialog(`<h3>${t('drones')}</h3>
    <label>${t('name')}</label><input name="name" value="${esc(d.name)}" required>
    <label>${t('model')}</label><input name="model" value="${esc(d.model)}">
    <div class="grid2"><div><label>${t('serial')}</label><input name="serial" class="mono" value="${esc(d.serial)}"></div>
      <div><label>${t('reg')}</label><input name="reg" class="mono" value="${esc(d.reg)}"></div></div>`,
  fd => { Object.assign(d, { name: fd.get('name').trim(), model: fd.get('model').trim(), serial: fd.get('serial').trim(), reg: fd.get('reg').trim() });
    if (isNew) { d.id = uid(); state.drones.push(d); } },
  isNew ? null : () => { state.drones = state.drones.filter(x => x.id !== d.id); state.flights.forEach(f => { if (f.droneId === d.id) f.droneId = ''; }); return true; });
}
function batteryDialog(b) {
  const isNew = !b; b = b || { droneId: state.drones[0]?.id || '', baseCycles: 0 };
  openDialog(`<h3>${t('batteries')}</h3>
    <label>${t('name')}</label><input name="label" value="${esc(b.label || `Battery ${state.batteries.length + 1}`)}" required>
    <div class="grid2"><div><label>${t('drone')}</label><select name="droneId"><option value="">${t('none')}</option>${state.drones.map(d => `<option value="${d.id}" ${d.id === b.droneId ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>
      <div><label>${t('baseCycles')}</label><input type="number" name="baseCycles" min="0" value="${b.baseCycles || 0}"></div></div>`,
  fd => { Object.assign(b, { label: fd.get('label').trim(), droneId: fd.get('droneId'), baseCycles: +fd.get('baseCycles') || 0 });
    if (isNew) { b.id = uid(); state.batteries.push(b); } },
  isNew ? null : () => { state.batteries = state.batteries.filter(x => x.id !== b.id); return true; });
}

// ---------- export ----------
function exportCSV() {
  const cols = ['Date', 'Start', 'Air time (min)', 'Type', 'Purpose', 'Location', 'Lat', 'Lng', 'Drone', 'LAANC', 'Airspace', 'Notes', 'Source', 'Status'];
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [cols.map(q).join(',')].concat(sorted().map(f => {
    const d = new Date(f.start);
    return [d.toLocaleDateString('en-CA'), d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), f.airMin ?? '', f.type, f.name,
      f.location, f.lat, f.lng, state.drones.find(x => x.id === f.droneId)?.name, f.laanc, f.airspace, f.notes, f.source, flown(f) ? 'Flown' : 'Not flown'].map(q).join(',');
  }));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
  a.download = `drone-logbook-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function printLog() {
  const rows = sorted().map(f => { const d = new Date(f.start);
    return `<tr><td>${d.toLocaleDateString(loc())}</td><td>${d.toLocaleTimeString(loc(), { hour: 'numeric', minute: '2-digit' })}</td><td>${f.airMin ?? '—'}</td><td>${esc(f.type)}</td><td>${esc(f.location)}</td><td>${esc(state.drones.find(x => x.id === f.droneId)?.name || '')}</td><td>${esc(f.laanc)}</td></tr>`; }).join('');
  $('#print').innerHTML = `<h2>${t('appName')} — ${esc(state.settings.pilot)}</h2><p>${state.flights.length} ${t('flightsShort')} · ${new Date().toLocaleDateString(loc())}</p>
    <table><thead><tr><th>Date</th><th>${t('start')}</th><th>${t('min')}</th><th>${t('type')}</th><th>${t('location')}</th><th>${t('drone')}</th><th>LAANC</th></tr></thead><tbody>${rows}</tbody></table>`;
  window.print();
}

// ---------- wiring ----------
let current = 'log';
document.querySelectorAll('nav.tabs button').forEach(b => b.onclick = () => {
  current = b.dataset.view;
  document.querySelectorAll('nav.tabs button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === 'v-' + current));
  $('#fab').style.display = current === 'log' ? '' : 'none';
  if (current === 'map') renderMap();
  window.scrollTo(0, 0);
});
$('#filters').onclick = e => { const b = e.target.closest('[data-f]'); if (b) { filter = b.dataset.f; renderList(); } };
$('#list').onclick = e => { const c = e.target.closest('[data-id]'); if (c) flightDialog(state.flights.find(f => f.id === c.dataset.id)); };
$('#fab').onclick = () => flightDialog();
$('#addDrone').onclick = () => droneDialog();
$('#addBattery').onclick = () => batteryDialog();
$('#drones').onclick = e => { const b = e.target.closest('[data-edit-drone]'); if (b) droneDialog(state.drones.find(d => d.id === b.dataset.editDrone)); };
$('#batteries').onclick = e => { const b = e.target.closest('[data-edit-battery]'); if (b) batteryDialog(state.batteries.find(x => x.id === b.dataset.editBattery)); };
$('#setPilot').onchange = e => { state.settings.pilot = e.target.value.trim(); save(); renderAll(); };
$('#setLang').onchange = e => { state.settings.lang = e.target.value; save(); renderAll(); };
$('#addCheck').onclick = () => { const v = $('#newCheck').value.trim(); if (v) { state.checklist.push(v); $('#newCheck').value = ''; save(); renderMore(); } };
$('#checkItems').onclick = e => { const b = e.target.closest('[data-rm-check]'); if (b) { state.checklist.splice(+b.dataset.rmCheck, 1); save(); renderMore(); } };
$('#importFile').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  const [n, s] = importAutoPylot(await file.text());
  $('#importMsg').hidden = false; $('#importMsg').textContent = t('imported', n, s);
  e.target.value = ''; renderAll();
};
$('#importDJI').onchange = async e => {
  const files = [...e.target.files].filter(f => /\.txt$/i.test(f.name)); if (!files.length) return;
  $('#importMsg').hidden = false; $('#importMsg').textContent = t('djiParsing');
  try { $('#importMsg').textContent = t('djiImported', ...importDJI(await parseDJIFiles(files))); }
  catch (err) { $('#importMsg').textContent = String(err); }
  e.target.value = ''; renderAll();
};
$('#exportCsv').onclick = exportCSV;
$('#backup').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'drone-logbook', v: 1, state }, null, 1)], { type: 'application/json' }));
  a.download = `logbook-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('#restoreFile').onchange = async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  let b; try { b = JSON.parse(await file.text()); } catch {}
  if (b?.app !== 'drone-logbook' || !Array.isArray(b.state?.flights)) { alert(t('badBackup')); return; }
  if (state.flights.length && !confirm(t('confirmRestore'))) return;
  state = { ...DEFAULT(), ...b.state, seeded: true }; save(); renderAll();
  $('#importMsg').hidden = false; $('#importMsg').textContent = t('restored', state.flights.length);
};
$('#printLog').onclick = printLog;
$('#resetAll').onclick = () => { if (confirm(t('confirmReset'))) { state = DEFAULT(); state.seeded = true; save(); renderAll(); } };

// ---------- boot ----------
(async function boot() {
  load();
  // First run: pull in the AutoPylot export sitting in data/ so the log starts with real history.
  if (!state.seeded) {
    try {
      const r = await fetch('data/autopylot_missions_export.csv');
      if (r.ok) importAutoPylot(await r.text());
    } catch {}
    state.seeded = true; save();
  }
  // Merge any new DJI log summaries extracted by tools/dji-details.mjs (already-seen logs are skipped).
  try {
    const r = await fetch('data/dji_details.json', { cache: 'no-store' });
    if (r.ok) importDJI(await r.json());
  } catch {}
  renderAll();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
