export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  isActive?: boolean;
  roleIds?: string[];
}
