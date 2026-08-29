import type { z } from "zod";

import { ValidationError } from "@/presentation/http/errors/validation.error";
import type { Validator } from "@/presentation/http/protocols/validator";

/**
 * Adapta o zod à porta `Validator`. É o único arquivo da aplicação que sabe
 * que o zod existe — trocar de biblioteca de validação para aqui.
 */
export class ZodValidator<TSchema extends z.ZodType> implements Validator<z.output<TSchema>> {
  private readonly schema: TSchema;

  constructor(schema: TSchema) {
    this.schema = schema;
  }

  validate(input: unknown): z.output<TSchema> {
    const result = this.schema.safeParse(input);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
    }

    return result.data;
  }
}
