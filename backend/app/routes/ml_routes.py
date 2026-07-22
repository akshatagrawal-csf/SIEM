"""
SIEM Analytics System - ML Routes

Endpoints:
  POST /api/ml/predict             → Run ML prediction on event
  GET  /api/ml/performance         → Return model comparison metrics
  GET  /api/ml/feature-importance  → Return feature importance rankings
"""
from fastapi import APIRouter, Query, status

from app.schemas import (
    MLPredictionRequest,
    MLPredictionResponse,
    MLPerformanceResponse,
    FeatureImportanceItem,
)
from app.services.ml_service import (
    predict_event,
    get_model_metrics,
    get_feature_importances,
)
from app.services.risk_scoring import calculate_risk_score

router = APIRouter()


@router.post(
    "/predict",
    response_model=MLPredictionResponse,
    summary="Run ML prediction on an event",
    description="Accepts event features, predicts malicious vs normal using trained models, and calculates composite risk score.",
)
async def predict_ml_event(
    event_data: MLPredictionRequest,
    model_name: str = Query("Random Forest", description="Model to use: 'Random Forest', 'Decision Tree', 'Logistic Regression'"),
):
    event_dict = event_data.model_dump()
    
    # Run ML prediction
    prediction_result = predict_event(event_dict, model_name=model_name)
    
    pred_label = prediction_result["prediction"]
    confidence = prediction_result["confidence"]

    # Calculate composite risk score
    risk = calculate_risk_score(event_dict, ml_prediction=pred_label, ml_confidence=confidence)

    return MLPredictionResponse(
        prediction=pred_label,
        confidence=confidence,
        risk_score=risk,
        model_used=prediction_result["model_used"],
    )


@router.get(
    "/performance",
    response_model=MLPerformanceResponse,
    summary="Get model performance metrics",
    description="Returns accuracy, precision, recall, and F1-score comparison for all trained classifiers.",
)
async def get_performance():
    metrics = get_model_metrics()
    return MLPerformanceResponse(models=metrics)


@router.get(
    "/feature-importance",
    response_model=list[FeatureImportanceItem],
    summary="Get feature importance rankings",
    description="Returns relative weight of each feature in Random Forest threat classification.",
)
async def get_feature_importance():
    return get_feature_importances()
