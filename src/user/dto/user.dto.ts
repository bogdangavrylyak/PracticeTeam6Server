export class UserDto {
  id: number;

  FirstName: string;

  LastName: string;

  Email: string;

  Password: string;

  refreshToken!: string | null;

  CartTotalPrice: number;
}
