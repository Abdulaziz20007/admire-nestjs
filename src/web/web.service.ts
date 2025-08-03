import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from "@nestjs/common";
import { CreateWebDto } from "./dto/create-web.dto";
import { UpdateWebDto } from "./dto/update-web.dto";
import { DB } from "../drizzle/db";
import {
  webs,
  web_media,
  web_phone,
  web_social,
  web_student,
  web_teacher,
} from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { CloudflareService } from "../cloudflare/cloudflare.service";

@Injectable()
export class WebService {
  constructor(
    @Inject("DRIZZLE") private readonly db: DB,
    private readonly cloudflareService: CloudflareService
  ) {}

  async create(
    createWebDto: CreateWebDto & any,
    headerImg?: Express.Multer.File
  ) {
    // Extract relational arrays from the DTO. The rest belongs to the main `webs` table.
    const {
      web_media: webMediaRaw,
      web_phones: webPhonesRaw,
      web_socials: webSocialsRaw,
      web_students: webStudentsRaw,
      web_teachers: webTeachersRaw,
      header_img: headerImgFromBody,
      ...webData
    } = createWebDto as any;

    // Helper to safely parse JSON coming from form-data; returns [] on failure or empty.
    const parseArray = (raw: unknown) => {
      if (!raw) return [] as any[];
      if (Array.isArray(raw)) return raw as any[];
      try {
        return JSON.parse(raw as string);
      } catch {
        return [] as any[];
      }
    };

    const webMediaArray = parseArray(webMediaRaw);
    const webPhonesArray = parseArray(webPhonesRaw);
    const webSocialsArray = parseArray(webSocialsRaw);
    const webStudentsArray = parseArray(webStudentsRaw);
    const webTeachersArray = parseArray(webTeachersRaw);

    // Handle header image
    let headerImgUrl: string | undefined;
    if (headerImg) {
      headerImgUrl = await this.cloudflareService.uploadFile(
        headerImg,
        "web-headers"
      );
    } else {
      headerImgUrl = headerImgFromBody;
    }
    if (!headerImgUrl) {
      throw new BadRequestException("Header image is required.");
    }

    // Cast numeric fields that are known to be integers but arrive as strings via multipart/form-data.
    const numericFields = [
      "total_students",
      "best_students",
      "total_teachers",
      "main_phone_id",
    ];
    for (const key of numericFields) {
      if (key in webData && typeof webData[key] === "string") {
        webData[key] = Number(webData[key]);
      }
    }

    // 1. Insert the main `webs` record.
    const [createdWeb] = await this.db
      .insert(webs)
      .values({ ...webData, header_img: headerImgUrl })
      .returning();

    const webId = createdWeb.id;

    // 2. Insert relational data ---------------------------------------------

    if (Array.isArray(webMediaArray) && webMediaArray.length) {
      await this.db.insert(web_media).values(
        webMediaArray.map((item: any) => ({
          order: item.order,
          size: item.size ?? "1x1",
          web_id: webId,
          media_id: Number(item.media_id),
        }))
      );
    }

    if (Array.isArray(webPhonesArray) && webPhonesArray.length) {
      await this.db.insert(web_phone).values(
        webPhonesArray.map((item: any) => ({
          web_id: webId,
          phone_id: Number(item.phone_id),
        }))
      );
    }

    if (Array.isArray(webSocialsArray) && webSocialsArray.length) {
      await this.db.insert(web_social).values(
        webSocialsArray.map((item: any) => ({
          web_id: webId,
          social_id: Number(item.social_id),
        }))
      );
    }

    if (Array.isArray(webStudentsArray) && webStudentsArray.length) {
      await this.db.insert(web_student).values(
        webStudentsArray.map((item: any) => ({
          order: item.order,
          web_id: webId,
          student_id: Number(item.student_id),
        }))
      );
    }

    if (Array.isArray(webTeachersArray) && webTeachersArray.length) {
      await this.db.insert(web_teacher).values(
        webTeachersArray.map((item: any) => ({
          order: item.order,
          web_id: webId,
          teacher_id: Number(item.teacher_id),
        }))
      );
    }

    // 3. Return the newly created configuration with all relations populated.
    return this.findOne(webId);
  }

