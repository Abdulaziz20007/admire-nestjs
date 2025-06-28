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
      certificate_photo?: Express.Multer.File[];
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

    let certificatePhotoUrl: string;
    if (files && files.certificate_photo && files.certificate_photo[0]) {
      certificatePhotoUrl = await this.cloudflareService.uploadFile(
        files.certificate_photo[0],
        "students/certificates"
      );
    } else {
      certificatePhotoUrl = createStudentDto.certificate_photo;
    }

    if (!imageUrl) {
      throw new BadRequestException("Student image is required.");
    }
    if (!certificatePhotoUrl) {
      throw new BadRequestException("Certificate photo is required.");
    }

    const { image, certificate_photo, ...rest } = createStudentDto;

    const [createdStudent] = await this.db
      .insert(students)
      .values({
        ...rest,
        image: imageUrl,
        certificate_photo: certificatePhotoUrl,
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
    files: {
      image?: Express.Multer.File[];
      certificate_photo?: Express.Multer.File[];
    }
  ) {
    const existingStudent = await this.findOne(id);
    if (!existingStudent) {
      throw new NotFoundException("Student not found.");
    }

    let imageUrl: string | undefined;
    if (files.image && files.image[0]) {
      if (existingStudent.image) {
        await this.cloudflareService.deleteFile(existingStudent.image);
      }
      imageUrl = await this.cloudflareService.uploadFile(
        files.image[0],
        "students"
      );
    }

    let certificatePhotoUrl: string | undefined;
    if (files.certificate_photo && files.certificate_photo[0]) {
      if (existingStudent.certificate_photo) {
        await this.cloudflareService.deleteFile(
          existingStudent.certificate_photo
        );
      }
      certificatePhotoUrl = await this.cloudflareService.uploadFile(
        files.certificate_photo[0],
        "students/certificates"
      );
    }

    const { image, certificate_photo, ...rest } = updateStudentDto;
    const valuesToUpdate: any = { ...rest };
    if (imageUrl) {
      valuesToUpdate.image = imageUrl;
    }
    if (certificatePhotoUrl) {
      valuesToUpdate.certificate_photo = certificatePhotoUrl;
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
      if (student.certificate_photo) {
        await this.cloudflareService.deleteFile(student.certificate_photo);
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
