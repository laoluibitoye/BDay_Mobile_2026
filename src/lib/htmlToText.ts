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
