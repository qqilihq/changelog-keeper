# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 0.1.0-beta.3 - 2026-11-18

### Added

- `--section-order` and `sectionOrder`: require the section types within each release in the order they are listed, e.g. `Added` before `Fixed`

## 0.1.0-beta.2 - 2026-11-17

### Added

- `--section-types` and `sectionTypes`: the section types to accept instead of Keep a Changelog's six, e.g. with `### Info` added

## 0.1.0-beta.1 - 2026-11-17

### Added

- `renderer`: renders a changelog's Markdown to HTML — title, description, headings, sections and entries — with link references resolved against the whole file
- Link definitions carry their `title`, where they have one
- `html-comment` rule: an HTML comment that is never closed, which hides the rest of the file

### Changed

- Reads versions with `semver` and Markdown with `marked`, instead of with code of its own
- Exits with status 2, not a stack trace, when a file cannot be read as Markdown, e.g. because it nests thousands of blockquotes

### Fixed

- Link reference definitions with a title, `[1.0.0]: https://… "title"`, or in angle brackets are recognised, and no longer show up in the oldest release's section
- Headings inside HTML comments are ignored
- A byte-order mark at the start of the file no longer hides the title
- Very long lines no longer make parsing slow
- `extract` appends the link definitions the section uses, so `[#12]` no longer shows up in literal brackets in release notes

## 0.1.0-beta.0 - 2026-11-16

### Added

- `lint`: checks a changelog against the Keep a Changelog structure — one title, releases as `## [X.Y.Z] - YYYY-MM-DD`, newest first, one Unreleased section at the top, only the six section types, one bullet character, and complete, consistent link references where a file uses them
- `verify`: everything `lint` checks, plus a section with entries for the version being released and nothing left under Unreleased
- `extract`: prints one release's section, e.g. as release notes
- `parse`: the changelog as a structure — title, description, releases, sections and entries, each with its Markdown, plus every problem found with its line
