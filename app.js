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
    noLogHint:'Your drone logged flights in the weeks around this date, but nothing on this day. If you cancelled, mark it as not flown — any approval code stays on record.',
    markNotFlown:'Mark not flown', backup:'Download backup', restore:'Restore backup',
    restored:(n)=>`Restored ${n} flights from backup.`, confirmRestore:'Replace everything on this device with the backup?', badBackup:'That file is not a logbook backup.',
    tabRules:'Rules', proAuth:'Professional / approval', auths:'Airspace approvals', pro:'Professional', authShort:'Approval', country:'Home country',
    overLimit:(l)=>`over the ${l} limit`, airNoteManual:(n)=>`<b>${n} flights have no air time yet.</b> Open each one and add the minutes.`,
    rulesIntro:'Plain-language summary to help you plan — not legal advice. Always confirm with the authority before flying.',
    checked:(d)=>`Last checked ${d}`, sources:'Sources', docs:'My documents', expires:'Expires', number:'Number',
    docOk:(d)=>`valid · ${d} days left`, docSoon:(d)=>`expires in ${d} days`, docExpired:'expired', docNone:'no date set',
    docAlert:(n)=>`<b>${n} document${n>1?'s':''} expiring soon or expired.</b> Check the Rules tab.`,
    yourFlights:(n,o)=>`${n} of your flights here${o ? ` · ${o} over the height limit` : ''}`,
    welcome:'Welcome', welcomeText:'Your logbook lives only on this phone — nothing is uploaded. Set yourself up and log your first flight.',
    start2:'Start', feedback:'Send feedback', droneOptional:'Your drone (optional)', autoCountry:'auto from GPS',
    weather:'Weather', observer:'Observer', incident:'Incidents / remarks', credentialNo:'Pilot credential #',
    weatherPh:'e.g. clear, wind 10 km/h', observerPh:'name, if any', end:'End', aircraftReg:'Aircraft reg.',
    workType:'Type of work', cyclesUsed:'Cycles', logTitle:'Flight log', date:'Date',
    azLayer:'Airport zones', azCheck:'Check my spot', azL8:'8 km airport zone', azL5:'5 km aerodrome zone',
    azNote:'Informational only, not official. Airport zones come from airport locations (no parks or US airspace classes); US rings are approximate (5 mi). Chile P/R/D zones are transcribed from the DGAC AIP (ENR 5.1, AMDT 67, 6 Aug 2026), only those that reach the ground; dashed = approximate shape; temporary NOTAM zones are not shown. The LAANC grid is the FAA UAS Facility Map (US only): it shows the maximum altitude for automatic approval, not permission, and not TFRs, parks or other restrictions. Always confirm in the AIP/NOTAM and SIGO (Chile) or B4UFLY and your LAANC app (US). Data: OurAirports (public domain), DGAC AIP-Chile, FAA.',
    zLayer:'Chile P/R/D zones', zLP:'Prohibited (P)', zLR:'Restricted (R)', zLD:'Danger (D)', zNoData:'Chile zone data could not be loaded.',
    zKind:{ P:'prohibited', R:'restricted', D:'danger' },
    zIn:list => `Inside ${list}. Do not fly there without DGAC authorization; check the AIP and NOTAMs.`,
    zOut:'Not inside any Chile P/R/D zone (AIP ENR 5.1, AMDT 67). Temporary NOTAM zones are not shown.',
    faaLayer:'LAANC grid', faaLeg:'LAANC max (ft):', faaZoom:'Zoom in to load the LAANC grid.', faaHint:'Tap the map to see the LAANC ceiling for a spot.',
    faaErr:'Could not load the FAA grid. It needs an internet connection.', faaMany:'Too many squares in view. Zoom in to load the LAANC grid.',
    faaNone:'No LAANC grid squares in this view (the grid only covers US controlled airspace near airports).', faaChecking:'Checking the FAA grid…',
    faaCell:(c, apt, cls, eff) => `LAANC grid: automatic approval up to ${c} ft AGL here (${apt}, Class ${cls}). You still must request authorization in a LAANC app before flying. FAA map effective ${eff}.`,
    faaZero:(apt, cls, eff) => `LAANC grid: 0 ft here (${apt}, Class ${cls}). No automatic approval. Part 107 pilots can ask the FAA for further coordination. FAA map effective ${eff}.`,
    faaNoGrid:'No LAANC grid square at this spot. That is not permission to fly: TFRs, parks and other restrictions are not in this layer. Check B4UFLY.',
    apOpen:'Open AutoPylot', apCopy:'Copy coordinates', apCopied:'Copied ✓',
    azHint:'Tap the map to check any spot.', azZoom:'Zoom in to see airport zones. Tap the map to check any spot.',
    azLocating:'Finding your location…', azNoGps:'Could not get your location. Allow location access, or tap the map instead.',
    azNoData:'Airport data could not be loaded.', azNone:'No airport in the data near this spot (data covers Chile and the US only).',
    azInside:(n, c, km, d) => `Inside the ${km} km zone of ${n} (${c}), ${d} km away. Do not fly without checking the rules and authorization.`,
    azNear:(n, c, km, d) => `Close to the ${km} km zone of ${n} (${c}), ${d} km away. Check before you fly.`,
    azClear:(n, c, km, d) => `Outside airport zones. Nearest: ${n} (${c}), ${d} km away (zone ${km} km). Still check other restrictions.`,
    azInsideUS:(n, c, km, d) => `Inside the approximate 5 mi ring of ${n} (${c}), ${d} km away. You are likely near controlled airspace. Check B4UFLY and get LAANC authorization if required.`,
    azNearUS:(n, c, km, d) => `Close to the approximate 5 mi ring of ${n} (${c}), ${d} km away. Controlled airspace can extend further. Check B4UFLY/LAANC.`,
    azClearUS:(n, c, km, d) => `Outside this app's approximate ring, but that does not mean clear. Class B/C/D airspace can reach well past 5 mi and is not shown. Nearest: ${n} (${c}), ${d} km. Check B4UFLY/LAANC before flying.`,
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
    noLogHint:'Tu dron registró vuelos en las semanas cercanas, pero nada este día. Si lo cancelaste, márcalo como no volado — el código de autorización queda registrado.',
    markNotFlown:'Marcar no volado', backup:'Descargar respaldo', restore:'Restaurar respaldo',
    restored:(n)=>`Se restauraron ${n} vuelos.`, confirmRestore:'¿Reemplazar todo en este dispositivo con el respaldo?', badBackup:'Ese archivo no es un respaldo de la bitácora.',
    tabRules:'Normas', proAuth:'Profesional / autorización', auths:'Autorizaciones', pro:'Profesional', authShort:'Autorización', country:'País principal',
    overLimit:(l)=>`sobre el límite de ${l}`, airNoteManual:(n)=>`<b>${n} vuelos aún no tienen tiempo de vuelo.</b> Abre cada uno y agrega los minutos.`,
    rulesIntro:'Resumen en lenguaje simple para planificar — no es asesoría legal. Confirma siempre con la autoridad antes de volar.',
    checked:(d)=>`Revisado el ${d}`, sources:'Fuentes', docs:'Mis documentos', expires:'Vence', number:'Número',
    docOk:(d)=>`vigente · quedan ${d} días`, docSoon:(d)=>`vence en ${d} días`, docExpired:'vencido', docNone:'sin fecha',
    docAlert:(n)=>`<b>${n} documento${n>1?'s':''} por vencer o vencido${n>1?'s':''}.</b> Revisa la pestaña Normas.`,
    yourFlights:(n,o)=>`${n} de tus vuelos aquí${o ? ` · ${o} sobre el límite de altura` : ''}`,
    welcome:'¡Hola!', welcomeText:'Tu bitácora vive solo en este teléfono — nada se sube a internet. Configura tu perfil y registra tu primer vuelo.',
    start2:'Comenzar', feedback:'Enviar comentarios', droneOptional:'Tu dron (opcional)', autoCountry:'automático por GPS',
    weather:'Clima', observer:'Observador RPAS', incident:'Incidentes / observaciones', credentialNo:'N° credencial del piloto',
    weatherPh:'ej. despejado, viento 10 km/h', observerPh:'nombre, si hubo', end:'Término', aircraftReg:'Registro aeronave',
    workType:'Tipo de trabajo', cyclesUsed:'Ciclos', logTitle:'Bitácora de vuelo', date:'Fecha',
    azLayer:'Zonas de aeropuertos', azCheck:'Revisar mi ubicación', azL8:'Zona de aeropuerto 8 km', azL5:'Zona de aeródromo 5 km',
    azNote:'Solo informativo, no oficial. Las zonas de aeropuertos salen de la ubicación de los aeropuertos (sin parques ni clases de espacio aéreo de EE.UU.); los círculos de EE.UU. son aproximados (5 mi). Las zonas P/R/D de Chile están transcritas del AIP de la DGAC (ENR 5.1, AMDT 67, 6 ago 2026), solo las que llegan al suelo; línea punteada = forma aproximada; no se muestran zonas temporales por NOTAM. La grilla LAANC es el mapa de instalaciones UAS de la FAA (solo EE.UU.): muestra la altura máxima de aprobación automática, no un permiso, ni TFR, parques u otras restricciones. Confirma siempre en el AIP/NOTAM y SIGO (Chile) o B4UFLY y tu app LAANC (EE.UU.). Datos: OurAirports (dominio público), AIP-Chile DGAC, FAA.',
    zLayer:'Zonas P/R/D Chile', zLP:'Prohibida (P)', zLR:'Restringida (R)', zLD:'Peligrosa (D)', zNoData:'No se pudieron cargar las zonas de Chile.',
    zKind:{ P:'prohibida', R:'restringida', D:'peligrosa' },
    zIn:list => `Dentro de ${list}. No vueles ahí sin autorización de la DGAC; revisa el AIP y los NOTAM.`,
    zOut:'Fuera de las zonas P/R/D de Chile (AIP ENR 5.1, AMDT 67). No se muestran zonas temporales por NOTAM.',
    faaLayer:'Grilla LAANC', faaLeg:'LAANC máx. (ft):', faaZoom:'Acércate para cargar la grilla LAANC.', faaHint:'Toca el mapa para ver el límite LAANC de un punto.',
    faaErr:'No se pudo cargar la grilla de la FAA. Necesita conexión a internet.', faaMany:'Demasiados cuadros a la vista. Acércate para cargar la grilla LAANC.',
    faaNone:'No hay cuadros de la grilla LAANC en esta vista (solo cubre espacio aéreo controlado de EE.UU. cerca de aeropuertos).', faaChecking:'Consultando la grilla de la FAA…',
    faaCell:(c, apt, cls, eff) => `Grilla LAANC: aprobación automática hasta ${c} ft AGL aquí (${apt}, Clase ${cls}). Igual debes pedir autorización en una app LAANC antes de volar. Mapa FAA vigente desde ${eff}.`,
    faaZero:(apt, cls, eff) => `Grilla LAANC: 0 ft aquí (${apt}, Clase ${cls}). Sin aprobación automática. Los pilotos Part 107 pueden pedir coordinación adicional a la FAA. Mapa FAA vigente desde ${eff}.`,
    faaNoGrid:'No hay cuadro de la grilla LAANC en este punto. Eso no es permiso para volar: TFR, parques y otras restricciones no están en esta capa. Revisa B4UFLY.',
    apOpen:'Abrir AutoPylot', apCopy:'Copiar coordenadas', apCopied:'Copiado ✓',
    azHint:'Toca el mapa para revisar cualquier punto.', azZoom:'Acércate para ver las zonas de aeropuertos. Toca el mapa para revisar cualquier punto.',
    azLocating:'Buscando tu ubicación…', azNoGps:'No se pudo obtener tu ubicación. Permite el acceso a la ubicación o toca el mapa.',
    azNoData:'No se pudieron cargar los datos de aeropuertos.', azNone:'No hay ningún aeropuerto en los datos cerca de este punto (solo Chile y EE.UU.).',
    azInside:(n, c, km, d) => `Dentro de la zona de ${km} km de ${n} (${c}), a ${d} km. No vueles sin revisar las normas y la autorización.`,
    azNear:(n, c, km, d) => `Cerca de la zona de ${km} km de ${n} (${c}), a ${d} km. Revisa antes de volar.`,
    azClear:(n, c, km, d) => `Fuera de zonas de aeropuertos. Más cercano: ${n} (${c}), a ${d} km (zona de ${km} km). Revisa igual otras restricciones.`,
    azInsideUS:(n, c, km, d) => `Dentro del círculo aproximado de 5 mi de ${n} (${c}), a ${d} km. Probablemente estás cerca de espacio aéreo controlado. Revisa B4UFLY y obtén autorización LAANC si corresponde.`,
    azNearUS:(n, c, km, d) => `Cerca del círculo aproximado de 5 mi de ${n} (${c}), a ${d} km. El espacio aéreo controlado puede extenderse más. Revisa B4UFLY/LAANC.`,
    azClearUS:(n, c, km, d) => `Fuera del círculo aproximado de esta app, pero eso no significa que esté libre. El espacio aéreo clase B/C/D puede llegar mucho más allá de 5 mi y no se muestra. Más cercano: ${n} (${c}), a ${d} km. Revisa B4UFLY/LAANC antes de volar.`,
  }
};
const t = (k, ...a) => { const v = (STR[state.settings.lang] || STR.en)[k] ?? STR.en[k] ?? k; return typeof v === 'function' ? v(...a) : v; };

