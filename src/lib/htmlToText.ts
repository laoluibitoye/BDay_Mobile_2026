// Minimal WP post-content HTML → plain-text paragraphs. Good enough for rendering article bodies
// fetched from AeroPaywall's entitlement endpoint (which returns `content` as raw WP HTML, not
// pre-split paragraphs the way mock data is authored) without pulling in a full HTML-rendering
// dependency. Block-level tags become paragraph breaks; everything else is stripped.
export function htmlToParagraphs(html: string): string[] {
  return html
    .replace(/<(p|div|h[1-6]|li|br)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((p) =>
      p
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#8216;/g, '‘')
        .replace(/&#8217;/g, '’')
        .replace(/&#8220;/g, '“')
        .replace(/&#8221;/g, '”')
        .replace(/&#039;|&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        // wp_trim_words()'s default "more" marker on a truncated preview — undecoded, this
        // leaked through literally as "...and&hellip;" at the end of the locked-article preview.
        .replace(/&hellip;/g, '…')
        .trim()
    )
    .filter((p) => p.length > 0);
}

// A locked article shows only a short taste before the register/profile/paywall card: this many
// lines on screen, however big the reader has set the text. Lines rather than words because a
// word count means a different amount of article at each text size — and because a short article
// must never fit entirely inside its own preview. The server's preview is much longer (the
// site-wide "preview word count", 120 by default, shared with the website), so the app trims it.
export const LOCKED_PREVIEW_LINES = 3;

// The same taste as text, for the paths that never show the on-screen lines — read-aloud above
// all, which would otherwise speak the server's whole preview and hand the reader far more than
// the three lines shown. Sized to what three lines hold at the smallest text setting; the screen
// still clamps to LOCKED_PREVIEW_LINES, so at larger sizes less than this is visible.
const LOCKED_PREVIEW_MAX_WORDS = 25;

export function lockedPreviewText(paragraphs: string[]): string {
  const words = paragraphs.join(' ').split(/\s+/).filter(Boolean);
  if (words.length <= LOCKED_PREVIEW_MAX_WORDS) return words.join(' ');
  return `${words.slice(0, LOCKED_PREVIEW_MAX_WORDS).join(' ')}…`;
}
