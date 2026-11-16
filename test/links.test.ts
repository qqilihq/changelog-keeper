import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parse, type Rule } from '../lib/index.ts';
import { normalizeRepository } from '../lib/links.ts';

const repo = 'https://github.com/owner/repo';

const release = (heading: string) => `## ${heading}\n\n### Added\n\n- A thing.\n\n`;

/** Unreleased, 1.1.0 and 1.0.0, with the given link references. */
function changelog(
  links: string[],
  headings = ['[Unreleased]', '[1.1.0] - 2026-02-01', '[1.0.0] - 2026-01-01'],
): string {
  return `# Changelog\n\n${headings.map(release).join('')}${links.join('\n')}\n`;
}

const validLinks = [
  `[unreleased]: ${repo}/compare/v1.1.0...HEAD`,
  `[1.1.0]: ${repo}/compare/v1.0.0...v1.1.0`,
  `[1.0.0]: ${repo}/releases/tag/v1.0.0`,
];

function problems(markdown: string, repository?: string): [number, Rule, string][] {
  return parse(markdown, { repository }).diagnostics.map(({ line, rule, message }) => [line, rule, message]);
}

describe('link references', () => {
  it('accepts a complete, consistent set', () => {
    assert.deepEqual(problems(changelog(validLinks)), []);
    assert.deepEqual(problems(changelog(validLinks), `git+${repo}.git`), []);
  });

  it('are optional', () => {
    assert.deepEqual(problems(changelog([], ['Unreleased', '1.1.0 - 2026-02-01', '1.0.0 - 2026-01-01'])), []);
  });

  it('ignore links that are not releases', () => {
    assert.deepEqual(problems(changelog([...validLinks, '[semver]: https://semver.org'])), []);
  });

  it('let the oldest release go without, as keepachangelog.com does', () => {
    assert.deepEqual(
      problems(changelog(validLinks.slice(0, 2), ['[Unreleased]', '[1.1.0] - 2026-02-01', '1.0.0 - 2026-01-01'])),
      [],
    );
  });

  it('let the oldest release compare against an earlier tag', () => {
    const links = [...validLinks.slice(0, 2), `[1.0.0]: ${repo}/compare/v0.9.0...v1.0.0`];
    assert.deepEqual(problems(changelog(links)), []);
  });

  it('report a bracketed version without a definition, with the line to add', () => {
    const [problem] = problems(changelog(validLinks.slice(0, 2)));
    assert.equal(problem?.[1], 'link');
    assert.equal(problem?.[0], 15);
    assert.match(
      problem?.[2] ?? '',
      /renders as literal brackets\. Add:\n\n {2}\[1\.0\.0\]: https:\/\/github\.com\/owner\/repo\/releases\/tag\/v1\.0\.0$/,
    );
  });

  it('report a release without brackets in a file that uses them', () => {
    const [problem] = problems(changelog(validLinks, ['[Unreleased]', '1.1.0 - 2026-02-01', '[1.0.0] - 2026-01-01']));
    assert.equal(problem?.[1], 'link');
  });

  it('report a link that compares the wrong versions', () => {
    const links = [validLinks[0] ?? '', `[1.1.0]: ${repo}/compare/v0.9.0...v1.1.0`, validLinks[2] ?? ''];
    const [problem] = problems(changelog(links));
    assert.equal(problem?.[0], 22);
    assert.match(
      problem?.[2] ?? '',
      /should read:\n\n {2}\[1\.1\.0\]: https:\/\/github\.com\/owner\/repo\/compare\/v1\.0\.0\.\.\.v1\.1\.0$/,
    );
  });

  it('report an Unreleased link that does not start at the newest release', () => {
    const links = [`[unreleased]: ${repo}/compare/v1.0.0...HEAD`, ...validLinks.slice(1)];
    assert.deepEqual(
      problems(changelog(links)).map(([line, rule]) => [line, rule]),
      [[21, 'link']],
    );
  });

  it('report links into another repository than package.json names', () => {
    assert.equal(problems(changelog(validLinks), 'https://github.com/someone/else').length, 3);
  });

  it('report duplicate and orphaned definitions', () => {
    const duplicate = problems(changelog([...validLinks, validLinks[1] ?? '']));
    assert.match(duplicate[0]?.[2] ?? '', /`\[1\.1\.0\]` is defined twice/);
    const orphan = problems(changelog([...validLinks, `[0.9.0]: ${repo}/releases/tag/v0.9.0`]));
    assert.match(orphan[0]?.[2] ?? '', /`\[0\.9\.0\]` is not a release in this changelog/);
  });

  it('follow GitLab URLs and the tag naming the file uses', () => {
    const gitlab = 'https://gitlab.example.com/group/project';
    const links = [
      `[unreleased]: ${gitlab}/-/compare/version-1.1.0...HEAD`,
      `[1.1.0]: ${gitlab}/-/compare/version-1.0.0...version-1.1.0`,
      `[1.0.0]: ${gitlab}/-/tags/version-1.0.0`,
    ];
    assert.deepEqual(problems(changelog(links)), []);
    const broken = [links[0] ?? '', `[1.1.0]: ${gitlab}/-/compare/version-1.0.0...v1.1.0`, links[2] ?? ''];
    assert.match(problems(changelog(broken))[0]?.[2] ?? '', /compare\/version-1\.0\.0\.\.\.version-1\.1\.0$/);
  });
});

describe('normalizeRepository', () => {
  it('turns the forms package.json allows into a web URL', () => {
    for (const form of [
      'git+https://github.com/owner/repo.git',
      'https://github.com/owner/repo/',
      'git@github.com:owner/repo.git',
      'ssh://git@github.com/owner/repo.git',
      'git://github.com/owner/repo.git',
      'owner/repo',
      'github:owner/repo',
    ]) {
      assert.equal(normalizeRepository(form), repo, form);
    }
    assert.equal(normalizeRepository('gitlab:group/project'), 'https://gitlab.com/group/project');
  });
});
