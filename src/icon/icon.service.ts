import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  BadRequestException,
} from "@nestjs/common";
import { CreateIconDto } from "./dto/create-icon.dto";
import { UpdateIconDto } from "./dto/update-icon.dto";
import { DB } from "../drizzle/db";
import { icons } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { CloudflareService } from "../cloudflare/cloudflare.service";

@Injectable()
export class IconService {
  constructor(
    @Inject("DRIZZLE") private readonly db: DB,
    private readonly cloudflareService: CloudflareService
  ) {}

  async create(createIconDto: CreateIconDto, file?: Express.Multer.File) {
    const existingIcon = await this.db.query.icons.findFirst({
      where: eq(icons.name, createIconDto.name),
    });
    if (existingIcon) {
      throw new ConflictException("Icon name already exists.");
    }

    let url: string;
    if (file) {
      url = await this.cloudflareService.uploadFile(file, "icons");
    } else {
      url = createIconDto.url;
    }

    if (!url) {
      throw new BadRequestException("Icon URL or file is required.");
    }

    const { url: _url, ...rest } = createIconDto;

    const [createdIcon] = await this.db
      .insert(icons)
      .values({ ...rest, url })
      .returning();
    return createdIcon;
  }

  findAll() {
    return this.db.select().from(icons);
  }

  async findOne(id: number) {
    const icon = await this.db.query.icons.findFirst({
      where: eq(icons.id, id),
    });
    if (!icon) {
      throw new NotFoundException("Icon not found.");
    }
    return icon;
  }

  async update(
    id: number,
    updateIconDto: UpdateIconDto,
    file?: Express.Multer.File
  ) {
    const existingIcon = await this.findOne(id);
    if (!existingIcon) {
      throw new NotFoundException("Icon not found.");
    }

    if (updateIconDto.name) {
      const anotherIconWithSameName = await this.db.query.icons.findFirst({
        where: eq(icons.name, updateIconDto.name),
      });
      if (anotherIconWithSameName && anotherIconWithSameName.id !== id) {
        throw new ConflictException("Icon name already exists.");
      }
    }

    let url: string | undefined;
    if (file) {
      if (existingIcon.url) {
        await this.cloudflareService.deleteFile(existingIcon.url);
      }
      url = await this.cloudflareService.uploadFile(file, "icons");
    }

    const { url: _url, ...rest } = updateIconDto;
    const valuesToUpdate: any = { ...rest };
    if (url) {
      valuesToUpdate.url = url;
    }

    const [updatedIcon] = await this.db
      .update(icons)
      .set(valuesToUpdate)
      .where(eq(icons.id, id))
      .returning();
    if (!updatedIcon) {
      throw new NotFoundException("Icon not found.");
    }
    return updatedIcon;
  }

  async remove(id: number) {
    const icon = await this.findOne(id);
    if (icon && icon.url) {
      await this.cloudflareService.deleteFile(icon.url);
    }

    const [deletedIcon] = await this.db
      .delete(icons)
      .where(eq(icons.id, id))
      .returning();
    if (!deletedIcon) {
      throw new NotFoundException("Icon not found.");
    }
    return deletedIcon;
  }
}
