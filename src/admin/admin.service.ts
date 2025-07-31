import {
  Injectable,
  ConflictException,
  BadRequestException,
  Inject,
  NotFoundException,
} from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { ChangeAdminPasswordDto } from "./dto/change-admin-password.dto";
import { DB } from "../drizzle/db"; // we'll create export
import { admins } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { IdChecker } from "../common/filters/id-checker";
import { CloudflareService } from "../cloudflare/cloudflare.service";

@Injectable()
export class AdminService {
  private readonly idChecker = new IdChecker();
  constructor(
    @Inject("DRIZZLE") private readonly db: DB,
    private readonly cloudflareService: CloudflareService
  ) {}

  async create(createAdminDto: CreateAdminDto, avatar?: Express.Multer.File) {
    const oldAdmin = await this.db.query.admins.findFirst({
      where: eq(admins.username, createAdminDto.username),
    });
    if (oldAdmin) {
      throw new ConflictException("Username is already in use.");
    }

    // Determine avatar URL: priority is uploaded file, otherwise provided string in DTO
    let avatarUrl: string | undefined = createAdminDto.avatar;

    // If a file is provided, upload it and overwrite the URL
    if (avatar) {
      avatarUrl = await this.cloudflareService.uploadFile(avatar, "admins");
    }

    // Exclude avatar from the rest of the DTO to avoid duplicate column assignment
    const { avatar: _avatar, ...rest } = createAdminDto;

    const [row] = await this.db
      .insert(admins)
      .values({
        ...rest,
        avatar: avatarUrl,
      })
      .returning();

    const { password, refresh_token, ...safe } = row;
    return safe;
  }

  async findAll() {
    return this.db
      .select({
        id: admins.id,
        name: admins.name,
        surname: admins.surname,
        username: admins.username,
        avatar: admins.avatar,
        // Explicitly excluding password and refresh_token by not selecting them
      })
      .from(admins);
  }

  async findOne(id: number) {
    this.idChecker.check(id);
    return this.db.query.admins.findFirst({
      where: eq(admins.id, id),
      columns: {
        password: false,
        refresh_token: false,
      },
    });
  }

  async findOneByUsername(username: string) {
    return this.db.query.admins.findFirst({
      where: eq(admins.username, username),
    });
  }

  async findOneByRefreshToken(refreshToken: string) {
    return this.db.query.admins.findFirst({
      where: eq(admins.refresh_token, refreshToken),
    });
  }

  async update(
    id: number,
    updateAdminDto: UpdateAdminDto,
    avatar?: Express.Multer.File
  ) {
    this.idChecker.check(id);
    const existingAdmin = await this.findOne(id);
    if (!existingAdmin) {
      throw new NotFoundException("Admin not found.");
    }

    let avatarUrl: string | undefined;
    if (avatar) {
      if (existingAdmin.avatar) {
        await this.cloudflareService.deleteFile(existingAdmin.avatar);
      }
      avatarUrl = await this.cloudflareService.uploadFile(avatar, "admins");
    }

    // Explicitly exclude avatar and password from the update payload
    const {
      avatar: _avatar,
      password: _password,
      ...rest
    } = updateAdminDto as any;

    const [row] = await this.db
      .update(admins)
      .set({ ...rest, avatar: avatarUrl })
      .where(eq(admins.id, id))
      .returning();
    const { password, refresh_token, ...safe } = row;
    return safe;
  }

  async changePassword(dto: ChangeAdminPasswordDto) {
    if (!dto) {
      throw new BadRequestException("Request body is missing.");
    }
    const { admin_id, old_password, new_password } = dto;
    this.idChecker.check(admin_id);

    const admin = await this.db.query.admins.findFirst({
      where: eq(admins.id, admin_id),
    });

    if (!admin) {
      throw new NotFoundException("Admin not found.");
    }

    // TODO: replace plain comparison with hashed password check when hashing is implemented
    if (admin.password !== old_password) {
      throw new ConflictException("Old password is incorrect.");
    }

    await this.db
      .update(admins)
      .set({ password: new_password })
      .where(eq(admins.id, admin_id));

    return { message: "Password updated successfully." };
  }

  async saveRefreshToken(id: number, refreshToken: string) {
    this.idChecker.check(id);
    await this.db
      .update(admins)
      .set({ refresh_token: refreshToken })
      .where(eq(admins.id, id));
  }

  async removeRefreshToken(refreshToken: string) {
    await this.db
      .update(admins)
      .set({ refresh_token: null })
      .where(eq(admins.refresh_token, refreshToken));
  }

  async remove(id: number) {
    if (id === 1) {
      throw new ConflictException(
        "The primary admin with id 1 cannot be deleted."
      );
    }
    const admin = await this.findOne(id);
    if (admin && admin.avatar) {
      await this.cloudflareService.deleteFile(admin.avatar);
    }
    const [deleted] = await this.db
      .delete(admins)
      .where(eq(admins.id, id))
      .returning();
    return deleted;
  }
}
