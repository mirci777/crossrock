# 🔒 Bezpečnostný návod pre Crossrock Capital Web

## ⚠️ DÔLEŽITÉ - PREČÍTAJ PRED NASADENÍM!

---

## 📋 OBSAH

1. [Web3Forms Bezpečnosť](#web3forms-bezpečnosť)
2. [Čo treba pridať](#čo-treba-pridať)
3. [reCAPTCHA Setup](#recaptcha-setup)
4. [Content Security Policy](#content-security-policy)
5. [HTTPS a SSL](#https-a-ssl)
6. [Best Practices](#best-practices)

---

## 🛡️ Web3Forms Bezpečnosť

### ✅ Čo Web3Forms už má:

1. **HTTPS šifrovanie** ✅
   - Všetky dáta prenášané šifrovane
   
2. **Honeypot ochrana** ✅
   - Skrytý input pre botov (už v kóde)
   
3. **Rate limiting** ✅
   - Max 100 správ/hodinu na jeden Access Key
   
4. **GDPR Compliant** ✅
   - Dáta sa neuchovávajú, len prepošlú
   
5. **Žiadna databáza** ✅
   - Nič sa neukladá na ich serveroch

### ⚠️ Čo CHÝBA (odporúčam pridať):

1. ❌ **reCAPTCHA** - ochrana pred botmi
2. ❌ **Email validácia** - kontrola formátu
3. ❌ **Input sanitizácia** - XSS ochrana
4. ❌ **CSRF token** - ochrana formulárov
5. ❌ **Content Security Policy** - HTTP hlavičky

---

## 🔧 Čo treba pridať

### 1️⃣ **reCAPTCHA v3 (ODPORÚČAM)**

**Prečo:** Ochrana pred botmi bez CAPTCHA boxu (neviditeľné)

**Ako nastaviť:**

#### Krok 1: Získaj kľúče
1. Choď na: https://www.google.com/recaptcha/admin
2. Vytvor nový web:
   - Typ: **reCAPTCHA v3**
   - Doména: `crossrockcapital.sk`
3. Dostaneš:
   - **Site Key** (verejný)
   - **Secret Key** (tajný - daj do Web3Forms)

#### Krok 2: Pridaj do HTML

V `<head>` sekcie **kontakt.html**:

```html
<script src="https://www.google.com/recaptcha/api.js?render=TVOJ_SITE_KEY"></script>
```

#### Krok 3: Pridaj do formulára

Pred odoslaním formulára v `kontakt.html`:

```javascript
// V script sekcii, pred fetch
grecaptcha.ready(function() {
    grecaptcha.execute('TVOJ_SITE_KEY', {action: 'submit'}).then(function(token) {
        // Pridaj token do formulára
        document.getElementById('recaptchaResponse').value = token;
        // Odošli formulár
    });
});
```

#### Krok 4: Nastav Web3Forms

V Web3Forms dashboarde:
- Zapni **reCAPTCHA v3**
- Vlož **Secret Key**
- Nastav threshold: **0.5** (stredná ochrana)

**Náročnosť:** ⭐⭐ (stredne ľahké, 15 minút)

---

### 2️⃣ **Input Validácia (UŽ MÁME)**

✅ Už implementované v kóde:

```html
<!-- Meno - len písmená a medzery -->
<input pattern="[A-Za-zÀ-žА-я\s]{2,100}" maxlength="100">

<!-- Telefón - len čísla a +/- -->
<input pattern="[0-9+\s\-()]{9,20}" maxlength="20">

<!-- Email - automatická validácia -->
<input type="email" maxlength="100">

<!-- Správa - max 1000 znakov -->
<textarea maxlength="1000"></textarea>
```

**Náročnosť:** ✅ HOTOVÉ

---

### 3️⃣ **Content Security Policy (CSP)**

**Prečo:** Ochrana pred XSS útokmi

**Ako pridať:**

#### Možnosť A: .htaccess (pre Apache)

Vytvor súbor `.htaccess` v root priečinku:

```apache
<IfModule mod_headers.c>
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://api.web3forms.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.web3forms.com; frame-ancestors 'none';"
    Header set X-Frame-Options "DENY"
    Header set X-Content-Type-Options "nosniff"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
```

#### Možnosť B: Nginx

V nginx config:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://api.web3forms.com;";
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

#### Možnosť C: Cloudflare

V Cloudflare dashboard → Rules → Transform Rules:
- Pridaj HTTP Response Header
- CSP header ako vyššie

**Náročnosť:** ⭐⭐⭐ (vyžaduje server prístup)

---

### 4️⃣ **HTTPS / SSL Certifikát**

**Prečo:** Šifrovanie všetkých dát

**Ako získať (ZADARMO):**

#### Let's Encrypt (odporúčam):
```bash
# Ak máš cPanel:
cPanel → SSL/TLS → Let's Encrypt (jeden klik)

# Ak máš Certbot:
sudo certbot --nginx -d crossrockcapital.sk
```

#### Cloudflare (najjednoduchšie):
1. Pridaj doménu do Cloudflare
2. Zmeň nameservers
3. **Automaticky** dostaneš SSL
4. **BONUS:** Dostaneš aj CDN, DDoS protection

**Náročnosť:** ⭐ (veľmi ľahké)

---

### 5️⃣ **Honeypot (UŽ MÁME)**

✅ Už implementované:

```html
<!-- Skrytý input pre botov -->
<input type="checkbox" name="botcheck" style="display: none;">
```

Web3Forms automaticky odmietne správy kde je `botcheck = true`

**Náročnosť:** ✅ HOTOVÉ

---

## 🎯 ODPORÚČANÁ IMPLEMENTÁCIA (priorita)

### **MUSÍŠ urobiť (HIGH PRIORITY):**

1. ✅ **HTTPS/SSL** - Let's Encrypt alebo Cloudflare
   - **Prečo:** Inak Chrome označí web ako "Not Secure"
   - **Náročnosť:** ⭐ (5 minút)
   
2. ✅ **Web3Forms Access Key** - chráň ho!
   - **Prečo:** Ktokoľvek s ním môže posielať spam
   - **Riešenie:** Nikdy ho nezdieľaj verejne
   
3. ⭐ **reCAPTCHA v3** - pridaj ho
   - **Prečo:** Ochrana pred spam botmi
   - **Náročnosť:** ⭐⭐ (15 minút)

### **MALI BY SI urobiť (MEDIUM PRIORITY):**

4. ⭐ **Content Security Policy** - .htaccess
   - **Prečo:** Ochrana pred XSS
   - **Náročnosť:** ⭐⭐ (10 minút)
   
5. ⭐ **Input validácia** - už máme ✅
   - **Prečo:** Prevencia malicious inputs
   - **Náročnosť:** ✅ HOTOVÉ

### **NICE TO HAVE (LOW PRIORITY):**

6. ⭐ **Rate limiting na serveri** - cez Cloudflare
   - **Prečo:** Extra ochrana
   - **Náročnosť:** ⭐⭐⭐

---

## 🚨 Bezpečnostné Riziká

### **Aktuálne riziká (pred implementáciou):**

| Riziko | Závažnosť | Riešenie |
|--------|-----------|----------|
| Bez HTTPS | 🔴 VYSOKÁ | SSL certifikát |
| Spam boti | 🟡 STREDNÁ | reCAPTCHA v3 |
| XSS útoky | 🟡 STREDNÁ | CSP headers |
| Form flood | 🟢 NÍZKA | Web3Forms rate limit |

### **Po implementácii (s reCAPTCHA + CSP):**

| Riziko | Závažnosť |
|--------|-----------|
| Bez HTTPS | ✅ VYRIEŠENÉ |
| Spam boti | ✅ VYRIEŠENÉ |
| XSS útoky | ✅ VYRIEŠENÉ |
| Form flood | ✅ VYRIEŠENÉ |

---

## 📊 Comparison: Pred vs. Po

### PRED (aktuálny stav):
- ❌ Žiadna ochrana pred botmi
- ⚠️ Základná input validácia
- ❌ Žiadne CSP headers
- ⚠️ Závisí len na Web3Forms

**Security Score: 6/10**

### PO (s odporúčanými úpravami):
- ✅ reCAPTCHA v3
- ✅ Input validácia + sanitizácia
- ✅ CSP headers
- ✅ HTTPS/SSL
- ✅ Honeypot
- ✅ Rate limiting

**Security Score: 9/10**

---

## 💡 GDPR Compliance

### Čo musíš mať:

1. ✅ **Privacy Policy stránka**
   - Ako spracúvaš dáta
   - Prečo zbieraš info
   - Ako dlho uchovávať

2. ✅ **Cookie Notice**
   - Ak používaš Google Analytics
   - Ak používaš reCAPTCHA

3. ✅ **Consent checkbox**
   - Pred formulárom: "Súhlasím so spracovaním údajov"

**Náš formulár UŽ MÁ:**
```html
<p style="font-size: 0.75rem; color: #8A8A8A; margin-top: 1rem; text-align: center;">
    Odoslaním súhlasíte so spracovaním osobných údajov podľa <a href="#">GDPR</a>
</p>
```

✅ Potrebuješ vytvoriť Privacy Policy stránku!

---

## 🛠️ Praktické kroky (TO-DO List)

### Teraz (pred nasadením):
- [ ] 1. Nastav SSL certifikát (Cloudflare/Let's Encrypt)
- [ ] 2. Získaj Web3Forms Access Key
- [ ] 3. Vlož Access Key do kontakt.html
- [ ] 4. Otestuj formulár

### Týždeň 1 (po nasadení):
- [ ] 5. Pridaj reCAPTCHA v3
- [ ] 6. Pridaj CSP headers (.htaccess)
- [ ] 7. Vytvor Privacy Policy stránku
- [ ] 8. Pridaj Cookie Notice banner

### Voliteľné (neskôr):
- [ ] 9. Pridaj Google Analytics
- [ ] 10. Nastav Cloudflare firewall rules
- [ ] 11. Monitoring pre uptime (UptimeRobot)

---

## ❓ FAQ

**Q: Je Web3Forms naozaj bezpečný?**
A: Áno, používajú HTTPS a nedržia dáta. Ale odporúčam pridať reCAPTCHA.

**Q: Koľko to bude stáť?**
A: Všetko je ZADARMO (Web3Forms, Let's Encrypt, reCAPTCHA, Cloudflare).

**Q: Ako dlho implementácia trvá?**
A: SSL (5 min) + reCAPTCHA (15 min) + CSP (10 min) = **30 minút celkom**

**Q: Čo ak nedám reCAPTCHA?**
A: Dostaneš pravdepodobne spam. Odporúčam ho pridať do 1 týždňa.

**Q: Potrebujem programátora?**
A: Na SSL a Web3Forms NIE. Na reCAPTCHA možno áno (15 min práce).

---

## 📞 Potrebuješ pomoc?

Ak potrebuješ pomoc s:
- reCAPTCHA implementáciou
- CSP headers nastavením
- SSL certifikátom
- Privacy Policy textom

Napíš mi a pomôžem! 🚀

---

**Záver:** Web je momentálne **relatívne bezpečný** vďaka Web3Forms, ale odporúčam pridať **reCAPTCHA v3** a **SSL certifikát** pred plným nasadením!
