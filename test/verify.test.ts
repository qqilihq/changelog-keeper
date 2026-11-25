import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { verify } from '../lib/index.ts';

const today = new Date().toLocaleDateString('sv-SE');

const promoted = `# Changelog

## Unreleased

## 1.1.0 - 2026-02-01

### Added

- A thing.

## 1.0.0 - 2026-01-01

### Added

- The first thing.
`;

function problems(markdown: string, version: string): [number, string][] {
  return verify(markdown, { version }).map(({ line, message }) => [line, message]);
}

describe('verify', () => {
  it('passes a changelog promoted to the version being released', () => {
    assert.deepEqual(problems(promoted, '1.1.0'), []);
  });

  it('allows no Unreleased section at all', () => {
    assert.deepEqual(problems(promoted.replace('## Unreleased\n\n', ''), '1.1.0'), []);
  });

  it('reports entries still under Unreleased', () => {
    const pending = promoted.replace('## Unreleased\n', '## Unreleased\n\n### Fixed\n\n- Soon.\n');
    assert.deepEqual(problems(pending, '1.1.0'), [
      [3, `\`## Unreleased\` still has entries. Move them under the release being made:\n\n  ## 1.1.0 - ${today}`],
    ]);
  });

  it('reports a missing section, with the heading to write', () => {
    assert.deepEqual(problems(promoted, '1.2.0'), [
      [3, `There is no section for 1.2.0. Add one:\n\n  ## 1.2.0 - ${today}`],
    ]);
  });

  it('suggests brackets when the file uses link references', () => {
    const [, message] =
      problems(
        '# Changelog\n\n## [Unreleased]\n\n[unreleased]: https://github.com/o/r/compare/v1.0.0...HEAD\n',
        '1.0.0',
      )[0] ?? [];
    assert.match(message ?? '', /## \[1\.0\.0\] - /);
  });

  it('reports a version that is not the newest', () => {
    assert.deepEqual(problems(promoted, '1.0.0'), [
      [11, '1.0.0 is not the newest release; `## 1.1.0 - 2026-02-01` is listed above it.'],
    ]);
  });

  it('reports a release with no entries', () => {
    const empty = promoted.replace('### Added\n\n- A thing.\n\n', '');
    assert.deepEqual(problems(empty, '1.1.0'), [[5, '`## 1.1.0 - 2026-02-01` has no entries.']]);
  });

  it('reports a release with text but no section type', () => {
    const prose = promoted.replace('### Added\n\n- A thing.\n\n', 'TBD\n\n');
    assert.deepEqual(problems(prose, '1.1.0'), [
      [5, '`## 1.1.0 - 2026-02-01` has no entries under a section type, such as `### Added`.'],
    ]);
  });

  it('reports a release with a list item but no section type', () => {
    const bullet = promoted.replace('### Added\n\n- A thing.\n\n', '- A thing.\n\n');
    assert.deepEqual(problems(bullet, '1.1.0'), [
      [5, '`## 1.1.0 - 2026-02-01` has no entries under a section type, such as `### Added`.'],
    ]);
  });

  it('reports a release with text but no list under its section type', () => {
    const prose = promoted.replace('### Added\n\n- A thing.\n\n', '### Added\n\nTBD\n\n');
    assert.deepEqual(problems(prose, '1.1.0'), [
      [5, '`## 1.1.0 - 2026-02-01` has no entries; write them as a list under the section type.'],
    ]);
  });

  it('takes the example section type from the accepted ones', () => {
    const prose = promoted.replace('### Added\n\n- A thing.\n\n', 'TBD\n\n').replace('### Added', '### Info');
    const messages = verify(prose, { version: '1.1.0', sectionTypes: ['Info'] }).map(({ message }) => message);
    assert.deepEqual(messages, ['`## 1.1.0 - 2026-02-01` has no entries under a section type, such as `### Info`.']);
  });

  it('reports a release whose sections are all empty, next to the section-empty rule', () => {
    const emptySection = promoted.replace('### Added\n\n- A thing.\n\n', '### Added\n\n');
    assert.deepEqual(problems(emptySection, '1.1.0'), [
      [5, '`## 1.1.0 - 2026-02-01` has no entries.'],
      [7, '`### Added` has no entries.'],
    ]);
  });

  it('includes everything lint reports', () => {
    const malformed = promoted.replace('### Added\n\n- A thing.', '### Breaking\n\n- A thing.');
    assert.equal(verify(malformed, { version: '1.1.0' })[0]?.rule, 'section-type');
  });
});
