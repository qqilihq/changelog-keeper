import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { marked } from 'marked';
import { parse, renderer } from '../lib/index.ts';

// A program that uses marked itself, deduplicated into the same copy, may
// change marked's process-wide settings. This file runs in its own process,
// so doing that here affects no other test.

const changelog = `# Changelog

## 1.0.0 - 2026-01-01

### Fixed

- See [#1],
  twice.

[#1]: https://github.com/o/r/issues/1
`;

describe("marked's process-wide settings", () => {
  const before = parse(changelog);
  const html = renderer(before);
  const entry = before.releases[0]?.sections[0]?.entries[0]?.markdown ?? '';
  const inline = html(entry, { inline: true });
  const block = html(entry);

  marked.use({
    gfm: false,
    breaks: true,
    // swallows level-3 headings, i.e. the section types
    extensions: [
      {
        name: 'swallow',
        level: 'block',
        tokenizer(source: string) {
          const match = /^### [^\n]*\n/.exec(source);
          return match ? { type: 'swallow', raw: match[0] } : undefined;
        },
        renderer: () => '',
      },
    ],
    renderer: {
      link() {
        return 'HIJACKED';
      },
    },
  });

  it('do not change how a changelog is read', () => {
    assert.deepEqual(parse(changelog), before);
  });

  it('do not change how it is rendered', () => {
    const after = renderer(parse(changelog));
    assert.equal(after(entry, { inline: true }), inline);
    assert.equal(after(entry), block);
    assert.match(inline, /<a href="https:\/\/github\.com\/o\/r\/issues\/1">#1<\/a>/);
  });
});