  async findAll() {
    const result = await this.db.query.webs.findMany({
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

  async findOne(id: number) {
    const web = await this.db.query.webs.findFirst({
      where: eq(webs.id, id),
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

    if (!web) {
      throw new NotFoundException("Web configuration not found.");
    }
    return web;
  }

  async update(
    id: number,
    updateWebDto: UpdateWebDto & any,
    headerImg?: Express.Multer.File
  ) {
    // Extract relational arrays from the DTO. The rest belongs to the main `webs` table.
    const {
      web_media: webMediaArray,
      web_phones: webPhonesArray,
      web_socials: webSocialsArray,
      web_students: webStudentsArray,
      web_teachers: webTeachersArray,
      ...webData
    } = updateWebDto as any;

    // Handle header image update
    let headerImgUrl: string | undefined;
    if (headerImg) {
      const existing = await this.findOne(id);
      if (existing?.header_img) {
        await this.cloudflareService.deleteFile(existing.header_img);
      }
      headerImgUrl = await this.cloudflareService.uploadFile(
        headerImg,
        "web-headers"
      );
    }

    // 1. Update the main `webs` record first.
    const [updatedWeb] = await this.db
      .update(webs)
      .set({
        ...webData,
        ...(headerImgUrl ? { header_img: headerImgUrl } : {}),
      })
      .where(eq(webs.id, id))
      .returning();

    if (!updatedWeb) {
      throw new NotFoundException("Web configuration not found.");
    }

    // 2. Update relational tables. Strategy: delete existing relations for this web and recreate from payload.
    // Web Media -----------------------------------------------------------------
    if (Array.isArray(webMediaArray)) {
      await this.db.delete(web_media).where(eq(web_media.web_id, id));
      if (webMediaArray.length) {
        await this.db.insert(web_media).values(
          webMediaArray.map((item: any) => ({
            order: item.order,
            size: item.size ?? "1x1",
            web_id: id,
            media_id: Number(item.media_id),
          }))
        );
      }
    }

    // Web Phones ----------------------------------------------------------------
    if (Array.isArray(webPhonesArray)) {
      await this.db.delete(web_phone).where(eq(web_phone.web_id, id));
      if (webPhonesArray.length) {
        await this.db.insert(web_phone).values(
          webPhonesArray.map((item: any) => ({
            web_id: id,
            phone_id: Number(item.phone_id),
          }))
        );
      }
    }

    // Web Socials ---------------------------------------------------------------
    if (Array.isArray(webSocialsArray)) {
      await this.db.delete(web_social).where(eq(web_social.web_id, id));
      if (webSocialsArray.length) {
        await this.db.insert(web_social).values(
          webSocialsArray.map((item: any) => ({
            web_id: id,
            social_id: Number(item.social_id),
          }))
        );
      }
    }

    // Web Students --------------------------------------------------------------
    if (Array.isArray(webStudentsArray)) {
      await this.db.delete(web_student).where(eq(web_student.web_id, id));
      if (webStudentsArray.length) {
        await this.db.insert(web_student).values(
          webStudentsArray.map((item: any) => ({
            order: item.order,
            web_id: id,
            student_id: Number(item.student_id),
          }))
        );
      }
    }

    // Web Teachers --------------------------------------------------------------
    if (Array.isArray(webTeachersArray)) {
      await this.db.delete(web_teacher).where(eq(web_teacher.web_id, id));
      if (webTeachersArray.length) {
        await this.db.insert(web_teacher).values(
          webTeachersArray.map((item: any) => ({
            order: item.order,
            web_id: id,
            teacher_id: Number(item.teacher_id),
          }))
        );
      }
    }

    // Return the full updated web configuration with relations populated.
    return this.findOne(id);
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
