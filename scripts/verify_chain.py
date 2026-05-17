"""Verify the real Base chain client by minting one certificate on-chain.

Run this once, before relying on `BaseChainClient` in production, to confirm
the platform admin key can actually mint against the live `AssayCertificate`
contract. It performs a real Base Sepolia transaction.

Usage (from the repo root, with the backend virtualenv):

    cd backend
    $env:ADMIN_PRIVATE_KEY = "0x..."          # the deployer / admin key
    .venv\\Scripts\\python.exe ..\\scripts\\verify_chain.py

Optional env (sensible defaults for the live deployment):
    BASE_RPC_URL                  default https://sepolia.base.org
    CERTIFICATE_CONTRACT_ADDRESS  default the live AssayCertificate address
    BASE_CHAIN_ID                 default 84532 (Base Sepolia)

On success it prints the transaction hash and a Basescan link — open it to
confirm the mint landed. The admin key is read from the environment only and
is never written anywhere.
"""

from __future__ import annotations

import asyncio
import os
import sys
from datetime import UTC, datetime

from assay.adapters.chain import BaseChainClient

_DEFAULT_CONTRACT = "0xdC409dBC3eb2824F2a7c7a1D0Cec2aeD34dAAe30"
_DEFAULT_RPC = "https://sepolia.base.org"
_DEFAULT_CHAIN_ID = 84532

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


async def main() -> int:
    private_key = os.environ.get("ADMIN_PRIVATE_KEY", "").strip()
    if not private_key:
        print("ERROR: set ADMIN_PRIVATE_KEY in the environment first.", file=sys.stderr)
        return 1

    contract = os.environ.get("CERTIFICATE_CONTRACT_ADDRESS", _DEFAULT_CONTRACT)
    rpc_url = os.environ.get("BASE_RPC_URL", _DEFAULT_RPC)
    chain_id = int(os.environ.get("BASE_CHAIN_ID", _DEFAULT_CHAIN_ID))

    client = BaseChainClient(
        rpc_url=rpc_url,
        private_key=private_key,
        contract_address=contract,
        chain_id=chain_id,
    )
    print(f"→ Admin account: {client.admin_address}")
    print(f"→ Contract:      {contract}")
    print("→ Minting one verification certificate on-chain...")

    idempotency_key = f"verify-{datetime.now(UTC).strftime('%Y%m%d-%H%M%S')}"
    result = await client.mint_certificate(
        owner_wallet="",  # no recipient — mints to the admin custodian
        ipfs_hash="QmVerifyChainClient",
        idempotency_key=idempotency_key,
    )

    print(f"✓ Minted token id {result.token_id}")
    print(f"✓ Tx hash: {result.tx_hash}")
    print(f"✓ Basescan: https://sepolia.basescan.org/tx/{result.tx_hash}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
