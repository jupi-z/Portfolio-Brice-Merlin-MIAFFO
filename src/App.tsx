import React, { useEffect, useMemo, useRef, useState } from 'react';
import { content, Lang, Page, parsePath, routePath, Training, ui } from './content/i18n';
import { escapeHtml, renderTemplate } from './content/templates';

const homePageTitles: Record<Lang, Record<Page, string>> = {
  fr: {home:'Finance. Stratégie. Transmission.',parcours:'Mon parcours',expertises:'Mes expertises',formations:'Formations exécutives',perspectives:'Perspectives',contact:'Contact'},
  en: {home:'Finance. Strategy. Knowledge Sharing.',parcours:'My journey',expertises:'My expertise',formations:'Executive education',perspectives:'Insights',contact:'Contact'}
};
const domain = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://brice.mymadvisor.ca';

function trainingRow(t:Training, lang:Lang,featured=false) {
 const classes=featured?'featured-item':'training-item';
 return `<button type="button" class="${classes}" data-training="${t.id}" aria-label="${escapeHtml(ui[lang].view+' '+t.title)}"><span class="training-n">${t.n}</span><span class="training-name">${escapeHtml(t.title)}</span><span class="training-cat">${escapeHtml(t.cat)}</span>${featured?'':`<span class="training-duration">${escapeHtml(t.duration)}</span>`}<span class="training-go" aria-hidden="true">↗</span></button>`;
}
function expertiseRow(e:(typeof content)['fr']['expertise'][number],selected:string){
 const active=e.num===selected;
 return `<button class="expertise-row ${active?'active':''}" type="button" data-expertise="${e.num}" aria-expanded="${active?'true':'false'}"><span class="ex-num">${e.num}</span><div><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.desc)}</p></div><span class="ex-arrow">${active?'−':'↗'}</span></button>`;
}
function updateMeta(lang:Lang, page:Page) {
 const name=homePageTitles[lang][page];
 const url=`${domain}${routePath(lang,page)}`;
 document.title=`${name} | Brice Merlin MIAFFO`;
 document.documentElement.lang=lang;
 const description=lang==='fr'?
  `Brice Merlin Miaffo : ${name.toLowerCase()}. Finance d’entreprise, crédit bancaire et formation exécutive.`:
  `Brice Merlin Miaffo: ${name.toLowerCase()}. Corporate finance, banking credit and executive education.`;
 function meta(selector:string,attr:string,value:string){let el=document.head.querySelector<HTMLMetaElement>(selector);if(!el){el=document.createElement('meta');el.setAttribute(attr,value);document.head.appendChild(el);}return el;}
 meta('meta[name="description"]','name','description').content=description;
 meta('meta[property="og:title"]','property','og:title').content=document.title;
 meta('meta[property="og:description"]','property','og:description').content=description;
 meta('meta[property="og:url"]','property','og:url').content=url;
 meta('meta[property="og:type"]','property','og:type').content='website';
 meta('meta[property="og:locale"]','property','og:locale').content=lang==='fr'?'fr_CD':'en_US';
 meta('meta[name="twitter:card"]','name','twitter:card').content='summary_large_image';
 function link(rel:string,hreflang?:string){let el=document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]${hreflang?`[hreflang="${hreflang}"]`:''}`);if(!el){el=document.createElement('link');el.rel=rel;if(hreflang)el.hreflang=hreflang;document.head.appendChild(el);}return el;}
 link('canonical').href=url;
 (['fr','en'] as const).forEach(l=>link('alternate',l).href=`${domain}${routePath(l,page)}`);
 link('alternate','x-default').href=`${domain}${routePath('fr',page)}`;
 const graph={
  '@context':'https://schema.org',
  '@graph':[
   {'@type':'Person','@id':`${domain}/#brice-miaffo`,name:'Brice Merlin Miaffo',url:`${domain}/fr/`,image:`${domain}/assets/brice-miaffo-portrait.webp`,jobTitle:lang==='fr'?'Fondateur et associé gérant':'Founder and Managing Partner',worksFor:{'@type':'Organization',name:'M-Y-M Advisor',url:'https://mymadvisor.ca'}},
   {'@type':'WebPage','@id':url,url,name:document.title,inLanguage:lang,about:{'@id':`${domain}/#brice-miaffo`}}
  ]
 };
 let script=document.head.querySelector<HTMLScriptElement>('#brice-jsonld');if(!script){script=document.createElement('script');script.id='brice-jsonld';script.type='application/ld+json';document.head.appendChild(script);}script.textContent=JSON.stringify(graph);
}

