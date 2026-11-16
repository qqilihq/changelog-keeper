import type { LinkDefinition, Release, Report } from './parse.ts';
import { isValidVersion } from './version.ts';

interface ParsedLink {
  base: string;
  /** GitLab puts `/-/` before `compare` and `tags`. */
  gitlab: boolean;
  from?: string;
  to: string;
}

const comparePattern = /^(.+?)\/(-\/)?compare\/(.+?)\.\.\.(.+)$/;
const tagPattern = /^(.+?)\/(?:(-\/)tags|releases\/tag)\/(.+)$/;

/**
 * Link references are optional, but a file that uses them uses them for every
 * release: a version in brackets without a definition renders as literal
 * brackets. Only the oldest release may go without, as in keepachangelog.com's
 * own example, since it has nothing to compare against.
 */
export function checkLinks(
  releases: Release[],
  links: LinkDefinition[],
  repository: string | undefined,
  report: Report,
): void {
  const keyOf = (release: Release) => (release.unreleased ? 'unreleased' : release.version?.toLowerCase());
  const releaseKeys = new Set(releases.map(keyOf));

  // `[semver]: https://semver.org` and the like are ordinary links, not ours
  const releaseLinks = links.filter(
    (link) =>
      releaseKeys.has(link.label.toLowerCase()) ||
      link.label.toLowerCase() === 'unreleased' ||
      isValidVersion(link.label),
  );
  if (releaseLinks.length === 0 && !releases.some((release) => release.linked)) {
    return;
  }

  const byLabel = new Map<string, LinkDefinition>();
  for (const link of releaseLinks) {
    const key = link.label.toLowerCase();
    if (byLabel.has(key)) {
      report(link.line, 'link', `The link reference \`[${link.label}]\` is defined twice.`);
    } else {
      byLabel.set(key, link);
    }
    if (!releaseKeys.has(key)) {
      report(link.line, 'link', `The link reference \`[${link.label}]\` is not a release in this changelog.`);
    }
  }

  const parsed = new Map(releaseLinks.map((link) => [link, parseLink(link.url)]));
  const style = linkStyle(releases, byLabel, parsed, repository);
  const tag = (version: string) => `${style.tagPrefix}${version}`;
  const compareUrl = (from: string, to: string) => `${style.base}/${style.gitlab ? '-/' : ''}compare/${from}...${to}`;
  const tagUrl = (name: string) => `${style.base}/${style.gitlab ? '-/tags' : 'releases/tag'}/${name}`;

  const newest = releases.find((release) => !release.unreleased && release.version !== undefined);
  for (const [index, release] of releases.entries()) {
    const key = keyOf(release);
    if (key === undefined) {
      continue;
    }
    const label = release.unreleased ? 'Unreleased' : (release.version ?? '');
    const older = releases.slice(index + 1).find((other) => !other.unreleased && other.version !== undefined);
    const definition = byLabel.get(key);

    if (!release.linked) {
      if (definition) {
        report(
          release.line,
          'link',
          `\`[${label}]\` has a link reference, so write the heading's version in brackets.`,
        );
      } else if (older) {
        report(
          release.line,
          'link',
          `This changelog uses link references, so \`## ${release.heading}\` needs brackets and a link reference, ` +
            'like every release except the oldest.',
        );
      }
      continue;
    }

    let expected: string | undefined;
    if (style.base !== undefined) {
      if (release.unreleased) {
        expected = newest?.version === undefined ? undefined : compareUrl(tag(newest.version), 'HEAD');
      } else if (release.version !== undefined) {
        expected =
          older?.version === undefined
            ? tagUrl(tag(release.version))
            : compareUrl(tag(older.version), tag(release.version));
      }
    }

    if (!definition) {
      report(
        release.line,
        'link',
        `\`[${label}]\` has no link reference, so it renders as literal brackets.` +
          (expected === undefined ? '' : ` Add:\n\n  [${label}]: ${expected}`),
      );
      continue;
    }
    if (expected === undefined) {
      if (style.base === undefined) {
        report(
          definition.line,
          'link',
          `Cannot tell the repository from \`${definition.url}\`; expected a \`…/compare/A...B\` or \`…/releases/tag/A\` link.`,
        );
      }
      continue;
    }
    // the oldest release has nothing in the file to compare against, so a
    // comparison with an earlier, unlisted tag is as good as a tag link
    const link = parsed.get(definition);
    const acceptableOldest =
      older === undefined &&
      !release.unreleased &&
      link?.from !== undefined &&
      link.base === style.base &&
      link.to === tag(release.version ?? '');
    if (definition.url !== expected && !acceptableOldest) {
      report(
        definition.line,
        'link',
        `The link reference for \`[${label}]\` should read:\n\n  [${definition.label}]: ${expected}`,
      );
    }
  }
}

interface LinkStyle {
  base: string | undefined;
  gitlab: boolean;
  tagPrefix: string;
}

/** Repository, host flavour and tag naming, taken from `repository` where
 * given and otherwise from the links themselves, newest first. */
function linkStyle(
  releases: Release[],
  byLabel: Map<string, LinkDefinition>,
  parsed: Map<LinkDefinition, ParsedLink | undefined>,
  repository: string | undefined,
): LinkStyle {
  const ordered: { release: Release; link: ParsedLink }[] = [];
  for (const release of releases) {
    const definition = byLabel.get(release.unreleased ? 'unreleased' : (release.version?.toLowerCase() ?? ''));
    const link = definition && parsed.get(definition);
    if (link) {
      ordered.push({ release, link });
    }
  }

  let tagPrefix = 'v';
  const newest = releases.find((release) => !release.unreleased && release.version !== undefined)?.version;
  for (const { release, link } of ordered) {
    const version = release.unreleased ? newest : release.version;
    const name = release.unreleased ? link.from : link.to;
    if (version !== undefined && name?.endsWith(version)) {
      tagPrefix = name.slice(0, -version.length);
      break;
    }
  }

  const first = ordered[0]?.link ?? [...parsed.values()].find((link) => link !== undefined);
  return {
    base: repository === undefined ? first?.base : normalizeRepository(repository),
    gitlab: first?.gitlab ?? (repository !== undefined && /gitlab/i.test(repository)),
    tagPrefix,
  };
}

function parseLink(url: string): ParsedLink | undefined {
  const compare = comparePattern.exec(url);
  if (compare) {
    return { base: compare[1] ?? '', gitlab: compare[2] !== undefined, from: compare[3] ?? '', to: compare[4] ?? '' };
  }
  const tag = tagPattern.exec(url);
  if (tag) {
    return { base: tag[1] ?? '', gitlab: tag[2] !== undefined, to: tag[3] ?? '' };
  }
  return undefined;
}

/** `git+https://host/owner/repo.git`, `git@host:owner/repo.git` and npm's
 * `owner/repo` shorthand all become `https://host/owner/repo`. */
export function normalizeRepository(repository: string): string {
  let url = repository.trim();
  const shorthand = /^(?:(github|gitlab|bitbucket):)?([\w.-]+\/[\w.-]+)$/.exec(url);
  if (shorthand) {
    const host =
      shorthand[1] === 'gitlab' ? 'gitlab.com' : shorthand[1] === 'bitbucket' ? 'bitbucket.org' : 'github.com';
    url = `https://${host}/${shorthand[2] ?? ''}`;
  }
  url = url
    .replace(/^git\+/, '')
    .replace(/^git@([^:]+):/, 'https://$1/')
    .replace(/^(?:ssh|git):\/\/(?:[^@/]+@)?/, 'https://')
    .replace(/\.git$/, '')
    .replace(/\/+$/, '');
  return url;
}
