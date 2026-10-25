import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0B0A08",
        color: "#F1ECDF",
      }}
    >
      <div
        style={{
          fontFamily: "serif",
          fontSize: 96,
          letterSpacing: 30,
          marginLeft: 30,
        }}
      >
        FOTMARK
      </div>
      <div
        style={{
          width: 90,
          height: 1,
          margin: "36px 0",
          background: "#C6A971",
        }}
      />
      <div
        style={{
          fontSize: 28,
          letterSpacing: 7,
          color: "#C9C1B0",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        Fotografía &amp; Marketing
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
