import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from "@nestjs/common";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import { DB } from "../drizzle/db";
import { teachers } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { CloudflareService } from "../cloudflare/cloudflare.service";

@Injectable()
export class TeacherService {
  constructor(
    @Inject("DRIZZLE") private readonly db: DB,
    private readonly cloudflareService: CloudflareService
  ) {}

  async create(
    createTeacherDto: CreateTeacherDto,
    image?: Express.Multer.File
  ) {
    let imageUrl: string;
    if (image) {
      imageUrl = await this.cloudflareService.uploadFile(image, "teachers");
    } else {
      imageUrl = createTeacherDto.image;
    }

    if (!imageUrl) {
      throw new BadRequestException("Teacher image is required.");
    }

    const { image: _image, ...rest } = createTeacherDto;

    const [createdTeacher] = await this.db
      .insert(teachers)
      .values({ ...rest, image: imageUrl })
      .returning();
    return createdTeacher;
  }

  findAll() {
    return this.db.select().from(teachers);
  }

  async findOne(id: number) {
    const teacher = await this.db.query.teachers.findFirst({
      where: eq(teachers.id, id),
    });
    if (!teacher) {
      throw new NotFoundException("Teacher not found.");
    }
    return teacher;
  }

  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
    image?: Express.Multer.File
  ) {
    const existingTeacher = await this.findOne(id);
    if (!existingTeacher) {
      throw new NotFoundException("Teacher not found");
    }

    let imageUrl: string | undefined;
    if (image) {
      if (existingTeacher.image) {
        await this.cloudflareService.deleteFile(existingTeacher.image);
      }
      imageUrl = await this.cloudflareService.uploadFile(image, "teachers");
    }

    const { image: _image, ...rest } = updateTeacherDto;
    const valuesToUpdate: any = { ...rest };
    if (imageUrl) {
      valuesToUpdate.image = imageUrl;
    }

    const [updatedTeacher] = await this.db
      .update(teachers)
      .set(valuesToUpdate)
      .where(eq(teachers.id, id))
      .returning();
    if (!updatedTeacher) {
      throw new NotFoundException("Teacher not found.");
    }
    return updatedTeacher;
  }

  async remove(id: number) {
    const teacher = await this.findOne(id);
    if (teacher && teacher.image) {
      await this.cloudflareService.deleteFile(teacher.image);
    }
    const [deletedTeacher] = await this.db
      .delete(teachers)
      .where(eq(teachers.id, id))
      .returning();
    if (!deletedTeacher) {
      throw new NotFoundException("Teacher not found.");
    }
    return deletedTeacher;
  }
}
