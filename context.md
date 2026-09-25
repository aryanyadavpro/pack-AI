# CONTEXT.md — AI-Based Food Packaging Recommendation & Shelf-Life Simulation System

---

## 1. Executive Summary & Problem Statement

### 1.1 The Problem
Food packaging is critical for maintaining food safety, quality, and shelf life during storage, transportation, and retail. Selecting an inappropriate packaging material leads to:
- **Moisture ingress or desiccation** (loss of crispness in dry snacks, caking of flours).
- **Lipid oxidation and rancidity** (foul odors and toxic peroxide accumulation in high-fat foods).
- **Microbial proliferation** (mold, bacterial slime, and food poisoning pathogens).
- **Respiration suffocation or anaerobic decay** (in postharvest fruits and vegetables).

At present, packaging selection is highly expert-dependent, manual, and expensive. Small food manufacturers, agricultural farmers, cloud kitchens, and D2C food startups in India lack in-house technical knowledge regarding:
- Polymer barrier properties (Oxygen Transmission Rate — OTR; Water Vapor Transmission Rate — WVTR).
- Permeability dynamics under harsh Indian tropical climates (up to 42°C in summer, 90%+ RH during monsoons).
- Statutory compliance with the **Food Safety and Standards Authority of India (FSSAI)** and **Central Pollution Control Board (CPCB)** plastic waste management rules.

### 1.2 The Solution
**BioPack AI** is an intelligent, deterministic decision-support software system that:
1. Recommends the optimal **100% biodegradable and compostable packaging material and gauge specifications** based on product chemistry, desired shelf life, and logistical stress.
2. Simulates **shelf life in days and identifies the primary failure mechanism** under specific environmental conditions using first-principles mass transfer kinetics.
3. Automatically audits statutory compliance against the **FSSAI (Packaging) Regulations, 2018** and **Bureau of Indian Standards (BIS)**.

---

## 2. Target Users & Operating Environment

### 2.1 Target Beneficiaries
- **D2C Food Startups & MSMEs**: Formulating packaged snacks, sweets, bakery products, and cold-pressed oils needing shelf-life validation without expensive 6-month lab trials.
- **Farmers, FPOs & Mandi Traders**: Requiring breathable or micro-perforated packaging for postharvest produce (mangoes, okra, onions, green chillies).
- **Traditional Food Processors (Halwais & Namkeen Manufacturers)**: Transitioning from banned single-use plastics to certified compostables.

### 2.2 Indian Climatic & Supply-Chain Regimes
The system is explicitly calibrated for Indian ambient conditions:
- **Hot & Humid (Coastal / Monsoon)**: 28°C–36°C, 75%–95% RH (Mumbai, Chennai, Kolkata).
- **Hot & Dry (Northern/Central Summer)**: 35°C–44°C, 25%–50% RH (Delhi, Rajasthan, Vidarbha).
- **Moderate / Plateau**: 20°C–32°C, 50%–70% RH (Pune, Bengaluru).
- **Cold Chain**: 0°C–4°C for meat/fish; 2°C–8°C for dairy/paneer.
- **Logistics Modes**: Rough unpaved rural roads, non-AC truck cargo, Indian Railway parcel freight.

---

## 3. Mathematical Foundations & Physical Models

The system rejects probabilistic hallucination and computes packaging thresholds via deterministic mass transfer and kinetics:

### 3.1 Water Vapor Transmission Rate (WVTR) Calculation
The maximum permissible WVTR is calculated using the product's critical moisture sorption limit:
$$\Delta m_{\text{max}} = W_{\text{product}} \times (M_{\text{critical}} - M_{\text{initial}})$$

Using steady-state Fickian diffusion across exposed surface area ($A$) over target days ($t$):
$$WVTR_{\text{allowable}} = \frac{\Delta m_{\text{max}}}{A \times t \times \left(\frac{RH_{\text{ambient}} - RH_{\text{internal}}}{100}\right)}$$
*Where $W_{\text{product}}$ is net weight (g), $M$ is moisture fraction (w/w), $A$ is surface area ($\text{m}^2$), and $t$ is days.*

