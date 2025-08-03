import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { CreateWebMediaDto } from "./dto/create-web-media.dto";
import { UpdateWebMediaDto } from "./dto/update-web-media.dto";
import { DB } from "../drizzle/db";
import { web_media } from "../drizzle/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class WebMediaService {
  constructor(@Inject("DRIZZLE") private readonly db: DB) {}

  async create(createWebMediaDto: CreateWebMediaDto) {
    const [row] = await this.db
      .insert(web_media)
      .values({
        ...createWebMediaDto,
        web_id: Number(createWebMediaDto.web_id),
        media_id: Number(createWebMediaDto.media_id),
      })
      .returning();
    return row;
  }

  findAll() {
    return this.db.select().from(web_media);
  }

  async findOne(id: string) {
    const found = await this.db.query.web_media.findFirst({
      where: eq(web_media.id, Number(id)),
    });

    if (!found) {
      throw new NotFoundException("Web media not found.");
    }
    return found;
  }

  async update(id: string, updateWebMediaDto: UpdateWebMediaDto) {
    const [row] = await this.db
      .update(web_media)
      .set({
        ...updateWebMediaDto,
        web_id: updateWebMediaDto.web_id
          ? Number(updateWebMediaDto.web_id)
          : undefined,
        media_id: updateWebMediaDto.media_id
          ? Number(updateWebMediaDto.media_id)
          : undefined,
      })
      .where(eq(web_media.id, Number(id)))
      .returning();
    if (!row) {
      throw new NotFoundException("Web media not found.");
    }
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(web_media)
      .where(eq(web_media.id, Number(id)))
      .returning();
    if (!row) {
      throw new NotFoundException("Web media not found.");
    }
    return row;
  }
}
