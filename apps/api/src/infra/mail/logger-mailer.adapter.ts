import type { Logger } from "@/application/shared/ports/logger";
import type { Mailer, MailMessage } from "@/application/shared/ports/mailer";

/**
 * Implementação de entrega que apenas registra a mensagem. É o suficiente para
 * o MVP fechar o fluxo de RF-PAG-05 sem escolher provedor de e-mail: trocar por
 * SES/Resend é implementar `Mailer` e mudar uma linha no composition root.
 */
export class LoggerMailer implements Mailer {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  send(message: MailMessage): Promise<void> {
    this.logger.info("mail_sent", {
      to: message.to,
      subject: message.subject,
      // O corpo carrega a URL do entregável: registrar inteiro seria vazar acesso.
      bodyLength: message.textBody.length,
    });

    return Promise.resolve();
  }
}
