import type { Tokens } from 'marked';
import { blocks, type SourceLine } from './blocks.ts';
import { checkLinks } from './links.ts';
import { compareVersions, isValidVersion } from './version.ts';

/** The section types https://keepachangelog.com defines, in its order. */
export const CHANGE_TYPES = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'] as const;

export type Rule =
  | 'title'
  | 'heading'
  | 'release-heading'
  | 'release-date'
  | 'release-order'
  | 'unreleased'
  | 'section-type'
  | 'section-duplicate'
  | 'section-empty'
  | 'bullet-style'
  | 'link'
  | 'html-comment'
  | 'release';

export interface Diagnostic {
  /** 1-based */
  line: number;
  rule: Rule;
  message: string;
}

/** One list item under a section type, without its bullet. */
export interface Entry {
  line: number;
  markdown: string;
}

export interface Section {
  /** The heading text, e.g. `Added`. Anything else is reported as a diagnostic. */
  type: string;
  line: number;
  /** Everything below the heading, up to the next section or release. */
  markdown: string;
  entries: Entry[];
}

export interface Release {
  /** The heading text without the leading `## `. */
  heading: string;
  line: number;
  unreleased: boolean;
  /** As written; `undefined` for Unreleased and for headings without one. */
  version: string | undefined;
  /** As written, `YYYY-MM-DD` when valid. */
  date: string | undefined;
  yanked: boolean;
  /** Whether the version is in brackets, i.e. refers to a link reference. */
  linked: boolean;
  /** Text between the heading and the first section. */
  description: string;
  sections: Section[];
  /** Everything below the heading, up to the next release. */
  markdown: string;
}

export interface LinkDefinition {
  /** As written. */
  label: string;
  url: string;
  /** Present when the definition has one: `[label]: url "title"`. */
  title?: string;
  line: number;
}

export interface Changelog {
  /** The level-1 heading, e.g. `Changelog`. */
  title: string | undefined;
  /** Text between the title and the first release. */
  description: string;
  releases: Release[];
  /** Every link reference definition, `[label]: url`, wherever it is. */
  links: LinkDefinition[];
  /** Sorted by line; empty when the changelog follows the format. */
  diagnostics: Diagnostic[];
}

export interface ParseOptions {
  /** The repository the link references must point at, e.g.
   * `https://github.com/owner/repo`. Without it, the links only have to agree
   * with each other. */
  repository?: string | undefined;
}

export type Report = (line: number, rule: Rule, message: string) => void;

interface OpenSection {
  type: string;
  line: number;
  lines: SourceLine[];
  entries: Entry[];
}

interface OpenRelease extends Omit<Release, 'description' | 'sections' | 'markdown'> {
  lines: SourceLine[];
  sections: OpenSection[];
}

const atxHeadingPattern = /^ {0,3}#/;
const setextUnderlinePattern = /^ {0,3}(?:=+|-+)[ \t]*$/;
const linkLabelPattern = /^ {0,3}\[([^\]]+)\]:/;
const releaseHeadingPattern = /^(\[)?([^[\]\s]+)(\])? - (\S+)( \[YANKED\])?$/;

const changeTypeList = CHANGE_TYPES.map((type) => `\`${type}\``).join(', ');