// ---------- state ----------
const uid = () => Math.random().toString(36).slice(2, 10);
const DEFAULT = () => ({
  flights: [],
  drones: [],
  batteries: [],
  settings: { lang: (navigator.language || 'en').startsWith('es') ? 'es' : 'en', pilot: '', country: guessCountry() },
  docs: {},
  seeded: false,
});
function guessCountry() {
  let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
  return tz === 'America/Santiago' || /-CL$/i.test(navigator.language || '') ? 'CL' : 'US';
}
let state;
function load() {
  try { state = JSON.parse(localStorage.getItem(KEY)) || DEFAULT(); } catch { state = DEFAULT(); }
  migrate();
}
// Older saves had one US checklist and no country/docs.
function migrate() {
  state.settings.country = state.settings.country || guessCountry();
  state.docs = state.docs || {};
  if (!state.checklists) {
    const lang = state.settings.lang;
    state.checklists = { US: state.checklist || RULES.US.checklist[lang], CL: RULES.CL.checklist[lang] };
    delete state.checklist;
  }
  // The first Chile checklist said "2 km" from aerodromes; swap in the stricter wording.
  const cl = state.checklists.CL || [], i = cl.findIndex(x => /^(Not near an aerodrome|Lejos de aeródromos) \(2 km\)$/.test(x));
  if (i >= 0) cl.splice(i, 1, ...RULES.CL.checklist[/^Lejos/.test(cl[i]) ? 'es' : 'en'].slice(0, 2));
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

// ---------- country rules ----------
const L10 = o => o[state.settings.lang] || o.en;
const home = () => state.settings.country;
// No GPS fix: borrow the country of the closest-in-time flight that has one (within 14 days).
function nearbyCountry(f) {
  const t0 = Date.parse(f.start); let best = null, gap = 14 * 864e5;
  for (const g of state.flights) {
    const c = g !== f && countryAt(g.lat, g.lng), d = Math.abs(Date.parse(g.start) - t0);
    if (c && d < gap) { best = c; gap = d; }
  }
  return best;
}
const countryOf = f => countryAt(f.lat, f.lng) || f.country || nearbyCountry(f) || home();
const ruleOf = f => RULES[countryOf(f)];
const typeLabel = f => f.type === 'Part 107' ? L10(ruleOf(f).proLabel) : t('recreational');
const heightTxt = (m, c) => RULES[c].heightUnit === 'ft' ? `${Math.round(m * 3.281)} ft` : `${Math.round(m)} m`;
const overLimit = f => f.maxHeightM > ruleOf(f).maxHeightM;
const checklistFor = c => state.checklists[c] || [];
// The pilot's credential number for a country, taken from the first document in its rule pack.
const credFor = c => state.docs[c + ':' + RULES[c].docs[0].key]?.number || '';
const cyclesOf = f => Object.values(f.batteryUses || {}).reduce((a, n) => a + n, 0) || (f.batteryIds || []).length;
const endOf = f => f.airMin != null ? new Date(Date.parse(f.start) + f.airMin * 6e4) : null;
function docStatus(d) {
  if (!d?.expires) return ['none', t('docNone')];
  const days = Math.ceil((Date.parse(d.expires) - Date.now()) / 864e5);
  return days < 0 ? ['bad', t('docExpired')] : days <= 30 ? ['soon', t('docSoon', days)] : ['ok', t('docOk', days)];
}
const docAlerts = () => RULES[home()].docs.filter(d => ['bad', 'soon'].includes(docStatus(state.docs[home() + ':' + d.key])[0])).length;

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
    [state.flights.filter(f => f.laanc).length, t('auths')],
  ];
  $('#stats').innerHTML = cards.map(([v, l]) => `<div class="stat"><div class="v mono">${v}</div><div class="l">${esc(l)}</div></div>`).join('');
  const miss = fl.filter(f => f.airMin == null), alerts = docAlerts();
  const notes = [];
  if (alerts) notes.push(t('docAlert', alerts));
  if (window.authAlerts) notes.push(...authAlerts());
  if (miss.length) notes.push(miss.some(f => f.source === 'autopylot') ? t('airNote', miss.length) : t('airNoteManual', miss.length));
  $('#airNote').hidden = !notes.length;
  $('#airNote').innerHTML = notes.join('<br><br>');
}
function renderList() {
  const countries = [...new Set(state.flights.map(countryOf))];
  $('#filters').innerHTML = [['all', t('all')], ...(countries.length > 1 ? countries.map(c => ['c:' + c, `${RULES[c].flag} ${L10(RULES[c].name)}`]) : []),
    ['Recreational', t('recreational')], ['Part 107', t('pro')], ['laanc', t('authShort')], ['cancelled', t('notFlown')]]
    .map(([k, l]) => `<button class="chip ${filter === k ? 'on' : ''}" data-f="${k}">${esc(l)}</button>`).join('');
  const fl = sorted().filter(f => filter === 'all' || (filter === 'laanc' ? f.laanc : filter === 'cancelled' ? !flown(f) : filter.startsWith('c:') ? countryOf(f) === filter.slice(2) : flown(f) && f.type === filter));
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
          <span class="badge">${ruleOf(f).flag} ${esc(typeLabel(f))}</span>
          ${f.laanc ? `<span class="badge laanc mono">${ruleOf(f).authShort} ${esc(f.laanc)}</span>` : ''}
          ${overLimit(f) ? `<span class="badge warn">↑${heightTxt(f.maxHeightM, countryOf(f))}</span>` : ''}
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
    zLayer = L.layerGroup().addTo(map); // added first so airport rings and flight markers draw on top
    azLayer = L.layerGroup().addTo(map);
    layer = L.layerGroup().addTo(map);
    azInit();
    zInit();
    faaInit();
  }
  layer.clearLayers();
  const pts = [];
  for (const f of state.flights) {
    if (f.lat == null) continue;
    const isL = !!f.laanc || f.type === 'Part 107';
    L.circleMarker([f.lat, f.lng], { radius: isL ? 9 : 7, color: isL ? '#4f7a00' : '#3d4740', weight: 2, fillColor: isL ? '#9bd400' : '#7c8a80', fillOpacity: .85, bubblingMouseEvents: false })
      .bindPopup(`<b>${esc(new Date(f.start).toLocaleDateString(loc(), { dateStyle: 'medium' }))}</b><br>${esc(f.location)}${f.laanc ? `<br>${ruleOf(f).authShort} ${esc(f.laanc)}` : ''}`)
      .addTo(layer);
    pts.push([f.lat, f.lng]);
  }
  setTimeout(() => { map.invalidateSize(); if (pts.length) map.fitBounds(pts, { padding: [30, 30], maxZoom: 14 }); else map.setView(home() === 'CL' ? [-33.45, -70.66] : [25.65, -80.43], 10); }, 50);
}

