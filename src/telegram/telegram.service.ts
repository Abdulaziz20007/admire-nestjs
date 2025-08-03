import {
  Injectable,
  Logger,
  OnModuleInit,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { MessageService } from "../message/message.service";

import { setTimeout as wait } from "timers/promises";

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly botToken: string;
  private readonly apiUrl: string;
  private pollingOffset = 0;
  private readonly chatId: string;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService
  ) {
    // Prefer ConfigService values (loaded from .env) but gracefully fall back to process.env.
    this.botToken =
      this.configService.get<string>("BOT_TOKEN") ||
      this.configService.get<string>("TELEGRAM_BOT_TOKEN") ||
      process.env.BOT_TOKEN ||
      "";

    this.chatId =
      this.configService.get<string>("CHAT_ID") ||
      this.configService.get<string>("TELEGRAM_CHAT_ID") ||
      process.env.CHAT_ID ||
      "";

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

  /**
   * Answers a callback query so that Telegram removes the loading spinner.
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/answerCallbackQuery`, {
          callback_query_id: callbackQueryId,
          text,
          show_alert: showAlert,
        })
      );
    } catch (err) {
      // surface detailed telegram error for easier debugging
      const responseData = err?.response?.data;
      this.logger.error("Failed to answer callback query", responseData || err);
      // rethrow so outer layers can decide what to do
      throw err;
    }
  }

  /**
   * Start long-polling if a webhook is not used.
   */
  async onModuleInit(): Promise<void> {
    const disablePolling = this.configService.get<string>(
      "DISABLE_TELEGRAM_POLLING"
    );
    if (disablePolling === "true") {
      this.logger.log("Telegram polling disabled via env flag");
      return;
    }
    if (!this.botToken) {
      this.logger.warn("BOT_TOKEN not set – polling disabled");
      return;
    }
    void this.startPolling();
  }

  private async startPolling(): Promise<void> {
    this.logger.log("Starting Telegram long-polling listener");
    while (true) {
      try {
        const res = await firstValueFrom(
          this.httpService.post(`${this.apiUrl}/getUpdates`, {
            offset: this.pollingOffset,
            timeout: 60,
            allowed_updates: ["callback_query"],
          })
        );
        const updates: any[] = res.data?.result || [];
        for (const update of updates) {
          this.pollingOffset = update.update_id + 1;
          await this.handleUpdate(update);
        }
      } catch (err) {
        this.logger.error("Polling error", err?.response?.data || err);
        await wait(2000);
      }
    }
  }

  private async handleUpdate(update: any): Promise<void> {
    if (!update?.callback_query) return;
    const cq = update.callback_query;

    try {
      await this.answerCallbackQuery(cq.id);
    } catch {
      return;
    }

    const data: string | undefined = cq.data;
    const chatId = cq.message?.chat?.id;
    const messageId = cq.message?.message_id;
    if (!data || !chatId || !messageId) return;

    try {
      const originalText: string = cq.message?.text || "";
      if (data.startsWith("accept_")) {
        const id = Number(data.split("_")[1]);
        await this.messageService.setCheckedTelegram(id, 1);
        const newText = this.updateStatus(
          originalText,
          "✅ <b>Status:</b> Accepted"
        );
        await this.editMessageText(chatId, messageId, newText, {
          inline_keyboard: [],
        });
      } else if (data.startsWith("reject_")) {
        const id = Number(data.split("_")[1]);
        await this.messageService.setCheckedTelegram(id, 2);
        const newText = this.updateStatus(
          originalText,
          "❌ <b>Status:</b> Rejected"
        );
        await this.editMessageText(chatId, messageId, newText, {
          inline_keyboard: [],
        });
      }
    } catch (err) {
      this.logger.error("Failed to process callback query", err);
    }
  }

  /**
   * Replaces or appends a status line to the existing message text.
   */
  private updateStatus(original: string, statusLine: string): string {
    const lines = original.split("\n");
    const idx = lines.findIndex((l) => l.toLowerCase().includes("status:"));
    if (idx !== -1) {
      lines[idx] = statusLine;
    } else {
      lines.push("", statusLine);
    }
    return lines.join("\n");
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
    const text = [
      "<b>📨 New Message Received</b>",
      "————————————",
      `<b>👤 Name:</b> ${message.name}`,
      `<b>📞 Phone:</b> ${message.phone}`,
      "<b>💬 Message:</b>",
      `${message.message}`,
      "",
      "⌛️ <b>Status:</b> Pending",
    ].join("\n");

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
