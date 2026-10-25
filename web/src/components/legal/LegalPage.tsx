import { PageShell } from "@/components/layout/PageShell";

export function LegalPage({
  title,
  placeholder,
}: {
  title: string;
  placeholder: string;
}) {
  return (
    <PageShell eyebrow="FOTMARK" title={title}>
      <p className="border-l border-acc pl-5">{placeholder}</p>
    </PageShell>
  );
}
