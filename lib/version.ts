import semver from 'semver';

/** Whether `version` is a Semantic Versioning 2.0.0 version, exactly as
 * written. `semver.parse` alone is lenient: it accepts `v1.0.0` and
 * surrounding whitespace, so the parsed version must read back unchanged. */
export function isValidVersion(version: string): boolean {
  const parsed = semver.parse(version);
  if (parsed === null) {
    return false;
  }
  const build = parsed.build.length > 0 ? `+${parsed.build.join('.')}` : '';
  return `${parsed.version}${build}` === version;
}

/** Negative if `a` precedes `b`, positive if it follows, zero if they rank equal.
 * Both must be valid versions. Build metadata does not affect precedence. */
export function compareVersions(a: string, b: string): number {
  return semver.compare(a, b);
}
