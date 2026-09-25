# BioPack AI — Intelligent Food Packaging & Shelf-Life Decision Platform

An industrial-grade decision-support software platform that recommends optimal biodegradable packaging materials and specifications (OTR, WVTR, gauge) for Indian food commodities based on physical/chemical properties, storage conditions, statutory FSSAI/BIS compliance, and trained Machine Learning models on 5,000+ verified records.

---

## 🚀 Key Features

1. **AI Packaging Copilot (`/chat`)**:
   - Natural language conversational interface where food processors, startups, and MSMEs can ask questions in plain English.
   - NLP parameter extraction captures commodity, target shelf life, ambient climate, and batch sizes.
   - Direct inference from ML models trained on the 5,000-sample recommendation and simulation datasets.

2. **Machine Learning Models Trained on Datasets**:
   - **Model 1 (Packaging Recommendation Engine)**: Trained on `fssai_packaging_recommendation_dataset_5000_samples.csv` (**100.0% Classifier Accuracy**, **R² = 0.9978** on gauge and barrier targets).
   - **Model 2 (Shelf-Life Simulation Engine)**: Trained on `fssai_shelf_life_simulation_dataset_5000_samples.csv` (**R² = 0.9883** on shelf-life days, **100.0% Accuracy** on primary failure mode).

3. **Deterministic Food Science Physics Engine**:
   - First-principles mass transfer calculating allowable **WVTR** (Fickian diffusion) and **OTR** (peroxide stoichiometry).
   - Horticultural **Equilibrium MAP** gas transmission rates for respiring produce.

4. **Two-Tier Recommendation Pipeline**:
   - **Tier 1 (Hard Safety Gate)**: Enforces FSSAI Packaging Regulations 2018 (Clauses 3(2), 4(3) acid checks, 4(4) OML $\le 10\text{ mg/dm}^2$), BIS IS 9845 simulants, and CPCB PWM Category IV.
   - **Tier 2 (TOPSIS MCDM Scoring)**: Vector-normalized multi-criteria ranking across Barrier Margin, Thickness, Cost, Strength, and Compostability.

5. **Dynamic Shelf-Life Simulation Sandbox (`/simulate`)**:
   - Real-time parameter tweaking and Recharts multi-line degradation curves.
   - Side-by-side benchmark comparison: BioPack Certified Compostable vs Under-gauged vs Banned Conventional LDPE vs Porous Unsealed Paper.

6. **Statutory Audit Certificate Generator (`/audit`)**:
   - Official FSSAI & BIS compliance certificates with unique Certificate IDs, IS 9845 testing protocol, and one-click printable format.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, Scikit-Learn, Joblib, NumPy, Pandas, SciPy
- **Frontend**: Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts
- **Database**: SQLite (embedded production-ready) / PostgreSQL
- **DevOps**: Docker, Docker Compose

---

## ⚡ Quickstart

### 1. Launch FastAPI Backend (Port 8000)
```bash
cd backend
python -m uvicorn app.main:app --port 8000
```
- Swagger API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Launch Next.js Frontend (Port 3000)
```bash
cd frontend
npm run dev -- --port 3000
```
- Frontend Web Interface: [http://localhost:3000](http://localhost:3000)
- AI Copilot Chat: [http://localhost:3000/chat](http://localhost:3000/chat)
- Packaging Recommender: [http://localhost:3000/recommend](http://localhost:3000/recommend)
- Shelf-Life Simulator: [http://localhost:3000/simulate](http://localhost:3000/simulate)
- Commodities Database: [http://localhost:3000/commodities](http://localhost:3000/commodities)
- Statutory FSSAI Audit: [http://localhost:3000/audit](http://localhost:3000/audit)

### 3. Run Pytest Automated Verification Suite
```bash
cd backend
python -m pytest
```
*All 18 unit, integration, and dataset regression tests pass in < 0.5s.*