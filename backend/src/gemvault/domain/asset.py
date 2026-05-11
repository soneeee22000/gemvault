from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from uuid import UUID

from .events import AssetRegistered, DomainEvent
from .value_objects import IpfsHash


@dataclass(slots=True)
class Asset:
    """A physical asset under platform custody (gemstones, in the worked example).

    Identity is `asset_id`. `lab_cert_number` is the off-chain ground-truth
    reference (GIA / SSEF / AGL / IGS etc) — global uniqueness is enforced at
    the persistence layer, not here.
    """

    asset_id: UUID
    asset_type: str
    lab_cert_number: str
    vault_location: str
    owner_user_id: UUID
    grade: str | None = None
    weight_carats: Decimal | None = None
    photo_ipfs_hash: IpfsHash | None = None
    _uncommitted: list[DomainEvent] = field(default_factory=list, repr=False)

    @classmethod
    def register(  # noqa: PLR0913
        cls,
        *,
        asset_id: UUID,
        asset_type: str,
        lab_cert_number: str,
        vault_location: str,
        owner_user_id: UUID,
        grade: str | None = None,
        weight_carats: Decimal | None = None,
        photo_ipfs_hash: IpfsHash | None = None,
    ) -> Asset:
        if not asset_type.strip():
            raise ValueError("asset_type must not be blank")
        if not lab_cert_number.strip():
            raise ValueError("lab_cert_number must not be blank")
        if not vault_location.strip():
            raise ValueError("vault_location must not be blank")
        if weight_carats is not None and weight_carats <= 0:
            raise ValueError(f"weight_carats must be positive: {weight_carats}")

        asset = cls(
            asset_id=asset_id,
            asset_type=asset_type,
            lab_cert_number=lab_cert_number,
            vault_location=vault_location,
            owner_user_id=owner_user_id,
            grade=grade,
            weight_carats=weight_carats,
            photo_ipfs_hash=photo_ipfs_hash,
        )
        asset._uncommitted.append(
            AssetRegistered(
                asset_id=asset_id,
                asset_type=asset_type,
                lab_cert_number=lab_cert_number,
                vault_location=vault_location,
                owner_user_id=owner_user_id,
            )
        )
        return asset

    def transfer_ownership(self, new_owner_id: UUID) -> None:
        self.owner_user_id = new_owner_id

    def pull_events(self) -> list[DomainEvent]:
        events = list(self._uncommitted)
        self._uncommitted.clear()
        return events
