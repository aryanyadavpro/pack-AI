# 🌿 PackCraft AI — Project Explanation in Simple Hinglish 📦

Yeh document tumhare aur tumhare dosto ke liye hai taaki sabko **aasan bhasha (Hinglish)** mein samajh aa sake ki **PackCraft AI** kya hai, yeh kaise kaam karta hai, iske peeche ki science kya hai, aur tech stack kaise work kar raha hai.

---

## 🎯 1. Yeh Project Kya Hai aur Kis Problem Ko Solve Karta Hai?

Jab bhi koi food business ya startup apna food product (jaise Namkeen, Cow Ghee, Mangoes, Paneer, Spices) market mein launch karta hai, unke paas **2 badi problems** aati hain:

1. **Government & Environmental Rules**: Single-use plastic ban ho chuka hai (CPCB PWM Rules), aur **FSSAI** ke strict rules hain ki harmful chemicals food mein leak nahi hone chahiye.
2. **Food Spoilage (Kharab Hona)**: Agar galat packet use kiya toh:
   - Bhujia/Chips 10 din mein **seel (soggy)** jaate hain.
   - Ghee/Namkeen mein se **ajeeb smell (rancid/bad odor)** aane lagti hai.
   - Bakery items par **fungus/mold** lag jaata hai.

👉 **PackCraft AI ka Solution**:
Ek smart AI platform jahan user bas apne food ka naam aur requirement batata hai, aur system **Machine Learning + Food Science Math + FSSAI Rules** ko use karke automatically exact **Biodegradable Pouch Material, Thickness (Gauge), OTR, WVTR aur Shelf-Life (Expiry Days)** calculate karke de deta hai!

---

## 🔬 2. Food Science Ka Funda: OTR aur WVTR Kya Hote Hain?

Packaging science mein saari game sirf 2 cheezon par tiki hoti hai: **OTR** aur **WVTR**.

```
                           Hawa Ki Oxygen (O2)
                                   │
                                   ▼  [OTR se andar aati hai]
┌────────────────────────────────────────────────────────────────────────┐
│               PACKET KI WALL (Biodegradable Barrier Layer)              │
└────────────────────────────────────────────────────────────────────────┘
                                   ▲  [WVTR se moisture aati/jaati hai]
                                   │
                           Hawa Ki Nami (Humidity / Moisture)
```

---

### 💧 A. WVTR (Water Vapor Transmission Rate)
* **Asaan Matlab**: 1 square meter packet mein se 24 ghante mein **kitne gram paani (moisture)** andar ya bahar jaa sakta hai.

#### Real Life Examples:
1. **Crispy / Dry Food (Bhujia, Khakhra, Biscuits, Chips)**:
   - Inka water content bohot kam hota hai ($a_w < 0.25$).
   - Agar packet ka WVTR high hai, toh hawa ki nami (moisture) packet ke andar ghus jaayegi.
   - **Nateeja**: Chips soft aur soggy ho jaate hain (crispness khatam).
2. **Fresh / Wet Food (Paneer, Fish, Cut Fruits)**:
   - Inke andar paani zyada hota hai.
   - Agar packet ka WVTR high hai, toh inka paani sukh jaayega (weight loss aur hardening).

---

### 💨 B. OTR (Oxygen Transmission Rate)
* **Asaan Matlab**: 1 square meter packet mein se 24 ghante mein **kitni cubic centimeter ($cc$) oxygen gas** andar ghus sakti hai.

#### Real Life Examples:
1. **Oily / Fatty Food (Ghee, Fried Namkeen, Mustard Oil, Dry Fruits)**:
   - Hawa ki oxygen jab oil/fat se react karti hai, toh usko bolte hain **Lipid Auto-Oxidation**.
   - **Nateeja**: Food mein se kadvahat (rancidity) aur sadi hui smell aane lagti hai. Isko rokne ke liye **bohot low OTR** (high oxygen barrier) chahiye hota hai.
2. **Phal aur Sabziyan (Fresh Respiring Produce)**:
   - Fruits aur veggies packet ke andar bhi **saans (respiration)** lete hain.
   - Agar bilkul $0$ oxygen kar di toh wo sadd jaayenge (anaerobic fermentation). Isliye inke liye **controlled high OTR** packet chahiye hota hai.

---

## 🚀 3. Project Ke 4 Main Modules (Yeh Kaam Kaise Karte Hain?)

