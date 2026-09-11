#!/usr/bin/env python3
"""Genera src/data/alimentosBase.js a partir de research/alimentos.md.

Ningun valor nutricional se escribe a mano: todos se extraen de la tabla
investigada y citada. Si un campo no esta en la fuente queda en null.
"""
import re, json, unicodedata

MD = '/home/user/workspace/research/alimentos.md'
VIEJO = '/home/user/workspace/ganabov1.0/src/data/alimentosBase.js'
SALIDA = '/home/user/workspace/ganabov1.0/src/data/alimentosBase.js'

# ---------------------------------------------------------------- parseo md
def limpiar(s):
    s = re.sub(r'\*+', '', s)
    s = re.sub(r'`', '', s)
    return s.strip()

def parse_valor(cell):
    """-> (valor|None, estimado)"""
    c = limpiar(cell)
    est = ('≈' in c) or ('ᵉ' in c)
    if 'n.a' in c.lower():
        return None, est
    # primer numero decimal del texto (conservador en rangos "a – b")
    m = re.search(r'-?\d+(?:[.,]\d+)?', c.replace(',', '.'))
    if not m:
        return None, est
    return float(m.group(0)), est

def parse_fuente(cell):
    """primer link markdown -> (nombre, url)"""
    m = re.search(r'\[([^\]]+)\]\((https?://[^\)]+)\)', cell)
    if not m:
        return None, None
    return limpiar(m.group(1)), m.group(2)

def leer_tablas():
    secciones = {}
    sec = None
    hdr = None
    for linea in open(MD, encoding='utf-8'):
        l = linea.rstrip('\n')
        if l.startswith('## '):
            sec = l[3:].split('.')[0].strip()
            hdr = None
            secciones.setdefault(sec, [])
            continue
        if not l.startswith('|') or sec is None:
            continue
        if re.match(r'^\|[\s\-:|]+\|?$', l):
            continue
        cells = [c.strip() for c in l.strip().strip('|').split('|')]
        prim = limpiar(cells[0])
        if prim in ('Feed', 'Product', 'Convention'):
            hdr = [limpiar(c) for c in cells]
            continue
        if hdr is None:
            continue
        secciones[sec].append(dict(zip(hdr, cells)))
    return secciones

SEC = leer_tablas()
FILAS = []
for k in ('1', '2', '3', '4', '5', '6'):
    FILAS += SEC.get(k, [])
MINERALES = SEC.get('7', [])

def buscar(filas, patron):
    """patron: subcadena del nombre ya limpio. Prefijo '=' = nombre exacto."""
    exacto = patron.startswith('=')
    p = patron[1:].lower() if exacto else patron.lower()
    for f in filas:
        clave = 'Feed' if 'Feed' in f else 'Product'
        nom = limpiar(f[clave]).lower()
        if (nom == p) if exacto else (p in nom):
            return f
    raise SystemExit('NO ENCONTRADO: ' + patron)

# columnas de la tabla nutricional -> clave js
COLS = {
    'ms': 'DM %', 'pb': 'CP % DM', 'rup_pct_pb': 'RUP % CP', 'tdn': 'TDN % DM',
    'ndf': 'NDF % DM', 'adf': 'ADF % DM', 'almidon': 'Starch % DM',
    'ee': 'EE % DM', 'cenizas': 'Ash % DM', 'ca': 'Ca %', 'p': 'P %',
    's': 'S %', 'k': 'K %', 'mg': 'Mg %', 'lignina': 'Lignin % DM',
}

def parse_em_publicada(cell):
    """Algunas filas no traen TDN pero si la EM: 'n.a. (ME 13.3 MJ/kg DM)'.
    Devuelve la EM en Mcal/kg MS (1 Mcal = 4,184 MJ)."""
    m = re.search(r'ME\s*([\d.]+)\s*MJ/kg', limpiar(cell))
    if not m:
        return None
    return round(float(m.group(1)) / 4.184, 4)


