import crypto from "crypto";

/**
 * Shopify App ProxyのHMACを検証する関数
 * @param queryParams - URLのクエリパラメータ全体
 * @param secret - Shopify API Secret
 * @returns boolean - 検証結果
 */

export function verifyProxyHmac(
  queryParams: URLSearchParams,
  secret: string
): boolean {
  const signature = queryParams.get("signature");
  if (!signature) {
    return false;
  }

  const params = new URLSearchParams(queryParams);
  params.delete("signature");

  const sortedParams = Array.from(params.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const hash = crypto
    .createHmac("sha256", secret)
    .update(sortedParams)
    .digest("hex");

  return hash === signature;
}
