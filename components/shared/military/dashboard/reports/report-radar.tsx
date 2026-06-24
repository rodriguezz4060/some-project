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

const DOT_COLORS: Record<string, string> = {
  Активні: "var(--color-active)",
  "На завданні": "var(--color-mission)",
  Поранені: "var(--color-wounded)",
  Відпустка: "var(--color-vacation)",
  Резерв: "var(--color-reserve)",
};

const chartConfig = {
  value: {
    label: "Кількість",
    theme: {
      light: "#22c55e",
      dark: "#4ade80",
    },
  },
  active: {
    label: "Активні",
    theme: { light: "#22c55e", dark: "#4ade80" },
  },
  mission: {
    label: "На завданні",
    theme: { light: "#f59e0b", dark: "#fbbf24" },
  },
  wounded: {
    label: "Поранені",
    theme: { light: "#f43f5e", dark: "#fb7185" },
  },
  vacation: {
    label: "Відпустка",
    theme: { light: "#0ea5e9", dark: "#38bdf8" },
  },
  reserve: {
    label: "Резерв",
    theme: { light: "#6b7280", dark: "#9ca3af" },
  },
} satisfies ChartConfig;

export function ReportRadar({ data, maxValue }: Props) {
  return (
    <ChartContainer config={chartConfig} className="h-90 w-full sm:h-115">
      <RadarChart
        data={data}
        margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
        cx="50%"
        cy="50%"
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
          fillOpacity={0.25}
          stroke="var(--color-value)"
          strokeWidth={2.5}
          dot={(props) => {
            const idx = (props as { index: number }).index;
            const label = data[idx]?.status;
            const color = label ? DOT_COLORS[label] : "var(--color-value)";
            return (
              <circle
                key={idx}
                cx={props.cx as number}
                cy={props.cy as number}
                r={5}
                fill={color}
                stroke="var(--background)"
                strokeWidth={2}
              />
            );
          }}
          label={{
            position: "insideStart",
            fontSize: 13,
            fontWeight: 600,
            fill: "var(--color-value)",
          }}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      </RadarChart>
    </ChartContainer>
  );
}
