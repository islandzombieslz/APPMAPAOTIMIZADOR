# Rotas Shopee — Mapa V14

Aplicativo para importar uma planilha de entregas e reconhecer os prédios usando coordenadas permanentes incorporadas. Abra `index.html` ou o endereço do GitHub Pages após a publicação.

## Cobertura atual

O cadastro contém **186 registros, 114 com coordenadas e 72 pendentes**. A pesquisa ainda não resolveu todos os endereços. Pontos identificam o prédio, a área mapeada ou o endereço censitário; a portaria não foi verificada. Não são 186 localizações confirmadas.

Cada registro em `data/buildings.json` inclui fonte, referência, precisão e, quando disponível, evidências do CNEFE. Há endereços antigos divergentes e nomes repetidos: os registros são identificados por um ID próprio, para evitar compartilhar coordenadas entre prédios diferentes.

## Uso

1. Importe sua planilha pelo aplicativo.
2. Os endereços reconhecidos recebem imediatamente as coordenadas do cadastro, mesmo quando a planilha não contém latitude e longitude.
3. Em Configurações → Ver cadastro e coordenadas, consulte os pontos, fontes e pendências.
4. Otimize a rota. Endereços pendentes exigem pesquisa adicional e podem continuar não localizados.
5. Exporte a rota corrigida ou o banco completo.

A rota e as correções manuais ficam no armazenamento deste navegador. Elas não são enviadas ao repositório. O arquivo público inicia sem entregas pessoais.

## Publicação

No GitHub, abra Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save. O GitHub publica o aplicativo por HTTPS, necessário para o GPS.

## Atualização do banco

Edite `data/buildings.json`, preservando os IDs e as fontes. Execute:

```sh
python scripts/build.py
node scripts/test.js
```

O comando recria o HTML com o cadastro incorporado. Suba também o `index.html` atualizado.

## Fontes

- OpenStreetMap: áreas e pontos nomeados, links individuais em cada registro. Dados © colaboradores OpenStreetMap, ODbL.
- IBGE: Cadastro Nacional de Endereços para Fins Estatísticos, Censo 2022, município de São Luís. Evidências e níveis de geocodificação nos registros.
- Waze: destinos publicados, identificados por nome/endereço.
- Páginas de empreendimentos: localização publicada pela construtora ou pelo portal imobiliário, identificada no registro.

Mapa: OpenFreeMap / MapLibre. Importação e exportação de planilhas: SheetJS. Esses recursos e buscas externas precisam de internet. Uma chave Google Maps é opcional e não acompanha o aplicativo.
