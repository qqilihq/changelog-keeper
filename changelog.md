# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 0.1.0-beta.0 - 2026-11-16

### Added

- `lint`: checks a changelog against the Keep a Changelog structure — one title, releases as `## [X.Y.Z] - YYYY-MM-DD`, newest first, one Unreleased section at the top, only the six section types, one bullet character, and complete, consistent link references where a file uses them
- `verify`: everything `lint` checks, plus a section with entries for the version being released and nothing left under Unreleased
- `extract`: prints one release's section, e.g. as release notes
- `parse`: the changelog as a structure — title, description, releases, sections and entries, each with its Markdown, plus every problem found with its line
