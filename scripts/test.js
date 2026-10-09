const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const els=new Map(),storage=new Map();const element=()=>({style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},appendChild(){},insertAdjacentHTML(){},value:''});
const ctx={console,setTimeout(){},clearTimeout(){},window:{addEventListener(){}},navigator:{},document:{getElementById(id){if(!els.has(id))els.set(id,element());return els.get(id)},createElement:element},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},AbortController,URL,Blob,confirm:()=>true};
vm.createContext(ctx);vm.runInContext(source+`;globalThis.api={BUILDING_DB,GEO_SEED,geoDb,inRegion,selectOSM,markerOffset,locationParts,permanentCoordinate,applyPermanentCatalog,groups,setData:x=>data=x};`,ctx);
const a=ctx.api;assert.equal(a.BUILDING_DB.length,192);assert.equal(Object.keys(a.GEO_SEED).length,122);
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
for(let n=2;n<=16;n++)for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const x=a.markerOffset(i,n),y=a.markerOffset(j,n);assert(Math.hypot(x[0]-y[0],x[1]-y[1])>=38)}
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
