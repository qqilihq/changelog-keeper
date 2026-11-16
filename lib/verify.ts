import { parse, type Diagnostic, type ParseOptions } from './parse.ts';

export interface VerifyOptions extends ParseOptions {
  /** The version being released. */
  version: string;
}

/**
 * Whether the changelog is ready to release `version`: everything `parse`
 * reports, plus a non-empty section for that version as the newest release,
 * and nothing left under Unreleased. It never changes the file -- wording,
 * grouping and date belong in a reviewed commit.
 */
export function verify(markdown: string, options: VerifyOptions): Diagnostic[] {
  const { version } = options;
  const { releases, diagnostics } = parse(markdown, options);
  const problems = [...diagnostics];
  const report = (line: number, message: string) => problems.push({ line, rule: 'release', message });

  const usesLinks = releases.some((release) => release.linked);
  const heading = `## ${usesLinks ? `[${version}]` : version} - ${new Date().toLocaleDateString('sv-SE')}`;

  const unreleased = releases.find((release) => release.unreleased);
  if (unreleased && unreleased.markdown !== '') {
    report(
      unreleased.line,
      `\`## ${unreleased.heading}\` still has entries. Move them under the release being made:\n\n  ${heading}`,
    );
  }

  const release = releases.find((candidate) => !candidate.unreleased && candidate.version === version);
  if (!release) {
    report(unreleased?.line ?? releases[0]?.line ?? 1, `There is no section for ${version}. Add one:\n\n  ${heading}`);
  } else {
    const newest = releases.find((candidate) => !candidate.unreleased);
    if (newest !== release) {
      report(release.line, `${version} is not the newest release; \`## ${newest?.heading ?? ''}\` is listed above it.`);
    }
    if (release.markdown === '') {
      report(release.line, `\`## ${release.heading}\` has no entries.`);
    }
  }

  return problems.sort((a, b) => a.line - b.line);
}
