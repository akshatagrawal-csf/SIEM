# 🛡️ Intelligent SIEM Analytics System

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

An Intelligent Security Information and Event Management (SIEM) Analytics System for proactive threat detection, attack correlation, and incident prioritization.

## ✨ Key Features
1. **Real-time Event Ingestion & Processing**: Handle millions of security logs efficiently.
2. **AI-driven Threat Detection**: Leverage machine learning to identify anomalous behavior.
3. **Attack Chain Correlation**: Map disconnected alerts into actionable attack storylines.
4. **Dynamic Risk Scoring**: Prioritize incidents based on business context and asset value.
5. **Interactive SOC Dashboard**: Visualize threats in real-time with an intuitive React UI.
6. **Automated Incident Response Recommendations**: Suggest remediation steps based on past patterns.
7. **Compliance & Reporting**: Generate comprehensive audit reports for regulatory compliance.

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────┐
│          React Frontend (Vite)              │
│   SOC Dashboard • Charts • Attack Chains    │
└──────────────────┬──────────────────────────┘
                   │ REST API + WebSocket
┌──────────────────▼──────────────────────────┐
│          FastAPI Backend (Python)            │
│  Rule Engine │ ML Models │ Risk Scoring     │
│  Attack Correlator │ Recommendation Engine  │
└──────────────────┬──────────────────────────┘
         ┌─────────┼─────────┐
    ┌────▼────┐ ┌──▼──┐ ┌───▼────┐
    │PostgreSQL│ │Redis│ │Models  │
    │   DB    │ │Cache│ │(.pkl)  │
    └─────────┘ └─────┘ └────────┘
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Python 3.10+, FastAPI, SQLAlchemy |
| Database | PostgreSQL 15, Redis |
| Machine Learning | Scikit-learn, Pandas, NumPy, Joblib |
| Deployment | Docker, Docker Compose |

## 🚀 Quick Start

### Using Docker Compose
1. Clone the repository: `git clone https://github.com/yourusername/siem-analytics.git`
2. Navigate to project: `cd siem-analytics`
3. Run with Docker: `docker-compose up -d --build`
4. Access frontend at `http://localhost:5173` and backend API at `http://localhost:8000/docs`

### Manual Setup
1. Create a virtual environment: `python -m venv .venv`
2. Activate it and install requirements: `pip install -r backend/requirements.txt`
3. Install frontend dependencies: `cd frontend && npm install`
4. Run Postgres and Redis locally or via Docker.
5. Run backend: `cd backend && uvicorn app.main:app --reload`
6. Run frontend: `cd frontend && npm run dev`

## 🖥️ Dashboard Screenshots
*Screenshots will be added after completion*

## 📁 Project Structure
```text
SIEM/
├── docker-compose.yml
├── .env
├── .gitignore
├── README.md
├── frontend/
│   ├── Dockerfile
│   └── src/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── routes/
│   │   │   └── __init__.py
│   │   └── services/
│   │       └── __init__.py
│   ├── data/
│   │   └── raw/
│   │       └── .gitkeep
│   ├── ml/
│   │   ├── __init__.py
│   │   └── models/
│   │       └── .gitkeep
│   └── tests/
│       └── __init__.py
├── notebooks/
│   └── .gitkeep
└── models/
    └── .gitkeep
```

## 👥 Team Roles

| Role | Responsibilities |
|------|------------------|
| Data Engineer | Log ingestion pipelines, data parsing, and storage architecture. |
| ML Engineer | Threat detection models, anomaly scoring, and risk quantification. |
| Backend Developer | FastAPI development, real-time WebSockets, core business logic. |
| Frontend Developer | React dashboard, data visualizations, attack chain mapping UI. |

## 🔌 API Endpoints (Core)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/events` | List security events |
| POST | `/api/events` | Ingest new events |
| GET | `/api/threats` | Active threats list |
| GET | `/api/attack-chains` | Correlated attack chains |
| GET | `/api/risk-scores` | Asset risk evaluation |

## 📄 License
Educational - IBM SkillsBuild Program
