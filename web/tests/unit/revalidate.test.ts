import { beforeEach, describe, expect, it, vi } from "vitest";
import { REVALIDATE_TAGS, tagsForDocumentType } from "@/sanity/revalidate";

const mocks = vi.hoisted(() => ({
  env: { SANITY_REVALIDATE_SECRET: "x".repeat(40) as string | undefined },
  parseBody: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/env", () => ({ env: mocks.env }));
vi.mock("next-sanity/webhook", () => ({ parseBody: mocks.parseBody }));
vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));

const { POST } = await import("@/app/api/revalidate/route");
const request = () =>
  new Request("http://localhost/api/revalidate", { method: "POST" });

describe("tagsForDocumentType", () => {
  it("maps every site document type to its own tag", () => {
    for (const type of REVALIDATE_TAGS)
      expect(tagsForDocumentType(type)).toEqual([type]);
  });

  it("ignores anything else", () => {
    expect(tagsForDocumentType("sanity.imageAsset")).toEqual([]);
    expect(tagsForDocumentType(undefined)).toEqual([]);
  });
});

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    mocks.env.SANITY_REVALIDATE_SECRET = "x".repeat(40);
    mocks.parseBody.mockReset();
    mocks.revalidateTag.mockReset();
  });

  it("answers 503 without a configured secret", async () => {
    mocks.env.SANITY_REVALIDATE_SECRET = undefined;
    const response = await POST(request() as never);
    expect(response.status).toBe(503);
    expect(mocks.parseBody).not.toHaveBeenCalled();
  });

  it("rejects a bad signature", async () => {
    mocks.parseBody.mockResolvedValue({
      isValidSignature: false,
      body: { _type: "settings" },
    });
    const response = await POST(request() as never);
    expect(response.status).toBe(401);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates the changed type's tag without serving stale content", async () => {
    mocks.parseBody.mockResolvedValue({
      isValidSignature: true,
      body: { _type: "portfolioItem" },
    });
    const response = await POST(request() as never);
    expect(response.status).toBe(200);
    expect(mocks.revalidateTag).toHaveBeenCalledWith("portfolioItem", {
      expire: 0,
    });
    expect(await response.json()).toEqual({ revalidated: ["portfolioItem"] });
  });

  it("does nothing for unknown types", async () => {
    mocks.parseBody.mockResolvedValue({
      isValidSignature: true,
      body: { _type: "other" },
    });
    const response = await POST(request() as never);
    expect(response.status).toBe(200);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });
});
