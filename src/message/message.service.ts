import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { DB } from "../drizzle/db";
import { messages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class MessageService {
  constructor(@Inject("DRIZZLE") private readonly db: DB) {}

  async create(createMessageDto: CreateMessageDto) {
    const [createdMessage] = await this.db
      .insert(messages)
      .values(createMessageDto)
      .returning();
    return createdMessage;
  }

  findAll() {
    return this.db.select().from(messages);
  }

  async findOne(id: number) {
    const message = await this.db.query.messages.findFirst({
      where: eq(messages.id, id),
    });
    if (!message) {
      throw new NotFoundException("Message not found.");
    }
    return message;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    const [updatedMessage] = await this.db
      .update(messages)
      .set(updateMessageDto)
      .where(eq(messages.id, id))
      .returning();
    if (!updatedMessage) {
      throw new NotFoundException("Message not found.");
    }
    return updatedMessage;
  }

  async remove(id: number) {
    const [deletedMessage] = await this.db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning();
    if (!deletedMessage) {
      throw new NotFoundException("Message not found.");
    }
    return deletedMessage;
  }
}