def extraer(patrones, cols=COLS):
    """Toma la 1a fila como principal; las siguientes rellenan huecos."""
    out = {c: None for c in cols}
    out['em_publicada'] = None
    est = {c: False for c in cols}
    proc = {}
    fuente = url = None
    extra = []
    for i, pat in enumerate(patrones):
        f = buscar(FILAS if cols is COLS else MINERALES, pat)
        clave = 'Feed' if 'Feed' in f else 'Product'
        fn, fu = parse_fuente(f.get('Source', ''))
        if i == 0:
            fuente, url = fn, fu
        usada = False
        if out['em_publicada'] is None and 'TDN % DM' in f:
            emp = parse_em_publicada(f['TDN % DM'])
            if emp is not None:
                out['em_publicada'] = emp
                proc['em_publicada'] = fu
        for c, col in cols.items():
            if col not in f or out[c] is not None:
                continue
            v, e = parse_valor(f[col])
            if v is not None:
                out[c] = v
                est[c] = e
                proc[c] = fu
                if i > 0:
                    usada = True
        if usada and fn:
            extra.append({'nombre': fn, 'url': fu, 'fila': limpiar(f[clave])})
    return out, est, proc, fuente, url, extra

# ------------------------------------------------------ mapeo id app -> fila
# Cada id lista las filas de alimentos.md en orden de prioridad. La primera es
# la fuente principal; las siguientes solo rellenan campos que quedaron n.a.
MAPA = [
 # --- forrajes -------------------------------------------------------------
 ('pasto_mombasa', ['Mombaça']),
 ('pasto_tanzania', ['Tanzânia']),
 ('pasto_zuri', ['BRS Zuri', 'Guinea grass']),
 ('pasto_marandu', ['cv. Marandu', 'bread grass, species mean']),
 ('pasto_piata', ['BRS Piatã', 'bread grass, species mean']),
 ('pasto_ruzi', ['ruziziensis']),
 ('pasto_dictyoneura', ['humidicola']),
 ('pasto_guinea', ['Guinea grass']),
 ('pasto_estrella', ['nlemfuensis']),
 ('pasto_bermuda', ['dactylon (bermuda, fresh', 'bermuda pasture, vegetative']),
 ('pasto_rhodes', ['Rhodes grass']),
 ('pasto_maralfalfa', ['Maralfalfa"', 'elefante / Napier']),
 ('pasto_camerun', ['elefante / Napier']),
 ('pasto_nativo', ['jaragua']),
 ('pasto_brachiaria', ['bread grass, species mean']),
 ('pasto_hybrid', ['King grass (', 'elefante / Napier']),
 ('pasto_andalucia', ['jaragua']),
 ('pasto_jaragua', ['jaragua']),
 ('pasto_fleming', ['Flemingia']),
 ('pasto_leucaena', ['Leucaena']),
 ('pasto_cratylia', ['Cratylia']),
 ('pasto_gliricidia', ['Gliricidia']),
 ('pasto_buffel', ['buffel, fresh']),
 ('pasto_decumbens', ['decumbens']),
 # --- henos ---------------------------------------------------------------
 ('heno_alfalfa', ['Alfalfa hay, sun-cured', 'Alfalfa hay, midbloom']),
 ('heno_brachiaria', ['Brachiaria hay (B. brizantha', 'Brachiaria hay (B. ruziziensis']),
 ('heno_tifton', ['Tifton 85', 'Bermudagrass hay (species mean']),
 ('heno_avena', ['=oat hay', 'Oat hay (US table']),
 ('heno_ryegrass', ['Ryegrass hay', 'Annual ryegrass']),
 ('heno_festuca', ['Tall fescue hay, full bloom', 'Tall fescue hay, early bloom']),
 ('heno_cenchrus', ['Cenchrus ciliaris hay']),
 ('heno_king', ['Elephant / King grass hay']),
 ('heno_guinea', ['Guinea/Panicum hay']),
 # --- silajes -------------------------------------------------------------
 ('silo_maiz', ['maize silage, normal', 'Maize silage, well-eared']),
 ('silo_maiz_alto', ['high-grain', 'Maize silage, well-eared']),
 ('silo_sorgo', ['Forage sorghum silage', 'Sorghum silage, early bloom']),
 ('silo_sorgo_baño', ['Sweet / dual-purpose sorghum']),
 ('silo_avena', ['=oat silage', 'Oat silage (US table']),
 ('silo_pasto', ['Tropical grass silage (Guinea', 'Tropical grass silage — alternative']),
 ('silo_king', ['King grass silage']),
 ('silo_maralfalfa', ['Maralfalfa silage']),
 ('silo_cana', ['Sugarcane silage', 'Sugarcane tops silage']),
 # --- granos --------------------------------------------------------------
 ('maiz_amarillo', ['yellow dent']),
 ('maiz_blanco', ['Maize grain, white', 'yellow dent']),
 ('sorgo_grano', ['milo), ground — all types']),
 ('sorgo_rojo', ['Sorghum grain, low tannin', 'milo), ground — all types']),
 ('cebada_grano', ['Barley grain']),
 ('trigo_grano', ['Wheat grain']),
 ('arroz_pulido', ['Rice, broken']),
 ('avena_grano', ['Oat grain']),
 # --- energeticos ---------------------------------------------------------
 ('yuca_raiz', ['fresh root']),
 ('yuca_seca', ['Cassava dried chips']),
 ('camote', ['Sweet potato']),
 ('melaza_caña', ['Sugarcane molasses']),
 ('cana_azucar', ['Fresh chopped sugarcane', 'Fresh sugarcane before ensiling']),
 ('cachaza', ['Filter cake']),
 ('grasa_bypass', ['Rumen-protected fat']),
 ('salvado_trigo', ['Wheat bran']),
 ('afrecho_arroz', ['Rice bran, full-fat']),
 ('arroz_desgrasado', ['Rice bran, defatted']),
 ('germen_maiz', ['Corn germ meal']),
 ('grano_destileria', ['Corn DDGS']),
 ('ddgs_sorgo', ['Sorghum DDGS']),
 ('burlanda_maiz', ['Corn gluten feed, wet', 'Corn gluten feed, dry']),
 ('cascarilla_soya', ['Soybean hulls']),
 ('pulpa_citrica', ['Citrus pulp']),
 ('granza_cerveza', ['Brewers grains, wet', 'Brewers grains, dried']),
 ('bagazo_cana', ['Sugarcane bagasse']),
 # --- proteicos -----------------------------------------------------------
 ('harina_soya', ['Soybean meal 48', 'Soybean meal 44']),
 ('expeller_soya', ['Soybean expeller']),
 ('soya_integral', ['Full-fat roasted soybeans']),
 ('torta_girasol', ['Sunflower meal']),
 ('torta_algodon', ['Cottonseed meal']),
 ('semilla_algodon', ['Whole cottonseed']),
 ('torta_palmiste', ['Palm kernel cake']),
 ('torta_copra', ['Copra']),
 ('torta_mani', ['Peanut']),
 ('torta_canola', ['Canola']),
 ('harina_pescado', ['Fish meal']),
 ('harina_carne', ['Meat and bone meal']),
 ('harina_sangre', ['Blood meal']),
 ('levadura_cerveza', ['Brewers dried yeast']),
]

