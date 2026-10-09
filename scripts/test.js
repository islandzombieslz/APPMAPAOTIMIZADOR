const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const els=new Map(),storage=new Map();const element=()=>({style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},appendChild(){},insertAdjacentHTML(){},setAttribute(){},value:''});
const ctx={console,setTimeout(){},clearTimeout(){},window:{addEventListener(){}},navigator:{},document:{getElementById(id){if(!els.has(id))els.set(id,element());return els.get(id)},createElement:element},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},AbortController,URL,Blob,confirm:()=>true};
vm.createContext(ctx);vm.runInContext(source+`;globalThis.api={BUILDING_DB,OSM_PLACES,marker,catalogMatches,GEO_SEED,geoDb,inRegion,selectOSM,markerOffset,locationParts,permanentCoordinate,applyPermanentCatalog,groups,routeStop,gps,importFile,draw,save,rasterMap,generateCpfMA,cpfAction,getCpfState:()=>cpfState,setData:x=>data=x,setMap:x=>map=x};`,ctx);
const a=ctx.api;assert(a.BUILDING_DB.length>=192);assert(Object.keys(a.GEO_SEED).length>=122);
const executive=a.BUILDING_DB.find(b=>b.nome==='Executive Center'||b.nome==='Edifício Executive Center');assert(executive);
const row={address:executive.logradouro+', '+executive.numero+', Edifício Executive Center, apto 101',lat:-2.51,lng:-44.30,source:'shopee',stop:'1',id:'test1'};
assert.equal(a.applyPermanentCatalog([row]),1);assert.equal(row.lat,executive.lat);assert.equal(row.lng,executive.lng);
const unknown={address:'Rua inexistente, 999, Edifício ZZZZ Teste',lat:null,lng:null};assert.equal(a.applyPermanentCatalog([unknown]),0);assert.equal(unknown.lat,null);
const manual={...row,lat:-2.50,lng:-44.29,source:'manual'};a.applyPermanentCatalog([manual]);assert.equal(manual.lat,-2.50);
assert(!a.geoDb['slz-186']);
const m=a.permanentCoordinate({building:'Montreal Residence',street:'Rua Marcelino Champagnat',number:'6'});assert.equal(m,null);
a.setData([{...row,address:'Rua do Teste, 1, Edifício Alfa'},{...row,id:'test2',address:'Rua do Teste, 1, Edifício Beta'}]);assert.equal(a.groups().length,2);
assert(html.includes('const SEED=[];'));assert(!html.includes('catálogo V6'));
console.log('PASS: importação automática, pendências, proteção de correções manuais, nomes repetidos e separação de prédios.');

assert(!a.inRegion({lat:-2.52,lng:-44.27}));assert(!a.inRegion({lat:-2.505,lng:-44.264}));
assert(a.inRegion({lat:-2.499,lng:-44.29}));assert(a.inRegion({lat:-2.4996,lng:-44.3121}));
const target={p:{street:'Rua dos Bicudos',roadKey:'bicudos',number:'10',building:'Edifício Alpha',buildingKey:'alpha',district:'Renascença'}};
assert.equal(a.selectOSM(target,[{lat:-2.52,lng:-44.27,tags:{name:'Edifício Alpha'}}]),null);
assert.equal(a.selectOSM(target,[{lat:-2.50,lng:-44.29,tags:{highway:'residential',name:'Rua dos Bicudos'}}]),null);
assert.equal(a.permanentCoordinate({building:'Belvedere',street:'Rua Miquerinos',district:'Vinhais'}),null);
for(let n=2;n<=16;n++)for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const x=a.markerOffset(i,n),y=a.markerOffset(j,n);assert(Math.hypot(x[0]-y[0],x[1]-y[1])>=27)}
const joana={address:'Joanalice, Rua dos Curiós, 5',source:'shopee'};assert.equal(a.applyPermanentCatalog([joana]),1);assert.equal(joana.lat,-2.493201);
console.log('PASS: área restrita, homônimos fora do recorte, centro de rua recusado e marcadores espaçados.');

