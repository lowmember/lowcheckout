import type { Account } from "@/domain/accounts/entities/account.entity";

/**
 * Porta de persistência de contas. A conta é a raiz do isolamento: não existe
 * consulta "todas as contas" — sempre se chega a uma pelo id ou pelo documento.
 */
export interface AccountsRepository {
  findById(accountId: string): Promise<Account | null>;
  /** Sustenta a unicidade do documento entre contas vivas (RF-ONB-02). */
  findByDocument(document: string): Promise<Account | null>;
  create(account: Account): Promise<void>;
  update(account: Account): Promise<void>;
}
