"use client";

import dynamic from "next/dynamic";
import type { BzvpPersonnel } from "./types";

const PdfButton = dynamic(
  () => import("./bzvp-pdf-button").then((m) => m.BzvpPdfButton),
  { ssr: false },
);

interface Props {
  personnel: BzvpPersonnel;
}

export function BzvpPdfWrapper({ personnel }: Props) {
  return <PdfButton personnel={personnel} />;
}
