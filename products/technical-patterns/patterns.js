/* Shared technical SVG source for product catalogue and drawing-pattern preview.
   Match by technicalSpecifications.type + bearingSeat (rollers only).
   Edit the SVG files in svg/ to change drawings in both places. */
(function(root){
 'use strict';
 const scriptSrc=document.currentScript?.src||'';
 const base=new URL('.',scriptSrc||'https://local.test/products/technical-patterns/patterns.js');
 const cache=new Map();
 const embedded=root.CircleLinePatternFallback||null;
 let manifestPromise;
 function loadManifest(){
  if(!manifestPromise)manifestPromise=(async()=>{
   if((location.protocol==='file:'||location.protocol==='about:')&&embedded)return embedded.manifest;
   try{
    const response=await fetch(new URL('patterns.json',base),{cache:'no-store'});
    if(!response.ok)throw new Error('Pattern manifest HTTP '+response.status);
    return await response.json();
   }catch(error){throw error}
  })();
  return manifestPromise;
 }
 async function loadSVG(file){
  if(cache.has(file))return cache.get(file);
  const promise=(async()=>{
   if((location.protocol==='file:'||location.protocol==='about:')&&embedded?.svgs?.[file])return embedded.svgs[file];
   try{
    const response=await fetch(new URL(file,base),{cache:'no-store'});
    if(!response.ok)throw new Error('SVG HTTP '+response.status+': '+file);
    return await response.text();
   }catch(error){throw error}
  })();
  cache.set(file,promise);return promise;
 }
 function seatOf(p){return String(p.bearingSeat||p.technicalSpecifications?.bearingSeat||'none').toLowerCase().replace(/[ -]/g,'_')}
 function positiveMillimetres(product,key){
  const entries=product.dimensions||product.technicalSpecifications?.dimensions||[];
  const item=entries.find(d=>d&&String(d.key)===key);
  if(!item)return null;
  const unit=String(item.unit||'mm').trim().toLowerCase();
  if(unit!=='mm')return null;
  const raw=String(item.value??'').trim().replace(',','.');
  if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw))return null;
  const value=Number(raw);
  return Number.isFinite(value)&&value>0?value:null;
 }
 function patternFor(manifest,product){
  const type=String(product.type||product.technicalSpecifications?.type||'').trim().toLowerCase();
  if(!type)return null;
  const matches=manifest.templates.filter(entry=>entry.type===type);
  if(!matches.length)return null;
  if(type==='solid_carbide_end_mill'){
   // The geometry is derived from numeric values already in the JSON.
   // It does not require another database field or a manual subtype selector.
   const cut=positiveMillimetres(product,'cutting_diameter');
   const shank=positiveMillimetres(product,'shank_diameter');
   if(cut===null||shank===null)return null;
   const relation=Math.abs(cut-shank)<1e-6?'equal':shank>cut?'shank_larger':'shank_smaller';
   return matches.find(entry=>entry.shankDiameterRelation===relation)||null;
  }
  // Roller variants must match the declared bearing-seat layout exactly.
  if(matches.length>1)return matches.find(entry=>entry.bearingSeat===seatOf(product))||null;
  return matches[0];
 }
 function renderSVG(source,product){
  const doc=new DOMParser().parseFromString(source,'image/svg+xml');
  if(doc.querySelector('parsererror'))throw new Error('Invalid SVG pattern');
  const dimensions=new Map((product.dimensions||[]).map((d,i)=>[String(d.key),{letter:d.letter||String.fromCharCode(65+i)}]));
  for(const group of [...doc.querySelectorAll('[data-dimension]')]){
   const dimension=dimensions.get(group.getAttribute('data-dimension'));
   if(!dimension){group.remove();continue}
   const text=group.querySelector('[data-dimension-value]');
   if(text)text.textContent=dimension.letter;
  }
  // Adapt the schematic end-view flute count to the actual product value.
  // Never show four flutes for a tool that the inventory identifies as two/three/etc.
  const geometry=doc.querySelector('[data-flute-geometry]');
  if(geometry){
   const fluteInfo=(product.dimensions||[]).find(d=>d&&d.key==='flute_count');
   const value=Number(fluteInfo?.value);
   const valid=fluteInfo&&Number.isInteger(value)&&value>=1&&value<=12;
   while(geometry.firstChild)geometry.removeChild(geometry.firstChild);
   if(valid){
    const NS='http://www.w3.org/2000/svg';
    for(let i=0;i<value;i++){
     const angle=2*Math.PI*i/value-Math.PI/4;
     const circle=doc.createElementNS(NS,'circle');
     circle.setAttribute('cx',String(207+61*Math.cos(angle)));
     circle.setAttribute('cy',String(187+61*Math.sin(angle)));
     circle.setAttribute('r',String(value>8?15:value>6?21:29));
     circle.setAttribute('fill','#fff');
     circle.setAttribute('stroke','#263f5b');
     circle.setAttribute('stroke-width','3');
     geometry.appendChild(circle);
    }
   }
  }
  const svg=doc.documentElement;
  svg.setAttribute('role','img');
  svg.setAttribute('focusable','false');
  return new XMLSerializer().serializeToString(svg);
 }
 async function forProduct(product){
  const manifest=await loadManifest();
  const match=patternFor(manifest,product);
  if(!match)return {pattern:null,views:[]};
  const views=await Promise.all(match.views.map(async view=>({name:view.name,file:view.file,svg:renderSVG(await loadSVG(view.file),product)})));
  return {pattern:match,views};
 }
 root.CircleLinePatterns={loadManifest,patternFor,forProduct,renderSVG};
})(window);
