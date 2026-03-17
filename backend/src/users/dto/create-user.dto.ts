export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  isActive?: boolean;
  roleIds?: string[];
  /** Role names (e.g. "admin", "user") for signup; roles are found or created by name. */
  roleNames?: string[];
}