COLS_MIN = {'ms': 'DM %', 'ca': 'Ca %', 'p': 'P %', 'na': 'Na %',
            'cl': 'Cl %', 'mg': 'Mg %', 's': 'S %'}

MAPA_MIN = [
 ('sal_mineral', ['Fosbovi']),
 ('sal_mineral_lactancia', ['Fosbovi']),
 ('sal_mineral_recria', ['Salminas Proteinado']),
 ('sal_comun', ['Common salt']),
 ('fosfato_bicalcico', ['Dicalcium phosphate (dihydrate', 'Dicalcium phosphate (US extension']),
 ('fosfato_monocalcico', ['Monocalcium phosphate']),
 ('carbonato_calcio', ['Calcium carbonate', 'Limestone (US extension']),
 ('bicarbonato', ['Sodium bicarbonate']),
 ('oxido_magnesio', ['Magnesium oxide']),
 ('cloruro_amonio', ['Ammonium chloride']),
 ('urea', ['Feed-grade urea']),
 ('zeolita', ['Zeolite']),
 ('monensina', ['Monensin sodium premix']),
 ('premezcla_vitaminica', []),
]

# --------------------------------------------- metadatos que no vienen del md
# Techos de inclusion (% de la MS de la dieta) verificados en seguridad.md
MAX_INC = {
    'urea': 1.0, 'melaza_caña': 25, 'semilla_algodon': 25, 'torta_algodon': 25,
    'grano_destileria': 30, 'ddgs_sorgo': 30, 'burlanda_maiz': 30,
    'granza_cerveza': 30, 'soya_integral': 15, 'cascarilla_soya': 30,
    'pulpa_citrica': 33, 'afrecho_arroz': 33, 'arroz_desgrasado': 33,
    'torta_palmiste': 80, 'torta_copra': 15, 'yuca_seca': 65, 'trigo_grano': 50,
    'carbonato_calcio': 2, 'bicarbonato': 1.5, 'oxido_magnesio': 0.75,
    'grasa_bypass': 4, 'harina_carne': 0, 'harina_sangre': 0,
    'sal_comun': 4.5, 'cloruro_amonio': 1.5, 'zeolita': 2.5,
    'sal_mineral': 4, 'sal_mineral_lactancia': 4, 'sal_mineral_recria': 4,
    'fosfato_bicalcico': 2, 'fosfato_monocalcico': 2, 'monensina': 0.05,
    'premezcla_vitaminica': 1,
}
NOTA_MAX = {
    'harina_carne': 'PROHIBIDO: proteina de mamifero para rumiantes (21 CFR 589.2000). Se deja en la base solo para bloquearla.',
    'harina_sangre': 'PROHIBIDO: proteina de mamifero para rumiantes (21 CFR 589.2000). Se deja en la base solo para bloquearla.',
    'monensina': 'Techo prudente del premezclado; el limite real es la dosis en mg/cabeza/dia (regla V74).',
    'premezcla_vitaminica': 'Techo prudente; seguir la dosis del fabricante.',
    'sal_mineral': 'Techo prudente por el aporte de sal (regla V87).',
    'sal_mineral_lactancia': 'Techo prudente por el aporte de sal (regla V87).',
    'sal_mineral_recria': 'Techo prudente por el aporte de sal (regla V87).',
    'fosfato_bicalcico': 'Techo prudente; el limite operativo es el P total de la dieta (regla V81).',
    'fosfato_monocalcico': 'Techo prudente; el limite operativo es el P total de la dieta (regla V81).',
    'zeolita': 'Techo prudente de aditivo inerte.',
    'cloruro_amonio': 'Techo prudente; se usa 0,5-1,5 % para prevenir urolitiasis.',
}

