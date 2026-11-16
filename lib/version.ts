// Semantic Versioning 2.0.0, https://semver.org -- only the parts a changelog
// needs: recognising a version and ordering two of them.

const numericIdentifier = '0|[1-9]\\d*';
const prereleaseIdentifier = `(?:${numericIdentifier}|\\d*[a-zA-Z-][0-9a-zA-Z-]*)`;
const versionPattern = new RegExp(
  `^(${numericIdentifier})\\.(${numericIdentifier})\\.(${numericIdentifier})` +
    `(?:-(${prereleaseIdentifier}(?:\\.${prereleaseIdentifier})*))?` +
    `(?:\\+[0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*)?$`,
);

interface ParsedVersion {
  numbers: [bigint, bigint, bigint];
  prerelease: string[];
}

function parseVersion(version: string): ParsedVersion | undefined {
  const match = versionPattern.exec(version);
  if (!match) {
    return undefined;
  }
  const [, major = '', minor = '', patch = '', prerelease] = match;
  return {
    numbers: [BigInt(major), BigInt(minor), BigInt(patch)],
    prerelease: prerelease === undefined ? [] : prerelease.split('.'),
  };
}

export function isValidVersion(version: string): boolean {
  return parseVersion(version) !== undefined;
}

/** Negative if `a` precedes `b`, positive if it follows, zero if they rank equal.
 * Both must be valid versions. Build metadata does not affect precedence. */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) {
    throw new Error(`Not a valid version: ${left ? b : a}`);
  }
  for (let i = 0; i < 3; i++) {
    const difference = compareBigInts(left.numbers[i] ?? 0n, right.numbers[i] ?? 0n);
    if (difference !== 0) {
      return difference;
    }
  }
  // a pre-release ranks below the release it precedes
  if (left.prerelease.length === 0 || right.prerelease.length === 0) {
    return right.prerelease.length - left.prerelease.length;
  }
  for (let i = 0; i < Math.max(left.prerelease.length, right.prerelease.length); i++) {
    const l = left.prerelease[i];
    const r = right.prerelease[i];
    if (l === undefined || r === undefined) {
      return l === undefined ? -1 : 1;
    }
    const difference = comparePrereleaseIdentifiers(l, r);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
}

function comparePrereleaseIdentifiers(a: string, b: string): number {
  const aNumeric = /^\d+$/.test(a);
  const bNumeric = /^\d+$/.test(b);
  if (aNumeric && bNumeric) {
    return compareBigInts(BigInt(a), BigInt(b));
  }
  if (aNumeric !== bNumeric) {
    // numeric identifiers rank below alphanumeric ones
    return aNumeric ? -1 : 1;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareBigInts(a: bigint, b: bigint): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
