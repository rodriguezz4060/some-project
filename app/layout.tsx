import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Providers } from "@/components/shared/auth/providers";
import { Header } from "@/components/shared/header/header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { ProgressBarProvider } from "./providers";

const nunito = Nunito({
  subsets: ["cyrillic"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Personal Tracker",
  description: "Контроль персоналу та військових 23 ОМБр",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ua" suppressHydrationWarning>
      <body className={nunito.className}>
        <ProgressBarProvider>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Header />
            <TooltipProvider>
              {children}
              <Toaster richColors closeButton />
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
        </ProgressBarProvider>
      </body>
    </html>
  );
}
