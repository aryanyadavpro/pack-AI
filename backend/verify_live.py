import httpx

client = httpx.Client(base_url='http://127.0.0.1:8000')

print("--- HEALTH ---")
print(client.get('/api/v1/health').json())

print("\n--- BENCHMARK COMPARISON (Bikaneri Bhujia @ 35°C, 75% RH) ---")
cmp_data = client.get('/api/v1/simulate/compare?commodity_name=Bikaneri%20Bhujia&storage_temp_c=35.0&storage_rh_pct=75.0').json()
for x in cmp_data['comparisons']:
    print(f" * {x['material_label']}: {x['predicted_shelf_life_days']} days (delta: {x['shelf_life_delta_pct']}%) -> Failure: {x['primary_failure_mode']}")

print("\n--- STATUTORY AUDIT CERTIFICATE ---")
audit = client.post('/api/v1/audit/report', json={
    'commodity_name': 'Bikaneri Bhujia',
    'packaging_material_name': 'High-Barrier Metallized Cellulose / Bio-PBS Laminate Pouch',
    'film_thickness_microns': 65.0,
    'target_shelf_life_days': 150
}).json()
print("Certificate ID:", audit['certificate_id'])
print("Verdict:", audit['overall_compliance_verdict'])
print("Prescribed Simulant:", audit['prescribed_simulant'], "-", audit['simulant_description'])
print("Test Standard:", audit['prescribed_is_standard'])
print("Clauses checked:", len(audit['clauses_audited']))
for c in audit['clauses_audited']:
    print(f"  [{c['status']}] {c['clause']}: {c['requirement']}")
