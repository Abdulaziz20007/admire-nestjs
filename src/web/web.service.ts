import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { CreateWebDto } from "./dto/create-web.dto";
import { UpdateWebDto } from "./dto/update-web.dto";
import { DB } from "../drizzle/db";
import { webs } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class WebService {
  constructor(@Inject("DRIZZLE") private readonly db: DB) {}

  async create(createWebDto: CreateWebDto) {
    const [createdWeb] = await this.db
      .insert(webs)
      .values(createWebDto)
      .returning();
    return createdWeb;
  }

  async findAll() {
    const result = await this.db.query.webs.findFirst({
      with: {
        main_phone: true,
      },
    });
    return result ? [result] : [];
  }

  async findOne(id: number) {
    const web = await this.db.query.webs.findFirst({
      where: eq(webs.id, id),
      with: {
        main_phone: true,
      },
    });

    if (!web) {
      throw new NotFoundException("Web configuration not found.");
    }
    return web;
  }

  async update(id: number, updateWebDto: UpdateWebDto) {
    const [updatedWeb] = await this.db
      .update(webs)
      .set(updateWebDto)
      .where(eq(webs.id, id))
      .returning();
    if (!updatedWeb) {
      throw new NotFoundException("Web configuration not found.");
    }
    return updatedWeb;
  }

  async remove(id: number) {
    const [deletedWeb] = await this.db
      .delete(webs)
      .where(eq(webs.id, id))
      .returning();
    if (!deletedWeb) {
      throw new NotFoundException("Web configuration not found.");
    }
    return deletedWeb;
  }

  async getActiveWeb() {
    const result = await this.db.query.webs.findFirst({
      where: eq(webs.is_active, true),
      columns: {
        visits: false,
      },
      with: {
        main_phone: true,
        web_media: {
          with: {
            media: true,
          },
        },
        web_phones: {
          with: {
            phone: true,
          },
        },
        web_socials: {
          with: {
            social: {
              with: {
                icon: true,
              },
            },
          },
        },
        web_students: {
          with: {
            student: true,
          },
        },
        web_teachers: {
          with: {
            teacher: true,
          },
        },
      },
    });
    return result;
  }

  async setActiveWeb(id: number) {
    await this.db.update(webs).set({
      is_active: false,
    });

    const result = await this.db
      .update(webs)
      .set({
        is_active: true,
      })
      .where(eq(webs.id, id))
      .returning();
    return result;
  }

  async increaseVisits(id: number) {
    const result = await this.db
      .update(webs)
      .set({ visits: sql`visits + 1` })
      .where(eq(webs.id, id))
      .returning();
    return result;
  }

  async getVisits(id: number) {
    const result = await this.db.query.webs.findFirst({
      where: eq(webs.id, id),
    });
    return result?.visits || 0;
  }
}
