import header from '../templates/header.html?raw';
import nav from '../templates/mobile-nav.html?raw';
import footer from '../templates/footer.html?raw';
import home from '../templates/home.html?raw';
import parcours from '../templates/parcours.html?raw';
import expertises from '../templates/expertises.html?raw';
import formations from '../templates/formations.html?raw';
import perspectives from '../templates/perspectives.html?raw';
import contact from '../templates/contact.html?raw';
import { Lang, Page, tr, routePath, ui } from './i18n';

const templates = {header,nav,footer,home,parcours,expertises,formations,perspectives,contact};
export function renderTemplate(name:keyof typeof templates,lang:Lang):string {
 const l=ui[lang];
 const attrs:Record<string,string>={
  'Rechercher une formation…':l.search,
  'Nom et prénom':l.name,
  'nom@entreprise.com':l.email,
  'Décrivez brièvement votre besoin…':l.message,
  'Passer en mode sombre':l.themeDark,
  'Ouvrir le menu':l.menu,
  'Fermer la fiche':l.close,
  'Filtrer par catégorie':l.select,
  "Brice Miaffo, revenir à l'accueil":lang==='fr'?"Brice Miaffo, revenir à l'accueil":"Brice Miaffo, return to the homepage",
  'Navigation principale':lang==='fr'?'Navigation principale':'Main navigation',
  'Navigation mobile':lang==='fr'?'Navigation mobile':'Mobile navigation',
  "Domaines d'expertise":lang==='fr'?"Domaines d'expertise":'Areas of expertise',
  'Découvrir mon parcours':lang==='fr'?'Découvrir mon parcours':'Explore my career'
 };
 // Only first-party strings from checked-in templates/dictionaries appear in this markup.
 let s=templates[name]
  .replace(/\{\{t:(s\d{3})\}\}/g,(_,k:string)=>escapeHtml(tr(lang,k)))
  .replace(/\{\{path:(home|parcours|expertises|formations|perspectives|contact)\}\}/g,(_,p:Page)=>routePath(lang,p));
 for(const [a,b] of Object.entries(attrs))s=s.replaceAll(`="${a}"`,`="${escapeHtml(b)}"`);
 s=s.replaceAll('src="assets/','src="/assets/');
 return s;
}
export function escapeHtml(x:unknown):string {
 return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]!));
}
