from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from app.copilot import ask_copilot

app = FastAPI(title="AeroGuard AI")

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"
UI_FILE = TEMPLATES_DIR / "copilot_ui.html"


class CopilotRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "AeroGuard AI API is running"}


@app.post("/copilot/ask")
def copilot_endpoint(request: CopilotRequest):
    answer = ask_copilot(request.question)
    return {"question": request.question, "answer": answer}


@app.get("/copilot-ui", response_class=HTMLResponse)
@app.get("/copilot-ui/", response_class=HTMLResponse, include_in_schema=False)
def copilot_ui():
    if UI_FILE.exists():
        return HTMLResponse(content=UI_FILE.read_text(encoding="utf-8"))
    return HTMLResponse(
        content="""<!DOCTYPE html>
<html>
<head><title>AeroGuard AI - Error</title></head>
<body style="background:#05080e;color:#e2e8f0;font-family:sans-serif;padding:2rem;">
  <h2>AeroGuard AI UI template not found at templates/copilot_ui.html</h2>
</body>
</html>""",
        status_code=404,
    )



@app.get("/copilot-ui", response_class=HTMLResponse)
@app.get("/copilot-ui/", response_class=HTMLResponse, include_in_schema=False)
def copilot_ui():
    if UI_FILE.exists():
        return HTMLResponse(content=UI_FILE.read_text(encoding="utf-8"))
    return HTMLResponse(
        content="""<!DOCTYPE html>
<html>
<head><title>AeroGuard AI - Error</title></head>
<body style="background:#05080e;color:#e2e8f0;font-family:sans-serif;padding:2rem;">
  <h2>AeroGuard AI UI template not found at templates/copilot_ui.html</h2>
</body>
</html>""",
        status_code=404,
    )