export function parse(markdown: string, options: ParseOptions = {}): Changelog {
  const diagnostics: Diagnostic[] = [];
  const report: Report = (line, rule, message) => diagnostics.push({ line, rule, message });

  let title: string | undefined;
  const preamble: SourceLine[] = [];
  const releases: OpenRelease[] = [];
  const links: LinkDefinition[] = [];
  let bulletStyle: string | undefined;
  let seenHeading = false;

  const currentRelease = () => releases.at(-1);
  const append = (lines: SourceLine[]) => {
    const release = currentRelease();
    if (!release) {
      preamble.push(...lines);
      return;
    }
    release.lines.push(...lines);
    release.sections.at(-1)?.lines.push(...lines);
  };

  for (const { token, lines, items } of blocks(markdown)) {
    const [first] = lines;
    if (first === undefined) {
      continue;
    }

    if (token.type === 'def') {
      const { raw, tag, href, title } = token as Tokens.Def;
      links.push({
        label: linkLabelPattern.exec(raw)?.[1] ?? tag,
        url: href,
        ...(title ? { title } : {}),
        line: first.number,
      });
      continue;
    }

    if (token.type === 'list') {
      for (const { line, bullet, markdown: entry } of items) {
        if (bullet !== undefined && bulletStyle === undefined) {
          bulletStyle = bullet;
        } else if (bullet !== undefined && bullet !== bulletStyle) {
          report(
            line,
            'bullet-style',
            `This list item uses \`${bullet}\`, but the first one in the file uses \`${bulletStyle}\`; use one bullet character throughout.`,
          );
        }
        currentRelease()?.sections.at(-1)?.entries.push({ line, markdown: entry });
      }
      append(lines);
      continue;
    }

    if (token.type === 'html' && /^ {0,3}<!--/.test(first.text) && !token.raw.includes('-->')) {
      report(
        first.number,
        'html-comment',
        'This HTML comment is never closed with `-->`, so it hides everything after it, as GitHub shows the file.',
      );
    }

    if (token.type !== 'heading') {
      append(lines);
      continue;
    }

    if (!atxHeadingPattern.test(first.text)) {
      const underline = lines.findLastIndex((line) => setextUnderlinePattern.test(line.text));
      report(
        lines[underline]?.number ?? first.number,
        'heading',
        `Write headings with \`#\`, not by underlining them: \`${lines[underline - 1]?.text ?? first.text}\`.`,
      );
      append(lines);
      continue;
    }

    const { depth, text: content } = token as Tokens.Heading;
    const line = first.number;
    if (/[ \t]$/.test(first.text)) {
      report(line, 'heading', `The heading \`${'#'.repeat(depth)} ${content}\` ends in whitespace.`);
    }
    if (!seenHeading && depth !== 1) {
      report(line, 'title', 'The changelog must start with a level-1 title, such as `# Changelog`.');
    }
    seenHeading = true;

    if (depth === 1) {
      if (title === undefined && releases.length === 0 && preamble.every((l) => l.text.trim() === '')) {
        title = content;
        append(lines.slice(1));
        continue;
      }
      report(
        line,
        'heading',
        `\`# ${content}\` is a level-1 heading, but only the title may be one.` +
          (/\d+\.\d+/.test(content) ? ' Releases are level-2 headings: `## [X.Y.Z] - YYYY-MM-DD`.' : ''),
      );
      append(lines);
    } else if (depth === 2) {
      releases.push(openRelease(content, line, report));
      append(lines.slice(1));
    } else if (depth === 3) {
      const release = currentRelease();
      if (!release) {
        report(
          line,
          'heading',
          `\`### ${content}\` is outside any release; section types belong under a \`## [X.Y.Z] - YYYY-MM-DD\` heading.`,
        );
        append(lines);
        continue;
      }
      checkSectionType(content, release, line, report);
      release.lines.push(first);
      release.sections.push({ type: content, line, lines: [], entries: [] });
      append(lines.slice(1));
    } else {
      report(
        line,
        'heading',
        `Level-${depth} headings are not part of the Keep a Changelog structure, which uses level 2 for ` +
          'releases and level 3 for section types.',
      );
      append(lines);
    }
  }

  if (!seenHeading) {
    report(1, 'title', 'The changelog must start with a level-1 title, such as `# Changelog`.');
  }

  const closedReleases = releases.map((release) => closeRelease(release, report));
  checkUnreleased(closedReleases, report);
  checkOrder(closedReleases, report);
  checkLinks(closedReleases, links, options.repository, report);

  return {
    title,
    description: joinLines(preamble),
    releases: closedReleases,
    links,
    diagnostics: diagnostics.sort((a, b) => a.line - b.line),
  };
}

