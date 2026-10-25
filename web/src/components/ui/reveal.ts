// Scroll reveal (prototype `.rv`, delays `.d1…d6`). Spread it onto the element that
// should rise in: `<div {...reveal(2)}>`. RevealObserver adds `data-in` on entry.
export type RevealDelay = 1 | 2 | 3 | 4 | 5 | 6;

export function reveal(delay?: RevealDelay) {
  return { "data-reveal": delay ?? "" };
}
