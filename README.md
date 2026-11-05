<<<<<<< HEAD
# AeroGuard AI — Aircraft Maintenance Copilot

[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Gemini](https://img.shields.io/badge/Google%20GenAI-Gemini%203.8%20Flash-4285F4.svg?logo=google)](https://ai.google.dev)
[![VectorDB](https://img.shields.io/badge/ChromaDB-Vector%20Store-orange.svg)](https://www.trychroma.com)

AeroGuard AI is an intelligent aircraft maintenance assistant and technical copilot designed for certified aviation maintenance technicians, avionics engineers, and ground crews. It combines Retrieval-Augmented Generation (RAG) with ChromaDB and Google Gemini 3.8 Flash to query Aircraft Maintenance Manuals (AMM), Fault Isolation Manuals (FIM), and Component Maintenance Manuals (CMM).

> [!WARNING]
> **SAFETY MANDATE:** Demonstration only. Actual aircraft maintenance decisions must be made by authorized aviation maintenance professionals.

---

## Features

- **Dark Cinematic Aerospace HUD UI** (`/copilot-ui`): State-of-the-art glass cockpit dashboard with tactical styling, HUD reticles, and real-time telemetry.
- **RAG Technical Document Search**: Integrates ChromaDB vector embeddings for indexing aircraft maintenance manuals and technical specs.
- **Gemini 3.8 Flash Copilot**: Fast, safety-aligned responses referencing technical procedures, ATA chapters, and limit tolerances.
- **Verified Source Citations**: Visual cards highlighting referenced manuals, ATA chapters, and page numbers.
- **Aviation Utilities**:
  - Quick Dispatch Prompts for ATA 32 (Landing Gear), ATA 29 (Hydraulics), ATA 49 (APU), and ATA 71 (Power Plant).
  - Hands-free Text-to-Speech audio readout for maintenance hangars.
  - One-click directive copying and markdown work log export.

---

## Project Structure

```
Aerogaurd/
├── app/
│   ├── copilot.py              # Gemini 3.8 RAG copilot reasoning engine
│   ├── main.py                 # FastAPI application routes
│   └── templates/
│       └── copilot_ui.html     # Dark aerospace HUD dashboard UI
├── rag/
│   ├── documents/              # Maintenance PDFs and TXT files
│   ├── ingest.py               # Document chunking & ChromaDB embedding ingestion
│   ├── retriever.py            # Vector retrieval module
│   └── vector_db/              # ChromaDB vector store
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
└── README.md
```

---

## Quick Start

### 1. Prerequisites
- Python 3.10+
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 2. Installation

Clone the repository and create a virtual environment:
```bash
git clone <your-repo-url>
cd Aerogaurd

python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and set your Gemini API key:
```bash
cp .env.example .env
```
Edit `.env`:
```ini
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 4. Ingest Documents (Optional)

Add your aircraft maintenance PDFs or text manuals into `rag/documents/` and run:
```bash
python -m rag.ingest
```

### 5. Run the Server

Start the FastAPI application:
```bash
uvicorn app.main:app --reload --port 8000
```

Open your browser to:
- **Cockpit Dashboard**: [http://localhost:8000/copilot-ui](http://localhost:8000/copilot-ui)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/](http://localhost:8000/)

---

## API Reference

### Ask Copilot
- **Endpoint**: `POST /copilot/ask`
- **Request Body**:
  ```json
  {
    "question": "What are the inspection procedures for landing gear brake wear pins?"
  }
  ```
- **Response**:
  ```json
  {
    "question": "What are the inspection procedures for landing gear brake wear pins?",
    "answer": "..."
  }
  ```

---

## License

Demonstration and educational project. All maintenance decisions must follow certified manufacturer data and regulatory authority directives (FAA / EASA).

=======
# AeroGuard AI
AI-powered Aircraft Predictive Maintenance Platform

BUILD DX HACKATHON 2026 - Team Omega
>>>>>>> 6b41e88c50856590436f97db2baed6d28b4b477c
