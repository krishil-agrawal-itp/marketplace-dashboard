"use client";

import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" className="btn-secondary print:hidden" onClick={() => window.print()}>
      <Download className="size-4" />
      Print / PDF
    </button>
  );
}
