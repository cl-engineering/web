/* Behaviour for generated static product pages; shares selection with catalogue. */
(()=>{'use strict';
const data=window.CircleLinePartData||{};
const key=data.key||window.PRODUCT_KEY, code=data.code||window.CODE, title=data.title||window.TITLE, unit=data.unit||window.UNIT||'pcs';
const input=document.querySelector('#qty'),status=document.querySelector('#status'),add=document.querySelector('#add'),remove=document.querySelector('#remove');
if(!input||!add)return;
function read(){try{return JSON.parse(sessionStorage.getItem('circleLineEnquiryV1')||'{}')}catch(e){return {}}}
function notes(){try{return JSON.parse(sessionStorage.getItem('circleLineEnquiryNotesV1')||'{}')}catch(e){return {}}}
function save(obj,n){try{sessionStorage.setItem('circleLineEnquiryV1',JSON.stringify(obj));sessionStorage.setItem('circleLineEnquiryNotesV1',JSON.stringify(n));return true}catch(e){status.textContent='Unable to save enquiry in this browser.';return false}}
function qty(){const n=Number(input.value);if(!Number.isSafeInteger(n)||n<1||n>1000000){input.setCustomValidity('Enter a valid whole number.');input.reportValidity();return null}input.setCustomValidity('');return n}
const custom=document.querySelector('#customRequirements');
const partBar=document.querySelector('#partEnquiryBar'),partDrawer=document.querySelector('#partEnquiryDrawer');
let partLookup=new Map();
function refresh(){refreshSharedEnquiry();const obj=read(),present=Object.prototype.hasOwnProperty.call(obj,key);add.textContent=present?'Update enquiry':'Add to enquiry';if(remove)remove.hidden=!present;if(present)input.value=obj[key];const n=notes();if(custom)custom.value=n[key]||'';}
input.addEventListener('input',()=>input.setCustomValidity(''));
// Capture before older inline handlers on legacy generated pages to prevent redirect.
add.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();const q=qty();if(q===null)return;const obj=read(),n=notes();obj[key]=q;if(custom)n[key]=custom.value.trim();if(save(obj,n)){status.textContent='Enquiry updated. You can remove this item or return to the catalogue.';refresh();}},true);
if(remove)remove.addEventListener('click',ev=>{ev.preventDefault();const obj=read(),n=notes();delete obj[key];delete n[key];if(save(obj,n)){status.textContent='Product removed from your enquiry.';refresh()} });
const email=document.querySelector('#email');if(email)email.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();const q=qty();if(q===null)return;const extra=custom?.value.trim()||'';const body='Hello Circle Line,\n\nPlease quote this part:\n\nProduct: '+title+'\nCode: '+code+'\nQuantity: '+q+' '+unit+(extra?'\nCustom requirements: '+extra:'')+'\n\nPlease confirm specifications, price, availability and lead time.\n\nThank you.';location.href='mailto:sales@circleline.co.nz?subject='+encodeURIComponent('RFQ: '+code)+'&body='+encodeURIComponent(body);},true);