console.log('COBERTURA NA ÁREA:',a.BUILDING_DB.filter(b=>a.inRegion(b)).length);

const vinhais={address:'Edifício Belvedere, Rua Miquerinos, 1, Vinhais',source:'shopee'};assert.equal(a.applyPermanentCatalog([vinhais]),0);console.log('PASS: bairro fora da área também detectado no endereço completo.');

for(const address of ['Joanalice Centro de Beleza, Rua dos Curiós, 5','Condomínio Morada de Avalon, Rua Jaracati, 6'])assert.equal(a.applyPermanentCatalog([{address,source:'shopee'}]),1);

// Reabrir com rota salva deve executar a inicialização completa.
storage.set('shopee-v11-data',JSON.stringify([row]));
const reopened={...ctx,window:{addEventListener(){}}};vm.createContext(reopened);vm.runInContext(source,reopened);
assert.equal(els.get('routeSub').textContent,'1 pacotes · 1 endereços');
assert.equal(JSON.parse(storage.get('shopee-v11-data'))[0].id,'test1');
console.log('PASS: reabertura com rota salva não trava nem perde entregas.');

for(const x of [0,7,"007","12A"])assert.equal(a.routeStop(x),String(x));assert.equal(a.routeStop(""),"-");console.log("PASS: números originais, incluindo zero e zeros à esquerda, preservados.");

(async()=>{
 const imported=[{Stop:'007',Sequence:1,'Destination Address':'Rua Teste, 1','SPX TN':'p1'},{Stop:0,Sequence:99,'Destination Address':'Rua Teste, 2','SPX TN':'p2'}];
 ctx.window.XLSX=ctx.XLSX={read:()=>({Sheets:{R:{}},SheetNames:['R']}),utils:{sheet_to_json:()=>imported}};
 await a.importFile({arrayBuffer:async()=>new ArrayBuffer(0)});
 assert.deepEqual(JSON.parse(storage.get('shopee-v11-data')).map(r=>r.stop),['007','0']);
 let callback,watchCount=0,updates=[],centers=[];
 ctx.navigator.geolocation={watchPosition(fn){callback=fn;watchCount++;return 42},clearWatch(){}};
 ctx.L={divIcon:x=>x,marker(ll){return {addTo(){return this},setLatLng(p){updates.push(p)},remove(){}}}};
 a.setMap({raster:{},flyTo:x=>centers.push(x.center)});
 a.gps();callback({coords:{longitude:-44.29,latitude:-2.5,accuracy:8}});callback({coords:{longitude:-44.291,latitude:-2.501,accuracy:6}});a.gps();
 assert.equal(watchCount,1);assert.deepEqual(updates[0],[-2.501,-44.291]);assert.deepEqual(centers.at(-1),[-44.291,-2.501]);
 console.log('PASS: importação preserva Stop em vez de Sequence; GPS acompanha posições sem duplicar monitoramento.');
 let created=0,removed=0;
 ctx.L.marker=()=>{created++;return {addTo(){return this},remove(){removed++}}};
 a.setMap({raster:{},loaded:()=>true});const route=[{...row,stop:'007',lat:-2.5,lng:-44.29}];a.setData(route);a.draw();a.draw();assert.equal(created,1);assert.equal(removed,0);
 route[0].lat=-2.501;a.save();a.draw();assert.equal(created,2);assert.equal(removed,1);a.setData([]);a.draw();assert.equal(removed,2);
 ctx.crypto=require('crypto').webcrypto;
 function validCpf(s){if(!/^\d{11}$/.test(s)||/^(.)\1+$/.test(s))return false;for(let len=9;len<=10;len++){let total=0;for(let i=0;i<len;i++)total+=Number(s[i])*(len+1-i);if(Number(s[len])!==((total*10)%11)%10)return false}return true}
 for(let i=0;i<1000;i++){const cpf=a.generateCpfMA();assert(validCpf(cpf));assert.equal(cpf[8],'3')}
 const pending=[];ctx.setTimeout=(fn,ms)=>{if(ms===80)pending.push(fn)};let copied='';ctx.navigator.clipboard={writeText:async value=>{copied=value}};
 const generating=a.cpfAction();assert.equal(a.getCpfState(),'loading');await a.cpfAction();assert.equal(pending.length,1);pending.shift()();await generating;assert.equal(a.getCpfState(),'ready');
 await a.cpfAction();assert.equal(a.getCpfState(),'idle');assert(validCpf(copied));assert.equal(els.get('cpfBtn').innerHTML,'CPF');
 const again=a.cpfAction();pending.shift()();await again;ctx.navigator.clipboard.writeText=async()=>{throw Error('Denied')};await a.cpfAction();assert.equal(a.getCpfState(),'ready');
 ctx.navigator.clipboard.writeText=async value=>{copied=value};await a.cpfAction();assert.equal(a.getCpfState(),'idle');
 console.log('PASS: marcadores reaproveitados e removidos quando necessário; 1000 CPFs, região 3, ciclo e falha de cópia.');
 let visible=true;const view={pad(){return this},contains(){return visible}};
 a.setMap({raster:{getBounds:()=>view},loaded:()=>true});a.setData(route);a.draw();const baseline=created;visible=false;a.draw();visible=true;a.draw();assert.equal(created,baseline+1);assert.equal(route[0].stop,'007');
 a.setData([]);let config,tiles,mask;
 const raster={setView(){return this},on(){return this},getBounds:()=>view,getZoom:()=>14};
 ctx.window.L=ctx.L;ctx.L.map=(id,opts)=>{config=opts;return raster};ctx.L.tileLayer=(url,opts)=>{tiles=opts;return {addTo(){}}};ctx.L.polygon=(rings,opts)=>{mask={rings,opts};return {addTo(){}}};a.rasterMap();
 assert.equal(config.minZoom,12);assert.equal(config.zoomSnap,.25);assert.equal(config.inertiaDeceleration,1200);assert.equal(tiles.maxNativeZoom,18);assert.equal(tiles.keepBuffer,1);assert.equal(tiles.noWrap,true);assert.deepEqual(JSON.parse(JSON.stringify(tiles.bounds)),[[-2.531,-44.34],[-2.465,-44.258]]);assert.equal(mask,undefined);assert.equal(config.maxBoundsViscosity,.4);
 assert(html.includes('.pin{width:22px!important'));console.log('PASS: área visual ampliada sem máscara, zoom suave e marcadores fora da tela sem alterar entregas.');
})().catch(e=>{console.error(e);process.exitCode=1});

