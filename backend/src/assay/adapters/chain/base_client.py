from __future__ import annotations

import asyncio
from typing import Any

from eth_account import Account
from eth_account.signers.local import LocalAccount
from web3 import AsyncHTTPProvider, AsyncWeb3, Web3

from assay.adapters.chain.stub_client import MintResult

_ZERO_ADDRESS = "0x" + "0" * 40
_RECEIPT_TIMEOUT_SECONDS = 120
_TOKEN_ID_BYTES = 8  # uint64 token ids — deterministic and collision-resistant
_TX_SUCCESS = 1

# Minimal ABI — only the two state-changing functions the platform calls.
_CONTRACT_ABI: list[dict[str, Any]] = [
    {
        "type": "function",
        "name": "mint",
        "stateMutability": "nonpayable",
        "inputs": [
            {"name": "to", "type": "address"},
            {"name": "tokenId", "type": "uint256"},
            {"name": "ipfsHash", "type": "string"},
        ],
        "outputs": [],
    },
    {
        "type": "function",
        "name": "attestVault",
        "stateMutability": "nonpayable",
        "inputs": [
            {"name": "tokenId", "type": "uint256"},
            {"name": "vaultRef", "type": "string"},
        ],
        "outputs": [],
    },
]


class ChainTransactionError(RuntimeError):
    """Raised when an on-chain transaction is rejected or reverts."""


def derive_token_id(idempotency_key: str) -> int:
    """Map an idempotency key to a deterministic uint64 ERC-721 token id.

    Deterministic so a replayed mint resolves to the same token id — the
    contract's `_safeMint` then reverts on the duplicate instead of issuing a
    second certificate for the same escrow.
    """
    digest = Web3.keccak(text=idempotency_key)
    return int.from_bytes(digest[:_TOKEN_ID_BYTES], "big")


def resolve_recipient(owner_wallet: str, custodian: str) -> str:
    """Return a checksummed recipient address, or the custodian as fallback.

    Demo escrows carry no buyer wallet; the platform custodies the certificate
    until release, so an absent or zero address resolves to the admin account.
    """
    candidate = (owner_wallet or "").strip()
    if Web3.is_address(candidate) and candidate.lower() != _ZERO_ADDRESS:
        return Web3.to_checksum_address(candidate)
    return custodian


class BaseChainClient:
    """Real `ChainClient` against an EVM chain (Base Sepolia).

    Signs `AssayCertificate` transactions with the platform admin key. It is
    selected over `StubChainClient` in `dependencies._chain()` only when an
    admin key is configured; CI and local dev fall back to the stub. See
    `docs/adr/decisions.md` ADR-005.
    """

    def __init__(
        self,
        *,
        rpc_url: str,
        private_key: str,
        contract_address: str,
        chain_id: int,
    ) -> None:
        self._w3 = AsyncWeb3(AsyncHTTPProvider(rpc_url))
        self._account: LocalAccount = Account.from_key(private_key)
        self._contract_address = Web3.to_checksum_address(contract_address)
        self._contract = self._w3.eth.contract(address=self._contract_address, abi=_CONTRACT_ABI)
        self._chain_id = chain_id
        self._lock = asyncio.Lock()  # serialise nonce allocation across requests

    @property
    def admin_address(self) -> str:
        """Checksummed address of the signing admin account."""
        return self._account.address

    async def mint_certificate(
        self, *, owner_wallet: str, ipfs_hash: str, idempotency_key: str
    ) -> MintResult:
        token_id = derive_token_id(idempotency_key)
        recipient = resolve_recipient(owner_wallet, self._account.address)
        tx_hash = await self._send(self._contract.functions.mint(recipient, token_id, ipfs_hash))
        return MintResult(
            token_id=token_id,
            tx_hash=tx_hash,
            contract_address=self._contract_address,
        )

    async def attest_vault(self, *, token_id: int, vault_ref: str) -> str:
        return await self._send(self._contract.functions.attestVault(token_id, vault_ref))

    async def _send(self, function_call: Any) -> str:
        """Build, sign, broadcast, and confirm a contract transaction.

        The lock is held only across nonce allocation and broadcast — the
        slow receipt wait runs unlocked so concurrent calls do not block.
        """
        async with self._lock:
            nonce = await self._w3.eth.get_transaction_count(self._account.address, "pending")
            tx = await function_call.build_transaction(
                {
                    "from": self._account.address,
                    "nonce": nonce,
                    "chainId": self._chain_id,
                }
            )
            signed = self._account.sign_transaction(tx)
            tx_hash = await self._w3.eth.send_raw_transaction(signed.raw_transaction)

        receipt = await self._w3.eth.wait_for_transaction_receipt(
            tx_hash, timeout=_RECEIPT_TIMEOUT_SECONDS
        )
        if receipt["status"] != _TX_SUCCESS:
            raise ChainTransactionError(f"transaction {Web3.to_hex(tx_hash)} reverted on-chain")
        return Web3.to_hex(tx_hash)
