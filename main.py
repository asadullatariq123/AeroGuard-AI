"""
AeroGuard AI - Root Entry Point for Cloud Deployments (Render / Railway)
Directly bridges to backend.main:app
"""

from backend.main import app

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

