import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Звіти | 23 ОМБр",
  description: "Звіти та аналітика особового складу",
};

export default function ReportsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
