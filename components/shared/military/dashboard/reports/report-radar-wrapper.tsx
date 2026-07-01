"use client";

import dynamic from "next/dynamic";

const ReportRadarInner = dynamic(
  () => import("./report-radar").then((m) => m.ReportRadar),
  { ssr: false },
);

interface RadarDataItem {
  status: string;
  value: number;
}

interface Props {
  data: RadarDataItem[];
  maxValue: number;
}

export function ReportRadarWrapper({ data, maxValue }: Props) {
  return <ReportRadarInner data={data} maxValue={maxValue} />;
}
