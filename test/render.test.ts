import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parse, renderer } from '../lib/index.ts';

const changelog = parse(`# Changelog

All notable changes, following [Keep a Changelog][kac].

## [1.0.0] - 2026-01-01

### Fixed

- Crash on start ([#12]).
- Release <b>notes</b>.

[kac]: https://keepachangelog.com "Keep a Changelog"
[1.0.0]: https://github.com/o/r/releases/tag/v1.0.0
[#12]: https://github.com/o/r/issues/12
[#12]: https://example.com/second-definition
`);
const html = renderer(changelog);
const [release] = changelog.releases;
const [crash, notes] = release?.sections[0]?.entries ?? [];

describe('renderer', () => {
  it('renders blocks', () => {
    assert.equal(
      html(changelog.description),
      '<p>All notable changes, following <a href="https://keepachangelog.com" title="Keep a Changelog">Keep a Changelog</a>.</p>\n',
    );
  });

  it('renders inline, without the paragraph around it', () => {
    assert.equal(html(changelog.title ?? '', { inline: true }), 'Changelog');
    assert.equal(
      html(release?.heading ?? '', { inline: true }),
      '<a href="https://github.com/o/r/releases/tag/v1.0.0">1.0.0</a> - 2026-01-01',
    );
  });

  /** The point of rendering through the changelog: the definitions sit at
   * the bottom of the file, far from the entries that use them. */
  it('resolves link references against the whole changelog, the first definition winning', () => {
    assert.equal(
      html(crash?.markdown ?? '', { inline: true }),
      'Crash on start (<a href="https://github.com/o/r/issues/12">#12</a>).',
    );
  });

  it('matches labels regardless of case and spacing, as CommonMark does', () => {
    for (const reference of ['[KAC]', '[ kac ]', '[Kac][]']) {
      assert.match(html(reference, { inline: true }), /^<a href="https:\/\/keepachangelog\.com"/, reference);
    }
  });

  it('renders Markdown formatting inline', () => {
    assert.equal(html('**Bold** and `code`', { inline: true }), '<strong>Bold</strong> and <code>code</code>');
  });

  it('renders nothing for an empty fragment', () => {
    assert.equal(html('', { inline: true }), '');
    assert.equal(html(''), '');
  });

  /** A plain object would answer these from its prototype, and skip them. */
  it('resolves labels that are also names of object properties', () => {
    const html = renderer(
      parse('# Changelog\n\n[constructor]: https://example.com/c\n[__proto__]: https://example.com/p\n'),
    );
    assert.equal(html('[constructor]', { inline: true }), '<a href="https://example.com/c">constructor</a>');
    // the underscores are Markdown for bold
    assert.equal(html('[__proto__]', { inline: true }), '<a href="https://example.com/p"><strong>proto</strong></a>');
  });

  it('leaves brackets without a definition as they are', () => {
    assert.equal(html('[#13]', { inline: true }), '[#13]');
  });

  /** Documented as unsanitized: changelogs such as selenium-knime's rely on
   * inline HTML. */
  it('passes HTML through', () => {
    assert.equal(html(notes?.markdown ?? '', { inline: true }), 'Release <b>notes</b>.');
  });
});
