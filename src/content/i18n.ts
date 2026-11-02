import fr from './static-fr.json';
import en from './static-en.json';
import catalogueFr from './catalogue-fr.json';
import catalogueEn from './catalogue-en.json';

export type Lang = 'fr' | 'en';
export const languages: Lang[] = ['fr', 'en'];
export type Page = 'home' | 'parcours' | 'expertises' | 'formations' | 'perspectives' | 'contact';
export const pages: Page[] = ['home','parcours','expertises','formations','perspectives','contact'];
export type Training = (typeof catalogueFr.training)[number];
export type Expertise = (typeof catalogueFr.expertise)[number];
export type Career = (typeof catalogueFr.career)[number];

const dictionaries: Record<Lang, Record<string,string>> = { fr, en };
export function tr(lang:Lang, key:string) {return dictionaries[lang][key] ?? dictionaries.fr[key] ?? key;}
export const content:Record<Lang,{training:Training[];expertise:Expertise[];career:Career[]}> = {fr:catalogueFr, en:catalogueEn};
export function routePath(lang:Lang, page:Page):string {return `/${lang}/${page === 'home' ? '' : page + '/'}`;}
export function parsePath(pathname:string):{lang:Lang,page:Page} {
  const parts=pathname.split('/').filter(Boolean);
  const lang:Lang=parts[0] === 'en' ? 'en' : 'fr';
  const page:Page=pages.includes(parts[1] as Page)?parts[1] as Page:'home';
  return {lang,page};
}
export const ui = {
 fr:{menu:'Ouvrir le menu',closeMenu:'Fermer le menu',themeDark:'Passer en mode sombre',themeLight:'Passer en mode clair',search:'Rechercher une formation…',name:'Nom et prénom',email:'nom@entreprise.com',message:'Décrivez brièvement votre besoin…',select:'Filtrer par catégorie',empty:'Aucune formation ne correspond à cette recherche.',modify:'Modifiez les filtres pour afficher d’autres programmes.',view:'Afficher la formation',close:'Fermer la fiche',audience:'Public concerné',syllabus:'Au programme',mode:'Présentiel · Intra-entreprise',ask:'Demander des renseignements',disclaimer:'Programme synthétisé d’après le catalogue 2026–2027 ; disponibilité et modalités à confirmer.',sending:'Envoi en cours…',sent:'Votre demande a été transmise.',failed:'La demande n’a pas pu être transmise. Réessayez ou utilisez le lien e-mail.',fallback:'Ouvrir mon application e-mail',missing:'Complétez les champs obligatoires.',subject:'Demande de rendez-vous',privacy:'En envoyant votre demande, vous acceptez d’être contacté en réponse à celle-ci.',ready:'Le formulaire transmet votre demande uniquement si le serveur de messagerie est configuré.'},
 en:{menu:'Open menu',closeMenu:'Close menu',themeDark:'Switch to dark mode',themeLight:'Switch to light mode',search:'Search training programmes…',name:'Full name',email:'name@company.com',message:'Briefly describe your needs…',select:'Filter by category',empty:'No training programmes match your search.',modify:'Change the filters to see other programmes.',view:'View programme',close:'Close details',audience:'Who should attend',syllabus:'Programme topics',mode:'In person · In-house',ask:'Request information',disclaimer:'Summary based on the 2026–2027 catalogue; availability and terms must be confirmed.',sending:'Sending…',sent:'Your enquiry has been sent.',failed:'Your enquiry could not be sent. Please retry or use the email link.',fallback:'Open my email app',missing:'Please complete all required fields.',subject:'Meeting request',privacy:'By submitting an enquiry you agree to be contacted in response.',ready:'This form sends your enquiry only when a mail server is configured.'}
} as const;
