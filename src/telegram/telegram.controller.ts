import { Body, Controller, Post } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { MessageService } from "../message/message.service";

@Controller("telegram")
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly messageService: MessageService
  ) {}

  /*
   * Webhook endpoint that processes incoming updates from Telegram.
   */
  @Post("webhook")
  async onUpdate(@Body() update: any) {
    if (!update) return "ok";

    if (update.callback_query) {
      const cq = update.callback_query;
      const data: string = cq.data;
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;

      if (!data || !chatId || !messageId) return "ok";

      // Step 1: ask for confirmation
      if (data.startsWith("accept_")) {
        const id = parseInt(data.split("_")[1], 10);
        await this.telegramService.editMessageReplyMarkup(chatId, messageId, {
          inline_keyboard: [
            [
              {
                text: "🟢 Confirm accept",
                callback_data: `confirm_accept_${id}`,
              },
              { text: "↩️ Cancel", callback_data: `cancel_${id}` },
            ],
          ],
        });
      } else if (data.startsWith("reject_")) {
        const id = parseInt(data.split("_")[1], 10);
        await this.telegramService.editMessageReplyMarkup(chatId, messageId, {
          inline_keyboard: [
            [
              {
                text: "🔴 Confirm reject",
                callback_data: `confirm_reject_${id}`,
              },
              { text: "↩️ Cancel", callback_data: `cancel_${id}` },
            ],
          ],
        });
      }
      // Step 2: confirmation handlers
      else if (data.startsWith("confirm_accept_")) {
        const id = parseInt(data.split("_")[2], 10);
        await this.messageService.setCheckedTelegram(id, 1);
        await this.telegramService.editMessageText(
          chatId,
          messageId,
          "✅ Message accepted"
        );
      } else if (data.startsWith("confirm_reject_")) {
        const id = parseInt(data.split("_")[2], 10);
        await this.messageService.setCheckedTelegram(id, 2);
        await this.telegramService.editMessageText(
          chatId,
          messageId,
          "❌ Message rejected"
        );
      }
      // Step 3: cancel back to original buttons
      else if (data.startsWith("cancel_")) {
        const id = parseInt(data.split("_")[1], 10);
        await this.telegramService.editMessageReplyMarkup(chatId, messageId, {
          inline_keyboard: [
            [
              { text: "✅ Accept", callback_data: `accept_${id}` },
              { text: "❌ Reject", callback_data: `reject_${id}` },
            ],
          ],
        });
      }
    }

    return "ok";
  }
}
