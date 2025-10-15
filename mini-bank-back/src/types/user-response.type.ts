import { User } from '../entities/user.entity';
import { AccountResponse, toAccountResponse } from './account-response.type';

export type UserResponse = {
  id: number;
  email: string;
  name: string;
  accounts?: AccountResponse[];
};

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    accounts: user.accounts?.map(toAccountResponse) || [],
  };
}
