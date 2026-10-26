import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { env } from "@/env";
import { tagsForDocumentType } from "@/sanity/revalidate";

// Sanity publish webhook (D-039): a signed POST with `{ _type }` revalidates that type's
// cache tag, so Studio edits reach the static pages without a redeploy.
export async function POST(request: NextRequest) {
  const secret = env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Not configured" }, { status: 503 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(
    request,
    secret,
  );
  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const tags = tagsForDocumentType(body?._type);
  // `expire: 0`: the next visit renders fresh content instead of a stale copy, so the
  // editor sees the change on the first reload (one blocking render on a quiet site).
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags });
}
