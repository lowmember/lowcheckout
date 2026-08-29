import type { UserDto } from "@/application/users/dtos/user.dto";
import type { User } from "@/domain/users/entities/user.entity";

export function toUserDto(user: User): UserDto {
  const snapshot = user.toSnapshot();

  return {
    id: snapshot.id,
    email: snapshot.email,
    name: snapshot.name,
    avatarUrl: snapshot.avatarUrl,
    lastLoginAt: snapshot.lastLoginAt?.toISOString() ?? null,
    createdAt: snapshot.createdAt.toISOString(),
  };
}
