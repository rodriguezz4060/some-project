import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Військові | 23 ОМБр",
  description: "База Військових>",
};

export default function MilitaryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main>{children}</main>;
}
