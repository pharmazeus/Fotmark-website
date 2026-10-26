import { ImageResponse } from "next/og";
import { MONOGRAM_PATH, MONOGRAM_VIEWBOX } from "./Monogram";

// The 286×338 framing of Monogram's viewBox.
const RATIO = 286 / 338;

// Favicon and touch icon: the header's cream monogram (`--monogram`) on the dark `--bg`,
// as hex because image routes can't read the CSS tokens.
export function brandIcon(
  size: { width: number; height: number },
  glyphHeight: number,
) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0A08",
      }}
    >
      <svg
        viewBox={MONOGRAM_VIEWBOX}
        width={Math.round(glyphHeight * RATIO)}
        height={glyphHeight}
        fill="#E9E2D3"
      >
        <path fillRule="evenodd" d={MONOGRAM_PATH} />
      </svg>
    </div>,
    size,
  );
}
