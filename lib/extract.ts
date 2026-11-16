import { parse } from './parse.ts';

/**
 * Everything under one release's heading, e.g. as release notes; `undefined`
 * when there is no such release or nothing under it. The version must match
 * exactly, so `0.1.0` never picks up `0.1.0-beta.1`. `Unreleased` selects the
 * Unreleased section.
 */
export function extract(markdown: string, version: string): string | undefined {
  const { releases } = parse(markdown);
  const release =
    version.toLowerCase() === 'unreleased'
      ? releases.find((candidate) => candidate.unreleased)
      : releases.find((candidate) => !candidate.unreleased && candidate.version === version);
  return release?.markdown || undefined;
}
