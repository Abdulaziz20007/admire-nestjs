import { Body, Controller, Post } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { MessageService } from "../message/message.service";

import { Public } from "../common/decorators/public.decorator";

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
  @Public()
  async onUpdate(@Body() update: any) {
    if (!update) return "ok";

    if (update.callback_query) {
      const cq = update.callback_query;

      /*
       * 1️⃣  Remove the loading spinner in the client as fast as possible.
       *     If this call fails we'll log the error so that the root cause is visible
       *     in the console / hosting provider logs.
       */
      try {
        await this.telegramService.answerCallbackQuery(cq.id);
      } catch (err) {
        // Telegram rejected the call – log the full response body if available
        console.error("answerCallbackQuery failed", err?.response?.data || err);
        return "ok"; // nothing more we can do for this update
      }

      /*
       * 2️⃣  Everything else (DB writes, message edits, …) is executed in the
       *     background so that the webhook can return immediately.
       *     Using `void` makes eslint / tsc accept the fire-and-forget promise.
       */
      void (async () => {
        const data: string | undefined = cq.data;
        const chatId = cq.message?.chat?.id;
        const messageId = cq.message?.message_id;

        if (!data || !chatId || !messageId) return;

        try {
          if (data.startsWith("accept_")) {
            const id = Number(data.split("_")[1]);
            await this.messageService.setCheckedTelegram(id, 1);
            await this.telegramService.editMessageText(
              chatId,
              messageId,
              "✅ Message accepted",
              {
                inline_keyboard: [],
              }
            );
          } else if (data.startsWith("reject_")) {
            const id = Number(data.split("_")[1]);
            await this.messageService.setCheckedTelegram(id, 2);
            await this.telegramService.editMessageText(
              chatId,
              messageId,
              "❌ Message rejected",
              {
                inline_keyboard: [],
              }
            );
          }
        } catch (err) {
          console.error("Failed to process callback query", err);
        }
      })();
    }

    // Always return 200 OK to Telegram as quickly as possible
    return "ok";
  }
}