export default function App({initialRoute}:{initialRoute?:{lang:Lang,page:Page}}={}){
 const [locationState,setLocationState]=useState(()=>initialRoute ?? parsePath(typeof window==='undefined'?'/fr/':window.location.pathname));
 const {lang,page}=locationState;
 const [theme,setTheme]=useState<'light'|'dark'>(()=>{
   try{return localStorage.getItem('bm:theme')==='dark'?'dark':'light';}catch{return 'light';}
 });
 const [menuOpen,setMenuOpen]=useState(false);
 const [search,setSearch]=useState('');
 const [category,setCategory]=useState('all');
 const [selectedExpertise,setSelectedExpertise]=useState('01');
 const [selectedTraining,setSelectedTraining]=useState<Training|null>(null);
 const [contactState,setContactState]=useState<'idle'|'sending'|'sent'|'error'>('idle');
 const [fallbackEmail,setFallbackEmail]=useState('');
 const modalRef=useRef<HTMLDialogElement>(null);
 const messages=ui[lang];

 const header=useMemo(()=>renderTemplate('header',lang),[lang]);
 const mobile=useMemo(()=>renderTemplate('nav',lang),[lang]);
 const footer=useMemo(()=>renderTemplate('footer',lang),[lang]);
 const body=useMemo(()=>{
   let markup=renderTemplate(page,lang);
   const programmes=content[lang].training;
   const domains=content[lang].expertise;
   // Also supply meaningful markup during static prerendering, not only after hydration.
   if(page==='home'){
    const featured=[programmes[0],programmes[1],programmes[10],programmes[11]].map(t=>trainingRow(t,lang,true)).join('');
    markup=markup.replace(/(<[^>]+id="featuredTraining"[^>]*>)(<\/[^>]+>)/,`$1${featured}$2`);
    const expertise=domains.map(e=>expertiseRow(e,'01')).join('');
    markup=markup.replace(/(<[^>]+id="expertiseList"[^>]*>)(<\/[^>]+>)/,`$1${expertise}$2`);
   }
   if(page==='formations'){
    markup=markup.replace(/(<[^>]+id="trainingResults"[^>]*>)(<\/[^>]+>)/,`$1${programmes.map(t=>trainingRow(t,lang)).join('')}$2`);
   }
   if(page==='expertises'){
    const detail=domains.map(e=>`<article class="expertise-row" style="cursor:default"><span class="ex-num">${e.num}</span><div><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.desc)}</p><p>${escapeHtml(e.detail)}</p></div><span class="ex-arrow">↗</span></article>`).join('');
    markup=markup.replace(/(<[^>]+id="expertiseDetailList"[^>]*>)(<\/[^>]+>)/,`$1${detail}$2`);
   }
   return markup;
  },[page,lang]);
 const list=content[lang].training;
 const expertises=content[lang].expertise;
 const filtered=useMemo(()=>list.filter(t=>(category==='all'||t.category===category)&&(!search||[t.title,t.cat,t.summary,t.audience].join(' ').toLocaleLowerCase(lang).includes(search.toLocaleLowerCase(lang)))),[category,lang,list,search]);

 function go(lang:Lang,page:Page){
  const path=routePath(lang,page);
  if(window.location.pathname!==path)history.pushState(null,'',path);
  setLocationState({lang,page});setMenuOpen(false);setContactState('idle');setFallbackEmail('');
  window.scrollTo({top:0,behavior:'instant'});
 }
 function changeLang(next:Lang){go(next,page);}

 useEffect(()=>{
  const onPop=()=>{setLocationState(parsePath(location.pathname));setMenuOpen(false);};
  window.addEventListener('popstate',onPop);
  if(location.pathname==='/'||!/^\/(fr|en)(\/|$)/.test(location.pathname))history.replaceState(null,'',routePath('fr','home'));
  return()=>window.removeEventListener('popstate',onPop);
 },[]);
 useEffect(()=>{
  document.documentElement.dataset.mode=theme;
  document.documentElement.dataset.theme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#172227':'#fbfaf6');
  try{localStorage.setItem('bm:theme',theme);}catch{/* storage may be unavailable */}
 },[theme]);
 useEffect(()=>{updateMeta(lang,page);},[lang,page]);
 useEffect(()=>{
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach(a=>{
   const active=a.dataset.nav===page;a.classList.toggle('active',active);
   active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');
  });
  const nav=document.querySelector<HTMLElement>('#mobileNav');if(nav)nav.hidden=!menuOpen;
  const toggle=document.querySelector<HTMLButtonElement>('#menuToggle');
  if(toggle){toggle.setAttribute('aria-expanded',String(menuOpen));toggle.setAttribute('aria-label',menuOpen?messages.closeMenu:messages.menu);}
  const themeSwitch=document.querySelector<HTMLButtonElement>('#themeToggle');
  if(themeSwitch)themeSwitch.setAttribute('aria-label',theme==='dark'?messages.themeLight:messages.themeDark);
 },[page,menuOpen,lang,theme,messages]);
 useEffect(()=>{
  const featured=document.querySelector<HTMLElement>('#featuredTraining');
  if(featured)featured.innerHTML=[list[0],list[1],list[10],list[11]].map(t=>trainingRow(t,lang,true)).join('');
  const results=document.querySelector<HTMLElement>('#trainingResults');
  if(results)results.innerHTML=filtered.length?filtered.map(t=>trainingRow(t,lang)).join(''):`<div class="training-zero">${escapeHtml(messages.empty)}<br/>${escapeHtml(messages.modify)}</div>`;
  const count=document.querySelector<HTMLElement>('#trainingCount');if(count)count.textContent=String(filtered.length);
 },[page,lang,search,category,list,filtered,messages]);
 useEffect(()=>{
  const el=document.querySelector<HTMLElement>('#expertiseList');
  if(el)el.innerHTML=expertises.map(e=>expertiseRow(e,selectedExpertise)).join('');
  const detail=document.querySelector<HTMLElement>('#expertiseDetailList');
  if(detail)detail.innerHTML=expertises.map(e=>`<article class="expertise-row" style="cursor:default"><span class="ex-num">${e.num}</span><div><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.desc)}</p><p>${escapeHtml(e.detail)}</p></div><span class="ex-arrow">↗</span></article>`).join('');
  const visual=document.querySelector<HTMLElement>('#expertiseVisual');
  if(visual){const title=expertises.find(e=>e.num===selectedExpertise)?.title||'';const n=visual.querySelector('.visual-top span:first-child');if(n)n.textContent=`${lang==='fr'?'POSITIONNEMENT':'POSITIONING'} / ${selectedExpertise}—04`;const label=visual.querySelector('.visual-bottom span:first-child');if(label)label.textContent=title.toLocaleUpperCase(lang);}
 },[page,lang,expertises,selectedExpertise]);
 useEffect(()=>{
  const year=document.querySelector<HTMLElement>('#year');if(year)year.textContent=String(new Date().getFullYear());
  const s=document.querySelector<HTMLInputElement>('#trainingSearch');if(s){s.value=search;s.placeholder=messages.search;}
  const f=document.querySelector<HTMLSelectElement>('#trainingFilter');if(f){f.value=category;f.setAttribute('aria-label',messages.select);}
  // Replace the original 'mailto demo' note with the factual production description.
  const note=document.querySelector<HTMLElement>('#contactForm + .form-note, #contactForm .form-note');
  if(note)note.textContent=messages.ready;
 },[page,lang,category,search,messages]);
 useEffect(()=>{
  const d=modalRef.current;
  if(selectedTraining){if(d&&!d.open)d.showModal();}else if(d?.open)d.close();
 },[selectedTraining]);

 function handleClick(e:React.MouseEvent<HTMLDivElement>){
  const element=e.target as Element;
  const languageButton=element.closest<HTMLButtonElement>('[data-language]');
  if(languageButton){changeLang(languageButton.dataset.language==='en'?'en':'fr');return;}
  if(element.closest('#themeToggle')){setTheme(m=>m==='dark'?'light':'dark');return;}
  if(element.closest('#menuToggle')){setMenuOpen(v=>!v);return;}
  const training=element.closest<HTMLButtonElement>('[data-training]');
  if(training){setSelectedTraining(list.find(t=>t.id===Number(training.dataset.training))??null);return;}
  const expertise=element.closest<HTMLButtonElement>('[data-expertise]');
  if(expertise){setSelectedExpertise(expertise.dataset.expertise||'01');return;}
  const anchor=element.closest<HTMLAnchorElement>('a[href]');
  if(anchor){
   const target=new URL(anchor.href,location.href);
   if(target.origin===location.origin&&/^\/(fr|en)(\/|$)/.test(target.pathname)){
    e.preventDefault();const route=parsePath(target.pathname);go(route.lang,route.page);
   }
  }
 }
 function handleInput(e:React.FormEvent<HTMLDivElement>){
  const el=e.target as HTMLInputElement;
  if(el.id==='trainingSearch')setSearch(el.value);
 }
 function handleChange(e:React.FormEvent<HTMLDivElement>){
  const el=e.target as HTMLSelectElement;
  if(el.id==='trainingFilter')setCategory(el.value);
 }
 async function handleSubmit(e:React.FormEvent<HTMLDivElement>){
  if(!(e.target instanceof HTMLFormElement)||e.target.id!=='contactForm')return;
  e.preventDefault();if(contactState==='sending')return;
  const form=e.target;
  if(!form.reportValidity())return;
  const fields=new FormData(form);
  const data={name:String(fields.get('name')||'').trim(),email:String(fields.get('email')||'').trim(),subject:String(fields.get('subject')||'').trim(),message:String(fields.get('message')||'').trim(),honeypot:String(fields.get('company_site')||''),language:lang};
  const mailSubject=`[Portfolio Brice Miaffo] ${data.subject}`;
  const mailBody=`${data.message}\n\n— ${data.name}\n${data.email}`;
  setFallbackEmail(`mailto:mym@mymadvisor.ca?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`);
  setContactState('sending');
  try {
   const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),15000);
   let response:Response;
   try{response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});}
   finally{window.clearTimeout(timer);}
   if(!response.ok)throw new Error('Delivery not confirmed');
   const json=await response.json();if(json?.ok!==true)throw new Error('Delivery not confirmed');
   setContactState('sent');form.reset();
  } catch {setContactState('error');}
 }
 const pageMarkup=body;
 const localeMarkup=header.replace('class="language-option" data-language="fr"',`class="language-option ${lang==='fr'?'active':''}" data-language="fr" aria-pressed="${lang==='fr'}"`).replace('class="language-option" data-language="en"',`class="language-option ${lang==='en'?'active':''}" data-language="en" aria-pressed="${lang==='en'}"`);

 return <div onClick={handleClick} onInput={handleInput} onChange={handleChange} onSubmit={handleSubmit}>
  <a href="#main" className="skip-link">{lang==='fr'?'Aller au contenu':'Skip to content'}</a>
  <div className="page-wrap">
   <div dangerouslySetInnerHTML={{__html:localeMarkup}} />
   <div dangerouslySetInnerHTML={{__html:mobile}} />
   <main id="main"><div className="page-view" data-page={page} dangerouslySetInnerHTML={{__html:pageMarkup}} />
    {page==='contact'&&contactState!=='idle'&&<div className="section-pad" style={{paddingTop:0}}>
     <div className="contact-feedback" role={contactState==='error'?'alert':'status'}>
      {contactState==='sending'?messages.sending:contactState==='sent'?messages.sent:messages.failed}
      {contactState==='error'&&fallbackEmail&&<> <a style={{textDecoration:'underline'}} href={fallbackEmail}>{messages.fallback}</a></>}
     </div>
    </div>}
   </main>
   <div dangerouslySetInnerHTML={{__html:footer}} />
  </div>
  <dialog ref={modalRef} className="modal" aria-labelledby="modalTitle" onClose={()=>setSelectedTraining(null)} onClick={e=>{if(e.target===modalRef.current)setSelectedTraining(null)}}>
   <div className="modal-box training-modal">
    <button className="modal-close btn btn-ghost" type="button" aria-label={messages.close} onClick={()=>setSelectedTraining(null)}>×</button>
    {selectedTraining&&<>
     <div className="micro-title">MASTERCLASS / {selectedTraining.n} · {selectedTraining.cat.toUpperCase()}</div>
     <h2 id="modalTitle">{selectedTraining.title}</h2>
     <p>{selectedTraining.summary}</p>
     <div className="modal-info"><span>◷ {selectedTraining.duration}</span><span>{messages.mode}</span></div>
     <p><b>{messages.audience}</b><br/>{selectedTraining.audience}</p>
     <p><b>{messages.syllabus}</b></p>
     <ul className="modal-syllabus">{selectedTraining.themes.map(s=><li key={s}>{s}</li>)}</ul>
     <a className="btn btn-primary btn-large modal-cta" href={`mailto:mym@mymadvisor.ca?subject=${encodeURIComponent((lang==='fr'?'Renseignements formation : ':'Training enquiry: ')+selectedTraining.title)}`}>
      {messages.ask} <span className="button-circle">↗</span>
     </a>
     <p style={{fontSize:11}}>{messages.disclaimer}</p>
    </>}
   </div>
  </dialog>
 </div>;
}
