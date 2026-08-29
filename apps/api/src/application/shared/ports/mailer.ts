export interface MailMessage {
  to: string;
  subject: string;
  textBody: string;
}

/**
 * Porta de envio de e-mail. O único uso no MVP é a entrega do produto após a
 * aprovação (RF-PAG-05); o provedor concreto é decisão da infra.
 */
export interface Mailer {
  send(message: MailMessage): Promise<void>;
}
