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
function refresh(){const obj=read(),present=Object.prototype.hasOwnProperty.call(obj,key);add.textContent=present?'Update enquiry':'Add to enquiry';if(remove)remove.hidden=!present;if(present)input.value=obj[key];const n=notes();if(custom)custom.value=n[key]||'';}
input.addEventListener('input',()=>input.setCustomValidity(''));
// Capture before older inline handlers on legacy generated pages to prevent redirect.
add.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();const q=qty();if(q===null)return;const obj=read(),n=notes();obj[key]=q;if(custom)n[key]=custom.value.trim();if(save(obj,n)){status.textContent='Enquiry updated. You can remove this item or return to the catalogue.';refresh();}},true);
if(remove)remove.addEventListener('click',ev=>{ev.preventDefault();const obj=read(),n=notes();delete obj[key];delete n[key];if(save(obj,n)){status.textContent='Product removed from your enquiry.';refresh()} });
const email=document.querySelector('#email');if(email)email.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();const q=qty();if(q===null)return;const extra=custom?.value.trim()||'';const body='Hello Circle Line,\n\nPlease quote this part:\n\nProduct: '+title+'\nCode: '+code+'\nQuantity: '+q+' '+unit+(extra?'\nCustom requirements: '+extra:'')+'\n\nPlease confirm specifications, price, availability and lead time.\n\nThank you.';location.href='mailto:sales@circleline.co.nz?subject='+encodeURIComponent('RFQ: '+code)+'&body='+encodeURIComponent(body);},true);
refresh();
})();