function openRelease(content: string, line: number, report: Report): OpenRelease {
  const release: OpenRelease = {
    heading: content,
    line,
    unreleased: false,
    version: undefined,
    date: undefined,
    yanked: false,
    linked: content.startsWith('['),
    lines: [],
    sections: [],
  };

  if (/^\[?unreleased\]?$/i.test(content)) {
    release.unreleased = true;
    if (content !== '[Unreleased]' && content !== 'Unreleased') {
      report(line, 'release-heading', `Write \`## [Unreleased]\`, not \`## ${content}\`.`);
    }
    return release;
  }

  const match = releaseHeadingPattern.exec(content);
  if (match && (match[1] === undefined) === (match[3] === undefined) && isValidVersion(match[2] ?? '')) {
    const [, , version = '', , date = '', yanked] = match;
    release.version = version;
    release.date = date;
    release.yanked = yanked !== undefined;
    if (!isValidDate(date)) {
      report(line, 'release-date', `\`${date}\` is not a valid date; write it as YYYY-MM-DD.`);
    }
    return release;
  }

  // Not the format. Keep what can be recognised, so that the rest of the
  // file can still be checked, and say what is wrong.
  const versionMatch = /\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?/.exec(content);
  const dateMatch = /\d{4}-\d{2}-\d{2}/.exec(content);
  release.version = versionMatch?.[0];
  release.date = dateMatch?.[0];
  release.yanked = /\[YANKED\]\s*$/i.test(content);

  if (!versionMatch) {
    const bare = content.replace(/^\[|\]$/g, '');
    const type = CHANGE_TYPES.find((t) => t.toLowerCase() === bare.toLowerCase());
    report(
      line,
      'release-heading',
      `\`## ${content}\` is not a release heading. Releases are \`## [X.Y.Z] - YYYY-MM-DD\` or \`## [Unreleased]\`` +
        (type ? `; \`${type}\` is a section type, which is a level-3 heading: \`### ${type}\`.` : '.'),
    );
    return release;
  }

  const hints: string[] = [];
  const prefix = content.slice(0, versionMatch.index).replace(/^\[/, '');
  if (prefix !== '') {
    hints.push(`no \`${prefix}\` before the version`);
  }
  if (versionMatch[0].split('-')[0]?.split('.').length === 2) {
    hints.push('the version needs all three numbers');
  } else if (!isValidVersion(versionMatch[0])) {
    hints.push(`\`${versionMatch[0]}\` is not a valid semantic version`);
  }
  if (/[–—]/.test(content)) {
    hints.push('a plain hyphen, not an en or em dash');
  }
  if (!dateMatch) {
    hints.push('the release date');
  }
  const version = release.linked ? `[${versionMatch[0]}]` : versionMatch[0];
  report(
    line,
    'release-heading',
    `\`## ${content}\` does not follow the release heading format: write \`## ${version} - ${dateMatch?.[0] ?? 'YYYY-MM-DD'}\`` +
      (hints.length > 0 ? ` (${hints.join('; ')})` : '') +
      '.',
  );
  return release;
}

function checkSectionType(type: string, release: OpenRelease, line: number, report: Report): void {
  if (!(CHANGE_TYPES as readonly string[]).includes(type)) {
    const sameExceptCase = CHANGE_TYPES.find((t) => t.toLowerCase() === type.toLowerCase());
    report(
      line,
      'section-type',
      sameExceptCase
        ? `Write \`### ${sameExceptCase}\`, not \`### ${type}\`.`
        : `\`### ${type}\` is not a Keep a Changelog section type; use one of ${changeTypeList}.`,
    );
  }
  if (release.sections.some((section) => section.type === type)) {
    report(line, 'section-duplicate', `\`### ${type}\` appears twice in \`## ${release.heading}\`; merge the two.`);
  }
}

function closeRelease(release: OpenRelease, report: Report): Release {
  const { lines, sections, ...rest } = release;
  const firstSectionLine = sections[0]?.line ?? Infinity;
  return {
    ...rest,
    description: joinLines(lines.filter((line) => line.number < firstSectionLine)),
    sections: sections.map((section) => {
      const markdown = joinLines(section.lines);
      if (markdown === '') {
        report(section.line, 'section-empty', `\`### ${section.type}\` has no entries.`);
      }
      return { type: section.type, line: section.line, markdown, entries: section.entries };
    }),
    markdown: joinLines(lines),
  };
}

function checkUnreleased(releases: Release[], report: Report): void {
  const unreleased = releases.filter((release) => release.unreleased);
  for (const extra of unreleased.slice(1)) {
    report(extra.line, 'unreleased', 'There is more than one Unreleased section; keep one, at the top.');
  }
  const first = unreleased[0];
  if (first && releases[0] !== first) {
    report(first.line, 'unreleased', 'The Unreleased section must come first, above every release.');
  }
}

function checkOrder(releases: Release[], report: Report): void {
  let previous: Release | undefined;
  for (const release of releases) {
    if (release.unreleased || release.version === undefined || !isValidVersion(release.version)) {
      continue;
    }
    if (previous?.version !== undefined) {
      const order = compareVersions(release.version, previous.version);
      if (order === 0) {
        report(release.line, 'release-order', `${release.version} is listed twice.`);
      } else if (order > 0) {
        report(
          release.line,
          'release-order',
          `${release.version} is listed below ${previous.version}; releases must be ordered newest first.`,
        );
      }
    }
    previous = release;
  }
}

function isValidDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    return false;
  }
  const [year, month, day] = match.slice(1).map(Number) as [number, number, number];
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

/** Joins the lines, without blank lines at either end. */
function joinLines(lines: SourceLine[]): string {
  const texts = lines.map((line) => line.text);
  while (texts.length > 0 && texts[0]?.trim() === '') {
    texts.shift();
  }
  while (texts.length > 0 && texts.at(-1)?.trim() === '') {
    texts.pop();
  }
  return texts.join('\n');
}
