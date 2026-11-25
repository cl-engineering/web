/* Circle Line Engineering catalogue — StockApp category export v2.
   Supports structured JSON and human-readable technical specs in product descriptions. */
(()=>{'use strict';
const EMAIL='sales@circleline.co.nz';
const $=sel=>document.querySelector(sel);
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const products=[];
const labels=new Map();
const selected=new Map();
const personalNotes=new Map();
try {const saved=JSON.parse(sessionStorage.getItem('circleLineEnquiryNotesV1')||'{}');for(const [k,v] of Object.entries(saved))if(typeof v==='string')personalNotes.set(k,v.slice(0,2000));}catch(e){}
// Keep a multi-product enquiry when navigating to a crawlable product detail page.
try { const saved=JSON.parse(sessionStorage.getItem('circleLineEnquiryV1')||'{}'); for (const [key,qty] of Object.entries(saved)){ if(Number.isSafeInteger(qty)&&qty>=1&&qty<=1000000)selected.set(key,qty); } } catch(e) { /* Storage unavailable, enquiry stays in memory. */ }
let activeCategory='all', query='', visible=18, openProduct=null;
const SPEC_BLOCK=/\[\[StockAppTechnicalSpecifications:v1\]\]([\s\S]*?)\[\[\/StockAppTechnicalSpecifications\]\]/gi;
const SPEC_ANY=/\[\[StockAppTechnicalSpecifications(?::[^\]]*)?\]\][\s\S]*?\[\[\/StockAppTechnicalSpecifications\]\]/gi;
function normalizeNotes(notes){
 if(typeof notes==='string')return notes.trim()?[notes.trim()]:[];
 if(!Array.isArray(notes))return [];
 const parts=notes.filter(x=>typeof x==='string');
 if(parts.length>1 && parts.every(x=>[...x].length<=1))return [parts.join('').trim()].filter(Boolean);
 return parts.map(x=>x.trim()).filter(Boolean);
}
function parsePlainTechnical(source){
 // StockApp exports may place technical values as human-readable sections inside description.
 // Recognize only a complete, anchored section heading so regular product prose is preserved.
 const sectionHeading=/^Technical information(?:\s*\([^\n)]*\))?:\s*$/im;
 const found=sectionHeading.exec(source);
 if(!found)return null;
 const description=source.slice(0,found.index).trim();
 const block=source.slice(found.index+found[0].length).trim();
 const dimensions=[],properties=[],notes=[];
 let section='';let unit='mm';let foundField=false;
 for(const rawLine of block.split(/\r?\n/)){
  const line=rawLine.trim();
  if(!line)continue;
  if(/^Dimensions:\s*$/i.test(line)){section='dimensions';continue}
  if(/^Properties:\s*$/i.test(line)){section='properties';continue}
  if(/^Technical notes:\s*$/i.test(line)){section='notes';continue}
  const u=/^Measurement unit:\s*(.+)$/i.exec(line);
  if(u){unit=u[1].trim();foundField=true;continue}
  if(section==='dimensions'){
   const parts=line.split('|').map(x=>x.trim());
   if(parts.length>=3&&/^[a-z0-9]{1,6}$/i.test(parts[0])&&parts[1]&&parts.slice(2).join(' | ')){
    dimensions.push({key:parts[0],label:parts[1],value:parts.slice(2).join(' | ')});foundField=true;continue;
   }
  }else if(section==='properties'){
   const split=line.indexOf(' | ');
   if(split>=1){const name=line.slice(0,split).trim(),value=line.slice(split+3).trim();if(name&&value){properties.push({name,value});foundField=true;continue}}
  }else if(section==='notes'){
   const item=line.replace(/^[-•]\s*/, '').trim();
   if(item){notes.push(item);foundField=true;continue}
  }
 }
 // Do not discard any description text if the header was merely prose and nothing parsed.
 if(!foundField)return null;
 return {description,dimensions,properties,notes,unit,verified:false,hasTechnical:true};
}
function parseStockDescription(raw){
 const source=typeof raw==='string'?raw:'';
 let spec=null;
 for(const m of source.matchAll(SPEC_BLOCK)){
  try {const parsed=JSON.parse(m[1]);if(parsed && typeof parsed==='object' && !Array.isArray(parsed)){spec=parsed;break}}catch(err){/* Keep prose, never output raw structured JSON. */}
 }
 if(spec){
  const description=source.replace(SPEC_ANY,'').trim();
  const dimensions=Array.isArray(spec.dimensions)?spec.dimensions.filter(d=>d&&d.key!=null&&d.label!=null&&d.value!=null).map(d=>({key:String(d.key).trim().slice(0,6),label:String(d.label).trim(),value:String(d.value).trim()})):[];
  const properties=Array.isArray(spec.properties)?spec.properties.filter(d=>d&&d.name!=null&&d.value!=null).map(d=>({name:String(d.name).trim(),value:String(d.value).trim()})):[];
  return {description,dimensions,properties,notes:normalizeNotes(spec.notes),unit:String(spec.measurementUnit||'mm'),verified:spec.verified===true,hasTechnical:true};
 }
 // Also support the new plain-text human-readable export with the same catalogue schema.
 const plain=parsePlainTechnical(source);
 if(plain)return plain;
 // On malformed legacy structured blocks, hide the raw JSON rather than displaying it publicly.
 return {description:source.replace(SPEC_ANY,'').trim(),dimensions:[],properties:[],notes:[],unit:'mm',verified:false,hasTechnical:false};
}
function prettyName(name){return String(name).replace(/_/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function measurement(value,unit){
 const raw=String(value??'').trim();let u=String(unit??'').trim();
 if(!raw)return '';
 // A nominal metric thread is a designation, not a linear measurement.
 if(/^M\d+(?:[.,]\d+)?(?:\s*[×x]\s*\d+(?:[.,]\d+)?)?$/i.test(raw))return raw;
 if(u.toLowerCase()==='deg'||u==='°')return raw.endsWith('°')?raw:raw+'°';
 if(!u||raw.toLowerCase().endsWith(' '+u.toLowerCase()))return raw;
 return raw+' '+u;
}
function parseStructuredTechnical(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const dimensions=(Array.isArray(raw.dimensions)?raw.dimensions:[]).filter(d=>d&&typeof d==='object'&&d.key!=null&&d.value!=null&&String(d.value).trim()!=='').map((d,i)=>{
  const key=String(d.key||'dimension_'+i).trim();
  const value=String(d.value).trim(),unit=String(d.unit||'').trim();
  return {key,label:String(d.label||prettyName(key)).trim(),value,unit,display:measurement(value,unit),letter:String.fromCharCode(65+i)};
 });
 let props=[];
 if(Array.isArray(raw.properties))props=raw.properties.filter(pr=>pr&&pr.name&&pr.value!=null&&String(pr.value).trim()).map(pr=>({name:String(pr.name).trim(),value:String(pr.value).trim()}));
 else if(raw.properties && typeof raw.properties==='object')props=Object.entries(raw.properties).filter(([k,v])=>k.toLowerCase()!=='notes'&&v!==null&&v!==undefined&&String(v).trim()!=='').map(([k,v])=>({name:prettyName(k),value:String(v).trim()}));
 // The 2026-11-25 StockApp export puts notes under properties.notes instead of
 // technicalSpecifications.notes. Accept both until the export generator is fixed.
 // Do not show notes as a material property or duplicate them in the accordion.
 const nestedNotes=raw.properties&&!Array.isArray(raw.properties)&&typeof raw.properties==='object'?raw.properties.notes:null;
 const topNotes=normalizeNotes(raw.notes),notes=topNotes.length?topNotes:normalizeNotes(nestedNotes);
 return {dimensions,properties:props,notes,unit:'mm',verified:raw.verified===true,hasTechnical:true,type:String(raw.type||'').trim(),bearingSeat:String(raw.bearingSeat||'').trim(),version:raw.version||1};
}
function imageFromExport(src){
 let value=src;
 if(value&&typeof value==='object'&&!Array.isArray(value))value=value.url||value.path||value.fileName||value.filename||value.src||null;
 if(typeof value!=='string'||!value.trim())return '';
 value=value.trim();
 if(/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(value))return value;
 if(/^https:\/\/[a-z\d.-]+(?:\:[0-9]+)?\/[a-z\d\-._~%!$&'()*+,;=:@/?#]+$/i.test(value))return value;
 if(/^(?!\.\.?\/)(?!\/)(?!.*(?:^|\/)\.\.\/)[a-z\d._\-/ ]+\.(?:webp|png|jpe?g|gif)$/i.test(value)){
   // Simple filenames are read from products/img; relative paths from products/.
   return value.includes('/')?value:'img/'+encodeURIComponent(value);
 }
 return '';
}
function slug(text){return String(text||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'other'}
function loadExport(data){
 products.length=0;labels.clear();
 if(!data||!Array.isArray(data.categories))throw Error('Expected a StockApp category export with categories[].products.');
 for(const category of data.categories){
  if(!category||!Array.isArray(category.products))continue;
  const name=String(category.name||'Other').trim(), cat=slug(name);
  labels.set(cat,name);
  for(const item of category.products){
   if(!item||!item.code||!item.name)continue;
   const legacy=parseStockDescription(item.description);
   const structured=parseStructuredTechnical(item.technicalSpecifications);
   const technical=structured||legacy;
   const dimensions=technical.dimensions.map((d,i)=>({
    ...d,letter:d.letter||String.fromCharCode(65+i),display:d.display||measurement(d.value,d.unit||'')
   }));
   const code=String(item.code).trim();
   products.push({key:cat+':'+code,category:cat,id:code,name:String(item.name).trim(),unit:String(item.unit||'pcs'),type:technical.type||'',bearingSeat:technical.bearingSeat||'',description:legacy.description,dimensions,properties:technical.properties,notes:technical.notes,technical,photo:imageFromExport(item.image),barcodes:Array.isArray(item.additionalBarcodes)?item.additionalBarcodes.filter(x=>typeof x==='string'):[]});
  }
 }
 // Remove enquiry items that no longer exist after a new StockApp export.
 for (const key of [...selected.keys()]) if(!products.some(p=>p.key===key)) selected.delete(key);
 // Rebuild chips on every reload to reflect StockApp categories without hard-coded groups.
 $('#categories').innerHTML='<button class="category" type="button" data-cat="all" aria-pressed="true">All products</button>'+[...labels.entries()].map(([id,name])=>'<button class="category" type="button" data-cat="'+escapeHTML(id)+'" aria-pressed="false">'+escapeHTML(name)+'</button>').join('');
 if(!labels.has(activeCategory))activeCategory='all';
}
async function load(){
 try{
  let data;
  if(location.protocol==='file:'){
   // Local HTML-only preview; the published website always loads the actual catalog.json.
   data=window.STOCKAPP_SAMPLE_CATALOG;
  }else{
   const r=await fetch('catalog.json',{cache:'no-store'});
   if(!r.ok)throw Error('Could not load catalog.json (HTTP '+r.status+').');
   data=await r.json();
  }
  loadExport(data);
  render();syncDetailRoute();
 }catch(err){
  console.error('Catalogue load failed:',err);
  $('#resultsInfo').textContent='Catalogue unavailable';
  $('#results').innerHTML='<div class="empty">We could not load the product catalogue. Please contact Circle Line for parts and quotes.</div>';
 }
}
function summary(p){
 const material=p.properties.find(x=>/^(material|finish|grade|property class)$/i.test(x.name));
 const lead=p.description.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean)[0]||'';
 return (lead||material?.value||p.dimensions.slice(0,2).map(d=>d.letter+' '+d.display).join(' · ')).slice(0,190);
}
function searchText(p){return [p.id,p.name,p.description,...p.barcodes,...p.dimensions.flatMap(d=>[d.key,d.label,d.value,d.display]),...p.properties.flatMap(pr=>[pr.name,pr.value])].join(' ').toLowerCase()}
function render(){
 const matching=products.filter(p=>(activeCategory==='all'||p.category===activeCategory)&&(!query||searchText(p).includes(query)));
 $('#resultsInfo').textContent=matching.length+' '+(matching.length===1?'product':'products')+(activeCategory==='all'?'':' · '+labels.get(activeCategory));
 $('#categories').querySelectorAll('.category').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cat===activeCategory)));
 if(!products.length)$('#results').innerHTML='<div class="empty">No products were included in this StockApp export.</div>';
 else if(!matching.length)$('#results').innerHTML='<div class="empty">No matching parts. Try another search, or enquire about a custom machined part.</div>';
 else $('#results').innerHTML=matching.slice(0,visible).map(p=>{
  const isSelected=selected.has(p.key),qty=selected.get(p.key)||1;
  const img=p.photo?'<img src="'+escapeHTML(p.photo)+'" alt="" loading="lazy" class="stock-image">':'';
  return '<article class="product'+(isSelected?' selected':'')+'" data-key="'+escapeHTML(p.key)+'">'+
   '<a class="product-card-link" href="part/'+slug(p.id)+'/" aria-label="View details and dimensions for '+escapeHTML(p.name)+'"></a>'+
   '<div class="product-thumb" aria-hidden="true">'+escapeHTML(p.name[0]||'P')+img+'</div>'+
   '<div class="product-details"><div class="product-code">'+escapeHTML(p.id)+' · '+escapeHTML(labels.get(p.category))+'</div><h3 class="product-name">'+escapeHTML(p.name)+'</h3><p class="product-sub" title="'+escapeHTML(summary(p))+'">'+escapeHTML(summary(p))+'</p></div>'+
   '<div class="product-actions"><label class="qty-wrap">Quantity<input class="qty" type="number" min="1" max="1000000" step="1" inputmode="numeric" value="'+qty+'" aria-label="Quantity for '+escapeHTML(p.id)+'"></label><button type="button" class="add-btn" aria-pressed="'+isSelected+'">'+(isSelected?'Update quantity':'Add to enquiry')+'</button>'+(isSelected?'<button class="remove-btn" type="button">Remove</button>':'')+'</div></article>';
 }).join('');
 $('#more').innerHTML=matching.length>visible?'<button type="button" class="more-btn">Show more ('+(matching.length-visible)+')</button>':'';
 document.querySelectorAll('.stock-image').forEach(img=>img.addEventListener('error',()=>img.remove(),{once:true}));
 updateQuoteBar();
}
function validQty(v){const n=Number(v);return Number.isSafeInteger(n)&&n>=1&&n<=1000000?n:null}
function updateQuoteBar(){const n=selected.size;$('#quoteBar').hidden=!n;$('#quoteCount').textContent=n+' '+(n===1?'item':'items')+' selected';document.body.style.paddingBottom=n?'100px':'0';try{sessionStorage.setItem('circleLineEnquiryV1',JSON.stringify(Object.fromEntries(selected)))}catch(e){/* Storage unavailable */}}
$('#results').addEventListener('click',e=>{
 const button=e.target.closest('.add-btn,.remove-btn');if(!button)return;
 const article=button.closest('.product'),key=article.dataset.key,input=article.querySelector('.qty');
 if(button.classList.contains('remove-btn')){selected.delete(key);personalNotes.delete(key);saveNotes();render();return;}
 const qty=validQty(input.value);
 if(!qty){input.focus();input.setCustomValidity('Enter a whole-number quantity between 1 and 1,000,000.');input.reportValidity();return;}
 selected.set(key,qty);render();
});
function saveNotes(){try{sessionStorage.setItem('circleLineEnquiryNotesV1',JSON.stringify(Object.fromEntries(personalNotes)))}catch(e){}}
function quoteReview(){const wrapper=$('#enquiryItems');wrapper.innerHTML=[...selected].map(([key,qty])=>{const p=products.find(x=>x.key===key);return p?'<div class="enquiry-row" data-key="'+escapeHTML(key)+'"><div><strong>'+escapeHTML(p.name)+'</strong><small>'+escapeHTML(p.id)+'</small></div><label>Qty<input type="number" min="1" step="1" max="1000000" value="'+qty+'" aria-label="Quantity for '+escapeHTML(p.name)+'"></label><button type="button" class="review-remove">Remove</button></div>':''}).join('');}
$('#reviewQuote').addEventListener('click',()=>{const d=$('#enquiryDrawer');if(d.hidden){quoteReview();d.hidden=false}else d.hidden=true;});
$('#closeEnquiry').addEventListener('click',()=>$('#enquiryDrawer').hidden=true);
$('#enquiryItems').addEventListener('click',e=>{const b=e.target.closest('.review-remove');if(!b)return;const key=b.closest('.enquiry-row').dataset.key;selected.delete(key);personalNotes.delete(key);saveNotes();quoteReview();render();if(!selected.size)$('#enquiryDrawer').hidden=true;});
$('#enquiryItems').addEventListener('change',e=>{const input=e.target.closest('input[type=number]');if(!input)return;const n=validQty(input.value);if(!n){input.reportValidity();quoteReview();return;}selected.set(input.closest('.enquiry-row').dataset.key,n);render();});
function categoryCustomMail(category){const label=labels.get(category)||'Engineering parts';sendMail({subject:'Custom RFQ: '+label,body:'Hello Circle Line,\n\nI would like a quote for a custom part in the '+label+' category.\n\nPart description / drawing reference: \nMaterial: \nDimensions: \nQuantity: \nAdditional requirements: \n\nPlease advise availability and lead time.\n\nThank you.'});}
$('#customCategory').addEventListener('click',()=>categoryCustomMail(activeCategory));
$('#results').addEventListener('input',e=>{if(!e.target.matches('.qty'))return;const input=e.target;input.setCustomValidity('');const key=input.closest('.product').dataset.key;if(selected.has(key)){const n=validQty(input.value);if(n)selected.set(key,n)}});
$('#categories').addEventListener('click',e=>{const button=e.target.closest('[data-cat]');if(!button)return;activeCategory=button.dataset.cat;visible=18;$('#categoryCustom').hidden=activeCategory==='all';render()});
$('#search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();visible=18;render()});
$('#more').addEventListener('click',()=>{visible+=18;render()});
$('#clearQuote').addEventListener('click',()=>{selected.clear();personalNotes.clear();saveNotes();$('#enquiryDrawer').hidden=true;$('#status').textContent='';render()});
function quoteMail(p,qty){
 const lines=['Hello Circle Line,','','Could you please quote this part?','','Product: '+p.name,'Code: '+p.id,'Quantity: '+qty+' '+p.unit,''];
 p.dimensions.forEach(d=>lines.push(d.letter+' — '+d.label+': '+d.display));
 p.properties.forEach(d=>lines.push(d.name+': '+d.value));
 if(personalNotes.get(p.key))lines.push('Custom requirements: '+personalNotes.get(p.key));
 lines.push('','Please confirm specifications, price, availability and lead time.','','Thank you.');
 return {subject:'RFQ: '+p.id,body:lines.join('\n')};
}
function allMail(){
 const lines=['Hello Circle Line,','','Please quote the following products:',''];let n=0;
 for(const [key,qty] of selected){const p=products.find(x=>x.key===key);if(!p)continue;n++;lines.push(n+'. '+p.name,'   Code: '+p.id,'   Quantity: '+qty+' '+p.unit,...(personalNotes.get(key)?['   Custom requirements: '+personalNotes.get(key)]:[]),'')}
 lines.push('Please confirm specifications, price, availability and lead time.','','Thank you.');
 return {subject:n===1?'RFQ: '+products.find(p=>selected.has(p.key)).id:'RFQ: '+n+' products',body:lines.join('\n')};
}
function sendMail(msg){location.href='mailto:'+EMAIL+'?subject='+encodeURIComponent(msg.subject)+'&body='+encodeURIComponent(msg.body)}
$('#emailQuote').addEventListener('click',()=>{if(selected.size)sendMail(allMail());$('#status').textContent='Review the draft in your email app before sending.'});
$('#copyQuote').addEventListener('click',async()=>{
 if(!selected.size)return;
 const m=allMail(),text='To: '+EMAIL+'\nSubject: '+m.subject+'\n\n'+m.body;
 try{await navigator.clipboard.writeText(text);$('#status').textContent='Enquiry copied to clipboard.'}
 catch(e){const el=document.createElement('textarea');el.value=text;el.style.cssText='position:fixed;left:-9999px';document.body.appendChild(el);el.select();const ok=document.execCommand('copy');el.remove();$('#status').textContent=ok?'Enquiry copied.':'Copy failed; please use Email enquiry.'}
});
$('#customEmail').href='mailto:'+EMAIL+'?subject='+encodeURIComponent('RFQ: Custom machined parts')+'&body='+encodeURIComponent('Hello Circle Line,\n\nI would like a quote for a custom machined part. I can provide a drawing or sample.\n\nMaterial: \nQuantity: \nRequirements: \n\nThank you.');
const menu=$('#navLinks'),hamburger=$('#hamburger');
function setMenu(open){menu.classList.toggle('open',open);hamburger.setAttribute('aria-expanded',String(open))}
hamburger.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
menu.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

// Technical diagrams come from editable SVG templates in technical-patterns/svg/.
// The preview page and catalogue both use the same registry and vector sources.
function specHint(d){
 const label=d.label.toLowerCase();
 if(/flange/.test(label))return 'Dimension of the raised flange feature, not the main body.';
 if(/outside|outer diameter|rolling diameter/.test(label))return 'Measured across the outer surface of the named feature.';
 if(/bore|inside diameter/.test(label))return 'Measured across the opening through the part.';
 if(/bearing seat depth/.test(label))return 'Axial depth of the recessed bearing pocket on the named side.';
 if(/bearing seat diameter/.test(label))return 'Diameter of the recessed pocket for the bearing on the named side.';
 if(/bottom flat/.test(label))return 'Width of the flat at the bottom of the V groove.';
 if(/flute count/.test(label))return 'Number of cutting flutes, not a length in millimetres.';
 if(/length under head/.test(label))return 'Length measured from beneath the head to the end of the threaded shank.';
 if(/length|width|height|thickness/.test(label))return 'Measured between the two relevant faces or edges.';
 if(/thread diameter|thread size|nominal fastener/.test(label))return 'Nominal metric thread or fastener designation; not the head width.';
 if(/pitch/.test(label))return 'Distance between corresponding points of adjacent threads.';
 if(/across.flats/.test(label))return 'Distance between two opposite parallel faces of the hexagon.';
 if(/slot/.test(label))return 'Slot reference dimension; check the mating part drawing.';
 if(/radius/.test(label))return 'Radius of the curved groove, not the overall diameter.';
 if(/angle/.test(label))return 'Included angle between the two sides of the groove.';
 if(/groove depth/.test(label))return 'Radial depth below the outside rolling surface.';
 return 'Refer to the drawing and confirm the specified measuring points.';
}
function detailHTML(p){
 const dimensionRows=p.dimensions.map(d=>'<button type="button" class="tech-dimension" data-dimension-key="'+escapeHTML(d.key)+'" aria-pressed="false" title="Show '+escapeHTML(d.label)+' on the drawing"><span class="tech-dimension-key">'+escapeHTML(d.letter)+'</span><span class="tech-dimension-label">'+escapeHTML(d.label)+'</span><strong class="tech-dimension-value">'+escapeHTML(d.display)+'</strong></button>').join('');
 const props=p.properties.map(d=>'<div class="prop-row"><span>'+escapeHTML(d.name)+'</span><strong>'+escapeHTML(d.value)+'</strong></div>').join('');
 const photo=p.photo?'<img class="detail-photo" src="'+escapeHTML(p.photo)+'" alt="Photo of '+escapeHTML(p.name)+'" loading="lazy">':'<div class="photo-placeholder"><strong>Product photo not available</strong><span>The StockApp export did not include an image for this product.</span></div>';
 const notes=p.notes.length?p.notes.map(note=>'<p class="spec-caution">'+escapeHTML(note)+'</p>').join(''):'<p class="spec-caution">Confirm the required specifications before ordering or manufacturing.</p>';
 const warning=p.technical.hasTechnical&&!p.technical.verified?'The exported technical specifications have not been independently verified. Confirm all dimensions before ordering.':'Dimensions are guides only. Confirm any tolerances, standards and fit requirements before ordering.';
 const accordion=(title,content)=>'<details class="accordion"><summary>'+title+'</summary><div class="accordion-body">'+content+'</div></details>';
 const isRoller=['v_groove','radius_groove','flat_bottom_v_groove'].includes(p.type);
 return '<div class="container"><button type="button" class="back-products" id="backProducts">← Back to all products</button><div class="detail-overline">'+escapeHTML(labels.get(p.category))+' / '+escapeHTML(p.id)+'</div><h1 class="detail-title">'+escapeHTML(p.name)+'</h1><p class="detail-lead">'+escapeHTML(p.description||'Please refer to the exported technical specifications below.')+'</p>'+
 '<div class="detail-layout tech-browser" id="catalogTechBrowser" data-primary-view="'+(isRoller?'axial':'first')+'"><section class="draw-panel tech-drawing-panel" aria-label="Technical drawing"><h2>Technical drawing</h2><div class="tech-view-tabs" id="catalogPatternTabs" role="group" aria-label="Drawing views"></div><div class="tech-views" id="catalogPatternViews"><div class="pattern-loading">Loading technical template…</div></div><p class="tech-instruction" role="status" aria-live="polite"></p><p class="drawing-warning"><strong>Illustrative guide only — not to scale.</strong> '+escapeHTML(warning)+'</p></section>'+
 '<section class="spec-panel tech-measures-panel"><h2>Dimensions</h2><p class="tech-panel-subtitle">Select any measurement to show its reference in the drawing. The view changes automatically when needed.</p><div class="tech-dimension-list">'+(dimensionRows||'<p>Dimensions are not available for this product.</p>')+'</div></section></div>'+
 '<section class="spec-panel tech-extra-panel"><h2>More information</h2><div class="detail-accordion">'+
 accordion('Product photo','<div class="reference-gallery reference-single"><div class="reference-card"><div class="reference-body">'+photo+'</div></div></div>')+
 (props?accordion('Material &amp; other details','<div class="prop-list">'+props+'</div>'):'')+
 accordion('Technical notes',notes+'<p class="verification-note">'+escapeHTML(warning)+'</p>')+
 '</div><section class="detail-enquiry"><h3>Request a quote</h3><p>Quote this StockApp product using code <strong>'+escapeHTML(p.id)+'</strong>.</p><label class="detail-custom-label">Custom enquiry / requirements for this product<textarea id="detailCustom" maxlength="2000" placeholder="Special material, dimensions, tolerances or drawing reference">'+escapeHTML(personalNotes.get(p.key)||'')+'</textarea></label><div class="detail-enquiry-actions"><label class="detail-qty-label">Quantity<input id="detailQty" type="number" min="1" max="1000000" step="1" inputmode="numeric" value="'+(selected.get(p.key)||1)+'"></label><button class="primary" id="detailAdd" type="button">'+(selected.has(p.key)?'Update enquiry':'Add to enquiry')+'</button><button id="detailRemove" class="detail-remove" type="button"'+(selected.has(p.key)?'':' hidden')+'>Remove from enquiry</button><button class="detail-mail" id="detailMail" type="button">Email about this part</button></div><p class="detail-feedback" id="detailFeedback" role="status" aria-live="polite"></p></section></section></div>';
}
function showDetail(p){
 if(!p)return;
 openProduct=p.key;
 $('#detailView').innerHTML=detailHTML(p);
 $('#detailView').hidden=false;
 $('.catalog').hidden=true;
 // Load the same template SVG files used by technical-patterns/index.html.
 const patternTarget=$('#catalogPatternViews');
 if(window.CircleLinePatterns){
  window.CircleLinePatterns.forProduct(p).then(({views})=>{
   if(openProduct!==p.key||!patternTarget.isConnected)return;
   if(!views.length){patternTarget.innerHTML='<div class="pattern-loading">No drawing template for this product type. See Dimension details below.</div>';return}
   const tabs=$('#catalogPatternTabs');
   tabs.innerHTML=views.map((v,i)=>'<button type="button" class="tech-view-tab" data-view-index="'+i+'" aria-pressed="false">'+escapeHTML(v.name)+'</button>').join('');
   patternTarget.innerHTML=views.map((view,i)=>'<div class="tech-view" data-view-index="'+i+'" data-view-name="'+escapeHTML(view.name)+'" hidden>'+view.svg+'</div>').join('')+'<div class="tech-current-view" aria-live="polite"></div>';
   window.CircleLineTechnicalViewer?.mount($('#catalogTechBrowser'));
  }).catch(error=>{
   console.warn('Technical template unavailable:',error);
   if(patternTarget.isConnected)patternTarget.innerHTML='<div class="pattern-loading">Technical drawing unavailable. Dimensions are listed below.</div>';
  });
 }else patternTarget.innerHTML='<div class="pattern-loading">Technical templates unavailable.</div>';
 document.title=p.name+' | Circle Line Engineering Ltd';
 window.scrollTo({top:0,behavior:'instant'});
 document.querySelectorAll('.detail-photo').forEach(img=>img.addEventListener('error',()=>{img.replaceWith(Object.assign(document.createElement('div'),{className:'photo-placeholder',textContent:'Product photo could not be loaded. Check its image path in catalog.json.'}))},{once:true}));
 $('#backProducts').addEventListener('click',()=>{location.hash='';syncDetailRoute()});
 $('#detailAdd').addEventListener('click',()=>{const input=$('#detailQty'),n=validQty(input.value);if(!n){input.setCustomValidity('Enter a whole-number quantity between 1 and 1,000,000.');input.reportValidity();return}input.setCustomValidity('');selected.set(p.key,n);personalNotes.set(p.key,$('#detailCustom').value.trim());saveNotes();$('#detailFeedback').textContent='Saved '+n+' '+p.unit+' to your enquiry.';$('#detailAdd').textContent='Update enquiry';$('#detailRemove').hidden=false;render()});
 $('#detailRemove').addEventListener('click',()=>{selected.delete(p.key);personalNotes.delete(p.key);saveNotes();$('#detailCustom').value='';$('#detailAdd').textContent='Add to enquiry';$('#detailRemove').hidden=true;$('#detailFeedback').textContent='Removed from your enquiry.';render()});
 $('#detailCustom').addEventListener('change',()=>{if(selected.has(p.key)){personalNotes.set(p.key,$('#detailCustom').value.trim());saveNotes();}});
 $('#detailQty').addEventListener('input',()=>$('#detailQty').setCustomValidity(''));
 $('#detailMail').addEventListener('click',()=>{const input=$('#detailQty'),n=validQty(input.value);if(!n){input.setCustomValidity('Enter a valid whole-number quantity.');input.reportValidity();return}input.setCustomValidity('');personalNotes.set(p.key,$('#detailCustom').value.trim());saveNotes();sendMail(quoteMail(p,n));$('#detailFeedback').textContent='Review the draft in your email app before sending.'});
}
function syncDetailRoute(){
 let hash='';try{hash=decodeURIComponent(location.hash.slice(1))}catch(e){hash=location.hash.slice(1)}
 if(hash.startsWith('part/')){
  const key=hash.slice(5),p=products.find(x=>x.key===key);
  if(p){if(openProduct!==p.key||$('#detailView').hidden)showDetail(p);return}
 }
 openProduct=null;
 $('#detailView').hidden=true;
 $('.catalog').hidden=false;
 document.title='Engineering Parts Catalogue Auckland | Circle Line Engineering';
}
window.addEventListener('hashchange',syncDetailRoute);
load();
})();
