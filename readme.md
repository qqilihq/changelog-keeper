# changelog-keeper

Parse, lint and verify changelogs in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. No dependencies.

## Installation

```shell
$ npm install --save-dev @qqilihq/changelog-keeper
```

Projects without a `package.json` can run it with `npx @qqilihq/changelog-keeper`.

## Usage

```shell
$ changelog-keeper lint                  # check the structure
$ changelog-keeper verify                # ready to release package.json's version?
$ changelog-keeper verify --version 1.2.0
$ changelog-keeper extract 1.2.0         # print that release's section
$ changelog-keeper parse                 # print the changelog as JSON
```

The changelog is `changelog.md` in the current directory, in any letter case, or the one given with `--file`.
Problems are printed as `file:line: message (rule)`. The exit status is 0 on success, 1 when the changelog has
problems, and 2 on usage errors.

### Releasing with npm or pnpm

```json
{
  "scripts": {
    "preversion": "changelog-keeper lint",
    "version": "changelog-keeper verify || (git checkout -- package.json && exit 1)"
  }
}
```

`version` runs after the version in `package.json` has been bumped, which is the only point at which it is known.
pnpm does not undo the bump when the script fails, hence the `git checkout`.

### Release notes

```shell
$ changelog-keeper extract "$version" > release-notes.md
```

## Rules

| Rule                | Requires                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `title`             | a level-1 title, such as `# Changelog`, as the first heading                                                          |
| `heading`           | no other level-1 headings, none below level 3, `#`-style only, no trailing whitespace                                 |
| `release-heading`   | `## [X.Y.Z] - YYYY-MM-DD` with a valid version and a plain hyphen, optionally ` [YANKED]`; `## [Unreleased]`          |
| `release-date`      | a valid date                                                                                                          |
| `release-order`     | releases newest first, each once                                                                                      |
| `unreleased`        | at most one Unreleased section, above all releases                                                                    |
| `section-type`      | `### Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` or `Security`                                                |
| `section-duplicate` | each section type at most once per release                                                                            |
| `section-empty`     | entries under every section type                                                                                      |
| `bullet-style`      | one bullet character throughout the file                                                                              |
| `link`              | where a file uses link references: one for every bracketed version, in the right repository, comparing the right tags |
| `release`           | `verify` only: entries for the version being released, as the newest release, and none left under Unreleased          |

Link references are optional. A file that uses them uses them for every release except possibly the oldest, as in
Keep a Changelog's own example. Brackets without a definition render as literal brackets. The repository is taken from
`package.json` or `--repository`; without either, the links only have to agree with each other. GitHub and GitLab
URLs are both understood.

## Library

```ts
import { extract, parse, verify } from '@qqilihq/changelog-keeper';

const changelog = parse(markdown); // { title, description, releases, links, diagnostics }
const problems = verify(markdown, { version: '1.2.0' });
const notes = extract(markdown, '1.2.0'); // undefined when there is nothing to say
```

Every release carries its `version`, `date`, `sections` with their `entries`, and its `markdown`.

## Development

```shell
$ pnpm install
$ pnpm test
$ pnpm run lint
```

## Releasing

Move the entries under `## Unreleased` to a new `## X.Y.Z - YYYY-MM-DD` section and commit, then:

```shell
$ pnpm run release <update_type>
$ git push --follow-tags
$ pnpm publish
```

## License

MIT
