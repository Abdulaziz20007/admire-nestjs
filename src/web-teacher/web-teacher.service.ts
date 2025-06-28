import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { CreateWebTeacherDto } from "./dto/create-web-teacher.dto";
import { UpdateWebTeacherDto } from "./dto/update-web-teacher.dto";
import { DB } from "../drizzle/db";
import { web_teacher } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

@Injectable()
export class WebTeacherService {
  constructor(@Inject("DRIZZLE") private readonly db: DB) {}

  async create(createWebTeacherDto: CreateWebTeacherDto) {
    const existing = await this.db.query.web_teacher.findFirst({
      where: and(
        eq(web_teacher.web_id, Number(createWebTeacherDto.web_id)),
        eq(web_teacher.teacher_id, Number(createWebTeacherDto.teacher_id))
      ),
    });
    if (existing) {
      throw new ConflictException(
        "This teacher is already associated with this web configuration."
      );
    }
    const [row] = await this.db
      .insert(web_teacher)
      .values({
        web_id: Number(createWebTeacherDto.web_id),
        teacher_id: Number(createWebTeacherDto.teacher_id),
        order: createWebTeacherDto.order,
      })
      .returning();
    return row;
  }

  findAll() {
    return this.db.select().from(web_teacher);
  }

  async findOne(id: string) {
    const row = await this.db.query.web_teacher.findFirst({
      where: eq(web_teacher.id, Number(id)),
    });
    if (!row) {
      throw new NotFoundException("Web teacher association not found.");
    }
    return row;
  }

  async update(id: string, updateWebTeacherDto: UpdateWebTeacherDto) {
    if (updateWebTeacherDto.web_id && updateWebTeacherDto.teacher_id) {
      const existing = await this.db.query.web_teacher.findFirst({
        where: and(
          eq(web_teacher.web_id, Number(updateWebTeacherDto.web_id)),
          eq(web_teacher.teacher_id, Number(updateWebTeacherDto.teacher_id)),
          eq(web_teacher.id, Number(id))
        ),
      });
      if (existing) {
        throw new ConflictException(
          "This teacher is already associated with this web configuration."
        );
      }
    }
    const [row] = await this.db
      .update(web_teacher)
      .set({
        web_id: updateWebTeacherDto.web_id
          ? Number(updateWebTeacherDto.web_id)
          : undefined,
        teacher_id: updateWebTeacherDto.teacher_id
          ? Number(updateWebTeacherDto.teacher_id)
          : undefined,
        order: updateWebTeacherDto.order,
      })
      .where(eq(web_teacher.id, Number(id)))
      .returning();
    if (!row) {
      throw new NotFoundException("Web teacher association not found.");
    }
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(web_teacher)
      .where(eq(web_teacher.id, Number(id)))
      .returning();
    if (!row) {
      throw new NotFoundException("Web teacher association not found.");
    }
    return row;
  }
}
