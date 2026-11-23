#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { extract } from './extract.ts';
import { parse, type Diagnostic } from './parse.ts';
import { verify } from './verify.ts';
import { isValidVersion } from './version.ts';

const usage = `Usage: changelog-keeper <command> [options]

Commands:
  lint                 Check that the changelog follows Keep a Changelog
  verify [version]     Check that it is ready to release a version: lint, plus a
                       section with entries for that version, nothing left under
                       Unreleased (default: the version in the package.json next
                       to the changelog)
  extract <version>    Print one release's section, e.g. as release notes
  parse                Print the parsed changelog as JSON

Options:
  --file <path>        The changelog (default: changelog.md, in any letter case)
  --repository <url>   The repository the link references must point at
                       (default: the package.json's repository)
  --section-types <list>
                       The section types to accept, comma-separated, instead
                       of Keep a Changelog's six, e.g.
                       Added,Changed,Deprecated,Removed,Fixed,Security,Info
  --section-order      Require the section types within a release in the order
                       of the section types above
  --version            Print the version of changelog-keeper
  -h, --help           Show this help

Exit status: 0 on success, 1 when the changelog has problems, 2 on usage errors and
when the file cannot be read.
`;

const out = (text: string) => process.stdout.write(text);
const err = (text: string) => process.stderr.write(text);

function main(args: string[]): number {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      options: {
        file: { type: 'string' },
        version: { type: 'boolean' },
        repository: { type: 'string' },
        'section-types': { type: 'string' },
        'section-order': { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (error) {
    err(`${(error as Error).message}\n\n${usage}`);
    return 2;
  }
  const { values, positionals } = parsed;
  const [command, ...operands] = positionals;

  if (values.help) {
    out(usage);
    return 0;
  }
  if (values.version) {
    // `--version` used to take the version for verify; with a command it is
    // most likely such a call, which must not pass by printing a version
    if (command !== undefined) {
      err(`--version takes no command; for verify, pass the version as an argument: verify <version>.\n\n${usage}`);
      return 2;
    }
    out(`${ownVersion()}\n`);
    return 0;
  }
  if (command === undefined) {
    err(usage);
    return 2;
  }
  if (!['lint', 'verify', 'extract', 'parse'].includes(command)) {
    err(`Unknown command: ${command}\n\n${usage}`);
    return 2;
  }
  const [minOperands, maxOperands] = command === 'extract' ? [1, 1] : command === 'verify' ? [0, 1] : [0, 0];
  if (operands.length < minOperands || operands.length > maxOperands) {
    err(`Wrong number of arguments for ${command}.\n\n${usage}`);
    return 2;
  }
  const sectionTypes = values['section-types']
    ?.split(',')
    .map((type) => type.trim())
    .filter((type) => type !== '');
  if (sectionTypes?.length === 0) {
    err('--section-types needs at least one section type.\n');
    return 2;
  }

  const file = values.file ?? findChangelog();
  if (file === undefined) {
    err('There is no changelog.md in this directory; name the file with --file.\n');
    return 2;
  }
  let markdown;
  try {
    markdown = fs.readFileSync(file, 'utf8');
  } catch (error) {
    err(`Cannot read ${file}: ${(error as Error).message}\n`);
    return 2;
  }

  // next to the changelog, so `--file` pointing into another project reads its manifest
  const packageJson = readPackageJson(path.dirname(file));
  const repository = values.repository ?? repositoryOf(packageJson);
  const options = { repository, sectionTypes, sectionOrder: values['section-order'] };

  // marked can fail on pathological input, e.g. thousands of nested
  // blockquotes; that is no problem with the changelog, so not exit status 1
  try {
    switch (command) {
      case 'lint':
        return printDiagnostics(file, parse(markdown, options).diagnostics, `${file} follows Keep a Changelog.`);

      case 'verify': {
        const version = operands[0] ?? (typeof packageJson?.version === 'string' ? packageJson.version : undefined);
        if (version === undefined) {
          err('verify needs the version being released: pass it as an argument, or run it next to a package.json.\n');
          return 2;
        }
        if (!isValidVersion(version)) {
          err(`${version} is not a valid semantic version.\n`);
          return 2;
        }
        return printDiagnostics(
          file,
          verify(markdown, { ...options, version }),
          `${file} is ready to release ${version}.`,
        );
      }

      case 'extract': {
        const version = operands[0] ?? '';
        const section = extract(markdown, version);
        if (section === undefined) {
          err(`${file} has no entries for ${version}.\n`);
          return 1;
        }
        out(`${section}\n`);
        return 0;
      }

      default: {
        const changelog = parse(markdown, options);
        out(`${JSON.stringify(changelog, null, 2)}\n`);
        return printDiagnostics(file, changelog.diagnostics);
      }
    }
  } catch (error) {
    err(`${file} could not be read as Markdown: ${(error as Error).message}\n`);
    return 2;
  }
}

function printDiagnostics(file: string, diagnostics: Diagnostic[], success?: string): number {
  for (const { line, rule, message } of diagnostics) {
    err(`${file}:${line}: ${message} (${rule})\n`);
  }
  if (diagnostics.length > 0) {
    return 1;
  }
  if (success !== undefined) {
    out(`${success}\n`);
  }
  return 0;
}

function findChangelog(): string | undefined {
  return fs.readdirSync('.').find((name) => name.toLowerCase() === 'changelog.md');
}

/** From the package.json one level up, both from `lib/` and from `dist/`. */
function ownVersion(): string {
  const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    version: string;
  };
  return packageJson.version;
}

function readPackageJson(directory: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8')) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function repositoryOf(packageJson: Record<string, unknown> | undefined): string | undefined {
  const repository = packageJson?.repository;
  if (typeof repository === 'string') {
    return repository;
  }
  if (typeof repository === 'object' && repository !== null && 'url' in repository) {
    return typeof repository.url === 'string' ? repository.url : undefined;
  }
  return undefined;
}

process.exitCode = main(process.argv.slice(2));
