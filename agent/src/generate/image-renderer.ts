import fs from "fs/promises";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { CarouselSlide } from "../create/carousel-writer";
import { AGENT_CONFIG } from "../config";

let interRegular: ArrayBuffer | undefined;
let interBold: ArrayBuffer | undefined;
let jetbrainsMono: ArrayBuffer | undefined;

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  // Buffer.buffer is typed as ArrayBuffer | SharedArrayBuffer; Satori accepts ArrayBuffer.
  return buf.buffer
    .slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function loadFonts(): Promise<void> {
  if (interRegular && interBold && jetbrainsMono) return;

  const fontsDir = path.join(process.cwd(), "fonts");
  const interRegularPath = path.join(fontsDir, "Inter-Regular.ttf");
  const interBoldPath = path.join(fontsDir, "Inter-Bold.ttf");
  const jetBrainsMonoPath = path.join(
    fontsDir,
    "JetBrainsMono-Regular.ttf"
  );

  interRegular = toArrayBuffer(
    await fs.readFile(interRegularPath).catch(() => {
      throw new Error(
        `Missing font file: ${interRegularPath}. Workflow should download fonts.`
      );
    })
  );
  interBold = toArrayBuffer(await fs.readFile(interBoldPath));
  jetbrainsMono = toArrayBuffer(await fs.readFile(jetBrainsMonoPath));
}

function buildSlideJSX(
  slide: CarouselSlide
): any {
  const { colors } = AGENT_CONFIG.carousel;
  const W = AGENT_CONFIG.carousel.imageWidth;
  const H = AGENT_CONFIG.carousel.imageHeight;

  if (slide.type === "hook") {
    return {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        },
        children: [
          slide.emoji
            ? {
                type: "div",
                props: {
                  style: { fontSize: "64px", marginBottom: "24px" },
                  children: slide.emoji,
                },
              }
            : null,
          {
            type: "div",
            props: {
              style: {
                fontSize: "52px",
                fontWeight: 700,
                color: colors.text,
                textAlign: "center",
                lineHeight: 1.3,
              },
              children: slide.heading,
            },
          },
        ].filter(Boolean),
      },
    };
  }

  if (slide.type === "code") {
    return {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          background: colors.primary,
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          gap: "32px",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontSize: "36px",
                fontWeight: 700,
                color: colors.accent,
              },
              children: slide.heading,
            },
          },
          slide.body
            ? {
                type: "div",
                props: {
                  style: {
                    fontSize: "24px",
                    color: colors.muted,
                    lineHeight: 1.5,
                  },
                  children: slide.body,
                },
              }
            : null,
          slide.codeSnippet
            ? {
                type: "div",
                props: {
                  style: {
                    background: "#1a1a2e",
                    borderRadius: "16px",
                    padding: "32px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "22px",
                    color: colors.code,
                    lineHeight: 1.8,
                    border: `1px solid ${colors.secondary}`,
                    whiteSpace: "pre-wrap",
                  },
                  children: slide.codeSnippet,
                },
              }
            : null,
        ].filter(Boolean),
      },
    };
  }

  if (slide.type === "cta") {
    return {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${colors.primary}, #1a1a3e)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          gap: "24px",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontSize: "44px",
                fontWeight: 700,
                color: colors.text,
                textAlign: "center",
              },
              children: "Found this helpful?",
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "28px",
                color: colors.accent,
                textAlign: "center",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              },
              children:
                `Follow ${AGENT_CONFIG.handle}\n` +
                `Save for later\n` +
                `Share with a dev friend`,
            },
          },
        ],
      },
    };
  }

  // Default: content slide
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        background: colors.primary,
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        justifyContent: "center",
        gap: "28px",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", gap: "16px" },
            children: [
              slide.emoji
                ? {
                    type: "div",
                    props: { style: { fontSize: "40px" }, children: slide.emoji },
                  }
                : null,
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "40px",
                    fontWeight: 700,
                    color: colors.text,
                    lineHeight: 1.3,
                  },
                  children: slide.heading,
                },
              },
            ].filter(Boolean),
          },
        },
        slide.body
          ? {
              type: "div",
              props: {
                style: {
                  fontSize: "28px",
                  color: colors.muted,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                },
                children: slide.body,
              },
            }
          : null,
      ].filter(Boolean),
    },
  };
}

async function renderSlideToImage(slide: CarouselSlide): Promise<Buffer> {
  await loadFonts();
  const { colors } = AGENT_CONFIG.carousel;
  const W = AGENT_CONFIG.carousel.imageWidth;
  const H = AGENT_CONFIG.carousel.imageHeight;

  const slideJSX = buildSlideJSX(slide);
  const svg = await satori(slideJSX, {
    width: W,
    height: H,
    fonts: [
      {
        name: AGENT_CONFIG.carousel.fonts.body,
        data: interRegular!,
        weight: 400,
        style: "normal",
      },
      {
        name: AGENT_CONFIG.carousel.fonts.body,
        data: interBold!,
        weight: 700,
        style: "normal",
      },
      {
        name: AGENT_CONFIG.carousel.fonts.code,
        data: jetbrainsMono!,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg as any, {
    fitTo: { mode: "width", value: W },
  });

  return Buffer.from(resvg.render().asPng());
}

export async function renderAllSlides(slides: CarouselSlide[]): Promise<Buffer[]> {
  const images: Buffer[] = [];
  for (const slide of slides) {
    images.push(await renderSlideToImage(slide));
  }
  return images;
}

