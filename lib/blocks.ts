import { getDefaults, Lexer, type Token, type Tokens } from 'marked';

export interface SourceLine {
  /** 1-based */
  number: number;
  text: string;
}

interface ListItem {
  line: number;
  /** `-`, `*` or `+`; `undefined` in an ordered list. */
  bullet: string | undefined;
  /** The item without its marker and indentation. */
  markdown: string;
}

/** A top-level Markdown block, as marked reads it, with its place in the source. */
export interface Block {
  token: Token;
  /** The source lines the block spans. */
  lines: SourceLine[];
  /** A list's items; empty for every other block. */
  items: ListItem[];
}

/**
 * Splits `markdown` into its top-level blocks. marked has no line numbers, but
 * the `raw` texts of its top-level tokens add up to the source, so counting
 * their line breaks gives each block's lines.
 */
export function blocks(markdown: string): Block[] {
  // marked keeps a byte-order mark as text, and turns `\r\n` into `\n` itself;
  // doing both here keeps the source and the tokens in step
  const source = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const texts = source.split('\n');

  const result: Block[] = [];
  let offset = 0;
  /** The line `offset` is on. */
  let line = 1;
  // marked's own defaults, not the process-wide settings a program using
  // marked may have changed with `marked.use`
  for (const token of Lexer.lex(source, getDefaults())) {
    const { raw } = token;
    if (!source.startsWith(raw, offset)) {
      throw new Error(
        `marked's tokens no longer match the source at offset ${offset}, so line numbers would be wrong.`,
      );
    }
    // a block that ends without its line break leaves it to the next token
    const midLine = offset > 0 && source[offset - 1] !== '\n';
    const firstLine = midLine ? line + 1 : line;
    const lastLine = raw.endsWith('\n') ? line + countLineBreaks(raw) - 1 : line + countLineBreaks(raw);

    if (firstLine <= lastLine) {
      const lines: SourceLine[] = [];
      for (let number = firstLine; number <= lastLine; number++) {
        lines.push({ number, text: texts[number - 1] ?? '' });
      }
      const items = token.type === 'list' ? listItems(token as Tokens.List, raw, line) : [];
      result.push({ token, lines, items });
    }
    offset += raw.length;
    line += countLineBreaks(raw);
  }
  if (offset !== source.length) {
    throw new Error(`marked's tokens end at offset ${offset}, before the end of the source.`);
  }
  return result;
}

/** `line` is the line `raw` starts on. */
function listItems(list: Tokens.List, raw: string, line: number): ListItem[] {
  let position = 0;
  let current = line;
  return list.items.map((item) => {
    // the items' `raw` texts follow each other in the list's; counting only
    // the text since the previous item keeps a long list linear
    const start = raw.indexOf(item.raw, position);
    current += countLineBreaks(raw.slice(position, start));
    const itemLine = current;
    current += countLineBreaks(item.raw);
    position = start + item.raw.length;
    return {
      line: itemLine,
      bullet: list.ordered ? undefined : item.raw.trimStart()[0],
      markdown: item.text.trim(),
    };
  });
}

function countLineBreaks(text: string): number {
  return text.split('\n').length - 1;
}
