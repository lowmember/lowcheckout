import { type DragEvent, type MouseEvent, type ReactNode, useId, useState } from "react";

import { useImageUpload } from "@/features/uploads/hooks/use-image-upload";
import { UPLOAD_IMAGE_CONTENT_TYPES } from "@/features/uploads/types/upload";
import { cn } from "@/shared/lib/cn";
import { isAbsoluteUrl } from "@/shared/lib/is-absolute-url";
import { Button } from "@/shared/ui/button";
import { CONTROL_CLASSNAME, CONTROL_ERROR_CLASSNAME, Field } from "@/shared/ui/field";
import { ImageIcon, LinkIcon, SpinnerIcon, UploadIcon } from "@/shared/ui/icons";
import { SegmentedControl } from "@/shared/ui/segmented-control";

type ImageSource = "upload" | "link";

const SOURCE_OPTIONS = [
  { value: "upload" as const, label: "Enviar arquivo", icon: <UploadIcon className="size-3.5" /> },
  { value: "link" as const, label: "Usar link", icon: <LinkIcon className="size-3.5" /> },
];

const ACCEPTED_FILE_TYPES = UPLOAD_IMAGE_CONTENT_TYPES.join(",");

const FILE_CONSTRAINTS = "PNG, JPEG, WebP ou AVIF, até 5 MB.";

interface ImageFieldProps {
  label: string;
  /** URL da imagem; string vazia é "sem imagem". */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
  placeholder?: string;
  /** Dimensão sugerida, ex.: `"600 × 600 px"`. Aparece junto das restrições do arquivo. */
  recommendedSize?: string;
}

/**
 * Um campo, duas origens: o arquivo enviado ao bucket e o link colado terminam
 * na mesma URL — o que o formulário recebe é sempre `string`. Por isso este
 * componente serve produto, oferta e as seções do checkout sem variação.
 */
export function ImageField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = "https://...",
  recommendedSize,
}: ImageFieldProps) {
  const fileInputId = useId();
  const linkInputId = useId();

  const [source, setSource] = useState<ImageSource>("upload");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const {
    uploadImage,
    isUploadingImage,
    hasUploadImageError,
    uploadImageErrorMessage,
    resetImageUpload,
  } = useImageUpload({ onSuccess: onChange });

  const hasPreview = value.trim() !== "" && isAbsoluteUrl(value.trim());
  const constraints = recommendedSize
    ? `${FILE_CONSTRAINTS} Tamanho recomendado: ${recommendedSize}.`
    : FILE_CONSTRAINTS;

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (!file) return;

    await uploadImage(file).catch(() => undefined);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    void handleFiles(event.dataTransfer.files);
  }

  return (
    <Field
      id={source === "upload" ? fileInputId : linkInputId}
      label={label}
      error={error ?? (hasUploadImageError ? uploadImageErrorMessage : undefined)}
      hint={hint}
    >
      <div className="space-y-3">
        <SegmentedControl
          options={SOURCE_OPTIONS}
          value={source}
          onChange={(next) => {
            resetImageUpload();
            setSource(next);
          }}
          ariaLabel="Origem da imagem"
        />

        {source === "upload" ? (
          // `label` em vez de `div`: a área inteira abre o seletor de arquivo
          // pelo comportamento nativo, sem handler de clique nem role inventado.
          <label
            htmlFor={fileInputId}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer items-center gap-4 rounded-lg border border-neutral-200 border-dashed p-3",
              "transition-[border-color,background-color] duration-200 ease-out",
              "hover:border-neutral-300 hover:bg-neutral-50",
              "focus-within:border-neutral-900 focus-within:bg-white",
              isDraggingOver && "border-neutral-400 bg-neutral-50",
              error && "border-red-300",
            )}
          >
            <input
              id={fileInputId}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              className="sr-only"
              onChange={(event) => {
                void handleFiles(event.target.files);
                // Permite reenviar o mesmo arquivo depois de removê-lo.
                event.target.value = "";
              }}
            />

            <ImagePreview url={hasPreview ? value : null} isLoading={isUploadingImage} />

            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-700 text-sm">
                {isUploadingImage
                  ? "Enviando imagem..."
                  : hasPreview
                    ? "Imagem definida — clique para trocar"
                    : "Clique para escolher ou arraste uma imagem"}
              </p>
              <p className="mt-0.5 text-neutral-500 text-xs">{constraints}</p>

              {hasPreview && !isUploadingImage && (
                <div className="mt-2.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    // O clique morre aqui: sem isto ele borbulharia até o
                    // `label` e reabriria o seletor logo após remover.
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onChange("");
                    }}
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>
          </label>
        ) : (
          <div className="flex items-center gap-4">
            <ImagePreview url={hasPreview ? value : null} isLoading={false} />

            <div className="min-w-0 flex-1">
              <input
                id={linkInputId}
                type="url"
                inputMode="url"
                placeholder={placeholder}
                value={value}
                aria-invalid={Boolean(error)}
                className={cn(CONTROL_CLASSNAME, error && CONTROL_ERROR_CLASSNAME)}
                onChange={(event) => onChange(event.target.value)}
              />
              {recommendedSize && (
                <p className="mt-1.5 text-neutral-500 text-xs">
                  Tamanho recomendado: {recommendedSize}.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}

interface ImagePreviewProps {
  url: string | null;
  isLoading: boolean;
}

function ImagePreview({ url, isLoading }: ImagePreviewProps) {
  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-400">
      {isLoading ? (
        <SpinnerIcon className="size-5" />
      ) : url ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <ImageIcon className="size-5" />
      )}
    </div>
  );
}
