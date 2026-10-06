# Builds geo/cl-zones.json: Chile's prohibited (P), restricted (R) and dangerous (D) areas, hand-transcribed from
# AIP-CHILE Vol. I ENR 5.1 (pages dated 07 AUG 2025 to 06 AUG 2026, up to AMDT NR 67), downloaded 2026-10-06 from
# aipchile.dgac.gob.cl. Only zones whose lower limit reaches the ground (GND, SFC or MSL) are kept, because a drone
# flying under 120 m AGL can't reach the others (lower limits of 3000 ft ALT and up, or 1000 ft AGL for SC-D11).
# Usage: python3 tools/build-cl-zones.py
import json, math, re
from pathlib import Path

SOURCE = 'AIP-CHILE ENR 5.1, AMDT NR 67 (06 AUG 2026)'
NM = 1852.0

def dms(s):
    """'33 26 28 S 70 39 14 W' (seconds may have decimals) -> (lat, lon)."""
    m = re.fullmatch(r'\s*(\d+) (\d+) ([\d.]+) ([NS]) (\d+) (\d+) ([\d.]+) ([EW])\s*', s)
    if not m: raise ValueError(s)
    d1, m1, s1, h1, d2, m2, s2, h2 = m.groups()
    la = int(d1) + int(m1) / 60 + float(s1) / 3600
    lo = int(d2) + int(m2) / 60 + float(s2) / 3600
    return (-la if h1 == 'S' else la, -lo if h2 == 'W' else lo)

def dest(p, brg, dist):
    """Point at true bearing brg (deg) and dist (m) from p, on a sphere."""
    R = 6371008.8
    la, lo, b, d = math.radians(p[0]), math.radians(p[1]), math.radians(brg), dist / R
    la2 = math.asin(math.sin(la) * math.cos(d) + math.cos(la) * math.sin(d) * math.cos(b))
    lo2 = lo + math.atan2(math.sin(b) * math.sin(d) * math.cos(la), math.cos(d) - math.sin(la) * math.sin(la2))
    return (math.degrees(la2), math.degrees(lo2))

def bearing(a, b):
    la1, la2, dl = math.radians(a[0]), math.radians(b[0]), math.radians(b[1] - a[1])
    y = math.sin(dl) * math.cos(la2)
    x = math.cos(la1) * math.sin(la2) - math.sin(la1) * math.cos(la2) * math.cos(dl)
    return math.degrees(math.atan2(y, x)) % 360

def dist(a, b):
    la1, la2 = math.radians(a[0]), math.radians(b[0])
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(math.radians(b[1] - a[1]) / 2) ** 2
    return 2 * 6371008.8 * math.asin(math.sqrt(h))

def circle(c, r):
    c = dms(c) if isinstance(c, str) else c
    return [dest(c, i * 360 / 48, r) for i in range(48)]

def arc(c, r, b1, b2, cw):
    """Points on a circle from bearing b1 to b2, clockwise (cw) or anticlockwise."""
    span = (b2 - b1) % 360 if cw else -((b1 - b2) % 360)
    n = max(2, int(abs(span) / 3))
    return [dest(c, b1 + span * i / n, r) for i in range(n + 1)]

def arc_between(c, r, a, b):
    """Shorter arc around c (radius r) from the bearing of point a to the bearing of point b."""
    b1, b2 = bearing(c, a), bearing(c, b)
    return arc(c, r, b1, b2, (b2 - b1) % 360 <= 180)

def poly(*pts):
    return [dms(p) for p in pts]

def hull(pts):
    """Convex hull (monotone chain). Used for 4-corner boxes whose corners the AIP lists out of order."""
    p = sorted(set(pts))
    def half(seq):
        h = []
        for q in seq:
            while len(h) >= 2 and ((h[-1][0] - h[-2][0]) * (q[1] - h[-2][1]) - (h[-1][1] - h[-2][1]) * (q[0] - h[-2][0])) <= 0: h.pop()
            h.append(q)
        return h
    lo, up = half(p), half(reversed(p))
    return lo[:-1] + up[:-1]

