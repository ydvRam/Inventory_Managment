export class UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  isActive?: boolean;
  roleIds?: string[];
}
