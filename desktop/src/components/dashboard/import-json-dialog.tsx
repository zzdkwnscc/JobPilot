import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2, FileIcon } from "lucide-react";
import {
  importDocument,
  parseMarkdownResume,
  parsePdfResume,
  type DesktopDocumentDetail,
} from "../../lib/desktop-api";

interface ImportJsonDialogProps {
  open: boolean;
  onClose: () => void;
  onImport?: (document?: DesktopDocumentDetail | null) => void | Promise<void>;
}

type FileType = "json" | "markdown" | "pdf";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getFileType(file: File): FileType {
  const name = file.name.toLowerCase();
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "markdown";
  if (name.endsWith(".pdf")) return "pdf";
  return "json";
}

function isSupportedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".json") ||
    name.endsWith(".md") ||
    name.endsWith(".markdown") ||
    name.endsWith(".pdf")
  );
}

export function ImportJsonDialog({
  open,
  onClose,
  onImport,
}: ImportJsonDialogProps) {
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>("json");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAndClose = () => {
    setFile(null);
    setFileType("json");
    setError("");
    setIsDragging(false);
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    setError("");
    if (!isSupportedFile(selectedFile)) {
      setError(t("importInvalidFormat"));
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(t("importFileTooLarge"));
      return;
    }
    setFileType(getFileType(selectedFile));
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setError("");

    try {
      let document: DesktopDocumentDetail;

      if (fileType === "json") {
        document = await handleJsonImport(file);
      } else if (fileType === "markdown") {
        document = await handleMarkdownImport(file);
      } else if (fileType === "pdf") {
        document = await handlePdfImport(file);
      } else {
        throw new Error(t("importInvalidFormat"));
      }

      await onImport?.(document);
      resetAndClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("importError");
      console.error("[import-json-dialog] Import failed:", err);
      setError(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleJsonImport = async (
    jsonFile: File
  ): Promise<DesktopDocumentDetail> => {
    const text = await jsonFile.text();
    const data = JSON.parse(text) as unknown;

    if (!isRecord(data)) {
      throw new Error(t("importInvalidFormat"));
    }

    const metadata = isRecord(data.metadata) ? data.metadata : {};
    const rawSections = Array.isArray(data.sections) ? data.sections : null;
    if (!rawSections) {
      throw new Error(t("importInvalidFormat"));
    }

    const sections = rawSections.map((section, index) => {
      if (!isRecord(section)) {
        throw new Error(t("importInvalidFormat"));
      }

      return {
        sectionType:
          readString(section.sectionType) ??
          readString(section.type) ??
          "custom",
        title: readString(section.title) ?? "custom",
        sortOrder:
          typeof section.sortOrder === "number" ? section.sortOrder : index,
        visible: typeof section.visible === "boolean" ? section.visible : true,
        content: isRecord(section.content) ? section.content : {},
      };
    });

    const themeSource = isRecord(data.theme)
      ? data.theme
      : isRecord(data.themeConfig)
        ? data.themeConfig
        : null;

    return importDocument({
      title:
        readString(data.title) ??
        readString(metadata.title) ??
        "Imported Resume",
      template: readString(data.template) ?? readString(metadata.template),
      language: readString(data.language) ?? readString(metadata.language),
      targetJobTitle:
        readString(data.targetJobTitle) ??
        readString(metadata.targetJobTitle) ??
        null,
      targetCompany:
        readString(data.targetCompany) ??
        readString(metadata.targetCompany) ??
        null,
      themeJson:
        readString(data.themeJson) ??
        (themeSource ? JSON.stringify(themeSource) : undefined),
      sections,
    });
  };

  const handleMarkdownImport = async (
    mdFile: File
  ): Promise<DesktopDocumentDetail> => {
    const content = await mdFile.text();

    const parsed = await parseMarkdownResume({
      content,
      locale: "zh",
    });

    const sections = parsed.sections.map((section, index) => ({
      sectionType: section.sectionType,
      title: section.title,
      sortOrder: index,
      visible: true,
      content: section.content,
    }));

    return importDocument({
      title: parsed.title,
      template: parsed.template,
      language: parsed.language,
      sections,
    });
  };

  const handlePdfImport = async (
    pdfFile: File
  ): Promise<DesktopDocumentDetail> => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const content = Array.from(new Uint8Array(arrayBuffer));

    const parsed = await parsePdfResume({
      content,
      locale: "zh",
    });

    const sections = parsed.sections.map((section, index) => ({
      sectionType: section.sectionType,
      title: section.title,
      sortOrder: index,
      visible: true,
      content: section.content,
    }));

    return importDocument({
      title: parsed.title,
      template: parsed.template,
      language: parsed.language,
      sections,
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onClick={resetAndClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dialog-header">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-pink-500" />
            <h2 className="dialog-title">{t("importTitle")}</h2>
          </div>
          <button type="button" className="dialog-close" onClick={resetAndClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="dialog-body">
          <p className="text-sm text-zinc-500 mb-4">
            {t("importDescription")}
          </p>

          {/* Upload area */}
          <div
            className={`upload-area ${isDragging ? "upload-area--dragging" : ""} ${file ? "upload-area--has-file" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.md,.markdown,.pdf"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFileSelect(e.target.files[0])
              }
            />
            {file ? (
              <div className="upload-file-info">
                {fileType === "json" ? (
                  <FileText className="h-8 w-8 text-pink-500" />
                ) : (
                  <FileIcon className="h-8 w-8 text-emerald-500" />
                )}
                <span className="upload-file-name">{file.name}</span>
                <span className="text-xs text-zinc-400">
                  ({fileType.toUpperCase()})
                </span>
                <button
                  type="button"
                  className="upload-file-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setError("");
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-zinc-400" />
                <p className="upload-hint">{t("importSelectFile")}</p>
                <p className="upload-subhint">{t("importDragHint")}</p>
              </>
            )}
          </div>

          {error && <p className="form-error mt-3">{error}</p>}
        </div>

        {/* Footer */}
        <div className="dialog-footer">
          <Button variant="secondary" onClick={resetAndClose} disabled={isImporting}>
            {t("commonCancel")}
          </Button>
          <Button
            onClick={() => void handleImport()}
            disabled={!file || isImporting}
          >
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isImporting ? t("importImporting") : t("importImportBtn")}
          </Button>
        </div>
      </div>
    </div>
  );
}
