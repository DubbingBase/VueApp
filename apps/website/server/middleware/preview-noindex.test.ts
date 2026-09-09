import { describe, expect, it } from "vitest";

import { getPreviewResponseHeaders } from "./preview-noindex";
import { isPreviewReadOnlyMethod } from "./preview-noindex";

describe("preview response headers", () => {
  it("marks preview responses as non-indexable", () => {
    expect(getPreviewResponseHeaders("preview")).toEqual({
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    });
  });

  it("does not add preview headers to production responses", () => {
    expect(getPreviewResponseHeaders("production")).toEqual({});
    expect(getPreviewResponseHeaders(undefined)).toEqual({});
  });

  it("allows only safe HTTP methods in previews", () => {
    expect(isPreviewReadOnlyMethod("GET")).toBe(true);
    expect(isPreviewReadOnlyMethod("HEAD")).toBe(true);
    expect(isPreviewReadOnlyMethod("OPTIONS")).toBe(true);
    expect(isPreviewReadOnlyMethod("POST")).toBe(false);
    expect(isPreviewReadOnlyMethod("DELETE")).toBe(false);
  });
});
