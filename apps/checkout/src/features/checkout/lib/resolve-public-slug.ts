/**
 * O slug do checkout vem do próprio caminho: `lowchk.click/a7k3mp2q`.
 *
 * Este app não tem roteador. Ele tem uma tela só, resolvida por um segmento de
 * URL — carregar um router para isso custaria bundle na única página do produto
 * onde bundle vira taxa de conversão. Qualquer caminho com mais de um segmento
 * é endereço inválido, não uma sub-rota.
 */
export function resolvePublicSlug(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length !== 1) {
    return null;
  }

  const [slug] = segments;

  return slug !== undefined && slug.length > 0 ? decodeURIComponent(slug) : null;
}
