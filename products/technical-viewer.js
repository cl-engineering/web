/* Shared dimension-to-view navigation for catalogue details and static product pages. */
(function(root){
 'use strict';
 function mount(browser){
  if(!browser||browser.dataset.viewerMounted==='true')return;
  const views=[...browser.querySelectorAll('.tech-view')];
  const nav=[...browser.querySelectorAll('.tech-view-tab')];
  const measures=[...browser.querySelectorAll('.tech-dimension')];
  const feedback=browser.querySelector('.tech-instruction');
  const current=browser.querySelector('.tech-current-view');
  if(!views.length)return;
  browser.dataset.viewerMounted='true';
  function groupsFor(view,key){return [...view.querySelectorAll('[data-dimension]')].filter(el=>el.getAttribute('data-dimension')===key)}
  function showView(i){
   const index=Math.max(0,Math.min(i,views.length-1));
   views.forEach((v,j)=>{v.hidden=j!==index;v.classList.toggle('is-active',j===index)});
   nav.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===index)));
   if(current)current.textContent=views[index].getAttribute('data-view-name')||('View '+(index+1));
  }
  function clearSelection(){
   browser.classList.remove('has-selection');
   measures.forEach(b=>b.setAttribute('aria-pressed','false'));
   views.forEach(v=>v.querySelectorAll('[data-dimension].is-highlighted').forEach(g=>g.classList.remove('is-highlighted')));
  }
  nav.forEach((button,index)=>button.addEventListener('click',()=>{
   showView(index);clearSelection();
   if(feedback)feedback.textContent='Select a measurement on the right to highlight its reference.';
  }));
  measures.forEach(button=>button.addEventListener('click',()=>{
   const key=button.getAttribute('data-dimension-key');
   const label=button.querySelector('.tech-dimension-label')?.textContent?.trim()||key;
   // Prefer the visible view if it shows the reference; otherwise switch automatically.
   let target=views.findIndex(v=>!v.hidden&&groupsFor(v,key).length);
   if(target<0)target=views.findIndex(v=>groupsFor(v,key).length);
   clearSelection();
   if(target<0){
    if(feedback)feedback.textContent=label+': the reference is not illustrated in the available views.';
    return;
   }
   showView(target);
   groupsFor(views[target],key).forEach(g=>g.classList.add('is-highlighted'));
   browser.classList.add('has-selection');
   button.setAttribute('aria-pressed','true');
   if(feedback)feedback.textContent=label+' — highlighted in '+(views[target].getAttribute('data-view-name')||'the drawing')+'.';
  }));
  const preferred=browser.getAttribute('data-primary-view')||'';
  let initial=0;
  if(preferred==='axial'){
   const i=views.findIndex(v=>/axial|section|profile/i.test(v.getAttribute('data-view-name')||''));
   if(i>=0)initial=i;
  }
  showView(initial);
  if(feedback)feedback.textContent='Select a measurement on the right to highlight its reference.';
 }
 root.CircleLineTechnicalViewer={mount};
 document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('.tech-browser').forEach(mount));
})(window);
