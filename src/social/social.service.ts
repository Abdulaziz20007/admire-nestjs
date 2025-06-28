import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { CreateSocialDto } from "./dto/create-social.dto";
import { UpdateSocialDto } from "./dto/update-social.dto";
import { DB } from "../drizzle/db";
import { socials } from "../drizzle/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class SocialService {
  constructor(@Inject("DRIZZLE") private readonly db: DB) {}

  async create(createSocialDto: CreateSocialDto) {
    const existingSocial = await this.db.query.socials.findFirst({
      where: eq(socials.name, createSocialDto.name),
    });
    if (existingSocial) {
      throw new ConflictException("Social media name already exists.");
    }
    const [createdSocial] = await this.db
      .insert(socials)
      .values(createSocialDto)
      .returning();
    return createdSocial;
  }

  findAll() {
    return this.db.select().from(socials);
  }

  async findOne(id: number) {
    const social = await this.db.query.socials.findFirst({
      where: eq(socials.id, id),
    });
    if (!social) {
      throw new NotFoundException("Social media not found.");
    }
    return social;
  }

  async update(id: number, updateSocialDto: UpdateSocialDto) {
    if (updateSocialDto.name) {
      const existingSocial = await this.db.query.socials.findFirst({
        where: eq(socials.name, updateSocialDto.name),
      });
      if (existingSocial && existingSocial.id !== id) {
        throw new ConflictException("Social media name already exists.");
      }
    }
    const [updatedSocial] = await this.db
      .update(socials)
      .set(updateSocialDto)
      .where(eq(socials.id, id))
      .returning();
    if (!updatedSocial) {
      throw new NotFoundException("Social media not found.");
    }
    return updatedSocial;
  }

  async remove(id: number) {
    const [deletedSocial] = await this.db
      .delete(socials)
      .where(eq(socials.id, id))
      .returning();
    if (!deletedSocial) {
      throw new NotFoundException("Social media not found.");
    }
    return deletedSocial;
  }
}
