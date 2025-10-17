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
          {/* リダイレクト先URL入力 */}
          <s-text-field
            label="リダイレクト先URL"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl((e.target as HTMLInputElement)?.value ?? "")}
            placeholder="https://example.com/404"
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
            {...(isLoading ? { loading: true } : {})}
          >
            保存
          </s-button>
        </s-stack>
      </s-section>

      {/* デバッグ用: 保存結果を表示 */}
      {fetcher.data && (
        <s-section heading="保存結果（デバッグ用）">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <pre style={{ margin: 0, overflow: 'auto' }}>
              {JSON.stringify(fetcher.data, null, 2)}
            </pre>
          </s-box>
        </s-section>
      )}

      {/* 現在の設定を表示（デバッグ用） */}
      <s-section slot="aside" heading="現在の設定">
        <s-paragraph>
          <s-text>リダイレクト先: </s-text>
          <s-text>{redirectUrl || "（未設定）"}</s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text>ステータス: </s-text>
          <s-text>{isEnabled ? "有効" : "無効"}</s-text>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
