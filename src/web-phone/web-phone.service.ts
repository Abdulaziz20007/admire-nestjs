import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { CreateWebPhoneDto } from "./dto/create-web-phone.dto";
import { UpdateWebPhoneDto } from "./dto/update-web-phone.dto";
import { DB } from "../drizzle/db";
import { web_phone } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

@Injectable()
export class WebPhoneService {
  constructor(@Inject("DRIZZLE") private readonly db: DB) {}

  async create(createWebPhoneDto: CreateWebPhoneDto) {
    const existing = await this.db.query.web_phone.findFirst({
      where: and(
        eq(web_phone.web_id, Number(createWebPhoneDto.web_id)),
        eq(web_phone.phone_id, Number(createWebPhoneDto.phone_id)),
      ),
    });
    if (existing) {
      throw new ConflictException(
        "This phone is already associated with this web configuration.",
      );
    }
    const [row] = await this.db
      .insert(web_phone)
      .values({
        web_id: Number(createWebPhoneDto.web_id),
        phone_id: Number(createWebPhoneDto.phone_id),
      })
      .returning();
    return row;
  }

  findAll() {
    return this.db.select().from(web_phone);
  }

  async findOne(id: string) {
    const row = await this.db.query.web_phone.findFirst({
      where: eq(web_phone.id, Number(id)),
    });
    if (!row) {
      throw new NotFoundException("Web phone association not found.");
    }
    return row;
  }

  async update(id: string, updateWebPhoneDto: UpdateWebPhoneDto) {
    if (updateWebPhoneDto.web_id && updateWebPhoneDto.phone_id) {
      const existing = await this.db.query.web_phone.findFirst({
        where: and(
          eq(web_phone.web_id, Number(updateWebPhoneDto.web_id)),
          eq(web_phone.phone_id, Number(updateWebPhoneDto.phone_id)),
          eq(web_phone.id, Number(id)),
        ),
      });
      if (existing) {
        throw new ConflictException(
          "This phone is already associated with this web configuration.",
        );
      }
    }
    const [row] = await this.db
      .update(web_phone)
      .set({
        web_id: updateWebPhoneDto.web_id
          ? Number(updateWebPhoneDto.web_id)
          : undefined,
        phone_id: updateWebPhoneDto.phone_id
          ? Number(updateWebPhoneDto.phone_id)
          : undefined,
      })
      .where(eq(web_phone.id, Number(id)))
      .returning();
    if (!row) {
      throw new NotFoundException("Web phone association not found.");
    }
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(web_phone)
      .where(eq(web_phone.id, Number(id)))
      .returning();
    if (!row) {
      throw new NotFoundException("Web phone association not found.");
    }
    return row;
  }
}
