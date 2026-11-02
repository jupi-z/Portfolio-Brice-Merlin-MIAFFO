import fs from 'node:fs';
import path from 'node:path';
const base=path.resolve('src/content');
const fr=JSON.parse(fs.readFileSync(path.join(base,'static-fr.json'),'utf8'));
const en=JSON.parse(fs.readFileSync(path.join(base,'static-en.json'),'utf8'));
const trFr=JSON.parse(fs.readFileSync(path.join(base,'catalogue-fr.json'),'utf8'));
const trEn=JSON.parse(fs.readFileSync(path.join(base,'catalogue-en.json'),'utf8'));
const fail=[];
for(const key of Object.keys(fr))if(!en[key])fail.push(`Missing English key ${key}`);
for(const key of Object.keys(en))if(!fr[key])fail.push(`Unknown English key ${key}`);
if(Object.keys(fr).length!==175)fail.push(`Unexpected source string count ${Object.keys(fr).length}`);
const expected=[1,2,3,8,9,10,11,12,24,34,35,36];
for(const [lang, data] of [['fr',trFr],['en',trEn]]){
 if(data.training.length!==12)fail.push(`${lang}: expected 12 training programmes`);
 if(JSON.stringify(data.training.map(t=>t.id))!==JSON.stringify(expected))fail.push(`${lang}: programme id mismatch`);
 for(const t of data.training)for(const fld of ['title','cat','duration','audience','summary','themes'])if(!t[fld]||!t[fld].length)fail.push(`${lang}: ${t.id} missing ${fld}`);
 if(data.expertise.length!==4||data.career.length!==4)fail.push(`${lang}: missing expertise or timeline entries`);
}
for(const filename of fs.readdirSync('src/templates').filter(s=>s.endsWith('.html'))){
 const template=fs.readFileSync(`src/templates/${filename}`,'utf8');
 for(const key of template.matchAll(/\{\{t:(s\d{3})\}\}/g))if(!(key[1] in fr))fail.push(`Template ${filename} has unknown ${key[1]}`);
}
if(fail.length){console.error(fail.join('\n'));process.exit(1)}
console.log(`OK: ${Object.keys(fr).length} bilingual text keys, 12 programmes in each language, 4 expertise areas, 4 career records.`);
