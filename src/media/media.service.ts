import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from "@nestjs/common";
import { CreateMediaDto } from "./dto/create-media.dto";
import { UpdateMediaDto } from "./dto/update-media.dto";
import { DB } from "../drizzle/db";
import { media } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { CloudflareService } from "../cloudflare/cloudflare.service";

@Injectable()
export class MediaService {
  constructor(
    @Inject("DRIZZLE") private readonly db: DB,
    private readonly cloudflareService: CloudflareService
  ) {}

  async create(createMediaDto: CreateMediaDto, file?: Express.Multer.File) {
    let url: string;
    if (file) {
      url = await this.cloudflareService.uploadFile(file, "media");
    } else {
      url = createMediaDto.url;
    }

    if (!url) {
      throw new BadRequestException("File or URL is required.");
    }

    const { url: _url, ...rest } = createMediaDto;

    const [createdMedia] = await this.db
      .insert(media)
      .values({
        ...rest,
        is_video: createMediaDto.is_video ?? false,
        url,
      })
      .returning();
    return createdMedia;
  }

  findAll() {
    return this.db.select().from(media);
  }

  async findOne(id: number) {
    const result = await this.db.query.media.findFirst({
      where: eq(media.id, id),
    });
    if (!result) {
      throw new NotFoundException("Media not found.");
    }
    return result;
  }

  async update(
    id: number,
    updateMediaDto: UpdateMediaDto,
    file?: Express.Multer.File
  ) {
    const existingMedia = await this.findOne(id);
    if (!existingMedia) {
      throw new NotFoundException("Media not found.");
    }

    let url: string | undefined;
    if (file) {
      if (existingMedia.url) {
        await this.cloudflareService.deleteFile(existingMedia.url);
      }
      url = await this.cloudflareService.uploadFile(file, "media");
    }

    const { url: _url, ...rest } = updateMediaDto;
    const valuesToUpdate: any = { ...rest };
    if (url) {
      valuesToUpdate.url = url;
    }

    const [updatedMedia] = await this.db
      .update(media)
      .set(valuesToUpdate)
      .where(eq(media.id, id))
      .returning();
    if (!updatedMedia) {
      throw new NotFoundException("Media not found.");
    }
    return updatedMedia;
  }

  async remove(id: number) {
    const existingMedia = await this.findOne(id);
    if (existingMedia && existingMedia.url) {
      await this.cloudflareService.deleteFile(existingMedia.url);
    }

    const [deletedMedia] = await this.db
      .delete(media)
      .where(eq(media.id, id))
      .returning();
    if (!deletedMedia) {
      throw new NotFoundException("Media not found.");
    }
    return deletedMedia;
  }
}
