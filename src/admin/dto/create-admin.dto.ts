export class CreateAdminDto {
  name: string;
  surname: string;
  username: string;
  password: string;
  priority?: number;
  avatar?: string;
}
