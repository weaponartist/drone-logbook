# Builds geo/cl-protected.json: Chile's protected areas, simplified for the map, from the Ministerio del Medio Ambiente
# open dataset "Áreas Protegidas" (GeoJSON, CC0, file dated 2024-07-23):
# https://lineasdebasepublicas.mma.gob.cl/datos_abiertos/dataset/areas-protegidas
# Usage: python3 tools/build-cl-protected.py "<path to Areas Protegidas.geojson>"   (needs: pip install shapely)
import json, sys
from pathlib import Path
from shapely.geometry import shape, Polygon, MultiPolygon

TOL = 0.0015   # simplification tolerance in degrees (~150 m); boundaries are shown as approximate
MIN_HA = 1     # drop slivers smaller than this
MAX_PTS = 4000 # per area
ISLET = 2e-5   # deg², about 0.2 km² at these latitudes
# 's' = SNAP areas where CONAF/DGAC prohibit recreational drone flights; 'o' = other protected land (owner rules apply).
# Biosphere reserves are left out: they are UNESCO labels over whole regions, towns included, not drone bans.
CATS = {
    'Parque Nacional': ('PN', 's'), 'Reserva Nacional': ('RN', 's'), 'Monumento Natural': ('MN', 's'),
    'Santuario de la Naturaleza': ('SN', 's'), 'Parque Marino': ('PM', 's'), 'Reserva Marina': ('RM', 's'),
    'Área Marina Costera Protegida': ('AMCP', 's'),
    'Conservación Privada y Comunitaria': ('CP', 'o'), 'Bien Nacional Protegido': ('BNP', 'o'),
    'Reserva Forestal': ('RF', 'o'), 'Paisaje de Conservación': ('PC', 'o'),
}

src = json.load(open(sys.argv[1]))
out, seen = [], set()
for f in src['features']:
    p = f['properties']
    cat = CATS.get(p['designacion_ap'])
    if not cat or not f.get('geometry') or (p.get('ha') or 0) < MIN_HA: continue
    raw = shape(f['geometry']).buffer(0)
    # Coarser for huge fjord areas (Kawésqar alone is ~200k points): grow the tolerance until the area fits MAX_PTS,
    # dropping islets under ISLET deg² once an area has many parts.
    for tol in (TOL, TOL * 2, TOL * 4, TOL * 8, TOL * 16):
        g = raw.simplify(tol, preserve_topology=True)
        polys = list(g.geoms) if isinstance(g, MultiPolygon) else [g] if isinstance(g, Polygon) else [x for x in getattr(g, 'geoms', []) if isinstance(x, Polygon)]
        if len(polys) > 20: polys = [pl for pl in polys if pl.area > ISLET]
        if sum(len(pl.exterior.coords) + sum(len(r.coords) for r in pl.interiors) for pl in polys) <= MAX_PTS: break
    if not polys: continue
    # rings as [lat, lon]; holes kept (lakes, enclaves) so the spot check treats them as outside
    rings = [[[[round(y, 4), round(x, 4)] for x, y in r.coords[:-1]] for r in [pl.exterior, *pl.interiors] if len(r.coords) > 3] for pl in polys]
    rings = [r for r in rings if r]
    if not rings: continue
    key = (p['nombre_ap'].strip().lower(), cat[0], json.dumps(rings[0][0][:2]))
    if key in seen: continue  # the source repeats some areas
    seen.add(key)
    out.append(dict(n=p['nombre_ap'].strip(), c=cat[0], t=cat[1], ha=round(p.get('ha') or 0), g=rings))

doc = dict(source='MMA Áreas Protegidas (CC0), 2024-07-23', built='2026-10-06', areas=out)
path = Path(__file__).resolve().parent.parent / 'geo' / 'cl-protected.json'
path.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
print(len(out), 'areas,', sum(a['t'] == 's' for a in out), 'SNAP,', path.stat().st_size // 1024, 'KB ->', path)
