import { useEffect, useState } from "react";

import { parseSchemaJson, toSchemaJson } from "@/features/checkouts/lib/checkout-schema";
import type { CheckoutSchema } from "@/features/checkouts/types/checkout-schema";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { CopyButton } from "@/shared/ui/copy-button";
import { Dialog } from "@/shared/ui/dialog";
import { AlertTriangleIcon } from "@/shared/ui/icons";

interface CheckoutJsonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schema: CheckoutSchema;
  onImport: (schema: CheckoutSchema) => void;
}

/**
 * Recurso avançado: o mesmo schema que o editor manipula, em texto. A validação
 * roda **antes** de tocar no estado — JSON inválido nunca destrói a
 * configuração atual (RF-CHK-08).
 */
export function CheckoutJsonDialog({ isOpen, onClose, schema, onImport }: CheckoutJsonDialogProps) {
  const [source, setSource] = useState(() => toSchemaJson(schema));
  const [error, setError] = useState<string>();
  const [pendingSchema, setPendingSchema] = useState<CheckoutSchema>();

  useEffect(() => {
    if (!isOpen) return;

    setSource(toSchemaJson(schema));
    setError(undefined);
    setPendingSchema(undefined);
  }, [isOpen, schema]);

  function handleImport() {
    const result = parseSchemaJson(source);

    if (result.error || !result.schema) {
      setError(result.error ?? "JSON inválido.");
      return;
    }

    setError(undefined);
    setPendingSchema(result.schema);
  }

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="Customizar via JSON"
        description="Edite diretamente a configuração do seu checkout. Essa opção é indicada para usuários avançados."
        className="max-w-3xl"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleImport}>
              Importar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-neutral-500 text-xs leading-relaxed">
              A configuração aceita <span className="font-mono">template</span>,{" "}
              <span className="font-mono">theme</span> e <span className="font-mono">sections</span>
              . Cada seção precisa de um <span className="font-mono">type</span> conhecido.
            </p>
            <CopyButton value={source} label="Copiar" />
          </div>

          <div>
            <label
              htmlFor="checkout-schema-json"
              className="mb-2 block font-medium text-neutral-700 text-sm"
            >
              Editor
            </label>
            <textarea
              id="checkout-schema-json"
              spellCheck={false}
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setError(undefined);
              }}
              className="h-96 w-full resize-y rounded-lg border border-neutral-200 bg-neutral-950 px-3.5 py-3 font-mono text-[13px] text-neutral-100 leading-relaxed outline-none ring-0 ring-neutral-900/10 transition-[border-color,box-shadow] focus:border-neutral-900 focus:ring-4"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-red-700 text-xs leading-relaxed"
            >
              <AlertTriangleIcon className="mt-px size-4 shrink-0" />
              {error}
            </p>
          )}
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={pendingSchema !== undefined}
        title="Sobrescrever a configuração atual?"
        description="A configuração atual do checkout será substituída pelo JSON importado."
        confirmLabel="Sobrescrever"
        isDestructive
        onCancel={() => setPendingSchema(undefined)}
        onConfirm={() => {
          if (!pendingSchema) return;

          onImport(pendingSchema);
          setPendingSchema(undefined);
          onClose();
        }}
      >
        <p className="text-neutral-600 text-sm leading-relaxed">
          A importação é substituição total, não mesclagem: seções ausentes no JSON somem e
          propriedades não informadas voltam ao padrão. Nada é gravado até você salvar no editor.
        </p>
      </ConfirmDialog>
    </>
  );
}
