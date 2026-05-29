import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Resume } from '@/types/resume';
import { getUnifiedTemplate, toCanonicalResume } from '@/lib/template-renderer';
import { buildContactEntries } from '@/lib/template-renderer/contact-info';
import { MinimalTemplate } from '@/components/preview/templates/minimal';
import { buildMinimalHtml } from '@/app/api/resume/[id]/export/templates/minimal';

function createSampleResume(template: string): Resume {
  const now = new Date('2026-03-31T00:00:00.000Z');

  return {
    id: 'resume-1',
    userId: 'user-1',
    title: 'Senior Frontend Engineer',
    template,
    themeConfig: {
      primaryColor: '#111827',
      accentColor: '#e94560',
      fontFamily: 'Inter',
      fontSize: 'medium',
      lineSpacing: 1.5,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      sectionSpacing: 16,
      avatarStyle: 'circle',
    },
    isDefault: false,
    language: 'en',
    targetJobTitle: null,
    targetCompany: null,
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: 'summary',
        resumeId: 'resume-1',
        type: 'summary',
        title: 'Summary',
        sortOrder: 2,
        visible: true,
        content: {
          text: 'Built **shipping** systems for global teams.',
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'work',
        resumeId: 'resume-1',
        type: 'work_experience',
        title: 'Experience',
        sortOrder: 3,
        visible: true,
        content: {
          items: [
            {
              id: 'work-1',
              company: 'JobPilot',
              position: 'Frontend Engineer',
              startDate: '2023-01',
              endDate: null,
              current: true,
              description: 'Delivered cross-platform resume rendering.',
              technologies: ['React', 'TypeScript'],
              highlights: ['Cut export regressions by 80%'],
            },
          ],
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'skills',
        resumeId: 'resume-1',
        type: 'skills',
        title: 'Skills',
        sortOrder: 4,
        visible: true,
        content: {
          categories: [
            {
              id: 'skills-1',
              name: 'Core',
              skills: ['Accessibility', 'Design Systems', 'Tauri'],
            },
          ],
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'personal',
        resumeId: 'resume-1',
        type: 'personal_info',
        title: 'Personal Info',
        sortOrder: 1,
        visible: true,
        content: {
          fullName: 'Alex Template',
          jobTitle: 'Senior Frontend Engineer',
          email: 'alex@example.com',
          phone: '123-456-7890',
          location: 'Hong Kong',
          website: 'https://example.com',
        },
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

function countSections(markup: string): number {
  return (markup.match(/data-section/g) || []).length;
}

function assertAppearsInOrder(markup: string, values: string[]): void {
  let cursor = 0;

  for (const value of values) {
    const index = markup.indexOf(value, cursor);
    assert.notEqual(index, -1, `"${value}" should appear in markup`);
    cursor = index + value.length;
  }
}

function testCanonicalResumeMetadata(): void {
  const canonical = toCanonicalResume(createSampleResume('classic'));

  assert.equal(canonical.personalInfo.fullName, 'Alex Template');
  assert.deepEqual(
    canonical.sections.map((section) => ({
      id: section.id,
      visible: section.visible,
      sortOrder: section.sortOrder,
    })),
    [
      { id: 'personal', visible: true, sortOrder: 1 },
      { id: 'summary', visible: true, sortOrder: 2 },
      { id: 'work', visible: true, sortOrder: 3 },
      { id: 'skills', visible: true, sortOrder: 4 },
    ],
  );
}

function testTemplateParity(templateId: string): void {
  const unifiedTemplate = getUnifiedTemplate(templateId);
  assert.ok(unifiedTemplate, `Expected "${templateId}" to be registered`);

  const canonical = toCanonicalResume(createSampleResume(templateId));
  const previewMarkup = renderToStaticMarkup(
    React.createElement(unifiedTemplate.PreviewComponent, { resume: canonical }),
  );
  const exportMarkup = unifiedTemplate.buildHtml(canonical);

  assert.equal(countSections(previewMarkup), countSections(exportMarkup));
  assertAppearsInOrder(previewMarkup, ['Summary', 'Experience', 'Skills']);
  assertAppearsInOrder(exportMarkup, ['Summary', 'Experience', 'Skills']);
  assert.match(previewMarkup, /Alex Template/);
  assert.match(exportMarkup, /Alex Template/);
  assert.match(previewMarkup, /<strong>shipping<\/strong>/);
  assert.match(exportMarkup, /<strong>shipping<\/strong>/);
}

function testProfessionalSkillsRenderAsListItems(): void {
  const unifiedTemplate = getUnifiedTemplate('professional');
  assert.ok(unifiedTemplate, 'Expected "professional" to be registered');

  const canonical = toCanonicalResume(createSampleResume('professional'));
  const previewMarkup = renderToStaticMarkup(
    React.createElement(unifiedTemplate.PreviewComponent, { resume: canonical }),
  );
  const exportMarkup = unifiedTemplate.buildHtml(canonical);

  for (const skill of ['Accessibility', 'Design Systems', 'Tauri']) {
    assert.match(previewMarkup, new RegExp(`<li[^>]*>${skill}</li>`));
    assert.match(exportMarkup, new RegExp(`<li[^>]*>${skill}</li>`));
  }

  assert.doesNotMatch(exportMarkup, /Accessibility,\s*Design Systems,\s*Tauri/);
}

function testProfessionalProfileContactInfoOrder(): void {
  const unifiedTemplate = getUnifiedTemplate('professional');
  assert.ok(unifiedTemplate, 'Expected "professional" to be registered');

  const resume = createSampleResume('professional');
  const personalSection = resume.sections.find((section) => section.type === 'personal_info');
  assert.ok(personalSection, 'Expected personal info section to exist');

  personalSection.content = {
    fullName: 'Alex Template',
    jobTitle: 'AI Product Manager',
    gender: 'Female',
    age: '29',
    hometown: 'Hangzhou',
    politicalStatus: 'CPC Member',
    phone: '123-456-7890',
    wechat: 'alex-wechat',
    email: 'alex@example.com',
    yearsOfExperience: '5 years',
    location: 'Hong Kong',
    website: 'https://example.com',
  };

  const canonical = toCanonicalResume(resume);
  const previewMarkup = renderToStaticMarkup(
    React.createElement(unifiedTemplate.PreviewComponent, { resume: canonical }),
  );
  const exportMarkup = unifiedTemplate.buildHtml(canonical);
  const expectedOrder = [
    'Alex Template',
    'AI Product Manager',
    '5 years',
    'Hong Kong',
    '123-456-7890',
    'alex@example.com',
    'alex-wechat',
    'https://example.com',
    'Female',
    '29',
    'Hangzhou',
    'CPC Member',
  ];

  assertAppearsInOrder(previewMarkup, expectedOrder);
  assertAppearsInOrder(exportMarkup, expectedOrder);
}

function testConsultantSkillsRenderAsListItems(): void {
  const unifiedTemplate = getUnifiedTemplate('consultant');
  assert.ok(unifiedTemplate, 'Expected "consultant" to be registered');

  const canonical = toCanonicalResume(createSampleResume('consultant'));
  const previewMarkup = renderToStaticMarkup(
    React.createElement(unifiedTemplate.PreviewComponent, { resume: canonical }),
  );
  const exportMarkup = unifiedTemplate.buildHtml(canonical);

  for (const skill of ['Accessibility', 'Design Systems', 'Tauri']) {
    assert.match(previewMarkup, new RegExp(`<li[^>]*>${skill}</li>`));
    assert.match(exportMarkup, new RegExp(`<li[^>]*>${skill}</li>`));
  }

  assert.doesNotMatch(exportMarkup, /Accessibility,\s*Design Systems,\s*Tauri/);
}

function testClassicSkillsRenderAsListItems(): void {
  const unifiedTemplate = getUnifiedTemplate('classic');
  assert.ok(unifiedTemplate, 'Expected "classic" to be registered');

  const canonical = toCanonicalResume(createSampleResume('classic'));
  const previewMarkup = renderToStaticMarkup(
    React.createElement(unifiedTemplate.PreviewComponent, { resume: canonical }),
  );
  const exportMarkup = unifiedTemplate.buildHtml(canonical);

  for (const skill of ['Accessibility', 'Design Systems', 'Tauri']) {
    assert.match(previewMarkup, new RegExp(`<li[^>]*>${skill}</li>`));
    assert.match(exportMarkup, new RegExp(`<li[^>]*>${skill}</li>`));
  }

  assert.doesNotMatch(exportMarkup, /Accessibility,\s*Design Systems,\s*Tauri/);
}

function testSharedProfileContactInfoOrder(): void {
  const expectedOrder = [
    'Alex Template',
    'AI Product Manager',
    '5 years',
    'Hong Kong',
    '123-456-7890',
    'alex@example.com',
    'alex-wechat',
    'https://example.com',
    'Female',
    '29',
    'Hangzhou',
    'CPC Member',
  ];

  for (const templateId of ['classic', 'modern', 'consultant']) {
    const unifiedTemplate = getUnifiedTemplate(templateId);
    assert.ok(unifiedTemplate, `Expected "${templateId}" to be registered`);

    const resume = createSampleResume(templateId);
    const personalSection = resume.sections.find((section) => section.type === 'personal_info');
    assert.ok(personalSection, 'Expected personal info section to exist');

    personalSection.content = {
      fullName: 'Alex Template',
      jobTitle: 'AI Product Manager',
      gender: 'Female',
      age: '29',
      hometown: 'Hangzhou',
      politicalStatus: 'CPC Member',
      phone: '123-456-7890',
      wechat: 'alex-wechat',
      email: 'alex@example.com',
      yearsOfExperience: '5 years',
      location: 'Hong Kong',
      website: 'https://example.com',
    };

    const canonical = toCanonicalResume(resume);
    const previewMarkup = renderToStaticMarkup(
      React.createElement(unifiedTemplate.PreviewComponent, { resume: canonical }),
    );
    const exportMarkup = unifiedTemplate.buildHtml(canonical);

    assertAppearsInOrder(previewMarkup, expectedOrder);
    assertAppearsInOrder(exportMarkup, expectedOrder);
  }
}

function testLegacyMinimalProfileContactInfoOrder(): void {
  const resume = createSampleResume('minimal');
  const personalSection = resume.sections.find((section) => section.type === 'personal_info');
  assert.ok(personalSection, 'Expected personal info section to exist');

  personalSection.content = {
    fullName: 'Alex Template',
    jobTitle: 'AI Product Manager',
    gender: 'Female',
    age: '29',
    hometown: 'Hangzhou',
    politicalStatus: 'CPC Member',
    phone: '123-456-7890',
    wechat: 'alex-wechat',
    email: 'alex@example.com',
    yearsOfExperience: '5 years',
    location: 'Hong Kong',
    website: 'https://example.com',
  };

  const previewMarkup = renderToStaticMarkup(
    React.createElement(MinimalTemplate, { resume }),
  );
  const exportMarkup = buildMinimalHtml(resume);
  const expectedOrder = [
    'Alex Template',
    'AI Product Manager',
    '5 years',
    'Hong Kong',
    '123-456-7890',
    'alex@example.com',
    'alex-wechat',
    'https://example.com',
    'Female',
    '29',
    'Hangzhou',
    'CPC Member',
  ];

  assertAppearsInOrder(previewMarkup, expectedOrder);
  assertAppearsInOrder(exportMarkup, expectedOrder);
}

function testModernMinimalProjectAndEducationHighlightsRenderAsBullets(): void {
  const unifiedTemplate = getUnifiedTemplate('modern-minimal');
  assert.ok(unifiedTemplate, 'Expected "modern-minimal" to be registered');

  const resume = createSampleResume('modern-minimal');
  const now = new Date('2026-03-31T00:00:00.000Z');

  resume.sections.push(
    {
      id: 'project',
      resumeId: 'resume-1',
      type: 'projects',
      title: 'Projects',
      sortOrder: 5,
      visible: true,
      content: {
        items: [
          {
            id: 'project-1',
            name: 'Export Parity',
            startDate: '2024-01',
            endDate: '2024-12',
            description: 'Aligned preview and export rendering.',
            technologies: ['HTML', 'PDF'],
            highlights: ['Restored project bullets'],
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'education',
      resumeId: 'resume-1',
      type: 'education',
      title: 'Education',
      sortOrder: 6,
      visible: true,
      content: {
        items: [
          {
            id: 'education-1',
            institution: 'Template University',
            degree: 'MSc',
            field: 'Computer Science',
            startDate: '2020-09',
            endDate: '2022-06',
            highlights: ['Restored education bullets'],
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
  );

  const canonical = toCanonicalResume(resume);
  const previewMarkup = renderToStaticMarkup(
    React.createElement(unifiedTemplate.PreviewComponent, { resume: canonical }),
  );
  const exportMarkup = unifiedTemplate.buildHtml(canonical);

  for (const highlight of ['Restored project bullets', 'Restored education bullets']) {
    assert.match(previewMarkup, new RegExp(`<li[^>]*>${highlight}</li>`));
    assert.match(exportMarkup, new RegExp(`<li[^>]*>${highlight}</li>`));
  }

  assert.match(exportMarkup, /<ul[^>]*(?:list-disc|list-style-type:disc)[^>]*>[\s\S]*Restored project bullets/);
  assert.match(exportMarkup, /<ul[^>]*(?:list-disc|list-style-type:disc)[^>]*>[\s\S]*Restored education bullets/);
  assert.match(previewMarkup, /class="flex w-full items-baseline justify-between gap-3"[\s\S]*Export Parity[\s\S]*class="shrink-0 text-right text-xs"[\s\S]*2024-01[\s\S]*2024-12/);
  assert.match(exportMarkup, /display:flex;width:100%;justify-content:space-between;align-items:baseline;gap:12px[\s\S]*Export Parity[\s\S]*text-align:right[\s\S]*2024-01[\s\S]*2024-12/);
}

function testModernMinimalHeaderAlignsLeftWhenAvatarMissing(): void {
  const unifiedTemplate = getUnifiedTemplate('modern-minimal');
  assert.ok(unifiedTemplate, 'Expected "modern-minimal" to be registered');

  const canonical = toCanonicalResume(createSampleResume('modern-minimal'));
  const previewMarkup = renderToStaticMarkup(
    React.createElement(unifiedTemplate.PreviewComponent, { resume: canonical }),
  );
  const exportMarkup = unifiedTemplate.buildHtml(canonical);

  assert.doesNotMatch(previewMarkup, /class="text-center"[\s\S]*Alex Template/);
  assert.match(previewMarkup, /text-align:left/);
  assert.match(exportMarkup, /<div style="text-align:left">[\s\S]*Alex Template/);
  assert.match(exportMarkup, /font-size:13px;color:#6B7280;[^"]*text-align:left/);
}

function testModernMinimalProfileContactInfoOrder(): void {
  const unifiedTemplate = getUnifiedTemplate('modern-minimal');
  assert.ok(unifiedTemplate, 'Expected "modern-minimal" to be registered');

  const resume = createSampleResume('modern-minimal');
  const personalSection = resume.sections.find((section) => section.type === 'personal_info');
  assert.ok(personalSection, 'Expected personal info section to exist');

  const profileContent = {
    fullName: 'Alex Template',
    jobTitle: 'AI Product Manager',
    gender: 'Female',
    age: '29',
    hometown: 'Hangzhou',
    politicalStatus: 'CPC Member',
    phone: '123-456-7890',
    wechat: 'alex-wechat',
    email: 'alex@example.com',
    yearsOfExperience: '5 years',
    location: 'Hong Kong',
    website: 'https://example.com',
  };
  personalSection.content = profileContent;

  const { row1, row2 } = buildContactEntries(profileContent, { variant: 'profile' });
  assert.deepEqual(row1.map((entry) => entry.value), [
    'AI Product Manager',
    '5 years',
    'Hong Kong',
    '123-456-7890',
    'alex@example.com',
  ]);
  assert.deepEqual(row2.map((entry) => entry.value), [
    'alex-wechat',
    'https://example.com',
    'Female',
    '29',
    'Hangzhou',
    'CPC Member',
  ]);

  const canonical = toCanonicalResume(resume);
  const previewMarkup = renderToStaticMarkup(
    React.createElement(unifiedTemplate.PreviewComponent, { resume: canonical }),
  );
  const exportMarkup = unifiedTemplate.buildHtml(canonical);
  const expectedOrder = [
    'Alex Template',
    'AI Product Manager',
    '5 years',
    'Hong Kong',
    '123-456-7890',
    'alex@example.com',
    'alex-wechat',
    'https://example.com',
    'Female',
    '29',
    'Hangzhou',
    'CPC Member',
  ];

  assertAppearsInOrder(previewMarkup, expectedOrder);
  assertAppearsInOrder(exportMarkup, expectedOrder);
}

testCanonicalResumeMetadata();
testTemplateParity('classic');
testTemplateParity('modern');
testTemplateParity('consultant');
testTemplateParity('professional');
testProfessionalSkillsRenderAsListItems();
testProfessionalProfileContactInfoOrder();
testConsultantSkillsRenderAsListItems();
testClassicSkillsRenderAsListItems();
testSharedProfileContactInfoOrder();
testLegacyMinimalProfileContactInfoOrder();
testModernMinimalProjectAndEducationHighlightsRenderAsBullets();
testModernMinimalHeaderAlignsLeftWhenAvatarMissing();
testModernMinimalProfileContactInfoOrder();