// ---------- airport zones (informational only; data: OurAirports, public domain) ----------
// Each row: [code, name, lat, lon, ring km, country]. Chile: 8 km commercial airports, 5 km other aerodromes (the stricter
// reading in rules.js). US: ~5 mi ring around large/medium airports, approximate; class B/C/D and LAANC are not shown.
let azData = null, azLayer, azOn = false, azPin;
const azLoad = () => azData ? Promise.resolve(azData) : fetch('geo/airports.json').then(r => r.json()).then(d => (azData = d)).catch(() => null);
function azDist(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180, dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}
function azMsg(cls, text) { const box = $('#azResult'); box.className = 'note ' + cls; box.textContent = text; box.hidden = !text; }
function azRender() {
  azLayer.clearLayers();
  if (!azOn || !azData) { azMsg('', ''); return; }
  if (map.getZoom() < 8) { azMsg('', t('azZoom')); return; }
  const b = map.getBounds().pad(0.3);
  for (const [code, name, lat, lon, km, cc] of azData) {
    if (!b.contains([lat, lon])) continue;
    const col = km === 8 ? '#c0392b' : '#d98c00';
    // dashed = approximate (US); the FAA grid replaces the US rings when it is on
    if (!(cc === 'US' && faaOn)) L.circle([lat, lon], { radius: km * 1000, color: col, weight: 1.5, fillColor: col, fillOpacity: .12, dashArray: cc === 'US' ? '6 6' : null }).addTo(azLayer);
    L.circleMarker([lat, lon], { radius: 3, color: col, weight: 1, fillColor: col, fillOpacity: 1, bubblingMouseEvents: false })
      .bindTooltip(`${code} · ${name}`).addTo(azLayer);
  }
  if (!azPin) azMsg('', t('azHint'));
}
function azSet(on) {
  azOn = on; state.settings.az = on; save();
  $('#azToggle').classList.toggle('on', on);
  document.querySelectorAll('.azLeg').forEach(e => { e.hidden = !on; });
  if (on) azLoad().then(d => { if (!d) azMsg('', t('azNoData')); else azRender(); }); else azRender();
}
function azCheckAt(lat, lon) {
  azLoad().then(d => {
    if (!d) { azMsg('', t('azNoData')); return; }
    let best = null;
    for (const a of d) { const dist = azDist(lat, lon, a[2], a[3]), over = dist - a[4]; if (!best || over < best.over) best = { a, dist, over }; }
    if (best.dist > 150) { azMsg('', t('azNone')); return; }
    const [code, name, , , km, cc] = best.a, dist = best.dist.toFixed(1), us = cc === 'US', sfx = us ? 'US' : '';
    if (us && faaOn) { azMsg('', ''); return; } // the FAA grid answers for the US
    // US rings are only a rough stand-in for Class B/C/D, so never answer "clear" there.
    if (best.over <= 0) azMsg('az-in', t('azInside' + sfx, name, code, km, dist));
    else if (best.over <= 3) azMsg('az-near', t('azNear' + sfx, name, code, km, dist));
    else azMsg(us ? 'az-near' : 'az-ok', t('azClear' + sfx, name, code, km, dist));
  });
}
function azInit() {
  $('#azToggle').onclick = () => azSet(!azOn);
  $('#azCheck').onclick = () => {
    azMsg('', t('azLocating'));
    if (!navigator.geolocation) { azMsg('', t('azNoGps')); return; }
    navigator.geolocation.getCurrentPosition(p => {
      const { latitude: la, longitude: lo } = p.coords;
      if (!azOn && !faaOn && !zOn) { azSet(true); zSet(true); }
      map.setView([la, lo], Math.max(map.getZoom(), 11));
      spotCheck(la, lo);
    }, () => azMsg('', t('azNoGps')), { enableHighAccuracy: true, timeout: 10000 });
  };
  map.on('moveend', azRender);
  map.on('click', e => { if (azOn || faaOn || zOn) spotCheck(e.latlng.lat, e.latlng.lng); });
  map.whenReady(() => azSet(!!state.settings.az)); // zoom is only readable once the map has a view
}
function spotPin(lat, lon) {
  if (azPin) azPin.remove();
  azPin = L.circleMarker([lat, lon], { radius: 8, color: '#1d6fd8', weight: 3, fillColor: '#1d6fd8', fillOpacity: .35, bubblingMouseEvents: false }).addTo(map);
}
function spotCheck(lat, lon) {
  spotPin(lat, lon);
  if (zOn) zCheckAt(lat, lon);
  if (azOn) azCheckAt(lat, lon);
  const us = faaOn && lat > 10; // the FAA grid only covers the US and its territories
  if (us) { faaCheckAt(lat, lon); lastSpot = [lat, lon]; } else if (faaOn) faaMsg('', '');
  $('#apRow').hidden = !us; // LAANC authorization happens in AutoPylot, not here
}

