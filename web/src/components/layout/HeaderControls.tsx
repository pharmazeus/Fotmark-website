import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import type { Locale } from "@/i18n/routing";

type Props = {
  locale: Locale;
  labels: {
    language: string;
    theme: { toggle: string; dark: string; light: string };
  };
};

export function HeaderControls({ labels, locale }: Props) {
  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher label={labels.language} locale={locale} />
      <ThemeToggle labels={labels.theme} />
    </div>
  );
}