PackCraft AI ke andar 4 core features hain:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PackCraft AI Feature Suite                      │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│ 1. AI Assistant │ 2. Recommender  │ 3. Simulator     │ 4. Audit Studio │
│    (/chat)      │    (/recommend) │    (/simulate)   │    (/audit)     │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┘
```

### 💬 1. AI Assistant (`/chat`)
- User aam bhasha mein prompt likhta hai, jaise:
  > *"Mujhe 500 gram Cow Ghee ke liye compostable pouch chahiye, Rajasthan garmi mein 9 mahine chalna chahiye."*
- **Behind the Scenes**:
  - NLP parser query mein se food item (`Ghee`), weight (`500g`), target days (`270`), aur weather nikalta hai.
  - ML Model ko bhejta hai aur < 2ms mein reply generate karta hai.
  - Screen par **3-Layer Laminate Structure** (Outer Paper + Barrier Layer + Sealant) aur supplier ko bhejne ke liye ready-made **RFQ (Request for Quotation) Brief** deta hai.

---

### 🎯 2. Packaging Recommendation Engine (`/recommend`)
Yeh engine 2 steps mein best packaging choose karta hai:

1. **Tier 1 (FSSAI Hard Safety Filter)**:
   - Pehle check karta hai ki food acidic hai kya ($\text{pH} < 4.5$) ya oily hai kya ($\text{Fat} > 10\%$).
   - Jo materials FSSAI safety limit (OML $\le 60\text{ mg/kg}$) ya CPCB Compostable norms pass nahi karte, unko **turant reject** kar deta hai.
2. **Tier 2 (TOPSIS Decision Algorithm)**:
   - Baki bache hue certified biopolymers ko rank karta hai on 6 factors:
     - Barrier Quality ($30\%$)
     - Thickness / Gauge ($15\%$)
     - Cost / Price ($20\%$)
     - Puncture Strength ($15\%$)
     - Compostability ($10\%$)
     - Format ($10\%$)
   - Jo sabse top score karta hai (e.g. `Score: 0.96`), wo recommend hota hai.

---

### ⏱️ 3. Shelf-Life Simulation Sandbox (`/simulate`)
- Isme user sliders se Temperature ($10^\circ\text{C}$ to $50^\circ\text{C}$), Humidity ($20\%$ to $100\%$), OTR aur WVTR change kar sakta hai.
- **Dynamic Physics Engine**:
  - Day 0 se Day 730 tak math equations run karta hai.
  - Graph plot karke batata hai ki product **kitne din mein expire hoga** aur kyu kharab hoga (Moisture ki wajah se ya Oil Oxidation ki wajah se).

---

### 📜 4. Statutory Compliance Audit (`/audit`)
- Ek click par FSSAI aur BIS IS 9845 testing standard ke mutabik official compliance certificate banata hai with unique Verification ID, jisko food business print karke packaging testing lab ya inspector ko dikha sakte hain.

---

## 🧠 4. Machine Learning & Math Models

Humne 5,000 FSSAI food packaging records par 2 alag Machine Learning models train kiye hain:

1. **Model 1 (Packaging Recommender)**:
   - *Algorithm*: Random Forest Classifier + Gradient Boosted Regressor.
   - *Kaam*: Food characteristics dekh kar optimal polymer type, gauge ($\mu\text{m}$), target OTR aur target WVTR predict karta hai ($R^2 = 0.9978$).
2. **Model 2 (Shelf-Life Predictor)**:
   - *Algorithm*: Random Forest Regressor + Classifier.
   - *Kaam*: Days to spoil aur failure reason (Moisture vs Oxidation vs Mold) predict karta hai ($R^2 = 0.9883$).

---

## 🛠️ 5. Project Ka Tech Stack (Kaise Build Hua Hai?)

| Layer | Technology | Kyu Use Kiya? |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (App Router) + React 19** | Super fast server rendering aur clean routing ke liye |
| **Styling** | **Tailwind CSS v4** | Bespoke warm paper palette (`#FAF7F2`, `#141928`, `#2A45FE`) ke liye |
| **Typography** | **Plus Jakarta Sans** | Modern, premium editorial look ke liye |
| **Charts** | **Recharts** | Interactive real-time shelf life curves ke liye |
| **Backend** | **FastAPI (Python 3.11+)** | High-speed async REST APIs aur instant ML inference ke liye |
| **ML Engine** | **Scikit-Learn + Joblib** | Pre-trained models ko microsecond inference mein run karne ke liye |
| **Deployment** | **Vercel (Frontend) + Render (Backend)** | Global edge fast loading aur auto-scaling Docker container ke liye |

---

## 🔄 6. Complete End-to-End Data Flow

```
1. User ne browser mein query daali ya form bhara (Next.js Frontend)
                       │
                       ▼ (HTTP POST JSON Request)
2. FastAPI Backend ko request aayi (/api/v1/recommend ya /chat)
                       │
                       ▼
3. FSSAI Rules check hue (pH, Oil, Non-toxic safety limits)
                       │
                       ▼
4. Scikit-Learn ML Model ne optimal gauge aur barrier target nikale
                       │
                       ▼
5. TOPSIS Algorithm ne saare candidate materials ko rank kiya
                       │
                       ▼
6. Kinetics Engine ne 730-day shelf life integrate ki
                       │
                       ▼
7. Frontend ko clean JSON response gaya -> Beautiful cards aur graph render ho gaye!
```

---

## 💻 7. Local Machine Par Run Kaise Karein?

### Sabse Aasan Tareeka (Windows 1-Click):
Bas project folder mein jaake **`run.bat`** par double click karo!
- Backend chal jaayega: `http://localhost:8000`
- Frontend chal jaayega: `http://localhost:3000`

### Manual Run Tareeka:
1. **Backend Terminal**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --port 8000
   ```
2. **Frontend Terminal**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Browser mein open karo: **`http://localhost:3000`**

---

## 🌟 Summary

PackCraft AI ek aisa complete end-to-end platform hai jo **Green Biodegradable Packaging** ko data, physics aur machine learning ke through easy banata hai taaki environment bhi bache aur food bhi safe rahe! 🚀
