"""
Estende il font del marchio (bdplakatt.ttf) con punteggiatura e lettere accentate.

Il file originale contiene solo A-Z, a-z e 0-9: tutti gli altri glifi sono vuoti.
Questo script ridisegna i segni mancanti con lo stesso spessore d'asta (~200 unita'),
gli stessi terminali netti e lo stesso bordo irregolare delle lettere, poi esporta un .woff2.

Uso:
    pip install fonttools brotli
    python scripts/estendi-font.py "percorso/bdplakatt.ttf" src/app/fonts/bd-plakatt-cultivar.woff2

Il disegno e' una soluzione ponte: va rifinito dal type designer prima del lancio definitivo.
Controlla la licenza del font: la modifica del file potrebbe richiedere l'autorizzazione del titolare.
"""

import math
import random
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

ASTA = 200  # spessore dell'asta (la "l" misura ~200)
XH = 740  # altezza delle minuscole
CAP = 835  # altezza delle maiuscole
SB = 55  # spazio laterale

# ---------------------------------------------------------------- geometria


def area(p):
    return sum(p[i][0] * p[(i + 1) % len(p)][1] - p[(i + 1) % len(p)][0] * p[i][1] for i in range(len(p))) / 2


def ruvido(p, rng, j=9, passo=150):
    """Suddivide i lati lunghi e sposta i punti di pochi decimi di millimetro: bordo da stampa."""
    out = []
    n = len(p)
    for i in range(n):
        a, b = p[i], p[(i + 1) % n]
        d = math.dist(a, b)
        k = max(1, int(d // passo))
        for s in range(k):
            t = s / k
            x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            out.append((x + rng.uniform(-j, j), y + rng.uniform(-j, j)))
    return out


def rett(x0, y0, x1, y1, cm=14):
    return [(x0 + cm, y0), (x1 - cm, y0), (x1, y0 + cm), (x1, y1 - cm), (x1 - cm, y1), (x0 + cm, y1), (x0, y1 - cm), (x0, y0 + cm)]


def blob(cx, cy, rx, ry, n=16, e=2.5):
    pts = []
    for k in range(n):
        a = 2 * math.pi * k / n
        c, s = math.cos(a), math.sin(a)
        pts.append((cx + rx * math.copysign(abs(c) ** (2 / e), c), cy + ry * math.copysign(abs(s) ** (2 / e), s)))
    return pts


def anello(cx, cy, rox, roy, t, a0, a1, passi=14):
    """Settore di anello ellittico (angoli in gradi, da a0 ad a1)."""
    ang = [math.radians(a0 + (a1 - a0) * k / passi) for k in range(passi + 1)]
    ext = [(cx + rox * math.cos(a), cy + roy * math.sin(a)) for a in ang]
    inn = [(cx + (rox - t) * math.cos(a), cy + (roy - t) * math.sin(a)) for a in reversed(ang)]
    return ext + inn


def sposta(p, dx=0, dy=0):
    return [(x + dx, y + dy) for x, y in p]


def specchia_x(p, w):
    return [(w - x, y) for x, y in p]


def ruota180(p, cy):
    return [(x, cy - y) for x, y in p]


# ---------------------------------------------------------------- punto interrogativo
# Contorni del "?" di Baloo 2 ExtraBold (SIL Open Font License), portati a linee spezzate e
# scalati per stare nell'altezza delle maiuscole con uno spessore vicino a quello del marchio.
_BALOO_INTERR = [
    [("M", (237, 230)), ("L", (136, 210)), ("Q", [(119, 221), (89, 267), (89, 298)]), ("Q", [(89, 329), (122, 360), (154, 368)]),
     ("L", (232, 387)), ("Q", [(258, 395), (282, 419), (282, 441)]), ("Q", [(282, 460), (245, 493), (200, 493)]),
     ("Q", [(160, 493), (87, 473), (65, 458)]), ("Q", [(49, 471), (24, 509), (24, 534)]), ("Q", [(24, 587), (137, 636), (224, 636)]),
     ("Q", [(303, 636), (409, 586), (463, 498), (463, 441)]), ("Q", [(463, 354), (350, 253), (237, 230)])],
    [("M", (103, 77)), ("Q", [(103, 118), (155, 171), (199, 171)]), ("Q", [(243, 171), (295, 118), (295, 77)]),
     ("Q", [(295, 36), (243, -17), (199, -17)]), ("Q", [(155, -17), (103, 36), (103, 77)])],
]
SCALA_INTERR = 1.25


def interrogativo_baloo():
    from fontTools.pens.basePen import decomposeQuadraticSegment

    contorni = []
    for seg in _BALOO_INTERR:
        pts = [seg[0][1]]
        cur = seg[0][1]
        for op, a in seg[1:]:
            if op == "L":
                pts.append(a)
                cur = a
            else:
                for off, on in decomposeQuadraticSegment(a):
                    for k in range(1, 7):
                        t = k / 6
                        pts.append(((1 - t) ** 2 * cur[0] + 2 * (1 - t) * t * off[0] + t * t * on[0],
                                    (1 - t) ** 2 * cur[1] + 2 * (1 - t) * t * off[1] + t * t * on[1]))
                    cur = on
        contorni.append(pts)
    # a scala, appoggiato sulla linea di base con il bordo sinistro a SB
    x0 = min(x for c in contorni for x, _ in c)
    return [[(SB + (x - x0) * SCALA_INTERR, (y + 17) * SCALA_INTERR) for x, y in c] for c in contorni]


# ---------------------------------------------------------------- segni (contorni, larghezza)

def punto(x0=SB, y0=0):
    return blob(x0 + 100, y0 + 100, 100, 100, e=2.8)


def virgola():
    return [
        [(SB + 4, 70), (SB + 60, 205), (SB + 190, 205), (SB + 204, 90), (SB + 150, -110), (SB + 40, -195), (SB - 18, -150), (SB + 40, -60)],
    ]


def apice():
    # apostrofo dritto: cuneo leggermente rastremato
    return [[(SB + 6, 520), (SB + 28, 880), (SB + 218, 880), (SB + 190, 520)]]


def apice_curvo():
    # ’ : come la virgola, portata in alto (stesso disegno: lo stile resta coerente)
    return [sposta(virgola()[0], 0, 690)]


def ruota_punto(p):
    """Rotazione di 180 gradi attorno al centro del contorno (da ’ a ‘)."""
    xs = [x for x, _ in p]
    ys = [y for _, y in p]
    return [(min(xs) + max(xs) - x, min(ys) + max(ys) - y) for x, y in p]


def lampo_acuto():
    return [[(0, 0), (150, 0), (275, 205), (125, 205)]]


def lampo_grave():
    return [[(125, 0), (275, 0), (150, 205), (0, 205)]]


# ---------------------------------------------------------------- costruzione


def costruisci(f, rng_seed=7):
    cm = f.getBestCmap()
    glyf = f["glyf"]
    hmtx = f["hmtx"]

    def disegna(nome, contorni, adv=None, seed=0):
        rng = random.Random(rng_seed * 1000 + seed)
        pen = TTGlyphPen(None)
        xs = []
        for c in contorni:
            c = ruvido(c, rng)
            if area(c) > 0:  # TrueType: orario per i contorni pieni
                c = list(reversed(c))
            pen.moveTo(c[0])
            for pt in c[1:]:
                pen.lineTo(pt)
            pen.closePath()
            xs += [x for x, _ in c]
        g = pen.glyph()
        glyf[nome] = g
        g.recalcBounds(glyf)
        adv = adv if adv is not None else int(max(xs)) + SB
        hmtx[nome] = (adv, int(g.xMin))
        return adv

    def per(cp):
        return cm[cp]

    def larghezza(contorni):
        return max(x for c in contorni for x, _ in c)

    # punti e virgole
    disegna(per(0x2E), [punto()], seed=1)
    disegna(per(0x2C), virgola(), seed=2)
    disegna(per(0x3A), [punto(SB, 0), punto(SB, XH - 200)], seed=3)
    disegna(per(0x3B), [punto(SB, XH - 200)] + virgola(), seed=4)
    disegna(per(0x2026), [punto(SB + k * 290, 0) for k in range(3)], seed=5)
    disegna(per(0xB7), [punto(SB, 270)], seed=6)
    disegna(per(0x2022), [blob(SB + 170, 360, 170, 170)], seed=7)

    # trattini
    disegna(per(0x2D), [rett(SB, 300, SB + 360, 300 + 170)], seed=8)
    disegna(per(0x2013), [rett(SB, 300, SB + 700, 300 + 170)], seed=9)
    disegna(per(0x2014), [rett(SB, 300, SB + 1300, 300 + 170)], seed=10)
    disegna(per(0x2212), [rett(SB, 300, SB + 620, 300 + 170)], seed=11)
    disegna(per(0x2F), [[(SB, -80), (SB + 200, -80), (SB + 520, 900), (SB + 320, 900)]], seed=12)

    # apici e virgolette
    disegna(per(0x27), apice(), seed=13)
    disegna(per(0x22), apice() + [sposta(apice()[0], 300)], seed=14)
    disegna(per(0x2019), apice_curvo(), seed=15)
    disegna(per(0x2018), [ruota_punto(apice_curvo()[0])], seed=16)
    disegna(per(0x201C), [ruota_punto(apice_curvo()[0]), sposta(ruota_punto(apice_curvo()[0]), 300)], seed=17)
    disegna(per(0x201D), apice_curvo() + [sposta(apice_curvo()[0], 300)], seed=18)
    disegna(per(0x201A), [sposta(virgola()[0], 0, 0)], seed=19)
    disegna(per(0x201E), [virgola()[0], sposta(virgola()[0], 300)], seed=20)
    # « » : due chevron
    def chevron(x, dx):
        # punta a sinistra se dx<0
        return [(x + 200, 720), (x + 330, 720), (x + 120, 380), (x + 330, 40), (x + 200, 40), (x, 380)] if dx < 0 else \
               [(x, 720), (x + 130, 720), (x + 330, 380), (x + 130, 40), (x, 40), (x + 210, 380)]
    disegna(per(0xAB), [chevron(SB, -1), chevron(SB + 280, -1)], seed=21)
    disegna(per(0xBB), [chevron(SB, 1), chevron(SB + 280, 1)], seed=22)

    # parentesi: settore di anello ellittico, la chiusa e' lo specchio della aperta
    rx, ry, t = 330, 640, 190
    aperta = anello(SB + rx, 400, rx, ry, t, 118, 242, 12)
    w = max(x for x, _ in aperta)
    disegna(per(0x28), [aperta], adv=int(w + 70), seed=23)
    disegna(per(0x29), [specchia_x(aperta, w + 15)], adv=int(w + 70), seed=24)

    # ! ? e rovesciati
    def esclam():
        return [[(SB + 22, 300), (SB + 208, 300), (SB + 232, CAP), (SB, CAP)], punto(SB + 14, 0)]
    def interr():
        return interrogativo_baloo()

    disegna(per(0x21), esclam(), seed=25)
    disegna(per(0x3F), interr(), seed=26)
    disegna(per(0xA1), [ruota180(c, 735) for c in esclam()], seed=27)
    disegna(per(0xBF), [ruota180(c, 735) for c in interr()], seed=28)

    # segni per gli accenti
    disegna(per(0xB4), lampo_acuto(), adv=300, seed=29)
    disegna(per(0x60), lampo_grave(), adv=300, seed=30)
    return cm


def composti(f, cm):
    """Lettere accentate: lettera di base + accento, centrato sulla lettera."""
    glyf = f["glyf"]
    hmtx = f["hmtx"]
    minuscole = {"a": ("àá", XH), "e": ("èé", XH), "i": ("ìí", XH), "o": ("òó", XH), "u": ("ùú", XH)}
    maiuscole = {"A": ("ÀÁ", CAP), "E": ("ÈÉ", CAP), "I": ("ÌÍ", CAP), "O": ("ÒÓ", CAP), "U": ("ÙÚ", CAP)}
    for base, (accentate, alt) in {**minuscole, **maiuscole}.items():
        for lettera, marchio in zip(accentate, (0x60, 0xB4)):
            nome = cm[ord(lettera)]
            b = cm[ord(base)]
            m = cm[marchio]
            adv = hmtx[b][0]
            w_acc = 300
            dx = (adv - w_acc) // 2
            dy = alt + 95
            pen = TTGlyphPen(glyf)
            pen.addComponent(b, (1, 0, 0, 1, 0, 0))
            pen.addComponent(m, (1, 0, 0, 1, dx, dy))
            glyf[nome] = pen.glyph()
            hmtx[nome] = (adv, hmtx[b][1])


def pulisci_cmap(f):
    """Toglie dal cmap i glifi ancora vuoti: cosi' il browser usa il carattere di ripiego invece di mostrare uno spazio."""
    gs = f.getGlyphSet()
    for t in f["cmap"].tables:
        for cp in list(t.cmap):
            if cp in (0x20, 0xA0, 0x09):
                continue
            bp = BoundsPen(gs)
            gs[t.cmap[cp]].draw(bp)
            if not bp.bounds:
                del t.cmap[cp]


def rinomina(f):
    for r in f["name"].names:
        if r.nameID in (1, 4, 16):
            r.string = "BD Plakatt Cultivar"
        elif r.nameID == 6:
            r.string = "BDPlakattCultivar-Regular"
        elif r.nameID == 3:
            r.string = "BDPlakattCultivar-Regular-estensione"


# Il disegno ha l'altezza delle minuscole a 0,36 em (Poppins: ~0,55). Riducendo unitsPerEm tutto il carattere
# appare piu' grande a parita' di font-size, senza toccare le dimensioni dei titoli nei CSS.
SCALA_VISIVA = 1.45


def main(src, dst):
    f = TTFont(src)
    cm = costruisci(f)
    composti(f, cm)
    pulisci_cmap(f)
    rinomina(f)
    f["head"].unitsPerEm = round(f["head"].unitsPerEm / SCALA_VISIVA)
    if dst.endswith(".woff2"):
        f.flavor = "woff2"
    f.save(dst)
    print("scritto", dst)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
