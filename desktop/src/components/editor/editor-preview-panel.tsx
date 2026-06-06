import { useMemo, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ResumePreview } from "@/components/preview/resume-preview";
import type { Resume as SharedResume } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "../../stores/resume-store";
import type { Resume } from "../../types/resume";

// A4 width in px (at 96 dpi)
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const DEFAULT_ZOOM = 90;
const MIN_ZOOM = 30;
const MAX_ZOOM = 150;

export function EditorPreviewPanel() {
  const { t } = useTranslation();
  const { currentResume, sections } = useResumeStore();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const liveResume = useMemo<Resume | null>(() => {
    if (!currentResume) return null;
    return { ...currentResume, sections };
  }, [currentResume, sections]);

  if (!liveResume) return null;

  const scale = zoom / 100;

  return (
    <div
      data-tour="preview"
      className="flex min-w-0 flex-[6] flex-col border-l bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b bg-white px-5 dark:border-zinc-800 dark:bg-background">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t("editor.toolbar.preview")}
        </span>
        <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-1 py-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 cursor-pointer rounded-full p-0 text-zinc-600 hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label={t("editor.toolbar.zoomOut")}
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 10))}
            disabled={zoom <= MIN_ZOOM}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="w-12 text-center text-xs font-medium tabular-nums text-zinc-600 dark:text-zinc-300">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 cursor-pointer rounded-full p-0 text-zinc-600 hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label={t("editor.toolbar.zoomIn")}
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 10))}
            disabled={zoom >= MAX_ZOOM}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview body */}
      <div className="min-h-0 flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-950">
        <div className="flex min-h-full justify-center px-8 py-8 lg:py-10">
          <div
            className="overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-xl shadow-zinc-900/20 ring-1 ring-zinc-900/5 dark:border-zinc-700 dark:shadow-black/50"
            style={{
              width: A4_WIDTH,
              minHeight: A4_HEIGHT,
              zoom: scale,
            }}
          >
            <ResumePreview resume={liveResume as unknown as SharedResume} />
          </div>
        </div>
      </div>
    </div>
  );
}
