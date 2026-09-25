import pytest
from app.services.recommendation.topsis_engine import rank_materials_topsis

def test_topsis_ranking_correctness():
    candidates = [
        {
            "name": "High Barrier Option",
            "barrier_margin": 4.5,       # high benefit
            "nominal_thickness_um": 60.0, # moderate cost
            "cost_index": 5.0,           # moderate cost
            "puncture_strength_rating": 8.5, # high benefit
            "compostability_score": 9.0   # high benefit
        },
        {
            "name": "Low Barrier Thin Option",
            "barrier_margin": 1.2,       # lower benefit
            "nominal_thickness_um": 35.0, # lower thickness
            "cost_index": 4.0,           # lower cost
            "puncture_strength_rating": 6.0,
            "compostability_score": 7.5
        },
        {
            "name": "Heavy Expensive Option",
            "barrier_margin": 2.0,
            "nominal_thickness_um": 120.0,
            "cost_index": 9.0,
            "puncture_strength_rating": 9.0,
            "compostability_score": 7.0
        }
    ]

    ranked = rank_materials_topsis(candidates)

    assert len(ranked) == 3
    # Top candidate should be the balanced high barrier option
    assert ranked[0]["name"] == "High Barrier Option"
    # All closeness scores must be in [0.0, 1.0]
    for r in ranked:
        assert 0.0 <= r["topsis_score"] <= 1.0
    # Strict descending order
    assert ranked[0]["topsis_score"] >= ranked[1]["topsis_score"] >= ranked[2]["topsis_score"]
