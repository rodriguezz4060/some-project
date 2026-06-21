"use client";

import dynamic from "next/dynamic";
import type { MilitaryPersonnel } from "../../types";

const PdfButton = dynamic(
  () =>
    import("./profile-pdf-button").then((m) => m.ProfilePdfButton),
  { ssr: false },
);

interface Props {
  personnel: MilitaryPersonnel;
}

export function ProfilePdfWrapper({ personnel }: Props) {
  return <PdfButton personnel={personnel} />;
}
