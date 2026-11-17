import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extract, parse } from '../lib/index.ts';

// ported from qrocodile-api-node's release-notes script, which this replaces

const CHANGELOG = `# Changelog

Preamble that belongs to no version.

## Unreleased

## 0.2.0 - 2026-02-01

### Added

- A thing.

## 0.1.0 - 2026-01-01

First public release.

### Changed

- Server-side only.
`;

describe('extract', () => {
  it('returns everything under the heading, up to the next one', () => {
    assert.equal(extract(CHANGELOG, '0.2.0'), '### Added\n\n- A thing.');
  });

  it('reads the last release to the end of the file', () => {
    assert.equal(extract(CHANGELOG, '0.1.0'), 'First public release.\n\n### Changed\n\n- Server-side only.');
  });

  /** Without them, release notes show `[#12]` in literal brackets. */
  it('appends the link definitions the section uses, and only those', () => {
    const linked =
      CHANGELOG.replace('- A thing.', '- A thing ([#12], [Docs][docs]).') +
      '\n[0.2.0]: https://github.com/owner/repo/compare/v0.1.0...v0.2.0\n' +
      '[#12]: https://github.com/owner/repo/issues/12\n' +
      '[docs]: <https://example.com/a b> "The \\"docs\\""\n' +
      '[#12]: https://example.com/second-definition\n';
    assert.equal(
      extract(linked, '0.2.0'),
      '### Added\n\n- A thing ([#12], [Docs][docs]).\n\n' +
        '[#12]: https://github.com/owner/repo/issues/12\n' +
        '[docs]: <https://example.com/a b> "The \\"docs\\""',
    );
  });

  /** Written back the way they were read, or links stop resolving in the
   * release notes. */
  it('writes appended definitions so that they read back unchanged', () => {
    const definitions = [
      '[a]: <https://example.com/a(b>',
      '[b]: <https://example.com/b)c>',
      '[c]: <https://example.com/with space>',
      '[d]: <https://example.com/\\<angle\\>>',
      '[e]: https://example.com/back\\\\slash',
      '[f]: <>',
      '[g]: https://example.com/g "A \\"quoted\\" \\\\ title"',
    ];
    const markdown = `${CHANGELOG.replace('- A thing.', '- [a] [b] [c] [d] [e] [f] [g]')}\n${definitions.join('\n')}\n`;
    const readBack = parse(`# Changelog\n\n${extract(markdown, '0.2.0') ?? ''}\n`).links;
    assert.deepEqual(
      readBack.map(({ label, url, title }) => ({ label, url, title })),
      parse(markdown).links.map(({ label, url, title }) => ({ label, url, title })),
    );
  });

  /** For every `[` without a `]`, a pattern that may run across `[` scans
   * to the end of the input. */
  it('finds the labels in linear time', () => {
    const markdown = `${CHANGELOG.replace('- A thing.', `- ${'['.repeat(80_000)}`)}`;
    const start = performance.now();
    extract(markdown, '0.2.0');
    assert.ok(performance.now() - start < 1_000, `took ${Math.round(performance.now() - start)} ms`);
  });

  it('leaves out the link references at the bottom', () => {
    const linked = `${CHANGELOG.replace('## 0.1.0', '## [0.1.0]')}\n[0.1.0]: https://github.com/owner/repo/releases/tag/v0.1.0\n`;
    assert.equal(extract(linked, '0.1.0'), 'First public release.\n\n### Changed\n\n- Server-side only.');
  });

  /** An empty Unreleased is the normal state between releases. */
  it('treats a heading with nothing under it as missing', () => {
    assert.equal(extract(CHANGELOG, 'Unreleased'), undefined);
    assert.equal(
      extract(CHANGELOG.replace('## Unreleased\n', '## Unreleased\n\n### Fixed\n\n- Soon.\n'), 'unreleased'),
      '### Fixed\n\n- Soon.',
    );
  });

  it('returns nothing for a version that is not there', () => {
    assert.equal(extract(CHANGELOG, '9.9.9'), undefined);
  });

  /** A prefix match would hand 0.1.0's notes to 0.1.0-beta.1, which is
   * precisely when someone is least likely to check. */
  it('does not let one version match another that starts the same way', () => {
    assert.equal(extract(CHANGELOG, '0.1'), undefined);
    assert.equal(extract('# Changelog\n\n## 0.1.0-beta.1 - 2026-01-01\n\nBeta notes.\n', '0.1.0'), undefined);
  });

  it('ignores the title and the preamble', () => {
    assert.equal(extract(CHANGELOG, 'Changelog'), undefined);
  });

  it('works on a changelog that does not follow the format', () => {
    assert.equal(
      extract('# Changelog\n\n## version-5.13.9 – 2026-10-04\n\n### Info\n\n- Notes.\n', '5.13.9'),
      '### Info\n\n- Notes.',
    );
  });
});