### 3.2 Oxygen Transmission Rate (OTR) Calculation
For high-fat foods, permissible oxygen ingress is governed by the allowable increase in Peroxide Value ($\Delta PV$):
$$\text{Fat Mass } (W_{\text{fat}}) = W_{\text{product}} \times \text{Fat Fraction}$$
$$\text{Allowed } O_2 \text{ (meq)} = (PV_{\text{critical}} - PV_{\text{initial}}) \times W_{\text{fat}}$$
$$\text{Mass of } O_2\text{ (g)} = \text{Allowed } O_2 \text{ (meq)} \times 0.008\text{ g/meq}$$
$$\text{Volume of } O_2\text{ at STP (cc)} = \left(\frac{\text{Mass of } O_2}{32\text{ g/mol}}\right) \times 22,400\text{ cc/mol}$$

Because ambient air contains only $20.95\%$ oxygen, the partial pressure driving force is $\Delta P_{\text{O}_2} = 0.21\text{ atm}$ (assuming nitrogen flush inside):
$$OTR_{\text{allowable}} = \frac{\text{Volume of } O_2\text{ (cc)}}{A \times t \times 0.21\text{ atm}}$$

### 3.3 Horticultural Equilibrium Modified Atmosphere Packaging (MAP)
For respiring produce, film permeation must equal commodity respiration rate ($R_{\text{O}_2}, R_{\text{CO}_2}$) to avoid anaerobic fermentation:
$$OTR_{\text{film}} = \frac{R_{\text{O}_2} \times W_{\text{produce}}}{A \times (0.21 - y_{\text{O}_2,\text{target}})}$$
*Target headspace gas: $3\%\text{--}5\%\ O_2,\ 5\%\text{--}8\%\ CO_2$, balance $N_2$.*

---

## 4. Indian Statutory & Regulatory Governance

Every recommendation enforces mandatory statutory requirements:

### 4.1 FSSAI (Packaging) Regulations, 2018
- **Clause 3(2)**: Strict prohibition of printed newspapers and unapproved recycled plastics in direct contact with food.
- **Clause 4(4) & 4(5)**: Overall Migration Limits (OML) must strictly not exceed **$60\text{ mg/kg}$ or $10\text{ mg/dm}^2$** with zero visible color/dye bleed.
- **Clause 4(3)**: High-acid ($\text{pH} \le 4.5$) and high-salt foods (pickles, sauces) must not cause corrosion or metal leaching.
- **Clause 5(1) to 5(5)**: Commodity-specific packaging mandates (edible oils, spices, milk products).

### 4.2 Bureau of Indian Standards (BIS) Test Standards
- **IS/ISO 17088 : 2021**: Mandatory Indian Standard for Compostable Plastics (replaces obsolete 2008 version; required for CPCB Form-VI licensing).
- **IS 9845**: Determination of overall and specific migration:
  - *Simulant A*: Distilled water (aqueous non-acid foods).
  - *Simulant B*: 3% Acetic acid (acidic foods, $\text{pH} \le 4.5$).
  - *Simulant C*: 15% Ethanol (alcoholic/dairy foods).
  - *Simulant D*: Rectified olive oil / Iso-octane (oils, fats, namkeen, fried foods).
- **IS 6615 / IS 1776**: Food-grade virgin paper and folding box board.
- **IS 15392**: Food packaging aluminum foil and barrier strips.

---

## 5. Verified Datasets (Single Source of Truth)

