import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compareVersions, isValidVersion } from '../lib/version.ts';

// Precedence itself is semver's business; these pin down how this package uses it.

describe('isValidVersion', () => {
  it('accepts releases, pre-releases and build metadata', () => {
    for (const version of ['0.0.0', '10.20.30', '1.0.0-alpha.1', '1.0.0-0.3.7', '1.0.0-beta+exp.sha.5114f85']) {
      assert.ok(isValidVersion(version), version);
    }
  });

  /** `semver.valid` cleans these up rather than rejecting them, which would
   * let `## v1.0.0` pass as a release heading. */
  it('rejects what semver would clean up', () => {
    for (const version of ['v1.0.0', '=1.0.0', ' 1.0.0', '1.0.0 ']) {
      assert.ok(!isValidVersion(version), JSON.stringify(version));
    }
  });

  it('rejects anything else', () => {
    for (const version of ['1.0', '01.0.0', '1.0.0-01', '1.0.0+', 'version-1.0.0', '']) {
      assert.ok(!isValidVersion(version), version);
    }
  });
});

describe('compareVersions', () => {
  it('ranks a pre-release below its release, and ignores build metadata', () => {
    assert.ok(compareVersions('1.0.0-rc.1', '1.0.0') < 0);
    assert.ok(compareVersions('1.0.0-beta.11', '1.0.0-beta.2') > 0);
    assert.equal(compareVersions('1.0.0+a', '1.0.0+b'), 0);
  });
});
