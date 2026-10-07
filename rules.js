// Country rule packs. These are plain-language summaries of the official regulations, not legal advice;
// each pack records when it was last checked and where the numbers came from.
const RULES = {
  CL: {
    flag: '🇨🇱', name: { en: 'Chile', es: 'Chile' }, authority: 'DGAC',
    checked: '2026-10-07',
    maxHeightM: 120, heightUnit: 'm',
    proLabel: { en: 'Professional (DGAC)', es: 'Profesional (DGAC)' },
    authLabel: { en: 'DGAC authorization #', es: 'N° autorización DGAC' }, authShort: 'DGAC',
    regLabel: { en: 'DGAC registration', es: 'Registro DGAC' },
    summary: { en: 'DAN 151: max 120 m · in sight, max 500 m · 30 m from people · keep well clear of aerodromes (see Rules)',
               es: 'DAN 151: máx. 120 m · a la vista, máx. 500 m · 30 m de personas · lejos de aeródromos (ver Normas)' },
    rules: [
      { en: 'In force: DAN 151 Edition 3 (27 May 2024) together with DAN 91. Edition 4 is a draft (March 2026) and not yet in force.',
        es: 'Vigente: DAN 151 Edición 3 (27 de mayo de 2024) junto con la DAN 91. La Edición 4 es un borrador (marzo 2026) y aún no está vigente.' },
      { en: 'Maximum height 120 m (400 ft) above the ground.', es: 'Altura máxima 120 m (400 ft) sobre el suelo.' },
      { en: 'Keep the drone in direct sight (VLOS), up to 500 m from the operator.', es: 'Mantén el dron a la vista (VLOS), hasta 500 m del operador.' },
      { en: '30 m horizontal separation from people.', es: '30 m de separación horizontal de las personas.' },
      { en: 'Aerodromes: stay at least 2 km from the extended runway centerline, measured from the threshold, and 1 km to each side of the runway (DAN 151 151.103(g)(5); DAN 91 91.102(i)(5)). The map rings (8 km / 5 km) are a wider safety margin, not the legal limit.',
        es: 'Aeródromos: mantente al menos a 2 km de la prolongación del eje de pista, medidos desde el umbral, y a 1 km a cada lado de la pista (DAN 151 151.103(g)(5); DAN 91 91.102(i)(5)). Los anillos del mapa (8 km / 5 km) son un margen de seguridad más amplio, no el límite legal.' },
      { en: 'Prohibited, restricted and dangerous zones (P/R/D) are published in the AIP Chile; flying over La Moneda is prohibited, and most national parks need CONAF authorization (aerotest.cl).',
        es: 'Las zonas prohibidas, restringidas y peligrosas (P/R/D) se publican en el AIP Chile; está prohibido volar sobre La Moneda y la mayoría de los parques nacionales requiere autorización de CONAF (aerotest.cl).' },
      { en: 'Night flights need a special DGAC authorization.', es: 'Volar de noche requiere autorización especial de la DGAC.' },
      { en: 'Over populated areas: prior DGAC authorization, plus RPAS operator credential, drone registration and liability insurance.',
        es: 'Sobre zonas pobladas: autorización previa de la DGAC, además de credencial de operador RPAS, registro del dron y seguro de responsabilidad civil.' },
      { en: 'Only exemption: foam (expanded polypropylene, EPP) drones up to 750 g, private/recreational use, in private places, up to 50 m above the tallest obstacle; these may fly over populated areas (DAN 91 91.102(j)). A plastic drone like a DJI Avata 2 does not qualify.',
        es: 'Única excepción: drones de espuma (polipropileno expandido, EPP) de hasta 750 g, uso privado/recreativo, en lugares privados, hasta 50 m sobre el obstáculo más alto; pueden volar sobre zonas pobladas (DAN 91 91.102(j)). Un dron plástico como el DJI Avata 2 no califica.' },
      { en: 'The RPAS operator credential is valid for 36 months (DAN 151 151.307(a)); renewing means retaking the written exam (pass mark 75%). Check the date printed on yours.',
        es: 'La credencial de operador RPAS dura 36 meses (DAN 151 151.307(a)); para renovarla se rinde de nuevo el examen teórico (aprobación 75%). Revisa la fecha impresa en la tuya.' },
    ],
    docs: [
      { key: 'credential', en: 'RPAS operator credential', es: 'Credencial de operador RPAS' },
      { key: 'registration', en: 'Drone registration (DGAC)', es: 'Registro del dron (DGAC)' },
      { key: 'insurance', en: 'Liability insurance', es: 'Seguro de responsabilidad civil' },
    ],
    checklist: {
      en: ['Clear of aerodromes (2 km runway axis / 1 km to the side)', 'Not in a P/R/D zone or national park', 'DGAC authorization if over a populated area', 'Credential and insurance valid',
        'Plan to stay under 120 m', 'Keep it in sight, max 500 m', '30 m from people', 'Weather & wind OK', 'Props secure & batteries charged'],
      es: ['Lejos de aeródromos (2 km eje de pista / 1 km lateral)', 'Fuera de zonas P/R/D y parques nacionales', 'Autorización DGAC si es zona poblada', 'Credencial y seguro vigentes',
        'Planificar bajo 120 m', 'Mantener a la vista, máx. 500 m', '30 m de personas', 'Clima y viento OK', 'Hélices firmes y baterías cargadas'],
    },
    sources: [
      ['DGAC — DAN 151 Ed. 3 (27 May 2024)', 'https://www.dgac.gob.cl/wp-content/uploads/2024/07/DAN-151-ED3-27MAY2024-2.pdf'],
      ['DGAC — DAN 91 Ed. 4 Enm. 5', 'https://www.dgac.gob.cl/wp-content/uploads/2024/07/DAN-91_ED4__ENM5_20JUL2023-2.pdf'],
      ['aereo.cl — Normativa de drones en Chile (agosto 2026)', 'https://aereo.cl/guias/normativa-drones-chile/'],
      ['aerotest.cl — RPA en Chile: guía 2026', 'https://aerotest.cl/blog/test/rpa-en-chile-guia-completa-para-volar-drones-legal-y-seguro-2026'],
      ['DGAC — ¿Cómo operar un dron en Chile?', 'https://www.dgac.gob.cl/como-operar-un-dron-en-chile/'],
    ],
  },
  US: {
    flag: '🇺🇸', name: { en: 'United States', es: 'Estados Unidos' }, authority: 'FAA',
    checked: '2026-10-03',
    maxHeightM: 122, heightUnit: 'ft',
    proLabel: { en: 'Part 107', es: 'Part 107' },
    authLabel: { en: 'LAANC reference code', es: 'Código LAANC' }, authShort: 'LAANC',
    regLabel: { en: 'FAA registration', es: 'Registro FAA' },
    summary: { en: 'FAA: max 400 ft · in sight · LAANC in controlled airspace',
               es: 'FAA: máx. 400 ft · a la vista · LAANC en espacio aéreo controlado' },
    rules: [
      { en: 'Recreational flying: pass the free TRUST test and follow the recreational safety rules. Paid or business flying: Part 107 certificate.',
        es: 'Vuelo recreativo: aprobar el test gratuito TRUST y seguir las reglas recreativas. Vuelo pagado o comercial: certificado Part 107.' },
      { en: 'Maximum 400 ft above the ground.', es: 'Máximo 400 ft (122 m) sobre el suelo.' },
      { en: 'Keep the drone in visual line of sight.', es: 'Mantén el dron a la vista.' },
      { en: 'Controlled airspace (e.g. Class D around Kendall-Tamiami) needs a LAANC or FAA authorization first.',
        es: 'El espacio aéreo controlado (ej. Clase D en Kendall-Tamiami) requiere autorización LAANC o de la FAA.' },
      { en: 'Part 107 pilots: recurrent online training every 24 months.', es: 'Pilotos Part 107: capacitación recurrente cada 24 meses.' },
    ],
    docs: [
      { key: 'part107', en: 'Part 107 certificate / recurrent training', es: 'Certificado Part 107 / recurrente' },
      { key: 'registration', en: 'FAA drone registration', es: 'Registro FAA del dron' },
    ],
    checklist: {
      en: ['Check airspace / LAANC', 'Weather & wind OK', 'Props secure & undamaged', 'Batteries charged (drone + goggles)',
        'SD card in, space free', 'Firmware up to date', 'Clear takeoff area'],
      es: ['Revisar espacio aéreo / LAANC', 'Clima y viento OK', 'Hélices firmes y sin daño', 'Baterías cargadas (dron + gafas)',
        'Tarjeta SD con espacio', 'Firmware actualizado', 'Zona de despegue despejada'],
    },
    sources: [['FAA — Drones (UAS)', 'https://www.faa.gov/uas']],
  },
};

// Rough country boxes; good enough to pick a rule pack from a flight's GPS position.
function countryAt(lat, lng) {
  if (lat == null || lng == null) return null;
  if (lat > -56 && lat < -17.4 && lng > -76 && lng < -66.4) return 'CL';
  if (lat > 18 && lat < 72 && lng > -170 && lng < -64) return 'US';
  return null;
}
