import type { ContactInput } from "./schema";

type Props = { input: ContactInput };

export function ContactEmail({ input }: Props) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
      <h1>New Fotmark enquiry</h1>
      <p>
        <strong>Name:</strong> {input.name}
      </p>
      <p>
        <strong>Email / phone:</strong> {input.contact}
      </p>
      <p>
        <strong>Business:</strong> {input.businessType}
      </p>
      <p>
        <strong>Service:</strong> {input.service}
      </p>
      <p>
        <strong>Locale:</strong> {input.locale}
      </p>
      <p style={{ whiteSpace: "pre-wrap" }}>{input.message}</p>
      <hr />
      <p>
        First touch: {input.utmSource || "—"} / {input.utmMedium || "—"} /{" "}
        {input.utmCampaign || "—"}
      </p>
    </div>
  );
}
