import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Providers } from "@/components/shared/auth/providers";
import { Header } from "@/components/shared/header/header";
import { SkipToContent } from "@/components/shared/skip-to-content";
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
    <html lang="uk" suppressHydrationWarning>
      <body className={nunito.className}>
        <SkipToContent />
        <ProgressBarProvider>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Header />
            <TooltipProvider>
              <main id="main-content">{children}</main>
              <Toaster richColors closeButton />
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
        </ProgressBarProvider>
      </body>
    </html>
  );
}
