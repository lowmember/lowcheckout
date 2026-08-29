import { Buyer } from "@/domain/buyers/entities/buyer.entity";
import type { BuyerRow, NewBuyerRow } from "@/infra/persistence/drizzle/schema";

export function toBuyer(row: BuyerRow): Buyer {
  return Buyer.restore({
    id: row.id,
    accountId: row.accountId,
    name: row.name,
    email: row.email,
    document: row.document,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toBuyerRow(buyer: Buyer): NewBuyerRow {
  const snapshot = buyer.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    name: snapshot.name,
    email: snapshot.email,
    document: snapshot.document,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}
