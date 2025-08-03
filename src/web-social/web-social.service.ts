import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { CreateWebSocialDto } from "./dto/create-web-social.dto";
import { UpdateWebSocialDto } from "./dto/update-web-social.dto";
import { DB } from "../drizzle/db";
import { web_social } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

@Injectable()
export class WebSocialService {
  constructor(@Inject("DRIZZLE") private readonly db: DB) {}

  async create(createWebSocialDto: CreateWebSocialDto) {
    const existing = await this.db.query.web_social.findFirst({
      where: and(
        eq(web_social.web_id, Number(createWebSocialDto.web_id)),
        eq(web_social.social_id, Number(createWebSocialDto.social_id)),
      ),
    });
    if (existing) {
      throw new ConflictException(
        "This social media is already associated with this web configuration.",
      );
    }
    const [row] = await this.db
      .insert(web_social)
      .values({
        web_id: Number(createWebSocialDto.web_id),
        social_id: Number(createWebSocialDto.social_id),
      })
      .returning();
    return row;
  }

  findAll() {
    return this.db.select().from(web_social);
  }

  async findOne(id: string) {
    const row = await this.db.query.web_social.findFirst({
      where: eq(web_social.id, Number(id)),
    });
    if (!row) {
      throw new NotFoundException("Web social association not found.");
    }
    return row;
  }

  async update(id: string, updateWebSocialDto: UpdateWebSocialDto) {
    if (updateWebSocialDto.web_id && updateWebSocialDto.social_id) {
      const existing = await this.db.query.web_social.findFirst({
        where: and(
          eq(web_social.web_id, Number(updateWebSocialDto.web_id)),
          eq(web_social.social_id, Number(updateWebSocialDto.social_id)),
          eq(web_social.id, Number(id)),
        ),
      });
      if (existing) {
        throw new ConflictException(
          "This social media is already associated with this web configuration.",
        );
      }
    }
    const [row] = await this.db
      .update(web_social)
      .set({
        web_id: updateWebSocialDto.web_id
          ? Number(updateWebSocialDto.web_id)
          : undefined,
        social_id: updateWebSocialDto.social_id
          ? Number(updateWebSocialDto.social_id)
          : undefined,
      })
      .where(eq(web_social.id, Number(id)))
      .returning();
    if (!row) {
      throw new NotFoundException("Web social association not found.");
    }
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(web_social)
      .where(eq(web_social.id, Number(id)))
      .returning();
    if (!row) {
      throw new NotFoundException("Web social association not found.");
    }
    return row;
  }
}
