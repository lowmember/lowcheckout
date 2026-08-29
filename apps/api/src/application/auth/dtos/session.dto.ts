import type { AccountDto } from "@/application/accounts/dtos/account.dto";
import type { UserDto } from "@/application/users/dtos/user.dto";

/**
 * O que o frontend recebe ao autenticar ou renovar. O `refreshToken` aparece em
 * claro **só aqui**: no banco existe apenas o SHA-256 dele.
 */
export interface SessionDto {
  tokenType: "Bearer";
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: UserDto;
  account: AccountDto;
  /** Atalho de RF-ONB-01 para o frontend decidir o redirecionamento. */
  onboardingPending: boolean;
}
