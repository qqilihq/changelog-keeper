import { getDefaults, Lexer, Parser, type Links } from 'marked';
import type { Changelog } from './parse.ts';

export interface RenderOptions {
  /** Leave out the block element around the HTML, e.g. the `<p>` around a
   * line of text: for a heading or the title. Only inline formatting is
   * rendered, so a fragment of more than one paragraph, or with a nested
   * list, comes out as plain text; entries can have either. */
  inline?: boolean | undefined;
}

/**
 * A function that renders Markdown from `changelog` -- its title, its
 * description, a release's heading or Markdown, a section's, an entry's -- to
 * HTML. Link references resolve against every definition in the changelog, so
 * a fragment renders as it does in place.
 *
 * The HTML is not sanitized: HTML in the changelog passes through as written,
 * and Markdown alone can make a `javascript:` link. Sanitize the result before
 * showing a changelog you do not trust.
 */
export function renderer(changelog: Changelog): (markdown: string, options?: RenderOptions) => string {
  // no prototype, so that labels such as `constructor` are stored too
  const links = Object.create(null) as Links;
  for (const { label, url, title } of changelog.links) {
    // the first definition of a label counts, as in CommonMark
    links[normalizeLabel(label)] ??= { href: url, title: title ?? null };
  }
  return (markdown, options = {}) => {
    // marked's own defaults, not the process-wide settings a program using
    // marked may have changed with `marked.use`; fresh each time, as the
    // lexer and parser attach their state to them
    const lexer = new Lexer(getDefaults());
    Object.assign(lexer.tokens.links, links);
    return options.inline
      ? Parser.parseInline(lexer.inlineTokens(markdown), getDefaults())
      : Parser.parse(lexer.lex(markdown), getDefaults());
  };
}

/** The key marked stores and looks up link definitions under. Upper-casing in
 * between folds case the way CommonMark asks, e.g. `ẞ` and `ss`. */
export function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase().toUpperCase().toLowerCase();
}
