# 📧 Resend Setup - Profesionálne Email Riešenie

## 🎯 Prečo Resend > Web3Forms?

### **Web3Forms:**
❌ Len prepošle email na tvoj email  
❌ Zákazník nedostane potvrdenie  
❌ Žiadna automatizácia  
❌ Basic funkcionalita  

### **Resend:**
✅ **Email zákazníkovi** - automatické potvrdenie  
✅ **Email obchodnému zástupcovi** - notifikácia o leade  
✅ **Vlastná doména** (emails@crossrockcapital.sk)  
✅ **Templates** - profesionálne formátované emaily  
✅ **Analytics** - trackuje otvorenia a kliky  
✅ **API** - plná kontrola  
✅ **ZADARMO** do 100 emailov/deň (3000/mesiac)  

---

## 🚀 Ako nastaviť Resend (Krok-za-krokom)

### **KROK 1: Registrácia na Resend**

1. Choď na: https://resend.com/signup
2. Registruj sa (cez Google alebo email)
3. Overte email

**Čas: 2 minúty**

---

### **KROK 2: Získaj API Key**

1. V Resend dashboarde choď na: **API Keys**
2. Klikni **"Create API Key"**
3. Názov: `Crossrock Contact Form`
4. Permissions: **Full Access**
5. **Skopíruj API Key** - ukáže sa len raz!

```
Príklad:
re_aBcDeFgH123456789
```

**DÔLEŽITÉ:** Ulož si tento kľúč niekam bezpečne!

**Čas: 1 minúta**

---

### **KROK 3: Nastav vlastnú doménu (VOLITEĽNÉ)**

**Prečo:**
- Emaily prídu z `noreply@crossrockcapital.sk`
- Nie z `onboarding@resend.dev`
- Profesionálnejšie!

**Ako:**

1. V Resend → **Domains** → **Add Domain**
2. Zadaj: `crossrockcapital.sk`
3. Resend ti ukáže DNS records na pridanie:

```
Type: TXT
Name: resend._domainkey.crossrockcapital.sk
Value: [dlhý string od Resend]
```

4. Pridaj tieto DNS záznamy u svojho registrátora (Websupport, GoDaddy...)
5. Počkaj 15-30 minút na propagáciu
6. Resend overí doménu automaticky ✅

**Čas: 5 minút práce + 15-30 minút čakanie**

**Ak nechceš:** Môžeš používať Resend bez vlastnej domény (emaily prídu z resend.dev)

---

### **KROK 4: Vytvor Backend API**

Potrebuješ **backend server** ktorý:
1. Prijme dáta z formulára
2. Pošle 2 emaily cez Resend API:
   - Email zákazníkovi (potvrdenie)
   - Email obchodnému zástupcovi (notifikácia)

**Možnosti:**

#### **A) Vercel Serverless Function (ODPORÚČAM)**
✅ Zadarmo  
✅ Jednoduché  
✅ Automaticky hostované  

#### **B) Netlify Function**
✅ Zadarmo  
✅ Podobné ako Vercel  

#### **C) Vlastný server (Node.js, PHP)**
❌ Musíš ho hostiť  
❌ Platené hostinh  

---

## 📝 KROK 5: Kód pre Vercel Serverless Function

Vytvor súbor: `api/send-email.js`

```javascript
// api/send-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, interest, message } = req.body;

  try {
    // 1. Email zákazníkovi (potvrdenie)
    await resend.emails.send({
      from: 'Crossrock Capital <noreply@crossrockcapital.sk>',
      to: email,
      subject: 'Ďakujeme za Váš záujem - Crossrock Capital',
      html: `
        <h2>Dobrý deň ${name},</h2>
        <p>Ďakujeme za Váš záujem o služby Crossrock Capital.</p>
        <p>Váš dopyt sme prijali a náš obchodný zástupca Vás bude kontaktovať do 24 hodín.</p>
        
        <h3>Vaše údaje:</h3>
        <ul>
          <li><strong>Meno:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Telefón:</strong> ${phone || 'Neuvedené'}</li>
          <li><strong>Záujem o:</strong> ${interest}</li>
        </ul>
        
        ${message ? `<p><strong>Vaša správa:</strong><br>${message}</p>` : ''}
        
        <p>S pozdravom,<br>Tím Crossrock Capital</p>
        
        <hr>
        <p style="font-size: 12px; color: #666;">
          Crossrock Capital a.s.<br>
          Lazaretská 3/A, 811 08 Bratislava<br>
          info@crossrockcapital.sk
        </p>
      `,
    });

    // 2. Email obchodnému zástupcovi (notifikácia)
    await resend.emails.send({
      from: 'Crossrock Form <noreply@crossrockcapital.sk>',
      to: 'tvoj.obchodnik@crossrockcapital.sk', // ZMEŇ TU!
      subject: `🔔 Nový lead: ${name} - ${interest}`,
      html: `
        <h2>Nový lead z kontaktného formulára</h2>
        
        <table style="border-collapse: collapse; width: 100%;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Meno:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Telefón:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${phone || 'Neuvedené'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Záujem o:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>${interest}</strong></td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Správa:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${message || 'Žiadna správa'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Čas:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString('sk-SK')}</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px;">
          <a href="mailto:${email}" style="padding: 10px 20px; background: #D4AF37; color: #000; text-decoration: none; border-radius: 5px;">Odpovedať zákazníkovi</a>
        </p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
