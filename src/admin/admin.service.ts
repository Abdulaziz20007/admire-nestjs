import {
  Injectable,
  ConflictException,
  Inject,
  NotFoundException,
} from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
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
    private readonly cloudflareService: CloudflareService,
  ) {}

  async create(createAdminDto: CreateAdminDto, avatar?: Express.Multer.File) {
    const oldAdmin = await this.db.query.admins.findFirst({
      where: eq(admins.username, createAdminDto.username),
    });
    if (oldAdmin) {
      throw new ConflictException("Username is already in use.");
    }

    let avatarUrl: string | undefined;
    if (avatar) {
      avatarUrl = await this.cloudflareService.uploadFile(avatar, "admins");
    }

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
        priority: admins.priority,
        avatar: admins.avatar,
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
    avatar?: Express.Multer.File,
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

    const { avatar: _avatar, ...rest } = updateAdminDto;

    const [row] = await this.db
      .update(admins)
      .set({ ...rest, avatar: avatarUrl })
      .where(eq(admins.id, id))
      .returning();
    const { password, refresh_token, ...safe } = row;
    return safe;
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
