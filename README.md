# Rotas Shopee — Mapa V21

Aplicativo para importar uma planilha de entregas e reconhecer os prédios usando coordenadas permanentes incorporadas. Abra `index.html` ou o endereço do GitHub Pages após a publicação.

## Cobertura atual

O cadastro contém **212 registros: 124 com coordenadas dentro da área atendida, 16 pontos fora do recorte e 72 pendentes**. A pesquisa ainda não resolveu todos os endereços. Pontos identificam o prédio, a área mapeada ou o endereço censitário; a portaria não foi verificada. Os pontos fora do recorte não são usados para reconhecer ou deslocar entregas.

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

## Área atendida e prevenção de homônimos

A V17 limita todas as buscas, coordenadas cadastradas, resultados em cache e marcadores ao recorte operacional de Renascença, Jardim Renascença, São Marcos, Península e Ponta do Farol e proximidades. O polígono está em `SERVICE_AREA` no template e não representa limites administrativos oficiais. Vinhais e outros bairros explicitamente fora da área são recusados. Resultados contendo apenas um centro de rua não deslocam mais entregas. Os registros da rota fora do recorte permanecem na lista, sem ponto de mapa.

Os marcadores têm 19 pixels. Até 16 paradas na mesma coordenada são distribuídas visualmente em círculo compacto ou grade; coordenadas de navegação permanecem intactas. Grupos maiores têm um marcador agregado que abre a lista.

Atualização pesquisada: Joanalice, Champs Mall, Morada de Avalon, Andaluzia da Renascença, Lausanne, Fontana Di Trevi, La Rochelle e Pratik. Farol da Ilha e Belvedere preservam seus pontos e recebem aliases. Roterdan tem endereço atualizado para Rua dos Bicudos, 9, mas a coordenada ainda está pendente.

Na V17, Stop/Parada é preservado (inclusive 0 e zeros à esquerda), os marcadores coincidentes usam espaçamento de 29–30 pixels e ambos os mapas têm inércia suave. O botão GPS ativa monitoramento contínuo e centraliza novamente sem desligá-lo; a permissão já concedida é retomada ao abrir. Foram adicionados 20 locais, 18 com coordenadas públicas e 2 com endereço confirmado e coordenada pendente.

Na V17, marcadores sem alterações são reaproveitados, os grupos e endereços são guardados em memória e invalidados nas edições, e os tiles só são atualizados ao terminar o zoom/arrasto. Celulares não baixam o motor WebGL que não utilizam. O botão CPF gera localmente números sintéticos para testes, sem pontuação, com o nono dígito 3 (região fiscal MA/CE/PI). Primeiro toque gera, o sinal verde indica pronto, segundo toque copia e reinicia. Falhas de cópia preservam o número para tentar novamente; nenhum CPF é exibido ou persistido.

Na V18, o mapa e a camada de imagens têm limites na região atendida, zoom mínimo 13 e buffer de um bloco. O zoom 19 reutiliza imagens do nível 18. Marcadores fora da tela (com margem de 20%) deixam de ser renderizados e voltam ao terminar o movimento. Os quadrados usam 19 pixels, selo de 12 pixels e sombra reduzida. Arrasto com desaceleração 1200 e zoom em passos de 0,25 dão mais continuidade aos gestos. As requisições de imagens são limitadas pelo retângulo da região; uma máscara simples oculta os trechos fora do polígono operacional. Blocos de imagem são indivisíveis e os blocos de borda contêm dados de áreas vizinhas, mas essas áreas ficam ocultas.

Na V19, a área visual ganha cerca de 2,2 km de margem ao redor do retângulo atendido, sem máscara de corte. O zoom mínimo passa a 12 e a resistência nas bordas diminui. O filtro geográfico das entregas continua no mesmo polígono operacional, independente da área visível. As melhorias de renderização da V18 são mantidas.

V20: marcadores redondos amarelos com borda branca, haste e base; quantidade em selo verde de 10 px. Mais 39 registros cartográficos com coordenadas, total 251 registros / 179 coordenadas (163 na área). Inclui 345 objetos nomeados do extrato OpenStreetMap de 31/05/2026, com atualização regional em segundo plano. Busca também nomes de lojas, nomes alternativos e endereços nomeados, normaliza prefixos e recusa homônimos distantes sem contexto. Coordenadas de centros cartográficos não garantem a posição da portaria.

V21: 258 registros, 189 coordenadas totais / 173 dentro da área; 10 locais antes sem ponto permanente passam a ter coordenadas. Imperial Premium, Ana Beatriz e Luma cruzam endereço publicado com CNEFE; Sassá Sushi cruza ligação de rota do estabelecimento com CNEFE; Mário Meireles usa destino Waze do endereço confirmado. Novos Saint James, Demoiselle, Bagatelle, Ponta Negra e Praia Grande usam objetos censitários nomeados. Endereços revisados de Canopus e Executive Lake Center (Andirobas) e Mirage (Holandeses); variação Anditobas aceita. Nomes de ruas não são interpretados como prédios homônimos. Fontes e precisão são registradas por local.