// Nomes publicados com prefixos diferentes devem reconhecer o mesmo objeto.
const mapped={lat:-2.499,lng:-44.29,tags:{name:'Condomínio Edifício Maison Teste'}};
const g={p:{building:'Maison Teste',buildingKey:'maison teste',street:'',roadKey:'',district:'Renascença'}};
assert(a.selectOSM(g,[mapped]));
assert.equal(a.selectOSM(g,[mapped,{...mapped,lng:-44.285}]),null);
const point=a.OSM_PLACES.find(o=>o.tags.name==='Espaço Renascença');assert(point);
const parsed=a.locationParts({address:'Espaço Renascença, sala 1, Jardim Renascença'});assert.equal(parsed.building,'Espaço Renascença');
assert(a.selectOSM({p:parsed},a.OSM_PLACES));
for(const b of a.BUILDING_DB.filter(b=>Number(b.id.slice(4))>212)){
 const r={address:b.nome+', apto 101',source:'shopee'};assert.equal(a.applyPermanentCatalog([r]),1,b.nome);assert.equal(r.lat,b.lat);
}
const pin=a.marker({stop:'007',items:[{source:'shopee'}],p:{}},3);assert(pin.innerHTML.includes('007'));assert(pin.innerHTML.includes('class="count">3'));
assert(html.includes('background:#20a65a'));assert(html.includes('.pin::before'));assert(html.includes('border-radius:50%!important'));
console.log('PASS: prefixos normalizados, homônimos recusados, local sem prefixo, novos registros e marcador com pacotes.');
