import {
  createError,
  defineEventHandler,
  getMethod,
  setResponseHeader,
} from "h3";

export function getPreviewResponseHeaders(
  deploymentEnvironment: string | undefined,
): Record<string, string> {
  if (deploymentEnvironment !== "preview") {
    return {};
  }

  return {
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  };
}

export function isPreviewReadOnlyMethod(method: string): boolean {
  return ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

export default defineEventHandler((event) => {
  const headers = getPreviewResponseHeaders(process.env.DEPLOYMENT_ENV);

  for (const [name, value] of Object.entries(headers)) {
    setResponseHeader(event, name, value);
  }

  if (
    process.env.DEPLOYMENT_ENV === "preview" &&
    !isPreviewReadOnlyMethod(getMethod(event))
  ) {
    throw createError({
      statusCode: 405,
      statusMessage: "Preview deployments are read-only",
    });
  }
});
