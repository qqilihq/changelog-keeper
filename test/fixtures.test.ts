import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';
import { parse } from '../lib/index.ts';

// Real changelogs, copied as they were before moving to this package, except
// that selenium-knime's is cut down to its released history. Each differs from
// Keep a Changelog in its own way; the tallies pin down that every difference
// is found, and nothing else.

function tally(name: string): Record<string, number> {
  const markdown = fs.readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8');
  const counts: Record<string, number> = {};
  for (const { rule } of parse(markdown).diagnostics) {
    counts[rule] = (counts[rule] ?? 0) + 1;
  }
  return counts;
}

describe('real changelogs', () => {
  it('evatr: en dashes and `### Breaking`', () => {
    assert.deepEqual(tally('evatr.md'), { 'release-heading': 10, 'section-type': 6 });
  });

  it('mongoose-slugger: en dashes and `### Breaking`', () => {
    assert.deepEqual(tally('mongoose-slugger.md'), { 'release-heading': 16, 'section-type': 5 });
  });

  it('qrocodile-api-node: no dates and `### Notes`', () => {
    assert.deepEqual(tally('qrocodile-api-node.md'), { 'release-heading': 2, 'section-type': 1 });
  });

  it('selenium-knime: `version-` prefixes, en dashes, `### Info` and a stray space', () => {
    assert.deepEqual(tally('selenium-knime.md'), { heading: 1, 'release-heading': 128, 'section-type': 14 });
  });
});