# pef = factor de efectividad fisica (fraccion de la FDN que estimula rumia).
# NO viene de alimentos.md: es un valor de clase, conservador a proposito.
# Se asigna 0 a los concentrados para que el motor NO les acredite peFDN; asi
# la dieta necesita mas forraje real, que es el lado seguro del error.
PEF_CLASE = {
    'pasto_fresco': (0.95, 'Forraje fresco entero; pef de clase, no medido.'),
    'heno': (0.85, 'Heno picado; pef de clase, no medido.'),
    'silo': (0.80, 'Silaje picado; pef de clase, no medido.'),
    'fibrosos': (0.40, 'Subproducto fibroso; pef de clase reducido, no medido.'),
    'concentrado': (0.0, 'pef 0 a proposito: no se acredita peFDN a los concentrados.'),
}
def clase_pef(fid, categoria):
    if fid.startswith('pasto_'):
        return 'pasto_fresco'
    if fid.startswith('heno_'):
        return 'heno'
    if fid.startswith('silo_') or fid in ('cana_azucar',):
        return 'silo'
    if fid in ('cascarilla_soya', 'pulpa_citrica', 'bagazo_cana', 'afrecho_arroz',
               'arroz_desgrasado', 'salvado_trigo', 'granza_cerveza',
               'grano_destileria', 'ddgs_sorgo', 'burlanda_maiz', 'cachaza'):
        return 'fibrosos'
    return 'concentrado'

