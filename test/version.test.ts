import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compareVersions, isValidVersion } from '../lib/version.ts';

describe('isValidVersion', () => {
  it('accepts releases, pre-releases and build metadata', () => {
    for (const version of [
      '0.0.0',
      '1.2.3',
      '10.20.30',
      '1.0.0-alpha',
      '1.0.0-alpha.1',
      '1.0.0-0.3.7',
      '1.0.0+20130313144700',
      '1.0.0-beta+exp.sha.5114f85',
    ]) {
      assert.ok(isValidVersion(version), version);
    }
  });

  it('rejects anything else', () => {
    for (const version of [
      '1.0',
      '1',
      'v1.0.0',
      '01.0.0',
      '1.00.0',
      '1.0.0-',
      '1.0.0-01',
      '1.0.0+',
      'version-1.0.0',
      '',
    ]) {
      assert.ok(!isValidVersion(version), version);
    }
  });
});

describe('compareVersions', () => {
  it('orders versions by precedence, as in the Semantic Versioning specification', () => {
    const ascending = [
      '1.0.0-alpha',
      '1.0.0-alpha.1',
      '1.0.0-alpha.beta',
      '1.0.0-beta',
      '1.0.0-beta.2',
      '1.0.0-beta.11',
      '1.0.0-rc.1',
      '1.0.0',
      '1.0.1',
      '1.1.0',
      '2.0.0',
      '10.0.0',
    ];
    for (let i = 1; i < ascending.length; i++) {
      const lower = ascending[i - 1] ?? '';
      const higher = ascending[i] ?? '';
      assert.ok(compareVersions(lower, higher) < 0, `${lower} < ${higher}`);
      assert.ok(compareVersions(higher, lower) > 0, `${higher} > ${lower}`);
    }
  });

  it('ignores build metadata', () => {
    assert.equal(compareVersions('1.0.0+a', '1.0.0+b'), 0);
  });

  it('throws on an invalid version', () => {
    assert.throws(() => compareVersions('1.0', '1.0.0'), /Not a valid version: 1\.0/);
  });
});
