# 🍪 Cookie Banner - Moderný & Minimalistický

## ✅ ČO SOM PRIDAL:

### **Moderný Cookie Banner v štýle Anthropic/Google:**

**Design:**
- ✅ **Minimalistický** - malý, nenápadný
- ✅ **Čierny s priesvitnosťou** (backdrop blur efekt)
- ✅ **Zlaté akcenty** - pasuje k Crossrock dizajnu
- ✅ **Zaoblené rohy** (12px border-radius)
- ✅ **Jemné tiene** - moderný 3D efekt
- ✅ **Plynulé animácie** - slide up/down

**Umiestnenie:**
- 📍 **Desktop:** Dole v strede obrazovky (fixed position)
- 📍 **Mobile:** Dole na celú šírku (sticky bottom)

**Funkcie:**
- ✅ **2 tlačidlá:** "Odmietnuť" a "Prijať"
- ✅ **Link na Privacy Policy** - priamo v texte
- ✅ **LocalStorage** - zapamätá si voľbu používateľa
- ✅ **Auto-zobrazenie** - po 1 sekunde (lepší UX)
- ✅ **Plynulé zmiznutie** - fade out animácia

---

## 🎨 Vizuálny štýl:

### **Farby:**
```
Pozadie: rgba(0, 0, 0, 0.95) s backdrop-filter blur
Text: rgba(255, 255, 255, 0.9)
Link: #D4AF37 (zlatá)
Tlačidlo Prijať: #D4AF37 (zlatá)
Tlačidlo Odmietnuť: Transparentné s hover efektom
```

### **Typografia:**
```
Font size: 14px
Font weight: 600 (tlačidlá)
Line height: 1.5
```

### **Spacing:**
```
Padding: 16px 24px
Gap: 20px (medzi textom a tlačidlami)
Gap: 12px (medzi tlačidlami)
Border-radius: 12px
```

---

## 📱 Responzívnosť:

### **Desktop (> 640px):**
- Banner v strede dole
- Text a tlačidlá vedľa seba
- Max-width: 600px

### **Mobile (< 640px):**
- Banner na celú šírku dole
- Text a tlačidlá pod sebou (column)
- Tlačidlá na celú šírku
- Border-radius iba hore (12px 12px 0 0)

---

## 🔧 Ako to funguje:

### **JavaScript logika:**
```javascript
1. Pri načítaní stránky skontroluje localStorage
2. Ak používateľ ešte nerozhodol → zobrazí banner po 1s
3. Klik na "Prijať" → uloží "accepted" do localStorage
4. Klik na "Odmietnuť" → uloží "rejected" do localStorage
5. Banner plynulo zmizne (fade out 0.3s)
6. Pri ďalšej návšteve sa už nezobrazí
```

### **LocalStorage keys:**
```
cookieConsent: "accepted" alebo "rejected"
```

---

## 📂 Kde je to implementované:

### **Pridané do všetkých stránok:**
✅ index.html  
✅ investicie.html  
✅ financovanie.html  
✅ kalkulacka.html  
✅ pribehy.html  
✅ kontakt.html  
✅ faq.html  
✅ privacy-policy.html  

### **CSS v:**
✅ styles.css (na konci súboru)

### **JavaScript:**
✅ Inline v každej HTML stránke (pred </body>)

---

## 🎯 User Experience:

### **Prvá návšteva:**
1. Stránka sa načíta
2. Po 1 sekunde sa **plynulo zobrazí** cookie banner
3. Používateľ vidí 2 možnosti:
   - **"Odmietnuť"** (sivé, transparentné)
   - **"Prijať"** (zlaté, výrazné)
4. Po kliku banner **plynulo zmizne**

### **Ďalšie návštevy:**
- Banner sa **nezobrazí** (zapamätal si voľbu)

### **Reset voľby:**
- Vymazať localStorage v prehliadači
- Alebo Developer Tools → Application → Local Storage → vymazať "cookieConsent"

---

## 💡 Výhody tohto riešenia:

✅ **Moderný dizajn** - inšpirované Anthropic, Google, Apple  
✅ **Minimalistický** - nezasahuje do obsahu  
✅ **Rýchly** - žiadne externe dependencies  
✅ **Lightweight** - len CSS + vanilla JS  
✅ **GDPR friendly** - link na Privacy Policy  
✅ **Responzívny** - funguje na všetkých zariadeniach  
✅ **Zapamätá si voľbu** - localStorage  
✅ **Smooth animácie** - profesionálny vzhľad  

---

## 🔄 Ak chceš zmeniť:

### **Text banneru:**
V každom HTML súbore nájdi:
```html
<p>Používame cookies na zlepšenie vášho zážitku...</p>
```

### **Farby tlačidiel:**
V `styles.css` nájdi:
```css
.cookie-btn-primary {
    background: #D4AF37; /* Zmeň tu */
}
```

### **Delay zobrazenia:**
V každom HTML súbore nájdi:
```javascript
setTimeout(() => { banner.style.display = "block"; }, 1000); // 1000 = 1 sekunda
```

### **Pozícia banneru:**
V `styles.css` nájdi:
```css
.cookie-banner {
    bottom: 20px; /* Zmeň výšku */
}
```

---

## 🧪 Ako testovať:

### **1. Prvá návšteva (čistý štart):**
```
1. Otvor index.html v prehliadači
2. Počkaj 1 sekundu
3. Banner by sa mal zobraziť
```

### **2. Testovanie "Prijať":**
```
1. Klikni "Prijať"
2. Banner zmizne
3. Refresh stránku
4. Banner sa UŽ nezobrazí ✅
```

### **3. Testovanie "Odmietnuť":**
```
1. Vymaž localStorage (F12 → Application → Local Storage → Delete)
2. Refresh
3. Klikni "Odmietnuť"
4. Banner zmizne
5. Refresh stránku
6. Banner sa UŽ nezobrazí ✅
```

### **4. Reset testu:**
```
F12 → Console → napíš:
localStorage.removeItem('cookieConsent')

Potom refresh stránku → banner sa zobrazí znova
```

---

## 📊 Príklad použitia s Google Analytics:

Ak chceš pridať Google Analytics pri "Prijať":

```javascript
acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    
    // Pridaj Google Analytics tu
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID'); // Tvoj GA ID
    
    banner.style.opacity = "0";
    setTimeout(() => { banner.style.display = "none"; }, 300);
});
```

---

## ✅ Checklist:

- [x] Cookie banner vytvorený
- [x] Pridaný do všetkých stránok
- [x] CSS štýly pridané
- [x] JavaScript funguje
- [x] Responzívny dizajn
- [x] Link na Privacy Policy
- [x] LocalStorage implementovaný
- [x] Animácie fungujú
- [x] Mobile friendly

---

## 🚀 Pripravené na nasadenie!

Banner je **production-ready** a funguje na všetkých stránkach!

Dobrú noc! 🌙😴