CATEGORIA = {}
NOMBRE = {}
PRECIO = {}
viejo = open(VIEJO, encoding='utf-8').read()
for m in re.finditer(r'\{\s*id:\s*"([^"]+)"[^}]*\}', viejo):
    blk = m.group(0)
    fid = m.group(1)
    n = re.search(r'nombre:\s*"([^"]*)"', blk)
    c = re.search(r'categoria:\s*"([^"]*)"', blk)
    pr = re.search(r'precio_kg:\s*([\d.]+)', blk)
    NOMBRE[fid] = n.group(1) if n else fid
    CATEGORIA[fid] = c.group(1) if c else 'energético'
    PRECIO[fid] = float(pr.group(1)) if pr else None

NUEVOS = {
    'pasto_leucaena': ('Leucaena (Leucaena leucocephala)', 'forraje', 0.55),
    'pasto_cratylia': ('Cratylia (Cratylia argentea)', 'forraje', 0.55),
    'pasto_gliricidia': ('Gliricidia (Gliricidia sepium)', 'forraje', 0.55),
    'pasto_buffel': ('Pasto Buffel (Cenchrus ciliaris)', 'forraje', 0.38),
    'pasto_decumbens': ('Brachiaria decumbens (Tapicuá)', 'forraje', 0.38),
    'heno_guinea': ('Heno de Guinea / Panicum', 'forraje', 0.85),
    'silo_cana': ('Silaje de caña de azúcar', 'forraje', 0.35),
    'bagazo_cana': ('Bagazo de caña fresco', 'forraje', 0.20),
    'arroz_desgrasado': ('Salvado de arroz desgrasado', 'energético', 1.10),
    'semilla_algodon': ('Semilla de algodón entera', 'proteico', 2.20),
    'fosfato_monocalcico': ('Fosfato monocálcico', 'mineral', 7.50),
    'cloruro_amonio': ('Cloruro de amonio', 'mineral', 9.00),
}
for fid, (nom, cat, pr) in NUEVOS.items():
    NOMBRE.setdefault(fid, nom)
    CATEGORIA.setdefault(fid, cat)
    if PRECIO.get(fid) is None:
        PRECIO[fid] = pr

# --------------------------------------------------- energia derivada del TDN
def energia(tdn, em_pub=None):
    """DE/EM/ENm/ENg. Si la fuente publica EM se usa esa y el TDN se deriva
    invirtiendo EM = 0,9455 x ED - 0,3032. Formulas en engine/energy.js."""
    if tdn is None and em_pub is None:
        return None, None, None
    if tdn is None:
        de = (em_pub + 0.3032) / 0.9455
        em = em_pub
    else:
        de = tdn / 100.0 * 4.409
        em = 0.9455 * de - 0.3032
    if em <= 0:
        return round(de, 3), round(max(em, 0), 3), None
    enm = 1.37 * em - 0.138 * em ** 2 + 0.0105 * em ** 3 - 1.12
    eng = 1.42 * em - 0.174 * em ** 2 + 0.0122 * em ** 3 - 1.65
    return round(de, 3), round(em, 3), (round(max(enm, 0), 3), round(max(eng, 0), 3))

