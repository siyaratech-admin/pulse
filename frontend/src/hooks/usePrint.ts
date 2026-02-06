import { useState, useCallback, useEffect } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
import type {
  PrintFormat,
  PrintHTMLResponse,
  UsePrintOptions,
  UsePrintReturn,
} from "@/types/print";

const STORAGE_KEY_PREFIX = "print_format_";

export function usePrint({
  doctype,
  docname,
  printFormat,
  letterhead,
  noLetterhead,
}: UsePrintOptions): UsePrintReturn {
  const [selectedFormat, setSelectedFormatState] = useState<string>(
    printFormat ||
      localStorage.getItem(`${STORAGE_KEY_PREFIX}${doctype}`) ||
      "Standard"
  );
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState<PrintHTMLResponse | null>(
    null
  );
  const [printFormats, setPrintFormats] = useState<PrintFormat[]>([]);
  const [isLoadingHTML, setIsLoadingHTML] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch available print formats for this DocType
  const {
    data: formatsData,
    isLoading: isLoadingFormats,
    error: formatsError,
  } = useFrappeGetCall<{
    message: PrintFormat[];
  }>(
    "frappe.client.get_list",
    {
      doctype: "Print Format",
      filters: JSON.stringify({
        doc_type: doctype,
        disabled: 0,
      }),
      fields: JSON.stringify(["name", "standard", "disabled"]),
      limit_page_length: 100,
    },
    undefined,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (formatsData?.message) {
      // Always include "Standard" format
      const formats = [
        { name: "Standard", standard: "Yes", disabled: 0 },
        ...formatsData.message.filter((f) => f.name !== "Standard"),
      ];
      setPrintFormats(formats);
    }
  }, [formatsData]);

  useEffect(() => {
    if (formatsError) {
      setError(new Error("Failed to load print formats"));
    }
  }, [formatsError]);

  // Get print HTML
  const getPrintHTML = useCallback(async (): Promise<PrintHTMLResponse> => {
    setIsLoadingHTML(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        doc: doctype,
        name: docname,
        print_format: selectedFormat,
        no_letterhead: noLetterhead ? "1" : "0",
      });

      if (letterhead) {
        params.append("letterhead", letterhead);
      }

      const response = await fetch(
        `/api/method/frappe.www.printview.get_html_and_style?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Frappe-CSRF-Token": (window as any).frappe?.csrf_token || "",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch print HTML: ${response.statusText}. ${errorText}`
        );
      }

      const data = await response.json();

      if (!data.message) {
        throw new Error("Invalid response format from server");
      }

      const result: PrintHTMLResponse = data.message || data;

      // Validate the response has required fields
      if (!result.html) {
        throw new Error("Print HTML is empty or invalid");
      }

      setHtmlContent(result);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch print HTML");

      console.error("Print HTML Error:", error);
      setError(error);
      throw error;
    } finally {
      setIsLoadingHTML(false);
    }
  }, [doctype, docname, selectedFormat, letterhead, noLetterhead]);

  // Download PDF
  const downloadPDF = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      const params = new URLSearchParams({
        doctype: doctype,
        name: docname,
        format: selectedFormat,
        no_letterhead: noLetterhead ? "1" : "0",
      });

      if (letterhead) {
        params.append("letterhead", letterhead);
      }

      const response = await fetch(
        `/api/method/frappe.utils.print_format.download_pdf?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "X-Frappe-CSRF-Token": (window as any).frappe?.csrf_token || "",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to download PDF: ${response.statusText}. ${errorText}`
        );
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/pdf")) {
        throw new Error("Server did not return a PDF file");
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Sanitize filename
      const sanitizedDocname = docname
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      a.download = `${sanitizedDocname}_${selectedFormat
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.pdf`;

      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to download PDF");

      console.error("PDF Download Error:", error);
      setError(error);
      throw error;
    }
  }, [doctype, docname, selectedFormat, letterhead, noLetterhead]);

  // Open print preview
  const openPrintPreview = useCallback(() => {
    setIsPrintPreviewOpen(true);
  }, []);

  // Close print preview
  const closePrintPreview = useCallback(() => {
    setIsPrintPreviewOpen(false);
    setHtmlContent(null);
    setError(null);
  }, []);

  // Set selected format and persist to localStorage
  const setSelectedFormat = useCallback(
    (format: string) => {
      setSelectedFormatState(format);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${doctype}`, format);
      } catch (err) {
        console.warn("Failed to save print format preference:", err);
      }
    },
    [doctype]
  );

  // Fetch print formats (manual refresh if needed)
  const fetchPrintFormats = useCallback(async () => {
    // This is handled by the useFrappeGetCall hook above
    // This method is here for manual refresh if needed
  }, []);

  // Direct print without preview
  const printDirect = useCallback(async () => {
    try {
      const content = await getPrintHTML();

      const printWindow = window.open("", "_blank");
      if (printWindow && content) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Print - ${docname}</title>
              <style>
                ${content.style || ""}
              </style>
            </head>
            <body>
              ${content.html}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 1000);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (err) {
      console.error("Direct print failed:", err);
      throw err;
    }
  }, [getPrintHTML, docname]);

  return {
    // State
    isLoading: isLoadingHTML || isLoadingFormats,
    error,
    printFormats,
    selectedFormat,
    htmlContent,
    isPrintPreviewOpen,

    // Methods
    getPrintHTML,
    downloadPDF,
    openPrintPreview,
    closePrintPreview,
    setSelectedFormat,
    fetchPrintFormats,
    printDirect,
  };
}
