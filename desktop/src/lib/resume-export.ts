import type {
  EducationContent,
  GitHubContent,
  PersonalInfoContent,
  ProjectsContent,
  QrCodesContent,
  Resume as SharedResume,
  ResumeSection as SharedResumeSection,
  SectionContent,
  WorkExperienceContent,
} from "@/types/resume";
import type {
  Resume as DesktopResume,
  ResumeSection as DesktopResumeSection,
} from "../types/resume";

function normalizeDate(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function cloneContent<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function maskValue(value: string | null | undefined): string {
  const length = Math.min(Math.max(Array.from(value || "").length, 4), 12);
  return "*".repeat(length);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pushSensitiveTerm(terms: string[], value: unknown): void {
  if (typeof value !== "string") {
    return;
  }

  const normalized = value.trim();
  if (Array.from(normalized).length >= 2) {
    terms.push(normalized);
  }
}

function collectSensitiveTerms(resume: SharedResume): string[] {
  const terms: string[] = [];
  pushSensitiveTerm(terms, resume.targetCompany);

  for (const section of resume.sections) {
    if (section.type === "personal_info") {
      const info = section.content as PersonalInfoContent;
      pushSensitiveTerm(terms, info.fullName);
      pushSensitiveTerm(terms, info.wechat);
    }

    if (section.type === "work_experience") {
      const work = section.content as WorkExperienceContent;
      for (const item of work.items || []) {
        pushSensitiveTerm(terms, item.company);
      }
    }

    if (section.type === "education") {
      const education = section.content as EducationContent;
      for (const item of education.items || []) {
        pushSensitiveTerm(terms, item.institution);
      }
    }
  }

  return Array.from(new Set(terms)).sort((a, b) => b.length - a.length);
}

function isOpenSourceRepositoryUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      return false;
    }

    return (
      host === "github.com"
      || host === "gitee.com"
      || host === "gitlab.com"
      || host === "bitbucket.org"
      || host === "sourceforge.net"
    );
  } catch {
    return false;
  }
}

function maskUrl(value: string): string {
  return isOpenSourceRepositoryUrl(value) ? value : maskValue(value);
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return "*".repeat(Math.min(Math.max(digits.length, 4), 12));
}

function maskKnownSensitiveTerms(value: string, terms: string[]): string {
  let result = value;
  for (const term of terms) {
    result = result.replace(new RegExp(escapeRegExp(term), "g"), maskValue(term));
  }
  return result;
}

function maskSensitiveInlineText(value: string, terms: string[]): string {
  return maskKnownSensitiveTerms(value, terms)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (candidate) =>
      maskValue(candidate),
    )
    .replace(/https?:\/\/[^\s)）\]}>"']+/gi, (candidate) => maskUrl(candidate))
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, (candidate) => {
      const digitCount = candidate.replace(/\D/g, "").length;
      return digitCount >= 8 ? maskPhone(candidate) : candidate;
    });
}

function deepMaskInlineSensitiveText<T>(value: T, terms: string[]): T {
  if (typeof value === "string") {
    return maskSensitiveInlineText(value, terms) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepMaskInlineSensitiveText(item, terms)) as T;
  }

  if (value && typeof value === "object") {
    const masked: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      masked[key] = deepMaskInlineSensitiveText(entry, terms);
    }
    return masked as T;
  }

  return value;
}

function anonymizePersonalInfo(
  content: PersonalInfoContent,
): PersonalInfoContent {
  return {
    ...content,
    fullName: content.fullName ? maskValue(content.fullName) : content.fullName,
    email: content.email ? maskValue(content.email) : "",
    phone: content.phone ? maskPhone(content.phone) : "",
    wechat: content.wechat ? maskValue(content.wechat) : content.wechat,
    website: content.website ? maskValue(content.website) : content.website,
    linkedin: content.linkedin ? maskValue(content.linkedin) : content.linkedin,
    github: content.github ? maskValue(content.github) : content.github,
    customLinks: content.customLinks?.map((link) => ({
      label: link.label,
      url: link.url ? maskUrl(link.url) : link.url,
    })),
    avatar: undefined,
  };
}

function anonymizeWorkExperience(
  content: WorkExperienceContent,
): WorkExperienceContent {
  return {
    ...content,
    items: (content.items || []).map((item) => ({
      ...item,
      company: item.company ? maskValue(item.company) : item.company,
    })),
  };
}

function anonymizeEducation(content: EducationContent): EducationContent {
  return {
    ...content,
    items: (content.items || []).map((item) => ({
      ...item,
      institution: item.institution ? maskValue(item.institution) : item.institution,
    })),
  };
}

