"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RadarDataItem {
  status: string;
  value: number;
}

interface Props {
  data: RadarDataItem[];
  maxValue: number;
}

const chartConfig = {
  value: {
    label: "Кількість",
    theme: {
      light: "#2563eb",
      dark: "#60a5fa",
    },
  },
} satisfies ChartConfig;

export function ReportRadar({ data, maxValue }: Props) {
  return (
    <ChartContainer config={chartConfig} className="h-90 w-full sm:h-115">
      <RadarChart
        data={data}
        margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
      >
        <PolarGrid />
        <PolarAngleAxis
          dataKey="status"
          tick={{ fontSize: 13, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, maxValue]}
          tick={{ fontSize: 12 }}
        />
        <Radar
          dataKey="value"
          fill="var(--color-value)"
          fillOpacity={0.35}
          stroke="var(--color-value)"
          strokeWidth={2.5}
          dot={{ r: 4, fillOpacity: 1, strokeWidth: 0 }}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      </RadarChart>
    </ChartContainer>
  );
}