// ---------- Chile P/R/D zones (DGAC AIP-Chile ENR 5.1, hand-transcribed by tools/build-cl-zones.py) ----------
// Only zones whose lower limit is the ground. Each zone: { id, k: 'P'|'R'|'D', n: name, up, lo, when, note, approx, g: [[lat, lon], ...] }.
const Z_COLORS = { P: '#b0186e', R: '#7a3db8', D: '#1f7fc4' };
let zData = null, zLayer, zOn = false;
const zLoad = () => zData ? Promise.resolve(zData) : fetch('geo/cl-zones.json').then(r => r.json()).then(d => (zData = d.zones)).catch(() => null);
const inChile = (lat, lon) => lat < -17 && lat > -57 && lon > -76 && lon < -66;
function zMsg(cls, text) { const box = $('#zResult'); box.className = 'note ' + cls; box.textContent = text; box.hidden = !text; }
function zInPoly(lat, lon, g) { // ray casting; zones are small enough to treat lat/lon as flat
  let inside = false;
  for (let i = 0, j = g.length - 1; i < g.length; j = i++) {
    const [ai, oi] = g[i], [aj, oj] = g[j];
    if ((ai > lat) !== (aj > lat) && lon < (oj - oi) * (lat - ai) / (aj - ai) + oi) inside = !inside;
  }
  return inside;
}
function zRender() {
  zLayer.clearLayers();
  if (!zOn || !zData) return;
  for (const z of zData) {
    const col = Z_COLORS[z.k];
    L.polygon(z.g, { color: col, weight: 1.5, fillColor: col, fillOpacity: z.k === 'P' ? .22 : .12, dashArray: z.approx ? '6 5' : null })
      .bindTooltip(`${z.id} · ${z.n}`).addTo(zLayer); // taps fall through to the map, which runs the spot check
  }
}
function zSet(on) {
  zOn = on; state.settings.z = on; save();
  $('#zToggle').classList.toggle('on', on);
  document.querySelectorAll('.zLeg').forEach(e => { e.hidden = !on; });
  if (!on) zMsg('', '');
  if (on) zLoad().then(d => { if (!d) zMsg('', t('zNoData')); else zRender(); }); else zRender();
}
function zCheckAt(lat, lon) {
  zLoad().then(d => {
    if (!d) { zMsg('', t('zNoData')); return; }
    if (!inChile(lat, lon)) { zMsg('', ''); return; }
    const hits = d.filter(z => zInPoly(lat, lon, z.g));
    if (!hits.length) { zMsg('', t('zOut')); return; }
    const kind = t('zKind');
    const list = hits.map(z => `${z.id} ${z.n} (${kind[z.k]}, ${z.lo}–${z.up}${z.when ? ', ' + z.when : ''}${z.note ? ', ' + z.note : ''})`).join('; ');
    zMsg(hits.some(z => z.k === 'P') ? 'az-in' : 'az-near', t('zIn', list));
  });
}
function zInit() {
  $('#zToggle').onclick = () => zSet(!zOn);
  map.whenReady(() => zSet(!!state.settings.z));
}

