import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';
import { CHANGE_TYPES, parse, type Rule } from '../lib/index.ts';

const fixture = (name: string) => fs.readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8');

/** The rules reported for `markdown`, with their lines. */
function problems(markdown: string): [number, Rule][] {
  return parse(markdown).diagnostics.map(({ line, rule }) => [line, rule]);
}

function messages(markdown: string): string[] {
  return parse(markdown).diagnostics.map(({ message }) => message);
}

describe('parse', () => {
  // keepachangelog.com's own example, as of its version 1.0.0
  describe('the keepachangelog.com example', () => {
    const changelog = parse(fixture('keepachangelog.md'));

    it('follows the format', () => {
      assert.deepEqual(changelog.diagnostics, []);
    });

    it('has the title and the description below it', () => {
      assert.equal(changelog.title, 'Changelog');
      assert.match(changelog.description, /^All notable changes to this project will be documented in this file\./);
      assert.match(
        changelog.description,
        /adheres to \[Semantic Versioning\]\(https:\/\/semver\.org\/spec\/v2\.0\.0\.html\)\.$/,
      );
    });

    it('has every release, Unreleased first', () => {
      assert.equal(changelog.releases.length, 13);
      assert.equal(changelog.releases[0]?.unreleased, true);
      assert.equal(changelog.releases[0]?.version, undefined);
    });

    it('reads version, date and brackets from the heading', () => {
      const release = changelog.releases[1];
      assert.equal(release?.heading, '[1.0.0] - 2017-06-20');
      assert.equal(release?.version, '1.0.0');
      assert.equal(release?.date, '2017-06-20');
      assert.equal(release?.linked, true);
      assert.equal(release?.yanked, false);
      assert.equal(changelog.releases.at(-1)?.linked, false);
    });

    it('reads the section types and their entries', () => {
      const sections = changelog.releases[1]?.sections ?? [];
      assert.deepEqual(
        sections.map(({ type, entries }) => [type, entries.length]),
        [
          ['Added', 21],
          ['Changed', 13],
          ['Removed', 1],
        ],
      );
      assert.equal(sections[0]?.entries[1]?.markdown, 'Version navigation.');
      assert.equal(
        sections[0]?.entries[0]?.markdown,
        'New visual identity by [@tylerfortune8](https://github.com/tylerfortune8).',
      );
    });

    it('collects the link references', () => {
      assert.equal(changelog.links.length, 12);
      assert.deepEqual(changelog.links[0], {
        label: 'Unreleased',
        url: 'https://github.com/olivierlacan/keep-a-changelog/compare/v1.0.0...HEAD',
        line: 139,
      });
    });

    it('keeps link references out of the last release', () => {
      assert.doesNotMatch(changelog.releases.at(-1)?.markdown ?? '', /compare/);
    });
  });

  describe('structure', () => {
    it('keeps prose under a release heading as its description', () => {
      const [release] = parse(
        '# Changelog\n\n## 1.0.0 - 2026-01-01\n\nFirst release.\n\n### Added\n\n- A thing.\n',
      ).releases;
      assert.equal(release?.description, 'First release.');
      assert.equal(release?.markdown, 'First release.\n\n### Added\n\n- A thing.');
      assert.equal(release?.sections[0]?.markdown, '- A thing.');
    });

    it('continues an entry over indented and wrapped lines', () => {
      const changelog = parse(
        '# Changelog\n\n## 1.0.0 - 2026-01-01\n\n### Added\n\n- One,\n  continued.\n\n  Second paragraph.\n- Two\n',
      );
      assert.deepEqual(
        changelog.releases[0]?.sections[0]?.entries.map((entry) => entry.markdown),
        ['One,\ncontinued.\n\nSecond paragraph.', 'Two'],
      );
    });

    it('marks yanked releases', () => {
      const changelog = parse('# Changelog\n\n## 1.0.0 - 2026-01-01 [YANKED]\n\n### Added\n\n- A thing.\n');
      assert.deepEqual(changelog.diagnostics, []);
      assert.equal(changelog.releases[0]?.yanked, true);
    });

    it('ignores headings inside fenced code', () => {
      const changelog = parse(
        '# Changelog\n\n## 1.0.0 - 2026-01-01\n\n### Added\n\n- Example:\n\n  ```md\n  ## not a release\n  ```\n',
      );
      assert.deepEqual(changelog.diagnostics, []);
      assert.equal(changelog.releases.length, 1);
    });

    it('accepts Windows line endings', () => {
      assert.deepEqual(problems('# Changelog\r\n\r\n## 1.0.0 - 2026-01-01\r\n\r\n### Added\r\n\r\n- A thing.\r\n'), []);
    });

    it('accepts a byte-order mark', () => {
      assert.deepEqual(problems('\uFEFF# Changelog\n\n## 1.0.0 - 2026-01-01\n\n### Added\n\n- A thing.\n'), []);
    });

    it('ignores headings inside HTML comments', () => {
      const changelog = parse(
        '# Changelog\n\n<!--\n## [Unreleased]\n### Added\n-->\n\n## 1.0.0 - 2026-01-01\n\n### Added\n\n- A thing.\n',
      );
      assert.deepEqual(changelog.diagnostics, []);
      assert.deepEqual(
        changelog.releases.map((release) => release.version),
        ['1.0.0'],
      );
    });

    it('ignores headings in fenced code nested deeper in a list', () => {
      const changelog = parse(
        '# Changelog\n\n## 1.0.0 - 2026-01-01\n\n### Added\n\n- A.\n  - B:\n\n        ```\n        ## x\n        ```\n',
      );
      assert.deepEqual(changelog.diagnostics, []);
    });

    /** Offsets count UTF-16 code units; counting code points instead would
     * shift every line after an emoji. */
    it('keeps line numbers right after characters outside the BMP', () => {
      assert.deepEqual(problems('# Changelog 🎉\n\n## 1.0.0 - 2026-01-01\n\n### Breaking\n\n- 🎉 A thing.\n'), [
        [5, 'section-type'],
      ]);
    });

    /** Each item's line used to be counted from the start of the list. */
    it('reads a long list in linear time, with the right lines', () => {
      const items = Array.from({ length: 20_000 }, (_, index) => `- Item ${index}.`);
      const markdown = `# Changelog\n\n## 1.0.0 - 2026-01-01\n\n### Added\n\n${items.join('\n')}\n\n  continued.\n- Last.\n`;
      const start = performance.now();
      const entries = parse(markdown).releases[0]?.sections[0]?.entries ?? [];
      assert.ok(performance.now() - start < 1_000, `took ${Math.round(performance.now() - start)} ms`);
      assert.deepEqual(
        entries.slice(-2).map(({ line, markdown: entry }) => [line, entry]),
        [
          [20_006, 'Item 19999.\n\ncontinued.'],
          [20_009, 'Last.'],
        ],
      );
    });

    it('reads link definitions with a title or angle brackets', () => {
      const { links, releases } = parse(
        '# Changelog\n\n## [1.0.0] - 2026-01-01\n\n### Added\n\n- A.\n\n[1.0.0]: <https://github.com/o/r/releases/tag/v1.0.0> "v1"\n',
      );
      assert.deepEqual(links, [
        { label: '1.0.0', url: 'https://github.com/o/r/releases/tag/v1.0.0', title: 'v1', line: 9 },
      ]);
      assert.equal(releases[0]?.markdown, '### Added\n\n- A.');
    });
  });

  describe('rules', () => {
    const valid = '# Changelog\n\n## 1.0.0 - 2026-01-01\n\n### Added\n\n- A thing.\n';

    it('reports nothing for a valid changelog', () => {
      assert.deepEqual(problems(valid), []);
    });

    it('requires a level-1 title first', () => {
      assert.deepEqual(problems('## 1.0.0 - 2026-01-01\n\n### Added\n\n- A thing.\n'), [[1, 'title']]);
      assert.deepEqual(problems('Just text.\n'), [[1, 'title']]);
    });

    it('allows only the title as a level-1 heading', () => {
      assert.deepEqual(problems(`${valid}\n# 0.9\n`), [[9, 'heading']]);
      assert.match(messages(`${valid}\n# 0.9\n`)[0] ?? '', /Releases are level-2 headings/);
    });

    it('rejects headings below level 3, and section types outside a release', () => {
      assert.deepEqual(problems(`${valid}\n#### Detail\n`), [[9, 'heading']]);
      assert.deepEqual(problems('# Changelog\n\n### Added\n\n- A thing.\n'), [[3, 'heading']]);
    });

    it('rejects underlined headings', () => {
      assert.deepEqual(problems('Changelog\n=========\n'), [
        [1, 'title'],
        [2, 'heading'],
      ]);
    });

    it('rejects trailing whitespace after a heading', () => {
      assert.deepEqual(problems(valid.replace('### Added', '### Added ')), [[5, 'heading']]);
    });

    describe('release headings', () => {
      const heading = (text: string) => `# Changelog\n\n## ${text}\n\n### Added\n\n- A thing.\n`;

      it('accepts the forms keepachangelog.com uses', () => {
        for (const text of [
          '1.0.0 - 2026-01-01',
          '1.0.0-beta.1 - 2026-01-01',
          '1.0.0 - 2026-01-01 [YANKED]',
          'Unreleased',
        ]) {
          assert.deepEqual(problems(heading(text)), [], text);
        }
      });

      it('explains what is wrong with a malformed one', () => {
        const cases: [string, RegExp][] = [
          ['1.0.0 – 2026-01-01', /write `## 1\.0\.0 - 2026-01-01` \(a plain hyphen, not an en or em dash\)/],
          ['1.0.0', /write `## 1\.0\.0 - YYYY-MM-DD` \(the release date\)/],
          ['version-1.0.0 - 2026-01-01', /\(no `version-` before the version\)/],
          ['v1.0.0 - 2026-01-01', /\(no `v` before the version\)/],
          ['1.0 - 2026-01-01', /\(the version needs all three numbers\)/],
          ['01.0.0 - 2026-01-01', /\(`01\.0\.0` is not a valid semantic version\)/],
          ['[1.0.0] 2026-01-01', /write `## \[1\.0\.0\] - 2026-01-01`/],
        ];
        for (const [text, message] of cases) {
          const [diagnostic] = parse(heading(text)).diagnostics;
          assert.equal(diagnostic?.rule, 'release-heading', text);
          assert.match(diagnostic?.message ?? '', message, text);
        }
      });

      it('points a section type written as a release to level 3', () => {
        const [diagnostic] = parse('# Changelog\n\n## Unreleased\n\n## added\n\n- A thing.\n').diagnostics;
        assert.equal(diagnostic?.rule, 'release-heading');
        assert.match(diagnostic?.message ?? '', /`Added` is a section type, which is a level-3 heading: `### Added`/);
      });

      it('rejects a heading that is no release at all', () => {
        assert.match(messages(heading('Breaking'))[0] ?? '', /`## Breaking` is not a release heading/);
      });

      it('requires the exact spelling of Unreleased', () => {
        assert.deepEqual(problems(heading('unreleased')), [[3, 'release-heading']]);
      });

      it('rejects an invalid version or date', () => {
        assert.deepEqual(problems(heading('01.0.0 - 2026-01-01')), [[3, 'release-heading']]);
        assert.deepEqual(problems(heading('1.0.0 - 2026-02-30')), [[3, 'release-date']]);
        assert.deepEqual(problems(heading('1.0.0 - 26-01-01')), [[3, 'release-date']]);
      });

      it('still reads the version from a malformed heading', () => {
        assert.equal(parse(heading('version-5.13.9 – 2026-10-04')).releases[0]?.version, '5.13.9');
      });
    });

    it('requires releases newest first, each once', () => {
      const changelog = (...versions: string[]) =>
        `# Changelog\n${versions.map((version) => `\n## ${version} - 2026-01-01\n\n### Added\n\n- A thing.\n`).join('')}`;
      assert.deepEqual(problems(changelog('2.0.0', '1.0.0', '1.0.0-rc.1')), []);
      assert.deepEqual(problems(changelog('1.0.0', '2.0.0')), [[9, 'release-order']]);
      assert.deepEqual(problems(changelog('1.0.0', '1.0.0')), [[9, 'release-order']]);
    });

    it('allows one Unreleased section, at the top', () => {
      const release = '## 1.0.0 - 2026-01-01\n\n### Added\n\n- A thing.\n';
      assert.deepEqual(problems(`# Changelog\n\n## Unreleased\n\n${release}`), []);
      assert.deepEqual(problems(`# Changelog\n\n${release}\n## Unreleased\n`), [[9, 'unreleased']]);
      assert.deepEqual(problems(`# Changelog\n\n## Unreleased\n\n## Unreleased\n\n${release}`), [[5, 'unreleased']]);
    });

    describe('section types', () => {
      it('allows only the six keepachangelog.com defines', () => {
        for (const type of ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']) {
          assert.deepEqual(problems(valid.replace('Added', type)), [], type);
        }
        assert.deepEqual(problems(valid.replace('Added', 'Breaking')), [[5, 'section-type']]);
        assert.match(messages(valid.replace('Added', 'Breaking'))[0] ?? '', /use one of `Added`, `Changed`/);
      });

      it('names the right spelling when only the case is wrong', () => {
        assert.match(messages(valid.replace('Added', 'added'))[0] ?? '', /Write `### Added`, not `### added`/);
      });

      it('rejects the same type twice in a release', () => {
        assert.deepEqual(problems(`${valid}\n### Added\n\n- Another.\n`), [[9, 'section-duplicate']]);
      });

      it('rejects a type with no entries', () => {
        assert.deepEqual(problems(`${valid}\n### Fixed\n`), [[9, 'section-empty']]);
      });

      describe('own types', () => {
        const options = { sectionTypes: [...CHANGE_TYPES, 'Info'] };
        const info = valid.replace('Added', 'Info');
        const problemsWith = (markdown: string, sectionTypes: readonly string[] = options.sectionTypes) =>
          parse(markdown, { sectionTypes }).diagnostics.map(({ line, rule }) => [line, rule]);
        const messageWith = (markdown: string) => parse(markdown, options).diagnostics[0]?.message ?? '';

        it('replace the six', () => {
          assert.deepEqual(problemsWith(info), []);
          assert.deepEqual(problemsWith(valid), []);
          assert.deepEqual(problems(info), [[5, 'section-type']]);
          assert.deepEqual(problemsWith(valid, ['Changed', 'Fixed']), [[5, 'section-type']]);
        });

        it('are listed when a heading matches none', () => {
          assert.match(
            messageWith(valid.replace('Added', 'Breaking')),
            /^`### Breaking` is not one of this changelog's section types; use one of `Added`, .*`Security`, `Info`\.$/,
          );
        });

        it('name the right spelling when only the case is wrong', () => {
          assert.match(messageWith(valid.replace('Added', 'info')), /Write `### Info`, not `### info`/);
        });

        it('are the ones suggested for a section type written as a release heading', () => {
          const release = (type: string) => `# Changelog\n\n## ${type}\n\n- A thing.\n`;
          const message = (type: string, sectionTypes: readonly string[]) =>
            parse(release(type), { sectionTypes }).diagnostics[0]?.message ?? '';
          assert.match(
            message('Info', options.sectionTypes),
            /is a section type, which is a level-3 heading: `### Info`/,
          );
          assert.doesNotMatch(message('Added', ['Info']), /section type/);
        });

        it('are checked like the six', () => {
          assert.deepEqual(problemsWith(`${info}\n### Info\n\n- Another.\n`), [[9, 'section-duplicate']]);
          assert.deepEqual(problemsWith(`${valid}\n### Info\n`), [[9, 'section-empty']]);
        });
      });
    });

    /** An HTML comment runs to the end of the file when it is never closed,
     * so the releases after it disappear without anything else to report. */
    it('rejects an HTML comment that is never closed', () => {
      const unclosed = `# Changelog\n\n<!-- add entries below\n\n${valid.replace('# Changelog\n\n', '')}`;
      assert.deepEqual(problems(unclosed), [[3, 'html-comment']]);
      assert.equal(parse(unclosed).releases.length, 0);
      assert.deepEqual(
        problems(`# Changelog\n\n<!-- add entries below -->\n\n${valid.replace('# Changelog\n\n', '')}`),
        [],
      );
    });

    it('requires one bullet character throughout', () => {
      assert.deepEqual(problems(valid.replace('- A thing.', '* A thing.')), []);
      assert.deepEqual(problems(`${valid}* Another.\n`), [[8, 'bullet-style']]);
    });
  });
});
