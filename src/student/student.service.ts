import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from "@nestjs/common";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { DB } from "../drizzle/db";
import { students } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { CloudflareService } from "../cloudflare/cloudflare.service";

@Injectable()
export class StudentService {
  constructor(
    @Inject("DRIZZLE") private readonly db: DB,
    private readonly cloudflareService: CloudflareService
  ) {}

  async create(
    createStudentDto: CreateStudentDto,
    files?: {
      image?: Express.Multer.File[];
      certificate_image?: Express.Multer.File[];
    }
  ) {
    let imageUrl: string;
    if (files && files.image && files.image[0]) {
      imageUrl = await this.cloudflareService.uploadFile(
        files.image[0],
        "students"
      );
    } else {
      imageUrl = createStudentDto.image;
    }

    let certificateImageUrl: string;
    if (files && files.certificate_image && files.certificate_image[0]) {
      certificateImageUrl = await this.cloudflareService.uploadFile(
        files.certificate_image[0],
        "students/certificates"
      );
    } else {
      certificateImageUrl = createStudentDto.certificate_image;
    }

    if (!imageUrl) {
      throw new BadRequestException("Student image is required.");
    }
    if (!certificateImageUrl) {
      throw new BadRequestException("Certificate image is required.");
    }

    const { image, certificate_image, ...rest } = createStudentDto;

    const [createdStudent] = await this.db
      .insert(students)
      .values({
        ...rest,
        image: imageUrl,
        certificate_image: certificateImageUrl,
      })
      .returning();
    return createdStudent;
  }

  findAll() {
    return this.db.select().from(students);
  }

  async findOne(id: number) {
    const student = await this.db.query.students.findFirst({
      where: eq(students.id, id),
    });
    if (!student) {
      throw new NotFoundException("Student not found.");
    }
    return student;
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
    files?: {
      image?: Express.Multer.File[];
      certificate_image?: Express.Multer.File[];
    }
  ) {
    const existingStudent = await this.findOne(id);
    if (!existingStudent) {
      throw new NotFoundException("Student not found.");
    }

    let imageUrl: string | undefined;
    if (files?.image && files.image[0]) {
      if (existingStudent.image) {
        await this.cloudflareService.deleteFile(existingStudent.image);
      }
      imageUrl = await this.cloudflareService.uploadFile(
        files.image[0],
        "students"
      );
    }

    let certificateImageUrl: string | undefined;
    if (files?.certificate_image && files.certificate_image[0]) {
      if (existingStudent.certificate_image) {
        await this.cloudflareService.deleteFile(
          existingStudent.certificate_image
        );
      }
      certificateImageUrl = await this.cloudflareService.uploadFile(
        files.certificate_image[0],
        "students/certificates"
      );
    }

    const { image, certificate_image, ...rest } = updateStudentDto;
    const valuesToUpdate: any = { ...rest };
    if (imageUrl) {
      valuesToUpdate.image = imageUrl;
    }
    if (certificateImageUrl) {
      valuesToUpdate.certificate_image = certificateImageUrl;
    }

    const [updatedStudent] = await this.db
      .update(students)
      .set(valuesToUpdate)
      .where(eq(students.id, id))
      .returning();
    if (!updatedStudent) {
      throw new NotFoundException("Student not found.");
    }
    return updatedStudent;
  }

  async remove(id: number) {
    const student = await this.findOne(id);
    if (student) {
      if (student.image) {
        await this.cloudflareService.deleteFile(student.image);
      }
      if (student.certificate_image) {
        await this.cloudflareService.deleteFile(student.certificate_image);
      }
    }

    const [deletedStudent] = await this.db
      .delete(students)
      .where(eq(students.id, id))
      .returning();
    if (!deletedStudent) {
      throw new NotFoundException("Student not found.");
    }
    return deletedStudent;
  }
}