// ---------- FAA LAANC grid (UAS Facility Maps; FAA public data, US only) ----------
// Each grid square carries the max altitude (ft AGL) the FAA lets LAANC approve automatically. It does not show TFRs,
// parks or other restrictions, and a ceiling is not a permission: the pilot still requests authorization in a LAANC app.
const FAA_URL = 'https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services/FAA_UAS_FacilityMap_Data/FeatureServer/0/query';
const FAA_COLORS = { 0: '#c0392b', 50: '#e0562b', 100: '#e8832a', 150: '#eba72c', 200: '#e6c62e', 300: '#a9c93a', 400: '#5aa845' };
const FAA_MAX = 2000; // the service's page size; a view that fills it is "too many squares"
let faaOn = false, faaLayer, faaCanvas, faaCtl, faaTimer, lastSpot = null;
const faaColor = c => FAA_COLORS[c] ?? (c > 400 ? FAA_COLORS[400] : '#999');
const faaQuery = (geom, type, extra) => FAA_URL + '?' + new URLSearchParams({
  where: '1=1', geometry: geom, geometryType: type, inSR: '4326', spatialRel: 'esriSpatialRelIntersects',
  outFields: 'CEILING,APT1_NAME,APT1_FAAID,AIRSPACE_1,MAP_EFF', outSR: '4326', f: 'geojson', ...extra });
