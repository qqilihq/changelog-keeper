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
  verify               Check that it is ready to release a version: lint, plus a
                       section with entries for that version, nothing left under
                       Unreleased
  extract <version>    Print one release's section, e.g. as release notes
  parse                Print the parsed changelog as JSON

Options:
  --file <path>        The changelog (default: changelog.md, in any letter case)
  --version <version>  verify: the version being released (default: the version
                       in the package.json next to the changelog)
  --repository <url>   The repository the link references must point at
                       (default: the package.json's repository)
  -h, --help           Show this help

Exit status: 0 on success, 1 when the changelog has problems, 2 on usage errors.
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
        version: { type: 'string' },
        repository: { type: 'string' },
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
  if (command === undefined) {
    err(usage);
    return 2;
  }
  if (!['lint', 'verify', 'extract', 'parse'].includes(command)) {
    err(`Unknown command: ${command}\n\n${usage}`);
    return 2;
  }
  if (operands.length !== (command === 'extract' ? 1 : 0)) {
    err(`Wrong number of arguments for ${command}.\n\n${usage}`);
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

  switch (command) {
    case 'lint':
      return printDiagnostics(file, parse(markdown, { repository }).diagnostics, `${file} follows Keep a Changelog.`);

    case 'verify': {
      const version = values.version ?? (typeof packageJson?.version === 'string' ? packageJson.version : undefined);
      if (version === undefined) {
        err('verify needs the version being released: pass --version, or run it next to a package.json.\n');
        return 2;
      }
      if (!isValidVersion(version)) {
        err(`${version} is not a valid semantic version.\n`);
        return 2;
      }
      return printDiagnostics(
        file,
        verify(markdown, { version, repository }),
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
      const changelog = parse(markdown, { repository });
      out(`${JSON.stringify(changelog, null, 2)}\n`);
      return printDiagnostics(file, changelog.diagnostics);
    }
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
