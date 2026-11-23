# changelog-keeper

Parse, lint and verify changelogs in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## Installation

```shell
$ npm install --save-dev @qqilihq/changelog-keeper
```

Projects without a `package.json` can run it with `npx @qqilihq/changelog-keeper`.

## Usage

```shell
$ changelog-keeper lint                  # check the structure
$ changelog-keeper verify                # ready to release package.json's version?
$ changelog-keeper verify 1.2.0          # ready to release 1.2.0?
$ changelog-keeper extract 1.2.0         # print that release's section
$ changelog-keeper parse                 # print the changelog as JSON
$ changelog-keeper lint --section-types Added,Changed,Deprecated,Removed,Fixed,Security,Info
$ changelog-keeper lint --section-order  # section types in the order Added, Changed, …
```

The changelog is `changelog.md` in the current directory, in any letter case, or the one given with `--file`.
Problems are printed as `file:line: message (rule)`. The exit status is 0 on success, 1 when the changelog has
problems, and 2 on usage errors and when the file cannot be read.

Markdown is read with [marked](https://github.com/markedjs/marked), which slows down on blocks nested hundreds of levels
deep, such as a list indented one step further on every line: 2,000 levels take about half a minute. Thousands of nested
blockquotes make it fail, with exit status 2. Real changelogs come nowhere near this, but when running `lint` on
changelogs from untrusted pull requests, give the job a timeout.

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

The link definitions the section uses are appended, so its links work on their own.

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
| `section-order`     | `--section-order` only: the section types within a release in the order they are listed                               |
| `bullet-style`      | one bullet character throughout the file                                                                              |
| `html-comment`      | every HTML comment closed with `-->`; one that is not hides the rest of the file                                      |
| `link`              | where a file uses link references: one for every bracketed version, in the right repository, comparing the right tags |
| `release`           | `verify` only: entries for the version being released, as the newest release, and none left under Unreleased          |

Link references are optional. A file that uses them uses them for every release except possibly the oldest, as in
Keep a Changelog's own example. Brackets without a definition render as literal brackets. The repository is taken from
`package.json` or `--repository`; without either, the links only have to agree with each other. GitHub and GitLab
URLs are both understood.

Keep a Changelog names six section types and leaves open whether there may be others. To accept a different set, list
all of them with `--section-types`, comma-separated, or with `sectionTypes` in the library: add one, e.g. `Info`, leave
one out, or translate them. They are checked like the six: each at most once per release, and with entries.

Keep a Changelog lists its six in an order, but does not ask releases to keep to it. To require that, pass
`--section-order`, or `sectionOrder: true` in the library: the section types of each release then follow the order of
the six, or of the list given with `--section-types`. A section type outside that list has no place in the order and is
reported only as such.

## Library

```ts
import { CHANGE_TYPES, extract, parse, verify } from '@qqilihq/changelog-keeper';

const changelog = parse(markdown); // { title, description, releases, links, diagnostics }
const problems = verify(markdown, { version: '1.2.0', sectionTypes: [...CHANGE_TYPES, 'Info'] });
const notes = extract(markdown, '1.2.0'); // undefined when there is nothing to say
```

Every release carries its `version`, `date`, `sections` with their `entries`, and its `markdown`.

### HTML

```ts
import { parse, renderer } from '@qqilihq/changelog-keeper';

const changelog = parse(markdown);
const html = renderer(changelog);

html(changelog.title ?? '', { inline: true }); // without the <p>
html(changelog.description); // <p>…</p>
html(release.heading, { inline: true });
html(entry.markdown); // <p>…</p>, or more blocks for an entry with a nested list
```

Link references resolve against every definition in the changelog, so a fragment renders as it would in place.

`inline` is for headings and the title. It renders only the inline formatting, so a fragment of more than one paragraph,
or with a nested list, comes out as plain text: the entry `One\n\n  Two` renders as `One\n\nTwo`. Entries can have
either, so render them without it.

The HTML is not sanitized. HTML in the changelog passes through as written, and Markdown alone can make a working
`javascript:` link: `[x](javascript:alert(1))`. Before rendering a changelog you do not trust, for example from a pull
request, sanitize the result, e.g. with [DOMPurify](https://github.com/cure53/DOMPurify).

## Versioning

After a minor or patch update, such as from 1.2.0 to 1.3.0, a changelog that passed still passes, except when

- a new rule reports a problem that breaks the changelog, such as an HTML comment that is never closed and hides the
  rest of the file, or
- a fixed rule reports what it let through before.

Other new rules are opt-in, such as `--section-order`. A rule that is on by default and can fail a changelog that
follows Keep a Changelog, or a stricter rule, comes only with a major update, such as to 2.0.0.

When using changelog-keeper as a [library](#library), give a `switch` over a diagnostic's `rule` a `default`, as minor
updates can add rules.

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
