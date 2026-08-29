import type { User } from "@/domain/users/entities/user.entity";

export interface UsersRepository {
  findById(userId: string): Promise<User | null>;
  /** Caminho normal de login: o `sub` do Google é a chave (RF-AUTH-01). */
  findByGoogleSub(googleSub: string): Promise<User | null>;
  /** Rede de segurança do `unique(email)`: mesmo e-mail é sempre o mesmo usuário. */
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
}