```

---

## 🔧 KROK 6: Vercel Setup

### **1. Vytvor účet na Vercel:**
https://vercel.com/signup

### **2. Vytvor nový projekt:**
```bash
# Lokálne na PC
mkdir crossrock-backend
cd crossrock-backend

# Vytvor package.json
npm init -y

# Nainštaluj Resend
npm install resend

# Vytvor api/send-email.js (kód vyššie)
mkdir api
# Skopíruj kód vyššie do api/send-email.js
```

### **3. Vytvor vercel.json:**
```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### **4. Deploy na Vercel:**
```bash
# Nainštaluj Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### **5. Nastav Environment Variables:**
V Vercel dashboarde:
- Settings → Environment Variables
- Pridaj: `RESEND_API_KEY` = `re_tvoj_api_key`

**URL tvojho API:**
```
https://crossrock-backend.vercel.app/api/send-email
```

---

## 🎨 KROK 7: Update kontaktného formulára

V `kontakt.html`:

```javascript
// Nahraď Web3Forms kód týmto:

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.querySelector('[name="name"]').value,
        email: document.querySelector('[name="email"]').value,
        phone: document.querySelector('[name="phone"]').value,
        interest: document.querySelector('[name="interest"]').value,
        message: document.querySelector('[name="message"]').value
    };
    
    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Odosiela sa...';
    button.disabled = true;
    
    try {
        const response = await fetch('https://crossrock-backend.vercel.app/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            document.getElementById('formMessage').style.display = 'block';
            document.getElementById('formMessage').style.background = '#D4F4DD';
            document.getElementById('formMessage').style.color = '#2C5F2D';
            document.getElementById('formMessage').textContent = '✓ Správa odoslaná! Skontrolujte svoj email.';
            e.target.reset();
        } else {
            throw new Error('Failed');
        }
    } catch (error) {
        document.getElementById('formMessage').style.display = 'block';
        document.getElementById('formMessage').style.background = '#FFE5E5';
        document.getElementById('formMessage').style.color = '#C30000';
        document.getElementById('formMessage').textContent = '✗ Chyba pri odoslaní. Skúste znova.';
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
});
```

---

## ✅ CHECKLIST - Kompletný Setup:

### **Resend:**
- [ ] Registrácia na Resend.com
- [ ] Vytvorený API Key
- [ ] (Voliteľné) Pridaná vlastná doména

### **Backend (Vercel):**
- [ ] Vytvorený Vercel účet
- [ ] Nainštalovaný Node.js + npm
- [ ] Vytvorený projekt s api/send-email.js
- [ ] Deploy na Vercel
- [ ] Environment variable RESEND_API_KEY nastavený

### **Frontend:**
- [ ] Formulár prepojený na Vercel API
- [ ] Testovaný odoslanie formulára
- [ ] Overené že prídu 2 emaily (zákazník + obchodník)

---

## 💰 Cena:

**Resend:**
- ✅ **ZADARMO:** Do 3000 emailov/mesiac
- ✅ **Paid:** $20/mesiac za 50,000 emailov

**Vercel:**
- ✅ **ZADARMO:** Hobby plan (100GB bandwidth)
- ✅ **Paid:** $20/mesiac za viac

**CELKOM: $0/mesiac** pre začiatok! 🎉

---

## 🎯 Výhody tohto riešenia:

✅ Zákazník dostane potvrdenie (profesionálne)  
✅ Obchodník dostane notifikáciu o leade  
✅ Vlastná doména (emails@crossrockcapital.sk)  
✅ Trackuje otvorenia emailov  
✅ Plná kontrola nad dizajnom emailov  
✅ Škálovateľné (až 3000 emailov/mesiac zadarmo)  
✅ Rýchle (Vercel edge network)  

---

## ❓ Potrebuješ pomoc s implementáciou?

Napíš mi a pomôžem ti:
1. Nastaviť Resend API
2. Vytvoriť Vercel backend
3. Prepojiť s formulárom
4. Otestovať celý flow

Toto je **production-grade** riešenie používané veľkými firmami! 🚀
