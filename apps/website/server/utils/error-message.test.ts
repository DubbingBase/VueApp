import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./error-message";

describe("getErrorMessage", () => {
  it("returns the message from standard errors", () => {
    expect(getErrorMessage(new Error("request failed"))).toBe("request failed");
  });

  it("serializes structured errors instead of returning object Object", () => {
    expect(
      getErrorMessage({
        message: "Provider request failed",
        statusCode: 503,
      }),
    ).toBe('{"message":"Provider request failed","statusCode":503}');
  });
});
