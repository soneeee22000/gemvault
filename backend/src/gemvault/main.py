from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from gemvault import __version__
from gemvault.adapters.api import api_router, install_exception_handlers

_DESCRIPTION = (
    "Reference RWA fintech backend: financial-grade ledger + on-chain certificate orchestration."
)

app = FastAPI(
    title="GemVault Backend",
    version=__version__,
    description=_DESCRIPTION,
)

install_exception_handlers(app)
app.include_router(api_router)


@app.get("/health", tags=["meta"])
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok", "version": __version__})
