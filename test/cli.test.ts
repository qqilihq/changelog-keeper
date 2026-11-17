import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const cli = new URL('../lib/cli.ts', import.meta.url).pathname;

const changelog = `# Changelog

## Unreleased

## 1.0.0 - 2026-01-01

### Added

- A thing.
`;

/** Runs the CLI in a new directory holding `files`. */
function run(args: string[], files: Record<string, string> = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'changelog-keeper-'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(directory, name), content);
  }
  const { status, stdout, stderr } = spawnSync(process.execPath, [cli, ...args], { cwd: directory, encoding: 'utf8' });
  fs.rmSync(directory, { recursive: true });
  return { status, stdout, stderr };
}

describe('the CLI', () => {
  describe('lint', () => {
    it('succeeds on a valid changelog, found in any letter case', () => {
      const result = run(['lint'], { 'CHANGELOG.md': changelog });
      assert.equal(result.status, 0);
      assert.equal(result.stdout, 'CHANGELOG.md follows Keep a Changelog.\n');
    });

    it('lists the problems with file and line, and exits 1', () => {
      const result = run(['lint'], { 'changelog.md': changelog.replace('Added', 'Breaking') });
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        /^changelog\.md:7: `### Breaking` is not a Keep a Changelog section type; .* \(section-type\)\n$/,
      );
    });

    it('accepts the section types given with --section-types instead of the six', () => {
      const custom = changelog.replace('Added', 'Info') + '\n### Fixed\n\n- A fix.\n';
      assert.equal(run(['lint'], { 'changelog.md': custom }).status, 1);
      assert.equal(run(['lint', '--section-types', 'Info'], { 'changelog.md': custom }).status, 1);
      const result = run(['lint', '--section-types', 'Info, Fixed'], { 'changelog.md': custom });
      assert.equal(result.status, 0, result.stderr);
      const verified = run(['verify', '--version', '1.0.0', '--section-types', 'Info,Fixed'], {
        'changelog.md': custom,
      });
      assert.equal(verified.status, 0, verified.stderr);
    });

    it('rejects an empty --section-types as a usage error', () => {
      const result = run(['lint', '--section-types', ' , '], { 'changelog.md': changelog });
      assert.equal(result.status, 2);
      assert.equal(result.stderr, '--section-types needs at least one section type.\n');
    });

    it('checks the links against the repository in package.json', () => {
      const linked =
        changelog.replace('## Unreleased', '## [Unreleased]').replace('## 1.0.0', '## [1.0.0]') +
        '\n[unreleased]: https://github.com/owner/repo/compare/v1.0.0...HEAD\n' +
        '[1.0.0]: https://github.com/owner/repo/releases/tag/v1.0.0\n';
      assert.equal(run(['lint'], { 'changelog.md': linked, 'package.json': '{"repository":"owner/repo"}' }).status, 0);
      assert.equal(run(['lint'], { 'changelog.md': linked, 'package.json': '{"repository":"owner/other"}' }).status, 1);
    });
  });

  describe('verify', () => {
    it('takes the version from package.json', () => {
      const result = run(['verify'], { 'changelog.md': changelog, 'package.json': '{"version":"1.0.0"}' });
      assert.equal(result.status, 0);
      assert.equal(result.stdout, 'changelog.md is ready to release 1.0.0.\n');
      assert.equal(run(['verify'], { 'changelog.md': changelog, 'package.json': '{"version":"1.1.0"}' }).status, 1);
    });

    it('takes the version from --version, for projects without package.json', () => {
      assert.equal(run(['verify', '--version', '1.0.0', '--file', 'notes.md'], { 'notes.md': changelog }).status, 0);
    });

    it('is a usage error without any version, or with an invalid one', () => {
      assert.equal(run(['verify'], { 'changelog.md': changelog }).status, 2);
      assert.equal(run(['verify', '--version', '1.0'], { 'changelog.md': changelog }).status, 2);
    });
  });

  describe('extract', () => {
    it('prints the section', () => {
      const result = run(['extract', '1.0.0'], { 'changelog.md': changelog });
      assert.equal(result.status, 0);
      assert.equal(result.stdout, '### Added\n\n- A thing.\n');
    });

    /** The failure path is what stops a release going out with nothing
     * written about it, so it has to exit non-zero. */
    it('exits 1 for a version with no entries', () => {
      const result = run(['extract', '9.9.9'], { 'changelog.md': changelog });
      assert.equal(result.status, 1);
      assert.equal(result.stderr, 'changelog.md has no entries for 9.9.9.\n');
    });
  });

  it('parse prints the changelog as JSON', () => {
    const result = run(['parse'], { 'changelog.md': changelog });
    assert.equal(result.status, 0);
    assert.equal((JSON.parse(result.stdout) as { releases: unknown[] }).releases.length, 2);
  });

  /** A crash inside marked is no problem with the changelog, so not exit 1,
   * and no stack trace. */
  it('exits 2 when marked cannot read the file', () => {
    const result = run(['lint'], { 'changelog.md': `# Changelog\n\n${'>'.repeat(5_000)} Deep.\n` });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /^changelog\.md could not be read as Markdown: Maximum call stack size exceeded\n$/);
  });

  it('exits 2 on usage errors', () => {
    assert.equal(run([]).status, 2);
    assert.equal(run(['frobnicate'], { 'changelog.md': changelog }).status, 2);
    assert.equal(run(['extract'], { 'changelog.md': changelog }).status, 2);
    assert.equal(run(['lint', '--nope'], { 'changelog.md': changelog }).status, 2);
    assert.equal(run(['lint']).status, 2);
  });

  it('prints help', () => {
    const result = run(['--help']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /^Usage: changelog-keeper <command>/);
  });
});