def crosses(pts):
    """True if any two non-adjacent edges intersect (a 'bow-tie' from corners listed out of order)."""
    n = len(pts)
    def ccw(a, b, c): return (c[0] - a[0]) * (b[1] - a[1]) - (b[0] - a[0]) * (c[1] - a[1])
    for i in range(n):
        for j in range(i + 2, n):
            if i == 0 and j == n - 1: continue
            a, b, c, d = pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n]
            if ccw(a, b, c) * ccw(a, b, d) < 0 and ccw(c, d, a) * ccw(c, d, b) < 0: return True
    return False

# VOR/DME stations, AIP-CHILE ENR 4.1
ARI = dms('18 22 10 S 70 20 47 W')
LOA = dms('22 30 07 S 68 52 32 W')
IQQ = dms('20 34 15 S 70 10 59 W')
NAS = dms('53 00 15 S 70 51 19 W')
NAS_VAR = 12.4  # magnetic declination at NAS (WMM, Oct 2026, east). VOR radials are magnetic, so true = radial + var.

def nas_sector(r1, r2, d1, d2):
    a, b = r1 + NAS_VAR, r2 + NAS_VAR
    return arc(NAS, d1 * NM, a, b, True) + arc(NAS, d2 * NM, b, a, False)

zones = []
def Z(id, kind, name, geom, up, lo, when='', note='', approx=False):
    zones.append(dict(id=id, k=kind, n=name, up=up, lo=lo, when=when, note=note, approx=approx, g=geom))

RPAS = 'Prohibida para RPAS'

# ---------------- Prohibited (P) ----------------
Z('SC-P3', 'P', 'Isla Dawson', poly('53 46 00 S 70 31 00 W', '53 46 00 S 70 19 30 W', '53 55 00 S 70 19 30 W', '53 55 00 S 70 31 00 W'), 'UNL', 'GND', 'H24')
Z('SC-P9', 'P', 'Sector Quidico', circle('37 19 54 S 73 33 33.31 W', 1.5 * NM), '1600 FT AGL', 'GND', '', RPAS)
p10 = [dms('18 57 10 S 70 00 00 W')] + arc_between(ARI, 40 * NM, dms('18 57 10 S 70 00 00 W'), dms('18 20 00 S 69 38 20 W'))[1:-1] + poly(
    '18 20 00 S 69 38 20 W', '18 20 00 S 69 11 30 W', '19 14 18 S 69 00 00 W', '21 00 00 S 69 00 00 W', '21 00 00 S 69 40 00 W', '20 30 00 S 70 00 00 W')
Z('SC-P10', 'P', 'Arica – Iquique interior (FACH)', p10, 'UNL', 'GND', 'H24', 'FACH', approx=True)
Z('SC-P14', 'P', 'Alto Jahuel, Buin', poly('33 44 03.74 S 70 41 41.16 W', '33 44 03.52 S 70 41 39.58 W', '33 44 05.76 S 70 41 39.12 W', '33 44 05.48 S 70 41 34.03 W',
    '33 44 10.68 S 70 41 33.88 W', '33 44 10.94 S 70 41 38.28 W', '33 44 12.17 S 70 41 38.05 W', '33 44 12.31 S 70 41 39.30 W'), '5000 FT AGL', 'GND', '', RPAS)
Z('SC-P15', 'P', 'Fundo Santa Marta, Puerto Varas', circle('41 17 54.07 S 72 51 49.95 W', 0.6 * NM), '5000 FT AGL', 'GND', '', RPAS)
Z('SC-P23', 'P', 'Talcahuano', poly('36 33 30 S 73 01 30 W', '36 41 30 S 73 02 48 W', '36 44 00 S 73 04 00 W', '36 44 00 S 73 13 00 W', '36 38 00 S 73 11 30 W', '36 33 00 S 73 09 00 W'),
    'FL 195 (VFR) / 3000 FT ALT (IFR)', 'GND/MSL', 'H24')
