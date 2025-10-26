import { useEffect, useState } from "react";
import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";

// URLバリデーション関数
const isValidUrl = (url: string): boolean => {
  if (!url) return true; // 空の場合は有効（無効化できるため）
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// サーバーサイド: 設定データを取得
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // データベースから現在の設定を取得
  const settings = await prisma.redirectSettings.findUnique({
    where: { shop: session.shop },
  });

  // 設定が存在しない場合はデフォルト値を返す
  if (!settings) {
    return {
      redirectUrl: "",
      isEnabled: true,
    };
  }

  return settings;
};

// クライアントサイド: UIコンポーネント
export default function Index() {
  const settings = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  
  // フォームの状態管理
  const [redirectUrl, setRedirectUrl] = useState(settings.redirectUrl || "");
  const [isEnabled, setIsEnabled] = useState(settings.isEnabled ?? true);
  
  const isLoading = fetcher.state === "submitting";

  // 保存成功時のトースト表示
  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("設定を保存しました");
    }
  }, [fetcher.data, shopify]);

  // フォーム送信ハンドラー
  const handleSubmit = () => {

    if(redirectUrl && !isValidUrl(redirectUrl)) {
      alert("正しいURLを入力してください（例: https://example.com）");
      return;
    }

    const formData = new FormData();
    formData.append("redirectUrl", redirectUrl);
    formData.append("isEnabled", isEnabled.toString());
    
    fetcher.submit(formData, {
      method: "POST",
      action: "/api/redirect-setting",
    });
  };

  return (
    <s-page heading="404リダイレクト設定">
      <s-section>
        <s-stack direction="block" gap="base">
          <s-text tone="critical">404ページのリダイレクト設定</s-text>
          <s-paragraph>
            <s-text>
            存在しないページにアクセスされた際に、自動的に指定したURLにリダイレクトします。
            これにより、ユーザーが迷わずに適切なページに誘導できます。
            </s-text>
          </s-paragraph>
          <s-banner tone="info">
            <s-text>
              <s-text tone="neutral">💡 使用例：</s-text><br/>
              ・商品ページが見つからない場合は、商品一覧ページにリダイレクト<br/>
              ・カテゴリページが見つからない場合は、トップページにリダイレクト<br/>
              ・エラーページ → トップページや検索ページにリダイレクト
            </s-text>
          </s-banner>
        </s-stack>
      </s-section>

      <s-section>
        <s-stack direction="block" gap="base">
          {/* リダイレクト先URL入力 */}
          <s-text-field
            label="リダイレクト先URL"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl((e.target as HTMLInputElement)?.value ?? "")}
            placeholder="https://example.com/404"
            error={redirectUrl && !isValidUrl(redirectUrl) ? "正しいURL形式を入力してください" : undefined}
            details={"完全なURLを入力してください（例: https://example.com/404)"}
          />
          
          {/* 有効/無効の切り替え */}
          <s-checkbox
            label="リダイレクト機能を有効にする"
            checked={isEnabled}
            onChange={(e) => setIsEnabled((e.target as HTMLInputElement)?.checked ?? false)}
          />
          
          {/* 保存ボタン */}
          <s-button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || Boolean(redirectUrl && !isValidUrl(redirectUrl))}
            {...(isLoading ? { loading: true } : {})}
          >
            保存
          </s-button>
        </s-stack>
      </s-section>

      {/* デバッグ用: 保存結果を表示 */}
        {fetcher.data?.error && (
          <s-banner tone="critical">
            <s-text>設定の保存に失敗しました: {fetcher.data.error}</s-text>
          </s-banner>
        )}

        {fetcher.data?.success && (
          <s-banner tone="success">
            <s-text>設定を保存しました</s-text>
          </s-banner>
        )}

        {isLoading && (
          <s-banner tone="info">
            <s-text>設定を保存しています...</s-text>
          </s-banner>
        )}

{/* 現在の設定表示セクション */}
      <s-section slot="aside" heading="現在の設定">
        <s-stack direction="block" gap="base">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="base">
              <s-text tone="neutral">📋 設定内容</s-text>
              
              <s-paragraph>
                <s-text tone="neutral">リダイレクト先: </s-text>
                <s-text>
                  {redirectUrl ? (
                    <s-link href={redirectUrl}>
                      {redirectUrl}
                    </s-link>
                  ) : (
                    <s-text tone="neutral">（未設定）</s-text>
                  )}
                </s-text>
              </s-paragraph>
                
              <s-paragraph>
                <s-text tone="neutral">ステータス: </s-text>
                <s-text>
                  {isEnabled ? (
                    <s-text tone="success">✅ 有効</s-text>
                  ) : (
                    <s-text tone="critical">❌ 無効</s-text>
                  )}
                </s-text>
              </s-paragraph>
                
              {redirectUrl && isEnabled && (
                <s-banner tone="success">
                  <s-text>
                    🎉 404ページで自動リダイレクトが有効です
                  </s-text>
                </s-banner>
              )}
              
              {!isEnabled && (
                <s-banner tone="warning">
                  <s-text>
                    ⚠️ リダイレクト機能が無効です
                  </s-text>
                </s-banner>
              )}
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
