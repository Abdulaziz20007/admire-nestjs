import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { CreateWebStudentDto } from "./dto/create-web-student.dto";
import { UpdateWebStudentDto } from "./dto/update-web-student.dto";
import { DB } from "../drizzle/db";
import { web_student } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

@Injectable()
export class WebStudentService {
  constructor(@Inject("DRIZZLE") private readonly db: DB) {}

  async create(createWebStudentDto: CreateWebStudentDto) {
    const existing = await this.db.query.web_student.findFirst({
      where: and(
        eq(web_student.web_id, createWebStudentDto.web_id),
        eq(web_student.student_id, createWebStudentDto.student_id),
      ),
    });
    if (existing) {
      throw new ConflictException(
        "This student is already associated with this web configuration.",
      );
    }
    const [row] = await this.db
      .insert(web_student)
      .values(createWebStudentDto)
      .returning();
    return row;
  }

  findAll() {
    return this.db.select().from(web_student);
  }

  async findOne(id: number) {
    const row = await this.db.query.web_student.findFirst({
      where: eq(web_student.id, id),
    });
    if (!row) {
      throw new NotFoundException("Web student association not found.");
    }
    return row;
  }

  async update(id: number, updateWebStudentDto: UpdateWebStudentDto) {
    if (updateWebStudentDto.web_id && updateWebStudentDto.student_id) {
      const existing = await this.db.query.web_student.findFirst({
        where: and(
          eq(web_student.web_id, updateWebStudentDto.web_id),
          eq(web_student.student_id, updateWebStudentDto.student_id),
          eq(web_student.id, id),
        ),
      });
      if (existing) {
        throw new ConflictException(
          "This student is already associated with this web configuration.",
        );
      }
    }
    const [row] = await this.db
      .update(web_student)
      .set(updateWebStudentDto)
      .where(eq(web_student.id, id))
      .returning();
    if (!row) {
      throw new NotFoundException("Web student association not found.");
    }
    return row;
  }

  async remove(id: number) {
    const [row] = await this.db
      .delete(web_student)
      .where(eq(web_student.id, id))
      .returning();
    if (!row) {
      throw new NotFoundException("Web student association not found.");
    }
    return row;
  }
}
