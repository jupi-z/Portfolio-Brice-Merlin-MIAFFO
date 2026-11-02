import express from 'express';
import nodemailer from 'nodemailer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const app=express();
const port=Number(process.env.PORT)||3000;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const build=path.join(root,'dist');
const publicUrl=process.env.PUBLIC_SITE_URL||'https://brice.mymadvisor.ca';
const origin=process.env.ALLOWED_ORIGIN || publicUrl;
const maxBody='12kb';
const requests=new Map();

app.disable('x-powered-by');
app.use((req,res,next)=>{
 res.set({
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'X-Frame-Options':'DENY',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Resource-Policy':'same-origin'
 });
 next();
});
app.use(express.json({limit:maxBody}));

const isEmail=(s)=>typeof s==='string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length<=254;
const safe=(s,max)=>typeof s==='string' && s.trim().length>=1 && s.trim().length<=max && !/[\u0000-\u0008\u000b\u000e-\u001f]/.test(s);
const htmlEscape=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

app.post('/api/contact',async(req,res)=>{
 const theirOrigin=req.get('origin');
 if(theirOrigin && theirOrigin!==origin)return res.status(403).json({ok:false,code:'forbidden_origin'});
 const now=Date.now();const ip=req.ip||req.socket.remoteAddress||'unknown';
 const existing=requests.get(ip)||[];
 const recent=existing.filter(t=>now-t<60*60*1000);
 if(recent.length>=5)return res.status(429).json({ok:false,code:'rate_limited'});
 recent.push(now);requests.set(ip,recent);
 // In-memory limit only; a shared proxy/server-side rate limiter is recommended for multi-instance deployment.
 const {name,email,subject,message,honeypot,language}=req.body||{};
 if(honeypot)return res.status(200).json({ok:true});
 if(!safe(name,100)||!isEmail(email)||!safe(subject,120)||!safe(message,4000)||message.trim().length<15||!['fr','en'].includes(language))
  return res.status(400).json({ok:false,code:'invalid_input'});
 const env=['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM','CONTACT_TO'];
 if(env.some(k=>!process.env[k]))return res.status(503).json({ok:false,code:'mail_not_configured'});
 try{
  const transport=nodemailer.createTransport({
   host:process.env.SMTP_HOST, port:Number(process.env.SMTP_PORT), secure:Number(process.env.SMTP_PORT)===465,
   requireTLS:Number(process.env.SMTP_PORT)!==465,
   auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},
   tls:{minVersion:'TLSv1.2'}
  });
  await transport.sendMail({
   from:process.env.SMTP_FROM,
   to:process.env.CONTACT_TO,
   replyTo:{name,email},
   subject:`[Portfolio Brice Miaffo] ${subject.trim()}`,
   text:`Langue: ${language}\nNom: ${name.trim()}\nCourriel: ${email}\nObjet: ${subject.trim()}\n\n${message.trim()}`,
   html:`<p><strong>Langue:</strong> ${htmlEscape(language)}</p><p><strong>Nom:</strong> ${htmlEscape(name.trim())}</p><p><strong>Courriel:</strong> ${htmlEscape(email)}</p><p><strong>Objet:</strong> ${htmlEscape(subject.trim())}</p><p>${htmlEscape(message.trim()).replace(/\n/g,'<br>')}</p>`
  });
  return res.status(200).json({ok:true});
 }catch(e){
  console.error('SMTP delivery failed:',e instanceof Error?e.message:'unknown SMTP error');
  return res.status(502).json({ok:false,code:'delivery_failed'});
 }
});

app.get('/health',(_req,res)=>res.json({ok:true,service:'brice-portfolio'}));
if(!fs.existsSync(build)){
 console.error('Missing dist/. Run npm install && npm run build before starting the server.');
 process.exit(1);
}
app.use(express.static(build,{index:false,maxAge:'1d'}));
app.get('/',(_req,res)=>res.redirect(302,'/fr/'));
app.get(/^\/(fr|en)(\/.*)?$/,(_req,res)=>res.sendFile(path.join(build,'index.html')));
app.use((_req,res)=>res.status(404).json({ok:false,code:'not_found'}));
app.listen(port,'0.0.0.0',()=>console.log(`Brice Miaffo portfolio listening on :${port}`));
