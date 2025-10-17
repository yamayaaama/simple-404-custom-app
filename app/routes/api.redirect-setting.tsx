
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const settings = await prisma.redirectSettings.findUnique({
    where: { shop: session.shop},
  });

  if (!settings) {
    return ({
      redirectUrl: "",
      isEnabled: true,
    });
  }

  return ({ settings });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();
  const redirectUrl = formData.get("redirectUrl") as string;
  const isEnabled = formData.get("isEnabled") === "true";

  const updatedSettings = await prisma.redirectSettings.upsert({
    where: { shop: session.shop },
    update: {
      redirectUrl: redirectUrl,
      isEnabled: isEnabled,
    },
    create: {
      shop: session.shop,
      redirectUrl: redirectUrl,
      isEnabled: isEnabled,
    },
  });

  return {
    success: true,
    settings: updatedSettings,
  };
};