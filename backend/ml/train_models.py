"""
SIEM Analytics System - ML Model Trainer

Trains three classification models (Random Forest, Decision Tree, Logistic Regression) on synthetic security log data.
Saves serialized model artifacts (.pkl) to backend/ml/models/ for real-time inference.

Run standalone:
    cd backend
    python -m ml.train_models
"""
import os
import sys
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Add backend root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from ml.feature_engineering import prepare_features_df

# Paths
DATA_CSV = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw", "security_events.csv")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


def main():
    print("[*] Starting SIEM ML Model Training Pipeline...")
    os.makedirs(MODELS_DIR, exist_ok=True)

    if not os.path.exists(DATA_CSV):
        print(f"[ERROR] Training CSV not found at {DATA_CSV}. Run data generator first!")
        return

    # Load dataset
    df = pd.read_csv(DATA_CSV)
    print(f"[OK] Loaded {len(df)} security log samples from CSV")

    # Extract feature matrix X and label vector y
    X, y = prepare_features_df(df)

    # Train / Test Split (80/20 Stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"[*] Train set size: {len(X_train)} | Test set size: {len(X_test)}")

    # Initialize 3 classifiers
    classifiers = {
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=8, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    }

    results = []

    for name, model in classifiers.items():
        print(f"\n[*] Training {name}...")
        model.fit(X_train, y_train)

        # Predictions
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)

        results.append({
            "name": name,
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1": f1,
        })

        print(f"    [RESULTS] Accuracy: {acc:.4f} | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f}")

        # Save model .pkl file
        file_name = name.lower().replace(" ", "_") + ".pkl"
        save_path = os.path.join(MODELS_DIR, file_name)
        joblib.dump(model, save_path)
        print(f"    [OK] Saved model artifact to {save_path}")

    print("\n" + "=" * 50)
    print("[SUMMARY] ML Model Evaluation Comparison:")
    print("=" * 50)
    for res in results:
        print(f"  {res['name']:20s} | Acc: {res['accuracy'] * 100:.1f}% | Prec: {res['precision'] * 100:.1f}% | Rec: {res['recall'] * 100:.1f}% | F1: {res['f1'] * 100:.1f}%")

    print("\n[DONE] Model training pipeline finished successfully!")


if __name__ == "__main__":
    main()
