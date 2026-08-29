import type { AccountDto } from "@/application/accounts/dtos/account.dto";
import type { UserDto } from "@/application/users/dtos/user.dto";

export interface MeDto {
  user: UserDto;
  account: AccountDto;
  onboardingPending: boolean;
}
