import { SitePlan, FormInputEntity } from '../types';
import { compileMarkdownBundle, getMarkdownDocsList } from './markdownBundleCompiler';
import { generateLocalSlug } from './slugify';

export interface ZipDownloadResult {
  filename: string;
  fileCount: number;
  totalBytes: number;
}

/**
 * Builds the complete in-memory ZIP archive containing the 11 markdown specs,
 * .cursorrules, .clinerules, and standalone prototype.html.
 */
export async function buildBlueprintZip(
  plan: SitePlan,
  formInputs?: Record<string, FormInputEntity>
): Promise<{ zipBlob: Blob; filename: string; fileCount: number }> {
  const JSZipModule = await import('jszip');
  const JSZip = (JSZipModule as any).default || JSZipModule;
  const zip = new JSZip();
  const bundle = compileMarkdownBundle(plan, formInputs);
  const docsList = getMarkdownDocsList(bundle);

  const projectName = plan.metadata?.projectName?.trim() || 'goguma-project';
  const slug = generateLocalSlug(projectName) || 'app';
  const filename = `goguma-blueprint-${slug}.zip`;

  // 1. Add root prototype.html
  zip.file('prototype.html', bundle.prototypeHtml);

  // 2. Add AI agent configuration files
  zip.file('.cursorrules', bundle.cursorrules);
  zip.file('.clinerules', bundle.clinerules);

  // 3. Create docs/ folder and add all 11 markdown files
  const docsFolder = zip.folder('docs');
  if (docsFolder) {
    for (const doc of docsList) {
      docsFolder.file(doc.filename, doc.content);
    }
  }

  // 4. Generate binary ZIP blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return {
    zipBlob,
    filename,
    fileCount: docsList.length + 3, // 11 docs + prototype.html + .cursorrules + .clinerules = 14 files
  };
}

/**
 * Triggers an immediate browser download of the full 11-spec blueprint ZIP archive.
 */
export async function downloadBlueprintZip(
  plan: SitePlan,
  formInputs?: Record<string, FormInputEntity>
): Promise<ZipDownloadResult> {
  const { zipBlob, filename, fileCount } = await buildBlueprintZip(plan, formInputs);

  const url = URL.createObjectURL(zipBlob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();

  // Clean up object URL after download trigger
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 1500);

  return {
    filename,
    fileCount,
    totalBytes: zipBlob.size,
  };
}