function faaMsg(cls, text) { const box = $('#faaResult'); box.className = 'note ' + cls; box.textContent = text; box.hidden = !text; }
function faaRender() {
  clearTimeout(faaTimer);
  if (faaCtl) faaCtl.abort();
  if (!faaOn) { faaLayer.clearLayers(); faaMsg('', ''); return; }
  if (map.getZoom() < 10) { faaLayer.clearLayers(); faaMsg('', t('faaZoom')); return; }
  faaTimer = setTimeout(async () => { // debounce: wait until the map stops moving
    faaCtl = new AbortController();
    const b = map.getBounds().pad(0.2);
    try {
      const url = faaQuery([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(','), 'esriGeometryEnvelope',
        { returnGeometry: 'true', geometryPrecision: '5', resultRecordCount: String(FAA_MAX) });
      const fs = (await (await fetch(url, { signal: faaCtl.signal })).json()).features || [];
      faaLayer.clearLayers();
      if (fs.length >= FAA_MAX) { faaMsg('', t('faaMany')); return; }
      L.geoJSON(fs, { renderer: faaCanvas, interactive: false,
        style: f => ({ stroke: true, color: '#fff', weight: .4, opacity: .5, fillColor: faaColor(f.properties.CEILING), fillOpacity: .42 }) }).addTo(faaLayer);
      faaMsg('', fs.length ? (azPin ? '' : t('faaHint')) : t('faaNone'));
    } catch (e) { if (e.name !== 'AbortError') faaMsg('', t('faaErr')); }
  }, 350);
}
async function faaCheckAt(lat, lon) {
  faaMsg('', t('faaChecking'));
  try {
    const fs = (await (await fetch(faaQuery(`${lon},${lat}`, 'esriGeometryPoint', { returnGeometry: 'false' }))).json()).features || [];
    if (!fs.length) { faaMsg('az-near', t('faaNoGrid')); return; }
    // overlapping squares from several airports: the lowest ceiling is the one that limits you
    const p = fs.map(f => f.properties).sort((a, b) => a.CEILING - b.CEILING)[0];
    if (p.CEILING === 0) faaMsg('az-in', t('faaZero', p.APT1_NAME, p.AIRSPACE_1, p.MAP_EFF));
    else faaMsg('az-near', t('faaCell', p.CEILING, p.APT1_NAME, p.AIRSPACE_1, p.MAP_EFF));
  } catch { faaMsg('', t('faaErr')); }
}
function faaSet(on) {
  faaOn = on; state.settings.faa = on; save();
  $('#faaToggle').classList.toggle('on', on);
  $('#faaLegend').hidden = !on;
  if (!on) $('#apRow').hidden = true;
  if (!on && !azOn && !zOn && azPin) { azPin.remove(); azPin = null; }
  faaRender();
  if (map) azRender(); // US rings hide while the grid is on
}
function faaInit() {
  map.createPane('faa').style.zIndex = 350; // under the airport rings and the flight markers
  faaCanvas = L.canvas({ pane: 'faa' });
  faaLayer = L.layerGroup().addTo(map);
  $('#faaLegend').innerHTML = `${t('faaLeg')} ` + [0, 100, 200, 300, 400].map(c => `<span class="dot" style="background:${faaColor(c)}"></span>${c}`).join(' ');
  $('#faaToggle').onclick = () => faaSet(!faaOn);
  $('#apCopy').onclick = async () => {
    const b = $('#apCopy');
    const xy = `${lastSpot[0].toFixed(5)}, ${lastSpot[1].toFixed(5)}`;
    try { await navigator.clipboard.writeText(xy); b.textContent = t('apCopied'); } catch { b.textContent = xy; } // blocked: show them to copy by hand
    setTimeout(() => { b.textContent = t('apCopy'); }, 4000);
  };
  map.on('moveend', faaRender);
  map.whenReady(() => faaSet(!!state.settings.faa));
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
  $('#setCountry').value = home();
  $('#checkTitle').textContent = `${t('checklist')} ${RULES[home()].flag}`;
  $('#checkItems').innerHTML = checklistFor(home()).map((c, i) =>
    `<div class="row"><span>${esc(c)}</span><button class="btn small" data-rm-check="${i}">${t('remove')}</button></div>`).join('');
}
let rulesCountry = null;
function renderRules() {
  const c = rulesCountry || home(), R = RULES[c];
  const mine = state.flights.filter(f => flown(f) && countryOf(f) === c);
  const docs = R.docs.map(d => {
    const v = state.docs[c + ':' + d.key] || {}, [cls, txt] = docStatus(v);
    return `<div class="row"><div style="flex:1;min-width:0"><b>${esc(L10(d))}</b>
      <div class="sub doc-${cls}">${esc(txt)}${v.number ? ' · <span class="mono">' + esc(v.number) + '</span>' : ''}</div></div>
      <button class="btn small" data-doc="${c}:${d.key}">✎</button></div>`;
  }).join('');
  $('#v-rules').innerHTML = `
    <div class="toolbar">${Object.entries(RULES).map(([k, r]) => `<button class="chip ${k === c ? 'on' : ''}" data-rc="${k}">${r.flag} ${esc(L10(r.name))}</button>`).join('')}</div>
    <p class="note">${esc(t('rulesIntro'))}</p>
    <section class="box"><h3>${R.flag} ${esc(R.authority)}</h3>
      <div class="sub" style="margin-bottom:6px">${esc(t('yourFlights', mine.length, mine.filter(overLimit).length))}</div>
      <ul class="rules">${R.rules.map(r => `<li>${esc(L10(r))}</li>`).join('')}</ul>
      <div class="sub">${esc(t('checked', R.checked))} · ${esc(t('sources'))}: ${R.sources.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(l)}</a>`).join(' · ')}</div>
    </section>
    <section class="box"><h3>${esc(t('docs'))}</h3>${docs}</section>
    ${window.authsSection ? authsSection(c) : ''}`;
}
function docDialog(key) {
  const [c, k] = key.split(':'), d = RULES[c].docs.find(x => x.key === k), v = state.docs[key] || {};
  openDialog(`<h3>${RULES[c].flag} ${esc(L10(d))}</h3>
    <label>${t('number')}</label><input name="number" class="mono" value="${esc(v.number)}">
    <label>${t('expires')}</label><input type="date" name="expires" value="${esc(v.expires)}">`,
  fd => { state.docs[key] = { number: fd.get('number').trim(), expires: fd.get('expires') }; });
}
function welcomeDialog() {
  const opt = (v, l, sel) => `<option value="${v}" ${sel ? 'selected' : ''}>${esc(l)}</option>`;
  openDialog(`<h3>${t('welcome')} 👋</h3><p class="note" style="margin:0">${esc(t('welcomeText'))}</p>
    <label>${t('pilot')}</label><input name="pilot" value="${esc(state.settings.pilot)}">
    <div class="grid2"><div><label>${t('country')}</label><select name="country">${Object.entries(RULES).map(([k, r]) => opt(k, `${r.flag} ${L10(r.name)}`, k === home())).join('')}</select></div>
      <div><label>${t('language')}</label><select name="lang">${opt('es', 'Español', state.settings.lang === 'es')}${opt('en', 'English', state.settings.lang === 'en')}</select></div></div>
    <label>${t('droneOptional')}</label><input name="drone" placeholder="DJI Avata 2, Mini 4 Pro…">`,
  fd => {
    Object.assign(state.settings, { pilot: fd.get('pilot').trim(), country: fd.get('country'), lang: fd.get('lang') });
    state.checklists = { US: RULES.US.checklist[state.settings.lang], CL: RULES.CL.checklist[state.settings.lang] };
    const dn = fd.get('drone').trim();
    if (dn) state.drones.push({ id: uid(), name: dn.replace(/^DJI /i, ''), model: dn, serial: '', reg: '' });
    state.welcomed = true;
  });
  $('#dCancel').onclick = () => { state.welcomed = true; save(); dlg.close(); };
}
function renderAll() {
  applyI18n();
  $('#pilotName').textContent = state.settings.pilot || '';
  renderStats(); renderList(); renderFleet(); renderMore(); renderRules();
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
  f = f || { start: new Date().toISOString(), type: 'Recreational', airMin: null, batteryIds: [], droneId: state.drones[0]?.id || '', country: home() };
  const R = ruleOf(f), checks = checklistFor(countryOf(f));
  if (isNew) f.credential = credFor(countryOf(f));
  const opt = (v, l, sel) => `<option value="${esc(v)}" ${sel ? 'selected' : ''}>${esc(l)}</option>`;
  openDialog(`<h3>${t(isNew ? 'newFlight' : 'editFlight')}</h3>
    ${f.source === 'autopylot' ? `<div class="note" style="margin:0 0 4px">${t('fromAP')}${f.plannedMin ? ` · ${f.plannedMin} ${t('min')} ${t('planned')}` : ''}</div>` : ''}
    ${noLogSuspect(f) ? `<div class="note" style="margin:4px 0">${t('noLogHint')} <button type="button" class="btn small" id="markNF">${t('markNotFlown')}</button></div>` : ''}
    ${f.djiLogs ? `<div class="note" style="margin:4px 0">${t('djiLine', f.djiLogs, f.distanceKm, f.maxHeightM, f.maxSpeed)}${overLimit(f) ? ` · <b class="missing">${t('overLimit', heightTxt(R.maxHeightM, countryOf(f)))}</b>` : ''}</div>` : ''}
    ${isNew ? `<div class="note" style="margin:4px 0">${R.flag} ${esc(L10(R.summary))}</div>` : ''}
    <div class="grid2"><div><label>${t('start')}</label><input type="datetime-local" name="start" value="${toLocalInput(f.start)}" required></div>
      <div><label>${t('airMin')}</label><input type="number" name="airMin" min="0" step="1" inputmode="numeric" value="${f.airMin ?? ''}"></div></div>
    <div class="grid2"><div><label>${t('type')}</label><select name="type">${opt('Recreational', t('recreational'), f.type !== 'Part 107')}${opt('Part 107', L10(R.proLabel), f.type === 'Part 107')}</select></div>
      <div><label>${t('drone')}</label><select name="droneId">${opt('', t('none'), !f.droneId)}${state.drones.map(d => opt(d.id, d.name, d.id === f.droneId)).join('')}</select></div></div>
    <label>${t('status')}</label><select name="status">${opt('', t('flown'), flown(f))}${opt('cancelled', t('notFlown'), !flown(f))}</select>
    <label>${t('purpose')}</label><input name="name" value="${esc(f.name)}">
    <label>${t('location')}</label><input name="location" value="${esc(f.location)}">
    <div class="grid2"><div><label>${t('lat')}</label><input name="lat" inputmode="decimal" value="${f.lat ?? ''}"></div>
      <div><label>${t('lng')}</label><input name="lng" inputmode="decimal" value="${f.lng ?? ''}"></div></div>
    <button type="button" class="btn small" id="gps" style="margin-top:8px">${t('useGps')}</button>
    <div class="grid2"><div><label>${esc(L10(R.authLabel))}</label><input name="laanc" class="mono" value="${esc(f.laanc)}"></div>
      <div><label>${t('airspace')}</label><input name="airspace" value="${esc(f.airspace)}"></div></div>
    ${window.authSelect ? authSelect(f) : ''}
    <div class="grid2"><div><label>${t('weather')}</label><input name="weather" placeholder="${esc(t('weatherPh'))}" value="${esc(f.weather)}"></div>
      <div><label>${t('observer')}</label><input name="observer" placeholder="${esc(t('observerPh'))}" value="${esc(f.observer)}"></div></div>
    <label>${t('credentialNo')}</label><input name="credential" class="mono" value="${esc(f.credential)}">
    ${state.batteries.length ? `<label>${t('batteries')}</label><div class="checks">${state.batteries.map(b =>
      `<label><input type="checkbox" name="bat" value="${b.id}" ${(f.batteryIds || []).includes(b.id) ? 'checked' : ''}>${esc(b.label)}</label>`).join('')}</div>` : ''}
    ${isNew && checks.length ? `<label>${t('checklist')} ${R.flag}</label><div class="checks">${checks.map((c, i) =>
      `<label><input type="checkbox" name="chk" value="${i}">${esc(c)}</label>`).join('')}</div>` : ''}
    <label>${t('incident')}</label><textarea name="incident">${esc(f.incident)}</textarea>
    <label>${t('notes')}</label><textarea name="notes">${esc(f.notes)}</textarea>`,
  fd => {
    const num = v => (v === '' || v == null || isNaN(+v)) ? null : +v;
    Object.assign(f, {
      start: new Date(fd.get('start')).toISOString(), airMin: num(fd.get('airMin')), type: fd.get('type'), status: fd.get('status') || undefined,
      droneId: fd.get('droneId'), name: fd.get('name').trim(), location: fd.get('location').trim(),
      lat: num(fd.get('lat')), lng: num(fd.get('lng')), laanc: fd.get('laanc').trim(), airspace: fd.get('airspace').trim(),
      batteryIds: fd.getAll('bat'), notes: fd.get('notes').trim(),
      authId: fd.get('authId') || undefined,
      weather: fd.get('weather').trim(), observer: fd.get('observer').trim(), credential: fd.get('credential').trim(), incident: fd.get('incident').trim(),
    });
    const au = f.authId && (state.auths || []).find(a => a.id === f.authId);
    if (au?.number && !f.laanc) f.laanc = au.number;
    if (f.batteryUses) f.batteryUses = Object.fromEntries(Object.entries(f.batteryUses).filter(([k]) => f.batteryIds.includes(k)));
    if (isNew) { f.id = uid(); f.source = 'manual'; f.checklist = `${fd.getAll('chk').length}/${checks.length}`; state.flights.push(f); }
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
      <div><label>${esc(L10(RULES[home()].regLabel))}</label><input name="reg" class="mono" value="${esc(d.reg)}"></div></div>`,
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
  const cols = ['Date', 'Start', 'End', 'Air time (min)', 'Country', 'Type', 'Purpose', 'Location', 'Lat', 'Lng', 'Drone', 'Aircraft reg', 'Batteries', 'Cycles',
    'Pilot', 'Credential', 'Authorization', 'Airspace', 'Weather', 'Observer', 'Incidents', 'Max height (m)', 'Notes', 'Source', 'Status'];
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [cols.map(q).join(',')].concat(sorted().map(f => {
    const d = new Date(f.start);
    const hm = x => x ? x.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
    const dr = state.drones.find(x => x.id === f.droneId);
    const bats = (f.batteryIds || []).map(id => state.batteries.find(b => b.id === id)?.label).filter(Boolean).join(' / ');
    return [d.toLocaleDateString('en-CA'), hm(d), hm(endOf(f)), f.airMin ?? '', countryOf(f), typeLabel(f), f.name, f.location, f.lat, f.lng,
      dr?.name, dr?.reg, bats, cyclesOf(f), state.settings.pilot, f.credential, f.laanc, f.airspace, f.weather, f.observer, f.incident,
      f.maxHeightM ?? '', f.notes, f.source, flown(f) ? 'Flown' : 'Not flown'].map(q).join(',');
  }));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
  a.download = `drone-logbook-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function printLog() {
  const tm = x => x ? x.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }) : '—';
  const rows = sorted().filter(flown).map(f => { const d = new Date(f.start), dr = state.drones.find(x => x.id === f.droneId);
    const bats = (f.batteryIds || []).map(id => state.batteries.find(b => b.id === id)?.label).filter(Boolean).join(', ');
    return `<tr><td>${d.toLocaleDateString(loc())}</td><td>${tm(d)}</td><td>${tm(endOf(f))}</td><td>${f.airMin ?? '—'}</td>
      <td>${esc(f.credential || '')}</td><td>${esc([dr?.name, dr?.reg].filter(Boolean).join(' · '))}</td><td>${esc(bats)}</td><td>${cyclesOf(f) || ''}</td>
      <td>${esc(shortLoc(f.location) || '')}${f.lat != null ? `<br>${f.lat.toFixed(5)}, ${f.lng.toFixed(5)}` : ''}</td>
      <td>${esc(typeLabel(f))}${f.name ? ' — ' + esc(f.name) : ''}</td><td>${esc(f.laanc || '')}</td><td>${esc(f.weather || '')}</td>
      <td>${esc(f.observer || '')}</td><td>${esc(f.incident || '')}</td></tr>`; }).join('');
  $('#print').innerHTML = `<h2>${t('logTitle')} — ${esc(state.settings.pilot)}</h2>
    <p>${state.flights.filter(flown).length} ${t('flightsShort')} · ${new Date().toLocaleDateString(loc())}</p>
    <table><thead><tr><th>${t('date')}</th><th>${t('start')}</th><th>${t('end')}</th><th>${t('min')}</th>
      <th>${t('credentialNo')}</th><th>${t('aircraftReg')}</th><th>${t('batteries')}</th><th>${t('cyclesUsed')}</th><th>${t('location')}</th>
      <th>${t('workType')}</th><th>${t('authShort')}</th><th>${t('weather')}</th><th>${t('observer')}</th><th>${t('incident')}</th></tr></thead><tbody>${rows}</tbody></table>`;
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
$('#setCountry').onchange = e => { state.settings.country = e.target.value; rulesCountry = null; save(); renderAll(); };
$('#addCheck').onclick = () => { const v = $('#newCheck').value.trim(); if (v) { (state.checklists[home()] ||= []).push(v); $('#newCheck').value = ''; save(); renderMore(); } };
$('#checkItems').onclick = e => { const b = e.target.closest('[data-rm-check]'); if (b) { state.checklists[home()].splice(+b.dataset.rmCheck, 1); save(); renderMore(); } };
$('#v-rules').onclick = e => {
  const rc = e.target.closest('[data-rc]'); if (rc) { rulesCountry = rc.dataset.rc; renderRules(); }
  const d = e.target.closest('[data-doc]'); if (d) docDialog(d.dataset.doc);
};
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
$('#backup').onclick = async () => {
  const files = window.backupFiles ? await backupFiles() : {};
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'drone-logbook', v: 1, state, files }, null, 1)], { type: 'application/json' }));
  a.download = `logbook-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('#restoreFile').onchange = async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  let b; try { b = JSON.parse(await file.text()); } catch {}
  if (b?.app !== 'drone-logbook' || !Array.isArray(b.state?.flights)) { alert(t('badBackup')); return; }
  if (state.flights.length && !confirm(t('confirmRestore'))) return;
  state = { ...DEFAULT(), ...b.state, seeded: true, welcomed: true }; migrate(); save();
  if (b.files && window.restoreFiles) await restoreFiles(b.files);
  renderAll();
  $('#importMsg').hidden = false; $('#importMsg').textContent = t('restored', state.flights.length);
};
$('#printLog').onclick = printLog;
$('#feedback').onclick = e => {
  e.preventDefault();
  const subj = encodeURIComponent(`${t('appName')} — ${t('feedback')}`);
  location.href = `mailto:manny@weaponartist.studio?subject=${subj}`;
};
$('#resetAll').onclick = () => { if (confirm(t('confirmReset'))) { state = DEFAULT(); migrate(); state.seeded = true; save(); renderAll(); welcomeDialog(); } };

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
  if (state.flights.length) state.welcomed = true;
  save();
  renderAll();
  if (!state.welcomed) welcomeDialog();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