function anonymizeGitHub(content: GitHubContent): GitHubContent {
  return {
    ...content,
    items: (content.items || []).map((item) => ({
      ...item,
      repoUrl: item.repoUrl ? maskUrl(item.repoUrl) : item.repoUrl,
    })),
  };
}

function anonymizeProjects(content: ProjectsContent): ProjectsContent {
  return {
    ...content,
    items: (content.items || []).map((item) => ({
      ...item,
      url: item.url ? maskUrl(item.url) : item.url,
    })),
  };
}

function anonymizeQrCodes(content: QrCodesContent): QrCodesContent {
  return {
    ...content,
    items: (content.items || []).map((item) => ({
      ...item,
      url: item.url ? maskValue(item.url) : item.url,
    })),
  };
}

function anonymizeSectionContent(
  type: string,
  content: SectionContent,
): SectionContent {
  switch (type) {
    case "personal_info":
      return anonymizePersonalInfo(content as PersonalInfoContent);
    case "work_experience":
      return anonymizeWorkExperience(content as WorkExperienceContent);
    case "education":
      return anonymizeEducation(content as EducationContent);
    case "projects":
      return anonymizeProjects(content as ProjectsContent);
    case "github":
      return anonymizeGitHub(content as GitHubContent);
    case "qr_codes":
      return anonymizeQrCodes(content as QrCodesContent);
    default:
      return content;
  }
}

export function anonymizeResumeForExport(
  resume: SharedResume,
): SharedResume {
  const sensitiveTerms = collectSensitiveTerms(resume);

  return {
    ...resume,
    title: deepMaskInlineSensitiveText(resume.title, sensitiveTerms),
    targetCompany: resume.targetCompany ? maskValue(resume.targetCompany) : resume.targetCompany,
    sections: resume.sections.map((section) => {
      const content = cloneContent(section.content);
      return {
        ...section,
        content: deepMaskInlineSensitiveText(
          anonymizeSectionContent(section.type, content),
          sensitiveTerms,
        ),
      };
    }),
  };
}

export function toSharedResume(
  resume: DesktopResume,
  sections: DesktopResumeSection[],
): SharedResume {
  const normalizedSections: SharedResumeSection[] = sections.map((section) => ({
    id: section.id,
    resumeId: section.resumeId,
    type: section.type,
    title: section.title,
    sortOrder: section.sortOrder,
    visible: section.visible,
    content: cloneContent(section.content) as SharedResumeSection["content"],
    createdAt: normalizeDate(section.createdAt),
    updatedAt: normalizeDate(section.updatedAt),
  }));

  return {
    id: resume.id,
    userId: resume.userId,
    title: resume.title,
    template: resume.template,
    themeConfig: resume.themeConfig,
    isDefault: resume.isDefault,
    language: resume.language,
    targetJobTitle: resume.targetJobTitle,
    targetCompany: resume.targetCompany,
    sections: normalizedSections,
    createdAt: normalizeDate(resume.createdAt),
    updatedAt: normalizeDate(resume.updatedAt),
  };
}

export function prepareDesktopPdfHtml(
  html: string,
  options: { fitOnePage: boolean },
): string {
  if (!options.fitOnePage || !html.includes("</body>")) {
    return html;
  }

  const fitScript = `
<script>
(function () {
  const A4_HEIGHT_PX = 1123;
  const MIN_SCALE = 0.78;

  function waitForLayout() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }

  async function fitToOnePage() {
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await waitForLayout();

      const root = document.querySelector('.resume-export');
      if (!(root instanceof HTMLElement)) {
        return;
      }

      const currentHeight = root.scrollHeight;
      if (!currentHeight || currentHeight <= A4_HEIGHT_PX) {
        return;
      }

      const scale = Math.max(MIN_SCALE, Math.min(1, A4_HEIGHT_PX / currentHeight));
      root.dataset.fitOnePage = 'true';
      root.style.transformOrigin = 'top center';
      root.style.transform = 'scale(' + scale.toFixed(3) + ')';
      root.style.width = (100 / scale).toFixed(2) + '%';
      root.style.margin = '0 auto';
    } catch (error) {
      console.error('[desktop-export] fit-one-page failed', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function onReady() {
      document.removeEventListener('DOMContentLoaded', onReady);
      void fitToOnePage();
    });
    return;
  }

  void fitToOnePage();
})();
</script>`;

  return html.replace("</body>", `${fitScript}\n</body>`);
}
