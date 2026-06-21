"use client";

import { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BzvpPdfDocument } from "./bzvp-pdf-document";
import type { BzvpPersonnel } from "./types";

interface Props {
  personnel: BzvpPersonnel;
}

export function BzvpPdfButton({ personnel }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsLoading(true);
    try {
      const pdfInstance = pdf(<BzvpPdfDocument personnel={personnel} />);
      const blob = await pdfInstance.toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${personnel.fullName.replace(/\s+/g, "_")}_бзвп.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  }, [personnel]);

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileDown className="size-4" />
      )}
      {isLoading ? "Генерація..." : "PDF"}
    </Button>
  );
}
