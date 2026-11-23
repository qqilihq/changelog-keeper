import { CHANGE_TYPES, parse, type Diagnostic, type ParseOptions, type Release } from './parse.ts';

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
    if (!release.sections.some((section) => section.entries.length > 0)) {
      report(release.line, `\`## ${release.heading}\` has no entries${missingEntriesHint(release, options)}.`);
    }
  }

  return problems.sort((a, b) => a.line - b.line);
}

/** Text that is not a list item under a section type, e.g. `TBD`, is not an
 * entry. Says where the entries go when the release has such text. */
function missingEntriesHint(release: Release, options: ParseOptions): string {
  if (release.sections.length === 0 && release.markdown !== '') {
    // Taken from the accepted section types, so that following the hint passes.
    const example = (options.sectionTypes ?? CHANGE_TYPES)[0];
    return ` under a section type${example === undefined ? '' : `, such as \`### ${example}\``}`;
  }
  if (release.sections.some((section) => section.markdown !== '')) {
    return '; write them as a list under the section type';
  }
  return '';
}
