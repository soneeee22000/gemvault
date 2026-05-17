from __future__ import annotations

import pytest

from assay.adapters.chain import BaseChainClient, derive_token_id, resolve_recipient

# A throwaway, well-formed 32-byte key — used only to exercise local construction.
_TEST_KEY = "0x" + "11" * 32
_CONTRACT = "0xdC409dBC3eb2824F2a7c7a1D0Cec2aeD34dAAe30"
_UINT64_MAX = 2**64


class TestDeriveTokenId:
    def test_is_deterministic(self) -> None:
        assert derive_token_id("escrow-abc") == derive_token_id("escrow-abc")

    def test_distinct_keys_distinct_ids(self) -> None:
        assert derive_token_id("escrow-abc") != derive_token_id("escrow-xyz")

    def test_fits_in_uint64(self) -> None:
        token_id = derive_token_id("11111111-2222-3333-4444-555555555555")
        assert 0 <= token_id < _UINT64_MAX


class TestResolveRecipient:
    _CUSTODIAN = "0xE07c1dDc4D555B085BB211acdcf70C0Ff7b1f5E8"

    @pytest.mark.parametrize("absent", ["", "   ", "0x0", "0x" + "0" * 40])
    def test_absent_or_zero_falls_back_to_custodian(self, absent: str) -> None:
        assert resolve_recipient(absent, self._CUSTODIAN) == self._CUSTODIAN

    def test_valid_address_is_checksummed(self) -> None:
        lowercased = self._CUSTODIAN.lower()
        assert resolve_recipient(lowercased, "0x" + "0" * 39 + "1") == self._CUSTODIAN


class TestBaseChainClientConstruction:
    def test_constructs_without_network_io(self) -> None:
        client = BaseChainClient(
            rpc_url="https://sepolia.base.org",
            private_key=_TEST_KEY,
            contract_address=_CONTRACT,
            chain_id=84532,
        )
        assert client.admin_address.startswith("0x")
        assert len(client.admin_address) == 42
