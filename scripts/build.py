import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
db=json.loads((root/'data/buildings.json').read_text())
assert len(db)>=186 and len({b['id'] for b in db})==len(db)
for b in db:
 assert (b['lat'] is None)==(b['lng'] is None)
 if b['lat'] is not None:
  assert -2.54<b['lat']<-2.467 and -44.346<b['lng']<-44.244
  assert b['geo_ref'] and b['geo_provider']
s=(root/'scripts/template.html').read_text().replace('__CATALOG__',json.dumps(db,ensure_ascii=False,separators=(',',':')))
(root/'index.html').write_text(s)
print('Cadastro:',len(db),'coordenadas:',sum(b['lat'] is not None for b in db))