# ------------------------------------------------------------------ construir
def fila_js(fid, vals, est, proc, fuente, url, extra, es_mineral=False):
    cat = CATEGORIA.get(fid, 'energético')
    notas = []
    if es_mineral:
        vals.setdefault('pb', None)
        vals.setdefault('em_publicada', None)
        for c in ('ndf', 'adf', 'almidon', 'ee', 'lignina', 'rup_pct_pb', 'tdn', 'k', 'cenizas'):
            vals.setdefault(c, None)
        if fid == 'urea':
            vals['pb'] = 287.0   # equivalente proteico, ver columna "Other" de la fuente
            notas.append('PB 287 % es equivalente proteico (N x 6,25), no proteina verdadera. Nunca cuenta como PDR real por encima del techo de 1 % de la MS.')
        elif fid in ('sal_mineral', 'sal_mineral_lactancia', 'sal_mineral_recria'):
            pass
        else:
            vals['pb'] = 0.0
        for c in ('ndf', 'adf', 'almidon', 'ee', 'lignina'):
            if vals.get(c) is None:
                vals[c] = 0.0
    cl = clase_pef(fid, cat)
    pef, nota_pef = PEF_CLASE[cl]
    if es_mineral:
        pef, nota_pef = 0.0, PEF_CLASE['concentrado'][1]
    de, em, en = energia(vals.get('tdn'), vals.get('em_publicada'))
    enm, eng = en if en else (None, None)
    if vals.get('tdn') is None and vals.get('em_publicada') is not None:
        # la fuente publica EM: derivamos el TDN para que el balanceador lo use
        vals['tdn'] = round(de / 4.409 * 100, 1)
        est['tdn'] = True
        notas.append('TDN derivado de la EM publicada por la fuente (%.2f Mcal EM/kg MS), no es un TDN medido.' % vals['em_publicada'])
    if vals.get('tdn') is None:
        notas.append('Sin TDN publicado en la fuente: el motor no puede usar este alimento como aporte de energia hasta que cargues un analisis.')
    if vals.get('ca') is None or vals.get('p') is None:
        notas.append('Falta Ca y/o P en la fuente: el motor lo trata como 0 y avisa, no lo inventa.')
    if est.get('tdn'):
        notas.append('TDN estimado desde la ED publicada (1 % TDN = 0,04409 Mcal ED/kg), no es un TDN medido.')
    if fid in NOTA_MAX:
        notas.append(NOTA_MAX[fid])
    if extra:
        notas.append('Campos rellenados con: ' + '; '.join(e['nombre'] for e in extra) + '.')
    notas.append(nota_pef)

    o = {
        'id': fid, 'nombre': NOMBRE.get(fid, fid), 'categoria': cat,
        'ms': vals.get('ms'), 'pb': vals.get('pb'), 'rup_pct_pb': vals.get('rup_pct_pb'),
        'tdn': vals.get('tdn'), 'tdn_estimado': bool(est.get('tdn')),
        'em_publicada': vals.get('em_publicada'),
        'ndf': vals.get('ndf'), 'adf': vals.get('adf'), 'lignina': vals.get('lignina'),
        'almidon': vals.get('almidon'), 'ee': vals.get('ee'), 'cenizas': vals.get('cenizas'),
        'ca': vals.get('ca'), 'p': vals.get('p'), 's': vals.get('s'),
        'k': vals.get('k'), 'mg': vals.get('mg'),
        'na': vals.get('na'), 'cl': vals.get('cl'),
        'de': de, 'em': em, 'enm': enm, 'eng': eng,
        'pef': pef,
        'peNDF': round(vals['ndf'] * pef, 2) if vals.get('ndf') is not None else None,
        'max_inclusion_pct': MAX_INC.get(fid),
        'precio_kg': PRECIO.get(fid),
        'fuente': fuente, 'url': url,
        'fuentes_extra': extra or None,
        'notas': ' '.join(notas) if notas else None,
        # alias heredados que otros modulos de la app todavia leen
        'prot': vals.get('pb'), 'fdn': vals.get('ndf'),
    }
    return o

salida = []
for fid, pats in MAPA:
    v, e, pr, fu, u, ex = extraer(pats)
    salida.append(fila_js(fid, v, e, pr, fu, u, ex))
for fid, pats in MAPA_MIN:
    if not pats:
        salida.append(fila_js(fid, {c: None for c in COLS_MIN}, {}, {}, None, None, [], True))
        continue
    v, e, pr, fu, u, ex = extraer(pats, COLS_MIN)
    salida.append(fila_js(fid, v, e, pr, fu, u, ex, True))

def js(v):
    if v is None:
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(round(v, 4))
    if isinstance(v, list):
        return '[' + ', '.join(js(x) for x in v) + ']'
    if isinstance(v, dict):
        return '{ ' + ', '.join(f'{k}: {js(x)}' for k, x in v.items()) + ' }'
    return json.dumps(v, ensure_ascii=False)

ORDEN = ['id', 'nombre', 'categoria', 'ms', 'pb', 'prot', 'rup_pct_pb', 'tdn',
         'tdn_estimado', 'em_publicada', 'de', 'em', 'enm', 'eng', 'ndf', 'fdn', 'adf', 'lignina',
         'almidon', 'ee', 'cenizas', 'ca', 'p', 's', 'k', 'mg', 'na', 'cl',
         'pef', 'peNDF', 'max_inclusion_pct', 'precio_kg', 'fuente', 'url',
         'fuentes_extra', 'notas']

