import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

const pages=['home','parcours','expertises','formations','perspectives','contact'];
const languages=['fr','en'];
const output=path.resolve('dist');
const base=process.env.VITE_PUBLIC_SITE_URL||'https://brice.mymadvisor.ca';
const original=fs.readFileSync(path.join(output,'index.html'),'utf8');
const vite=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error'});
try {
 const {default:App}=await vite.ssrLoadModule('/src/App.tsx');
 for(const lang of languages)for(const page of pages){
  const suffix=page==='home'?'':`${page}/`;
  const url=`/${lang}/${suffix}`;
  const pageTitle=lang==='fr'?'Brice Merlin MIAFFO — Portfolio professionnel':'Brice Merlin MIAFFO — Professional Portfolio';
  const desc=lang==='fr'?'Expertises en finance, ingénierie du crédit, gouvernance et formation exécutive.':'Expertise in corporate finance, banking credit, governance and executive education.';
  const markup=renderToString(React.createElement(App,{initialRoute:{lang,page}}));
  const escapedTitle=pageTitle.replaceAll('&','&amp;');
  const alts=languages.map(l=>`<link rel="alternate" hreflang="${l}" href="${base}/${l}/${suffix}">`).join('\n');
  const canonical=`<link rel="canonical" href="${base}${url}">`;
  const html=original.replace('<html lang="fr"',`<html lang="${lang}"`)
   .replace('<div id="root"></div>',`<div id="root">${markup}</div>`)
   .replace(/<title>.*?<\/title>/,`<title>${escapedTitle}</title>`)
   .replace(/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${desc}" />`)
   .replace('</head>',`${canonical}\n${alts}\n</head>`);
  const dir=path.join(output,lang,...(page==='home'?[]:[page]));
  fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html);
  console.log('Prerendered',url);
 }
}finally{await vite.close();}
