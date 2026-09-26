// Turns Sia's Markdown replies into a small, safe tree of plain data for the chat UI to render.
//
// Sia's replies are generated from crawled web pages, so they are untrusted input. This never produces
// HTML or fetches anything: raw HTML is dropped, images are reduced to their alt text, and only https links
// survive (anything else is shown as plain text). `marked` is used purely as a *lexer* — the token tree is
// walked here, and nothing it renders is ever displayed — which keeps the same battle-tested parsing the
// website widget gets, with no HTML in the loop. Pure: no React Native imports.

import { Lexer, type Token, type Tokens } from 'marked';

export type LinkKind = 'article' | 'web';

export type Inline =
  | { t: 'text'; text: string }
  | { t: 'strong'; children: Inline[] }
  | { t: 'em'; children: Inline[] }
  | { t: 'del'; children: Inline[] }
  | { t: 'code'; text: string }
  | { t: 'br' }
  | { t: 'link'; href: string; kind: LinkKind; children: Inline[] };

export type Block =
  | { t: 'paragraph'; children: Inline[] }
  | { t: 'heading'; depth: number; children: Inline[] }
  | { t: 'list'; ordered: boolean; start: number; items: Block[][] }
  | { t: 'quote'; children: Block[] }
  | { t: 'code'; text: string }
  | { t: 'table'; header: Inline[][]; rows: Inline[][][] }
  | { t: 'rule' }
  // A BusinessDay article link that stood on its own in the reply — rendered as a tappable card that opens
  // the story in the app's own reader, like the website widget's "source cards".
  | { t: 'sourceCard'; href: string; title: string };

// ---- links ----

type ParsedUrl = { href: string; host: string; port: string; path: string; search: string; hash: string };

// A deliberately small, https-only parser rather than `new URL()`: React Native's URL support has been
// partial across versions, and all this needs is the host and path to decide how a link should open. The
// host pattern excludes `@` and `:`, so `https://businessday.ng@evil.example/` (userinfo spoofing) doesn't
// parse at all.
const HTTPS_URL = /^https:\/\/([^\s/?#@:]+)(?::(\d{1,5}))?(\/[^\s?#]*)?(\?[^\s#]*)?(#\S*)?$/i;

export function parseHttpsUrl(raw: string): ParsedUrl | null {
  const match = HTTPS_URL.exec(raw.trim());
  if (!match) return null;
  const host = match[1].toLowerCase();
  const port = match[2] ?? '';
  const path = match[3] ?? '';
  const search = match[4] ?? '';
  const hash = match[5] ?? '';
  return { href: `https://${host}${port ? `:${port}` : ''}${path}${search}${hash}`, host, port, path: path || '/', search, hash };
}

function isBusinessDayHost(host: string): boolean {
  // Exact match — a prefix or suffix test would also accept lookalikes such as businessday.ng.evil.example.
  return host === 'businessday.ng' || host === 'www.businessday.ng';
}

function isArticleLink(url: ParsedUrl): boolean {
  if (!url.path.includes('/article/')) return false;
  if (url.path.includes('/search-page/') || url.path.includes('/tag/') || url.path.includes('/category/')) return false;
  if (/(^|&)s=/.test(url.search.replace(/^\?/, '')) || url.hash.includes('gsc.q=')) return false;
  return true;
}

// null = not safe to link at all (not https / malformed), so the caller renders the text without a link.
export function classifyLink(href: string): { url: string; kind: LinkKind } | null {
  const parsed = parseHttpsUrl(href);
  if (!parsed) return null;
  // An explicit port on the BusinessDay host is never the real site, so it isn't trusted as an article.
  const isOurArticle = isBusinessDayHost(parsed.host) && parsed.port === '' && isArticleLink(parsed);
  return { url: parsed.href, kind: isOurArticle ? 'article' : 'web' };
}

// ---- text helpers ----

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

// Markdown text tokens can still carry HTML entities (a model occasionally writes "&amp;"); a browser would
// decode them, React Native's <Text> won't.
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });
}

export function plainText(inlines: Inline[]): string {
  return inlines
    .map((node) => {
      switch (node.t) {
        case 'text':
        case 'code':
          return node.text;
        case 'br':
          return ' ';
        default:
          return plainText(node.children);
      }
    })
    .join('');
}

// ---- token walking ----

function inlinesFrom(tokens: Token[] | undefined): Inline[] {
  const out: Inline[] = [];
  for (const token of tokens ?? []) {
    switch (token.type) {
      case 'text': {
        const t = token as Tokens.Text;
        if (t.tokens && t.tokens.length > 0) out.push(...inlinesFrom(t.tokens));
        else out.push({ t: 'text', text: decodeEntities(t.text) });
        break;
      }
      case 'escape':
        out.push({ t: 'text', text: (token as Tokens.Escape).text });
        break;
      case 'strong':
        out.push({ t: 'strong', children: inlinesFrom((token as Tokens.Strong).tokens) });
        break;
      case 'em':
        out.push({ t: 'em', children: inlinesFrom((token as Tokens.Em).tokens) });
        break;
      case 'del':
        out.push({ t: 'del', children: inlinesFrom((token as Tokens.Del).tokens) });
        break;
      case 'codespan':
        out.push({ t: 'code', text: (token as Tokens.Codespan).text });
        break;
      case 'br':
        out.push({ t: 'br' });
        break;
      case 'link': {
        const t = token as Tokens.Link;
        const children = inlinesFrom(t.tokens);
        const link = classifyLink(t.href);
        // Unsafe/unparseable target: keep what the reader would have seen, minus the link.
        if (link) out.push({ t: 'link', href: link.url, kind: link.kind, children });
        else out.push(...children);
        break;
      }
      case 'image': {
        // Never fetch a model-supplied image URL (tracking pixel / data exfiltration); show its alt text.
        const alt = (token as Tokens.Image).text;
        if (alt) out.push({ t: 'text', text: decodeEntities(alt) });
        break;
      }
      case 'html': {
        // No raw HTML reaches the screen. A stray <br> is the one thing worth honouring.
        if (/^<br\s*\/?>$/i.test((token as Tokens.HTML).text.trim())) out.push({ t: 'br' });
        break;
      }
      default: {
        const text = (token as { text?: unknown }).text;
        if (typeof text === 'string') out.push({ t: 'text', text: decodeEntities(text) });
      }
    }
  }
  return out;
}

