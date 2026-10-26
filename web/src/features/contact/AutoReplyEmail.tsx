export type AutoReplyCopy = {
  subject: string;
  greeting: string;
  body: string;
  signoff: string;
};

type Props = { copy: AutoReplyCopy };

// The confirmation sent to whoever submitted the form (D-038). Fixed, localized copy only:
// nothing from the submission is echoed (not even the name), so the form can't be used
// to send someone else a message of the attacker's choosing.
export function AutoReplyEmail({ copy }: Props) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
      <p>{copy.greeting}</p>
      <p>{copy.body}</p>
      <p>{copy.signoff}</p>
    </div>
  );
}
