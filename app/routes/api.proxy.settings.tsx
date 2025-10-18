import prisma from "../db.server";
import type { LoaderFunctionArgs } from "react-router";
import { verifyProxyHmac } from "../utils/verifyProxyHmac";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (process.env.NODE_ENV === "production") {
    const apiSecret = process.env.SHOPIFY_API_SECRET;

    if (!apiSecret) {
      return Response.json(
        { error: "Server configuration error"},
        { status: 500 }
      );
    }

    const isValid = verifyProxyHmac(url.searchParams, apiSecret);

    if (!isValid) {
      return Response.json(
        { error: "Invalid signature"},
        { status: 401 }
      );
    }
  }


  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json(
      { error: "Shop parameter is required" },
      { status: 400 }
    );
  }

  const settings = await prisma.redirectSettings.findUnique({
    where: { shop: shop},
  });

  if (!settings) {
    return Response.json({
      redirectUrl: "",
      isEnabled: false,
    });
  }

  return Response.json({
    redirectUrl: settings.redirectUrl,
    isEnabled: settings.isEnabled,
  });
};