function safeText(text){return String(text??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function savedEntries(){return Object.entries(read()).filter(([k,v])=>Number.isSafeInteger(v)&&v>=1&&v<=1000000)}
function labelFor(k){const p=partLookup.get(k);return p?.name||((k.split(':').slice(1).join(':'))||k)}
function codeFor(k){return partLookup.get(k)?.code||(k.split(':').slice(1).join(':'))||k}
function unitFor(k){return partLookup.get(k)?.unit||'pcs'}
function refreshSharedEnquiry(){
 if(!partBar)return;
 const entries=savedEntries(),n=entries.length;
 partBar.hidden=!n;
 const count=document.querySelector('#partEnquiryCount');if(count)count.textContent=n+' '+(n===1?'item':'items')+' selected';
 document.body.style.paddingBottom=n?'calc(85px + env(safe-area-inset-bottom, 0px))':'';
 if(!n&&partDrawer)partDrawer.hidden=true;
 if(partDrawer&&!partDrawer.hidden)renderSharedReview();
}
function renderSharedReview(){
 const target=document.querySelector('#partEnquiryItems');if(!target)return;
 target.innerHTML=savedEntries().map(([k,v])=>'<div class="part-enquiry-item" data-key="'+safeText(k)+'"><div><strong>'+safeText(labelFor(k))+'</strong><small>'+safeText(codeFor(k))+'</small></div><label>Qty<input type="number" min="1" max="1000000" step="1" inputmode="numeric" value="'+v+'" aria-label="Quantity for '+safeText(codeFor(k))+'"></label><button class="part-item-remove" type="button">Remove</button></div>').join('');
}
async function loadPartLookup(){
 try{
  const response=await fetch('../../catalog.json',{cache:'no-store'});
  if(!response.ok)return;
  const catalog=await response.json();
  for(const cat of catalog.categories||[]){
   const id=String(cat.name||'Other').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'other';
   for(const p of cat.products||[]){if(p.code)partLookup.set(id+':'+p.code,{name:p.name,code:p.code,unit:p.unit});}
  }
  if(partDrawer&&!partDrawer.hidden)renderSharedReview();
 }catch(e){/* Codes are available as fallback when offline. */}
}
function allEnquiryEmail(){
 const entries=savedEntries(),n=notes();
 const lines=['Hello Circle Line,','','Please quote the following products:',''];
 entries.forEach(([k,q],i)=>{
  lines.push((i+1)+'. '+labelFor(k),'   Code: '+codeFor(k),'   Quantity: '+q+' '+unitFor(k));
  if(n[k])lines.push('   Custom requirements: '+n[k]);
  lines.push('');
 });
 lines.push('Please confirm specifications, price, availability and lead time.','','Thank you.');
 const subject=entries.length===1?'RFQ: '+codeFor(entries[0][0]):'RFQ: '+entries.length+' products';
 location.href='mailto:sales@circleline.co.nz?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
}
async function copySharedEnquiry(){
 const entries=savedEntries();if(!entries.length)return;
 const n=notes(),lines=['To: sales@circleline.co.nz','Subject: '+(entries.length===1?'RFQ: '+codeFor(entries[0][0]):'RFQ: '+entries.length+' products'),'','Hello Circle Line,','','Please quote the following products:',''];
 entries.forEach(([k,q],i)=>{lines.push((i+1)+'. '+labelFor(k),'   Code: '+codeFor(k),'   Quantity: '+q+' '+unitFor(k));if(n[k])lines.push('   Custom requirements: '+n[k]);lines.push('')});
 lines.push('Please confirm specifications, price, availability and lead time.','','Thank you.');
 const text=lines.join('\n');
 try{await navigator.clipboard.writeText(text);if(status)status.textContent='Enquiry copied to clipboard.'}
 catch(error){const field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;left:-9999px';document.body.appendChild(field);field.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}field.remove();if(status)status.textContent=ok?'Enquiry copied.':'Copy failed; please use Email enquiry.'}
}

if(partBar){
 document.querySelector('#partCopy')?.addEventListener('click',copySharedEnquiry);
 document.querySelector('#partCopyReview')?.addEventListener('click',copySharedEnquiry);
 document.querySelector('#partReview')?.addEventListener('click',()=>{partDrawer.hidden=!partDrawer.hidden;if(!partDrawer.hidden)renderSharedReview()});
 document.querySelector('#partCloseReview')?.addEventListener('click',()=>partDrawer.hidden=true);
 document.querySelector('#partEmailAll')?.addEventListener('click',allEnquiryEmail);
 document.querySelector('#partEnquiryItems')?.addEventListener('click',e=>{
  const btn=e.target.closest('.part-item-remove');if(!btn)return;
  const key=btn.closest('.part-enquiry-item').dataset.key;
  const obj=read(),n=notes();delete obj[key];delete n[key];
  if(save(obj,n))refresh();
 });
 document.querySelector('#partEnquiryItems')?.addEventListener('change',e=>{
  const target=e.target.closest('input[type=number]');if(!target)return;
  const val=Number(target.value);
  if(!Number.isSafeInteger(val)||val<1||val>1000000){target.setCustomValidity('Enter a quantity between 1 and 1,000,000.');target.reportValidity();return}
  target.setCustomValidity('');const obj=read();obj[target.closest('.part-enquiry-item').dataset.key]=val;
  if(save(obj,notes()))refresh();
 });
 loadPartLookup();
 window.addEventListener('pageshow',refresh);
 window.addEventListener('storage',refresh);
}

refresh();
})();