Z('SC-P26', 'P', 'Santiago (ex Congreso Nacional)', circle('33 26 18 S 70 39 12 W', 0.15 * NM), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P28', 'P', 'Palacio La Moneda', poly('33 26 28 S 70 39 17 W', '33 26 28 S 70 39 14 W', '33 26 39 S 70 39 11 W', '33 26 40 S 70 39 15 W'), '3000 FT ALT', 'GND', 'H24')
Z('SC-P29', 'P', 'Valparaíso (Congreso Nacional)', circle('33 02 53 S 71 36 19 W', 0.15 * NM), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P30', 'P', 'Palacio Presidencial Viña del Mar', circle('33 01 14 S 71 33 51 W', 500), '1200 FT ALT (IFR) / FL 50 (VFR)', 'GND/MSL', 'H24')
Z('SC-P44', 'P', 'La Reina', circle('33 25 43 S 70 31 28 W', 500), '3300 FT ALT', 'GND', 'H24')
Z('SC-P50', 'P', 'Valparaíso (Armada)', circle('33 01 00 S 71 38 00 W', 2 * NM), '3000 FT ALT', 'GND/MSL', 'H24', 'Armada de Chile')
# The AIP prints the longitudes as "07 031 15 W"; they are 070 31 15 W (3 NM east of Vitacura, SCLC).
Z('SC-P51', 'P', 'Santiago (3 NM E de Vitacura)', poly('33 23 02 S 70 31 15 W', '33 23 05 S 70 31 13 W', '33 23 07 S 70 31 16 W', '33 23 03 S 70 31 19 W'), '3800 FT ALT', 'GND', 'H24')
Z('SC-P55', 'P', 'Iquique', circle('20 15 29.48 S 70 06 31.66 W', 500), '2000 FT ALT', 'GND', '', 'Prohibida para sobrevuelo de aeronaves')
Z('SC-P57', 'P', 'Santiago (0.4 NM E Quinta Normal)', poly('33 26 27.4 S 70 40 27.0 W', '33 26 34.9 S 70 40 26.2 W', '33 26 35.5 S 70 40 31.4 W', '33 26 28.0 S 70 40 32.0 W'),
    '3000 FT ALT', 'GND', '', 'Prohibida para aeronaves y RPA/RPAS')
Z('SC-P59', 'P', 'Santiago', poly('33 26 39.48 S 70 41 9.06 W', '33 26 39.31 S 70 41 3.45 W', '33 26 47.09 S 70 41 3.74 W', '33 26 46.92 S 70 41 8.78 W'), '3000 FT ALT', 'GND', 'H24')
Z('SC-P83', 'P', 'Campo Militar Coyhaique', poly('45 33 20.23 S 72 04 08.97 W', '45 33 39.72 S 72 04 01.88 W', '45 33 55.60 S 72 04 11.49 W', '45 33 39.87 S 72 04 25.23 W'), '600 FT AGL', 'GND', '', RPAS)
Z('SC-P84', 'P', 'Regimiento Nº 8 "Chiloé", Puerto Aysén', hull(poly('45 23 29.92 S 72 41 06.05 W', '45 23 56.69 S 72 40 48.90 W', '45 23 38.36 S 72 40 44.51 W', '45 23 41.66 S 72 41 09.84 W')), '600 FT AGL', 'GND', '', RPAS)
Z('SC-P85', 'P', 'Compañía Andina Nº 20 "Cochrane"', hull(poly('47 15 09.45 S 72 33 28.05 W', '47 15 13.81 S 72 33 32.14 W', '47 15 14.61 S 72 33 17.40 W', '47 15 09.66 S 72 33 40.04 W')), '600 FT AGL', 'GND', '', RPAS)
Z('SC-P86', 'P', 'CIE "Las Bandurrias", Coyhaique', poly('45 29 46.00 S 71 53 26.00 W', '45 29 33.00 S 71 52 33.00 W', '45 29 48.00 S 71 52 29.00 W', '45 30 47.00 S 71 53 35.00 W', '45 30 18.00 S 71 53 55.00 W'),
    '600 FT AGL', 'GND', '', RPAS)
Z('SC-P87', 'P', 'Sector Central Rucalhue, Santa Bárbara', circle('37 41 54.3 S 71 53 35.7 W', 6 * NM), '10000 FT AGL', 'GND', '', RPAS)
Z('SC-P90', 'P', 'Campo Militar Ojo Bueno', poly('53 02 23.06 S 70 56 06.09 W', '53 02 30.33 S 70 53 42.89 W', '53 02 54.79 S 70 53 27.20 W', '53 03 13.89 S 70 51 36.92 W',
    '53 03 20.15 S 70 51 44.99 W', '53 03 17.70 S 70 52 29.58 W', '53 03 08.89 S 70 53 32.77 W', '53 03 17.91 S 70 55 44.37 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P91', 'P', 'Destacamento Acorazado Nº 5 "Lanceros"', poly('51 42 40.69 S 72 27 47.59 W', '51 38 58.21 S 72 20 25.36 W', '51 36 07.87 S 72 20 11.47 W', '51 35 36.43 S 72 19 23.08 W',
    '51 38 00.29 S 72 17 11.24 W', '51 43 14.79 S 72 17 17.04 W', '51 44 04.64 S 72 27 11.64 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P92', 'P', 'Regimiento Logístico Nº 5 "Magallanes"', poly('53 06 24.75 S 70 53 18.42 W', '53 06 22.03 S 70 53 26.76 W', '53 06 20.39 S 70 53 29.92 W', '53 06 11.72 S 70 53 25.70 W',
    '53 06 12.48 S 70 53 10.67 W', '53 06 25.73 S 70 53 13.64 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P93', 'P', 'Regimiento Nº 10 "Pudeto"', poly('53 09 36.40 S 70 55 35.57 W', '53 09 23.62 S 70 55 26.97 W', '53 09 30.00 S 70 55 12.69 W', '53 09 41.11 S 70 55 23.25 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P94', 'P', 'Destacamento Motorizado Nº 11 "Caupolicán"', poly('53 17 27.37 S 70 21 49.32 W', '53 17 29.66 S 70 20 29.83 W', '53 18 00.91 S 70 20 56.53 W', '53 18 05.33 S 70 21 40.00 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P95', 'P', 'CIE "Las Mercedes"', poly('53 23 44.84 S 70 20 19.76 W', '53 23 05.97 S 70 20 13.33 W', '53 23 05.49 S 70 16 21.91 W', '53 25 34.21 S 70 13 59.54 W', '53 26 46.05 S 70 17 28.68 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P96', 'P', 'CIE "Lote 102"', poly('53 16 06.47 S 69 54 03.75 W', '53 18 03.03 S 69 53 06.49 W', '53 19 55.26 S 69 53 02.23 W', '53 20 12.90 S 69 53 59.69 W', '53 16 39.15 S 69 57 13.16 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P97', 'P', 'CIE "Lote 159"', poly('53 12 11.74 S 69 34 53.09 W', '53 12 17.14 S 69 31 59.20 W', '53 14 53.78 S 69 30 58.62 W', '53 15 35.11 S 69 34 53.01 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P98', 'P', 'CIE "Santa María"', poly('52 17 57.64 S 70 05 49.42 W', '52 17 15.02 S 69 58 51.14 W', '52 32 25.62 S 69 58 25.65 W', '52 34 45.46 S 70 05 58.19 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P99', 'P', 'CIE "Chorrillo Basilio"', poly('52 31 59.92 S 71 20 00.99 W', '52 32 05.17 S 71 10 53.78 W', '52 49 06.84 S 71 10 48.74 W', '52 49 08.43 S 71 19 33.24 W'), '1000 FT AGL', 'GND', '', RPAS)
Z('SC-P100', 'P', 'CIE "TTE Briones"', poly('53 11 22.65 S 71 00 24.70 W', '53 12 01.92 S 70 58 08.23 W', '53 12 22.98 S 70 58 24.52 W', '53 12 17.02 S 70 59 13.05 W', '53 11 33.62 S 71 00 44.49 W'), '1000 FT AGL', 'GND', '', RPAS)

# ---------------- Restricted (R) ----------------
Z('SC-R7', 'R', 'Peldehue', poly('33 06 49 S 70 41 08 W', '33 06 33 S 70 40 46 W', '33 09 29 S 70 38 21 W', '33 09 44 S 70 38 37 W'), '3600 FT ALT', 'GND', 'HJ, NOTAM', 'Paracaidismo militar')
Z('SC-R17', 'R', 'Seno Otway', poly('52 57 30 S 71 15 00 W', '52 57 30 S 71 12 30 W', '53 00 00 S 71 12 30 W', '53 00 00 S 71 15 00 W'), '1000 FT AGL', 'GND', 'H24', 'Peligro aviario')
Z('SC-R18', 'R', 'Isla Magdalena', circle('52 55 00 S 70 34 00 W', NM), '1000 FT AGL', 'GND', 'H24', 'Peligro aviario')
Z('SC-R19', 'R', 'Isla Marta', circle('52 51 00 S 70 34 00 W', NM), '1000 FT AGL', 'GND', 'H24', 'Peligro aviario')
r22 = poly('21 41 00 S 69 56 00 W', '22 17 00 S 69 15 00 W') + arc_between(LOA, 25 * NM, dms('22 17 00 S 69 15 00 W'), dms('22 33 00 S 69 19 00 W'))[1:-1] + poly('22 33 00 S 69 19 00 W', '22 56 00 S 70 15 00 W')
Z('SC-R22', 'R', 'Tocopilla Este', r22, 'FL 450', 'GND', 'HJ', 'Entrenamiento FACH', approx=True)
r25 = poly('23 11 00 S 70 15 00 W', '22 46 00 S 69 13 00 W') + arc_between(LOA, 25 * NM, dms('22 46 00 S 69 13 00 W'), dms('22 50 54 S 69 07 36 W'))[1:-1] + poly(
    '22 50 54 S 69 07 36 W', '23 07 29 S 69 04 47 W', '25 30 00 S 69 31 41 W', '25 30 00 S 69 57 24 W', '23 44 00 S 70 18 00 W')
Z('SC-R25', 'R', 'Antofagasta Este', r25, 'FL 450', 'GND', 'HJ', 'Entrenamiento FACH', approx=True)
Z('SC-R27', 'R', 'Escuela de Aviación (El Bosque)', poly('33 30 00 S 70 39 50 W', '33 30 00 S 70 38 00 W', '33 32 30 S 70 37 15 W', '33 33 15 S 70 36 15 W', '33 37 00 S 70 36 30 W',
    '33 38 45 S 70 42 00 W', '33 37 00 S 70 43 00 W'), '9000 FT ALT', 'GND', 'H24', 'Ingreso: El Bosque TWR 118.8 MHz')
r32 = poly('19 06 43 S 70 42 03 W', '20 03 00 S 70 49 00 W', '19 26 50 S 71 17 58 W') + arc_between(IQQ, 92 * NM, dms('19 26 50 S 71 17 58 W'), dms('19 06 43 S 70 42 03 W'))[1:-1]
Z('SC-R32', 'R', 'Iquique (mar)', r32, 'FL 450', 'MSL', 'NOTAM', 'Tiro aire-aire', approx=True)
Z('SC-R36', 'R', 'Embajada EEUU', poly('33 24 40.14 S 70 36 18.58 W', '33 24 41.51 S 70 36 12.82 W', '33 24 50.29 S 70 36 18.68 W', '33 24 44.86 S 70 36 19.40 W'), '400 FT AGL', 'GND', '', 'Restringida para RPAS')
Z('SC-R37', 'R', 'Residencia diplomática 1 (EEUU)', poly('33 24 40.10 S 70 35 41.50 W', '33 24 40.46 S 70 35 38.00 W', '33 24 44.10 S 70 35 38.00 W', '33 24 44.86 S 70 35 41.42 W'), '400 FT AGL', 'GND', '', 'Restringida para RPAS')
Z('SC-R38', 'R', 'Residencia diplomática 2 (EEUU)', poly('33 23 51.72 S 70 35 35.92 W', '33 23 52.15 S 70 35 33.76 W', '33 23 53.84 S 70 35 34.01 W', '33 23 53.56 S 70 35 36.42 W'), '400 FT AGL', 'GND', '', 'Restringida para RPAS')
Z('SC-R41', 'R', 'Lo Aguirre', circle('33 27 01 S 70 55 56 W', NM), '3500 FT ALT', 'GND', 'Día (1100/1200 UTC – puesta de sol)')
Z('SC-R45', 'R', 'Punta Arenas SW (RDL 192°–293° NAS, 20–90 NM)', nas_sector(192, 293, 20, 90), 'UNL', 'GND', 'H24', 'Coordinar con Punta Arenas ACC', approx=True)
Z('SC-R46', 'R', 'Punta Arenas NW (RDL 314°–357° NAS, 20–50 NM)', nas_sector(314, 357, 20, 50), 'FL 245', 'GND', 'NOTAM', 'Coordinar con Punta Arenas ACC', approx=True)
a25, a41, a130 = 25 + NAS_VAR, 41 + NAS_VAR, 130 + NAS_VAR
r47 = arc(NAS, 20 * NM, a25, a130, True) + arc(NAS, 70 * NM, a130, a41, False) + arc(NAS, 54 * NM, a41, a25, False)
Z('SC-R47', 'R', 'Punta Arenas NE (RDL 025°–130° NAS)', r47, 'UNL', 'GND', 'H24', 'Coordinar con Punta Arenas ACC', approx=True)
Z('SC-R48', 'R', 'Punta Arenas S (RDL 148°–189° NAS, 20–80 NM)', nas_sector(148, 189, 20, 80), 'UNL', 'GND', 'H24', 'Coordinar con Punta Arenas ACC', approx=True)
Z('SC-R52', 'R', 'Antofagasta', hull(poly('23 17 00 S 70 24 00 W', '23 17 30 S 70 03 08 W', '23 28 30 S 70 24 00 W', '23 28 30 S 70 03 08 W')), 'FL 245', 'GND', 'NOTAM', 'Ejercicios de tiro')
Z('SC-R53', 'R', 'Iquique (Punta Gruesa sur)', poly('20 38 00 S 70 13 00 W', '20 38 00 S 70 02 00 W', '20 50 00 S 70 02 00 W', '20 50 00 S 70 15 00 W'), '7500 FT ALT', 'SFC', 'Coordinada con Iquique APP/TWR')
Z('SC-R54', 'R', 'Iquique', poly('20 35 00 S 70 12 30 W', '20 35 00 S 70 02 00 W', '20 38 00 S 70 02 00 W', '20 38 00 S 70 13 00 W'), '7500 FT ALT', 'SFC', 'Coordinada con Iquique APP/TWR', 'Ejercicios de tiro')
Z('SC-R67', 'R', 'Casablanca', poly('33 06 00 S 71 27 30 W', '33 10 30 S 71 17 00 W', '33 21 30 S 71 17 00 W', '33 21 30 S 71 39 40 W', '33 12 30 S 71 40 30 W'), '5000 FT ALT', 'GND', 'HJ', 'Entrenamiento Armada')
Z('SC-R68', 'R', 'María Pinto', hull(poly('33 27 00 S 71 13 00 W', '33 27 00 S 71 00 00 W', '33 32 00 S 71 13 00 W', '33 32 00 S 71 00 00 W')), 'FL 70', 'GND', 'H24', 'Coordinar con Santiago ACC')
Z('SC-R69', 'R', 'Antofagasta (mar)', poly('22 30 00 S 71 30 00 W', '22 30 00 S 71 00 00 W', '23 25 00 S 71 00 00 W', '23 23 00 S 71 30 00 W'), 'FL 450', 'MSL', 'NOTAM', 'Tiro aire-aire')
Z('SC-R71', 'R', 'Llano de San Rafael', poly('34 08 36 S 71 32 58 W', '34 08 38 S 71 30 38 W', '34 12 39 S 71 30 45 W', '34 12 36 S 71 33 05 W'), '3000 FT ALT', 'GND', 'HJ, NOTAM', 'Ejercicios militares')
Z('SC-R72', 'R', 'Sector Punta Gruesa', hull(poly('20 19 29.71 S 70 11 55.49 W', '20 19 29.71 S 70 09 07.29 W', '20 23 08.66 S 70 11 55.49 W', '20 23 08.66 S 70 09 27.29 W')), '2000 FT AMSL', 'SFC', '',
    'Restringida para drones (Comando Conjunto Norte)')
Z('SC-R73', 'R', 'Palacio Pereira', poly('33 26 21 S 70 39 34 W', '33 26 20 S 70 39 28 W', '33 26 25 S 70 39 28 W', '33 26 25 S 70 39 33 W'), '3500 FT AMSL', 'GND', '', 'Restringida para RPAS')
Z('SC-R74', 'R', 'Instalaciones militares, Calama', circle('22 26 58 S 68 54 38 W', 500), '1000 FT AGL', 'GND', '', 'Restringida para aeronaves y RPA/RPAS')

# ---------------- Dangerous (D) ----------------
Z('SC-D4', 'D', 'Talagante (planta química)', circle('33 38 32 S 70 55 25 W', NM), '2500 FT ALT', 'GND', 'H24', 'Planta química')
Z('SC-D5', 'D', 'Helipuerto Los Cerrillos', circle('33 29 22 S 70 41 54 W', NM), '3000 FT ALT', 'GND', 'H24')
Z('SC-D13', 'D', 'AD Cuatro Diablos (paracaidismo)', circle('33 40 38 S 71 06 36 W', NM), 'FL 100', 'GND', 'HJ', 'Paracaidismo')
Z('SC-D33', 'D', 'Pecket Harbour', poly('52 45 30 S 71 03 00 W', '52 33 30 S 70 29 00 W', '52 45 00 S 70 17 30 W', '52 57 00 S 70 52 00 W'), 'FL 245', 'GND', 'H24')
Z('SC-D34', 'D', 'Quintero', poly('32 46 23 S 71 29 32 W', '32 46 56 S 71 28 58 W', '32 47 06 S 71 29 08 W', '32 46 33 S 71 29 42 W'), '1000 FT ALT', 'GND', '', 'Escape de gases inflamables')
Z('SC-D66', 'D', 'Calama', circle('22 31 00 S 68 58 00 W', 1000), '3000 FT AGL', 'GND', 'H24')
Z('SC-D70', 'D', 'Torquemada', poly('32 57 20 S 71 28 30 W', '32 58 30 S 71 26 00 W', '32 59 40 S 71 26 10 W', '32 58 40 S 71 28 30 W'), '1000 FT AGL', 'GND', 'Viña del Mar TWR', 'Ejercicios Infantería de Marina')
Z('D (sin código)', 'D', 'Planta química (Coquimbo)', circle('30 49 28 S 71 13 17 W', NM), '1000 FT ALT', 'GND', '', 'Planta química')
Z('D (sin código)', 'D', 'Iquique y Alto Hospicio (vuelo RPAS)', hull(poly('20 11 25 S 70 08 15 W', '20 18 11 S 70 06 34 W', '20 14 48 S 70 07 20 W', '20 17 26 S 70 07 59 W', '20 16 26 S 70 04 48 W', '20 12 54 S 70 09 34 W')),
    '1200 FT AGL', 'GND', 'H24', 'Vuelo RPAS 24 h – Iquique RDO 127.3 MHz', approx=True)

# Sanity checks: no bow-ties, every point inside Chile's rough box, circles where the centre says.
for z in zones:
    if crosses(z['g']): print('WARNING self-intersecting:', z['id'])
    for la, lo in z['g']:
        assert -57 < la < -17 and -78 < lo < -66, (z['id'], la, lo)
for name, c, p in [('P10 start', ARI, dms('18 57 10 S 70 00 00 W')), ('P10 end', ARI, dms('18 20 00 S 69 38 20 W')),
                   ('R22', LOA, dms('22 17 00 S 69 15 00 W')), ('R25', LOA, dms('22 50 54 S 69 07 36 W')), ('R32', IQQ, dms('19 06 43 S 70 42 03 W'))]:
    print(f'{name}: {dist(c, p) / NM:.1f} NM from VOR')

out = dict(source=SOURCE, built='2026-10-06', zones=[{**z, 'g': [[round(a, 5), round(b, 5)] for a, b in z['g']]} for z in zones])
path = Path(__file__).resolve().parent.parent / 'geo' / 'cl-zones.json'
path.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print(len(zones), 'zones,', path.stat().st_size, 'bytes ->', path)