Both datasets are hosted on Google Drive and compiled strictly from official sources ([ICMR-NIN IFCT 2017](https://www.nin.res.in/ebooks/IFCT2017.pdf), CSIR-CFTRI, IIP, and FSSAI Gazette):

| Dataset Name | Records | Google Drive Link |
| :--- | :--- | :--- |
| **Model 1: Packaging Recommendation** | 5,000 | [fssai_packaging_recommendation_dataset_5000_samples](https://docs.google.com/spreadsheets/d/1U4fmwHb5400fuPYULZDwIVNkWFuQgdpYIEj872lmLh4/edit?usp=drivesdk&ouid=108827864625853818671) |
| **Model 2: Shelf-Life Simulation** | 5,000 | [fssai_shelf_life_simulation_dataset_5000_samples](https://docs.google.com/spreadsheets/d/1WU46HLoNRH-K7AtckOxW9QZnabxuyknd2xh2jvsSRmU/edit?usp=drivesdk&ouid=108827864625853818671) |

### 5.1 Model 1 Schema (`28 Columns`)
1. `indian_commodity_name`: Official name (e.g., *Fresh Malai Paneer, Bikaneri Bhujia, Desi Cow Ghee*).
2. `commodity_category_fssai`: Regulatory category (Dairy, Namkeen, Spices, Horticulture, Staples).
3. `icmr_nin_ifct_code`: Official ICMR food code (e.g., *B005, A001, F005*).
4. `moisture_content_pct`, `fat_content_pct`, `ph_level`, `water_activity_aw`: Intrinsic food chemistry.
5. `respiration_rate_mg_co2_kg_hr`: Respiration rate at storage temperature.
6. `target_shelf_life_days`, `storage_temperature_c`, `ambient_relative_humidity_pct`: Operational constraints.
7. `supply_chain_logistics`, `storage_regime`: Distribution conditions.
8. `recommended_biodegradable_packaging`: Specific bio-material family (Cellulose, Bio-PBS, PHA, PLA).
9. `biodegradable_layer_structure`: Layer-by-layer specification with gauges.
10. `recommended_gauge_thickness_microns`, `target_otr_cc_m2_day_atm`, `target_wvtr_g_m2_day`: Engineering targets.
11. `sealing_mechanism`, `mechanical_strength_requirement`, `map_suitability`, `recommended_gas_composition`.
12. `fssai_packaging_regulations_2018_clause`, `prescribed_bis_is_standard`, `fssai_migration_limit_compliance`.
13. `cpcb_plastic_waste_management_rule_category`, `commercial_trade_reference_india`, `legal_and_scientific_source_citation`.

### 5.2 Model 2 Schema (`21 Columns`)
1. `commodity_name`, `commodity_category`.
2. `initial_moisture_pct`, `initial_fat_pct`, `initial_ph`, `water_activity_aw`, `preservative_type`.
3. `packaging_material_tested`, `actual_film_thickness_microns`, `actual_film_otr_cc_m2_day_atm`, `actual_film_wvtr_g_m2_day`.
4. `storage_condition`, `storage_temperature_c`, `storage_rh_pct`, `headspace_gas_regime`.
5. `measured_shelf_life_days`: Days until product reaches spoilage cutoff.
6. `primary_failure_mode`: Limiting failure factor (Moisture sogginess, PV rancidity, mold, TVB-N).
7. `kinetic_reaction_order`: Governing kinetic model (BET/GAB sorption, first-order autoxidation).
8. `critical_endpoint_value`, `fssai_safety_compliance`, `empirical_research_citation`.

---

## 6. System Architecture & The Two-Tier Pipeline

BioPack AI implements a decoupled, two-tier decision and simulation architecture:

### 6.1 Tier 1: Hard Safety & Statutory Compliance Filter
Every candidate bioplastic material undergoes non-negotiable deterministic boundary checks before being scored:
1. **Migration Limits**: Overall Migration Limit (OML) must strictly satisfy $\le 10\text{ mg/dm}^2$ under the designated IS 9845 simulant (A, B, C, or D).
2. **Chemical Compatibility**: High-acid ($\text{pH} \le 4.5$) products mandate non-reactive barrier layers (AlOx-PLA or Bio-PBS); bare cellulose or unlined metals are categorically disqualified.
3. **Barrier Adequacy**: Material baseline WVTR and OTR must fall within allowable bounds calculated via first-principles mass transfer.
4. **CPCB Certification**: Only materials certified under IS/ISO 17088 : 2021 with valid CPCB Category IV Form-VI registration are permitted.

### 6.2 Tier 2: Multi-Criteria Decision Making (TOPSIS MCDM)
Candidate films passing Tier 1 are ranked using vector-normalized TOPSIS across five engineering criteria:
- **Barrier Safety Margin ($w = 0.35$)**: Ratio of allowable to actual permeation rates.
- **Commercial Cost Index ($w = 0.20$)**: Normalized polymer economics in the Indian market.
- **Compostability Grade ($w = 0.15$)**: Home compostable > Industrial compostable.
- **Mechanical Tensile & Puncture Strength ($w = 0.15$)**: Calibrated for Indian logistics stress.
- **Gauge Efficiency ($w = 0.15$)**: Thinner films minimizing raw material footprint.

### 6.3 Dynamic Shelf-Life & Degradation Simulation
The system projects numerical decay trajectories ($\Delta t = 1\text{ day}$) tracking moisture sorption, lipid autoxidation, microbial proliferation, and produce respiration. The primary failure mode and days to spoilage are diagnosed deterministically, providing empirical benchmark comparisons against banned conventional LDPE and unsealed paper packaging.