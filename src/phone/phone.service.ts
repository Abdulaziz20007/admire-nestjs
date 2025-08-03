import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { CreatePhoneDto } from "./dto/create-phone.dto";
import { UpdatePhoneDto } from "./dto/update-phone.dto";
import { DB } from "../drizzle/db";
import { phones } from "../drizzle/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class PhoneService {
  constructor(@Inject("DRIZZLE") private readonly db: DB) {}

  async create(createPhoneDto: CreatePhoneDto) {
    const existingPhone = await this.db.query.phones.findFirst({
      where: eq(phones.phone, createPhoneDto.phone),
    });
    if (existingPhone) {
      throw new ConflictException("Phone number already exists.");
    }
    const [createdPhone] = await this.db
      .insert(phones)
      .values(createPhoneDto)
      .returning();
    return createdPhone;
  }

  findAll() {
    return this.db.select().from(phones);
  }

  async findOne(id: number) {
    const phone = await this.db.query.phones.findFirst({
      where: eq(phones.id, id),
    });
    if (!phone) {
      throw new NotFoundException("Phone not found.");
    }
    return phone;
  }

  async update(id: number, updatePhoneDto: UpdatePhoneDto) {
    if (updatePhoneDto.phone) {
      const existingPhone = await this.db.query.phones.findFirst({
        where: eq(phones.phone, updatePhoneDto.phone),
      });
      if (existingPhone && existingPhone.id !== id) {
        throw new ConflictException("Phone number already exists.");
      }
    }
    const [updatedPhone] = await this.db
      .update(phones)
      .set(updatePhoneDto)
      .where(eq(phones.id, id))
      .returning();
    if (!updatedPhone) {
      throw new NotFoundException("Phone not found.");
    }
    return updatedPhone;
  }

  async remove(id: number) {
    const [deletedPhone] = await this.db
      .delete(phones)
      .where(eq(phones.id, id))
      .returning();
    if (!deletedPhone) {
      throw new NotFoundException("Phone not found.");
    }
    return deletedPhone;
  }
}