function isBlank(node: Inline): boolean {
  return node.t === 'br' || (node.t === 'text' && node.text.trim() === '');
}

function trimRun(run: Inline[]): Inline[] {
  const out = run.slice();
  while (out.length > 0 && isBlank(out[0])) out.shift();
  while (out.length > 0 && isBlank(out[out.length - 1])) out.pop();
  const first = out[0];
  if (first && first.t === 'text') out[0] = { t: 'text', text: first.text.replace(/^\s+/, '') };
  const last = out[out.length - 1];
  if (last && last.t === 'text') out[out.length - 1] = { t: 'text', text: last.text.replace(/\s+$/, '') };
  return out;
}

// A paragraph containing a BusinessDay article link becomes: the text before it, a source card, the text
// after it — the same visual result as the website widget, where the card interrupts the sentence. Only
// links at the top level of the paragraph become cards; one nested inside bold/italic stays an inline link.
//
// Punctuation that belonged to the sentence the link ended ("...see [the report](url). This shift...") is
// dropped from the start of the text after a card, and a run that is nothing but punctuation is dropped
// entirely — otherwise the card would be followed by a stray "." on a line of its own.
function paragraphBlocks(inlines: Inline[]): Block[] {
  const out: Block[] = [];
  let run: Inline[] = [];
  let afterCard = false;
  const flush = () => {
    let trimmed = trimRun(run);
    if (afterCard && trimmed.length > 0) {
      const first = trimmed[0];
      if (first.t === 'text') {
        const stripped = first.text.replace(/^[.,;:!?]+\s*/, '');
        trimmed = stripped ? [{ t: 'text', text: stripped }, ...trimmed.slice(1)] : trimmed.slice(1);
      }
    }
    if (trimmed.length > 0) out.push({ t: 'paragraph', children: trimmed });
    run = [];
  };
  for (const node of inlines) {
    if (node.t === 'link' && node.kind === 'article') {
      flush();
      out.push({ t: 'sourceCard', href: node.href, title: plainText(node.children).trim() || 'Source article' });
      afterCard = true;
    } else {
      run.push(node);
    }
  }
  flush();
  return out;
}

function blocksFrom(tokens: Token[] | undefined): Block[] {
  const out: Block[] = [];
  for (const token of tokens ?? []) {
    switch (token.type) {
      case 'space':
      case 'def':
      case 'html':
        break;
      case 'paragraph':
        out.push(...paragraphBlocks(inlinesFrom((token as Tokens.Paragraph).tokens)));
        break;
      case 'text': {
        // Block-level "text" appears inside tight list items.
        const t = token as Tokens.Text;
        out.push(...paragraphBlocks(t.tokens ? inlinesFrom(t.tokens) : [{ t: 'text', text: decodeEntities(t.text) }]));
        break;
      }
      case 'heading': {
        const t = token as Tokens.Heading;
        out.push({ t: 'heading', depth: t.depth, children: inlinesFrom(t.tokens) });
        break;
      }
      case 'list': {
        const t = token as Tokens.List;
        out.push({
          t: 'list',
          ordered: t.ordered,
          start: typeof t.start === 'number' ? t.start : 1,
          items: t.items.map((item) => blocksFrom(item.tokens)),
        });
        break;
      }
      case 'blockquote':
        out.push({ t: 'quote', children: blocksFrom((token as Tokens.Blockquote).tokens) });
        break;
      case 'code':
        out.push({ t: 'code', text: (token as Tokens.Code).text });
        break;
      case 'table': {
        const t = token as Tokens.Table;
        out.push({
          t: 'table',
          header: t.header.map((cell) => inlinesFrom(cell.tokens)),
          rows: t.rows.map((row) => row.map((cell) => inlinesFrom(cell.tokens))),
        });
        break;
      }
      case 'hr':
        out.push({ t: 'rule' });
        break;
      default: {
        const text = (token as { text?: unknown }).text;
        if (typeof text === 'string' && text.trim()) out.push({ t: 'paragraph', children: [{ t: 'text', text: decodeEntities(text) }] });
      }
    }
  }
  return out;
}

// Never throws: if lexing somehow fails, the reader still gets the words.
export function parseMarkdown(source: string): Block[] {
  try {
    return blocksFrom(Lexer.lex(source, { gfm: true, breaks: true }));
  } catch {
    const text = source.trim();
    return text ? [{ t: 'paragraph', children: [{ t: 'text', text }] }] : [];
  }
}
