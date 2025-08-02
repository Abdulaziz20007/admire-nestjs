import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class TelegramService {
  private readonly botToken: string;
  private readonly apiUrl: string;
  private readonly chatId: string;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly httpService: HttpService) {
    this.botToken = process.env.BOT_TOKEN ?? "";
    this.chatId = process.env.CHAT_ID ?? "";
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /*
   * Sends a raw text message to the configured chat with optional inline keyboard.
   */
  async sendMessage(
    text: string,
    replyMarkup?: Record<string, unknown>
  ): Promise<void> {
    if (!this.botToken || !this.chatId) {
      this.logger.warn(
        "BOT_TOKEN or CHAT_ID env variables are not set – skipping telegram notification"
      );
      return;
    }
    try {
      await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/sendMessage`, {
          chat_id: this.chatId,
          text,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        })
      );
    } catch (err) {
      this.logger.error("Failed to send telegram message", err);
    }
  }

  async editMessageReplyMarkup(
    chatId: number | string,
    messageId: number,
    replyMarkup: Record<string, unknown>
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/editMessageReplyMarkup`, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: replyMarkup,
        })
      );
    } catch (err) {
      this.logger.error("Failed to edit message reply markup", err);
    }
  }

  async editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    replyMarkup?: Record<string, unknown>
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/editMessageText`, {
          chat_id: chatId,
          message_id: messageId,
          text,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        })
      );
    } catch (err) {
      this.logger.error("Failed to edit telegram message text", err);
    }
  }

  /*
   * Helper that formats and sends a nicely styled message when a new message entity is created.
   */
  async notifyNewMessage(message: {
    id: number;
    name: string;
    phone: string;
    message: string;
  }): Promise<void> {
    const text = `<b>New Message Received</b>\n<b>Name:</b> ${message.name}\n<b>Phone:</b> ${message.phone}\n<b>Message:</b> ${message.message}`;

    const reply_markup = {
      inline_keyboard: [
        [
          { text: "✅ Accept", callback_data: `accept_${message.id}` },
          { text: "❌ Reject", callback_data: `reject_${message.id}` },
        ],
      ],
    };

    await this.sendMessage(text, reply_markup);
  }
}