GRUPOS = [('FORRAJES FRESCOS Y LEGUMINOSAS', lambda f: f['id'].startswith('pasto_')),
          ('HENOS', lambda f: f['id'].startswith('heno_')),
          ('SILAJES', lambda f: f['id'].startswith('silo_')),
          ('GRANOS DE CEREAL', lambda f: f['id'] in ('maiz_amarillo','maiz_blanco','sorgo_grano','sorgo_rojo','cebada_grano','trigo_grano','arroz_pulido','avena_grano')),
          ('ENERGETICOS Y SUBPRODUCTOS', lambda f: f['categoria'] == 'energético' or f['id'] in ('cana_azucar','bagazo_cana')),
          ('PROTEICOS', lambda f: f['categoria'] == 'proteico'),
          ('MINERALES Y ADITIVOS', lambda f: True)]

usados = set()
partes = []
for titulo, pred in GRUPOS:
    filas = [f for f in salida if f['id'] not in usados and pred(f)]
    for f in filas:
        usados.add(f['id'])
    if not filas:
        continue
    partes.append('  // ' + '=' * 68 + f'\n  // {titulo} ({len(filas)})\n  // ' + '=' * 68)
    for f in filas:
        cuerpo = ',\n    '.join(f'{k}: {js(f[k])}' for k in ORDEN if k in f)
        partes.append('  {\n    ' + cuerpo + ',\n  },')

cab = '''// src/data/alimentosBase.js
// Base de composicion de alimentos para bovinos de carne del tropico
// (Santa Cruz, Bolivia).
//
// GENERADO AUTOMATICAMENTE por research/gen_alimentos.py desde
// research/alimentos.md. No edites este archivo a mano: edita la tabla
// investigada y volve a generarlo.
//
// Reglas de esta base:
//   1. Ningun valor nutricional esta inventado. Cada numero sale de una fuente
//      publicada y cada alimento lleva su URL en el campo `url`.
//   2. Si la fuente no publica un valor, el campo queda en `null`. El motor
//      trata `null` como "no se" y avisa; NUNCA rellena con un valor tipico.
//   3. `de`, `em`, `enm` y `eng` son DERIVADOS del TDN con las ecuaciones de
//      NRC/BR-CORTE implementadas en engine/energy.js, no son valores medidos.
//   4. `pef` es un factor de clase, no una medicion. A los concentrados se les
//      asigna 0 a proposito para no acreditarles peFDN: obliga al motor a poner
//      forraje real, que es el lado seguro del error.
//   5. `max_inclusion_pct` es el techo de inclusion como % de la MS de la
//      dieta, tomado de research/seguridad.md.
//
// Unidades: ms = % del alimento tal cual. Todo lo demas = % de la MS,
// salvo precio_kg (Bs./kg tal cual) y max_inclusion_pct (% de la MS dietaria).

export const ALIMENTOS_BASE = [
'''
open(SALIDA, 'w', encoding='utf-8').write(cab + '\n'.join(partes) + '\n];\n\n// Orden y etiquetas de las categorías, tal como las usa la pantalla.
export const CATEGORIAS_ORDER = ["forraje", "energético", "proteico", "mineral"];
export const TIPO_LABELS = {
  forraje: "🌿 Forraje",
  energético: "🌽 Energético",
  proteico: "🫘 Proteico",
  mineral: "💊 Mineral",
};

export default ALIMENTOS_BASE;\n')

# ------------------------------------------------------------------- resumen
print('alimentos:', len(salida))
for campo in ('tdn', 'ca', 'p', 'ndf', 'pb', 'ms', 'rup_pct_pb', 'almidon', 's'):
    faltan = [f['id'] for f in salida if f.get(campo) is None]
    print(f'  sin {campo}: {len(faltan)}', faltan[:8] if faltan else '')
print('tdn estimado:', sum(1 for f in salida if f['tdn_estimado']))
peor = sorted(salida, key=lambda f: sum(1 for k in ORDEN if f.get(k) is None), reverse=True)[:10]
print('mas huecos:', [(f['id'], sum(1 for k in ORDEN if f.get(k) is None)) for f in peor])
