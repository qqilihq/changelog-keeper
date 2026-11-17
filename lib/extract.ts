import { parse, type LinkDefinition } from './parse.ts';
import { normalizeLabel } from './render.ts';

/**
 * Everything under one release's heading, e.g. as release notes; `undefined`
 * when there is no such release or nothing under it. The version must match
 * exactly, so `0.1.0` never picks up `0.1.0-beta.1`. `Unreleased` selects the
 * Unreleased section.
 *
 * The link definitions the section refers to, which usually sit at the bottom
 * of the file, are appended, so that its links still work on their own.
 */
export function extract(markdown: string, version: string): string | undefined {
  const { releases, links } = parse(markdown);
  const release =
    version.toLowerCase() === 'unreleased'
      ? releases.find((candidate) => candidate.unreleased)
      : releases.find((candidate) => !candidate.unreleased && candidate.version === version);
  if (!release?.markdown) {
    return undefined;
  }
  const used = definitionsUsedIn(release.markdown, links);
  return used.length === 0 ? release.markdown : `${release.markdown}\n\n${used.map(formatDefinition).join('\n')}`;
}

/** The first definition of every label that `markdown` writes in brackets.
 * A bracketed label in code is counted too; the extra definition is harmless,
 * as definitions do not render. */
function definitionsUsedIn(markdown: string, links: LinkDefinition[]): LinkDefinition[] {
  const used = new Set<string>();
  // a label cannot contain brackets; allowing `[` would rescan the rest of
  // the input for every `[` that no `]` follows
  for (const [, label = ''] of markdown.matchAll(/\[([^[\]]+)\]/g)) {
    used.add(normalizeLabel(label));
  }
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = normalizeLabel(link.label);
    if (!used.has(key) || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/** Written so that it reads back as the same label, URL and title. */
function formatDefinition({ label, url, title }: LinkDefinition): string {
  return `[${label}]: ${formatDestination(url)}${title === undefined ? '' : ` "${escape(title, /["\\]/g)}"`}`;
}

/** Bare where that is safe; otherwise in angle brackets, which can hold
 * anything but a line break, such as spaces, an unbalanced parenthesis, or
 * nothing at all. */
function formatDestination(url: string): string {
  return /^[^\s<>()\\]+$/.test(url) ? url : `<${escape(url, /[<>\\]/g)}>`;
}

function escape(text: string, characters: RegExp): string {
  return text.replace(characters, '\\$&');
}
