import type { Buyer } from "@/domain/buyers/entities/buyer.entity";

export interface BuyersRepository {
  /** O `unique(account_id, email)` é o que reaproveita o comprador entre compras. */
  findByAccountAndEmail(accountId: string, email: string): Promise<Buyer | null>;
  create(buyer: Buyer): Promise<void>;
  update(buyer: Buyer): Promise<void>;
}
