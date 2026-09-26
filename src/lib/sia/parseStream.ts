// Splits Sia's streamed reply into the answer the reader sees and the follow-up questions appended after
// it. Sia's backend ends every answer with a `<followups>…</followups>` block (see its persona prompt); the
// website widget parses it the same way (assets/js/sia-script.js), so the two clients read one contract.
// Pure — no React Native imports.

export const FOLLOWUP_OPEN = '<followups>';
export const FOLLOWUP_CLOSE = '</followups>';

const MAX_FOLLOWUPS = 4;
const MAX_FOLLOWUP_CHARS = 140;

// While streaming, a trailing partial tag ("…answer <follo") is held back so it never flashes on screen
// between two chunks; once the stream has ended `streaming` is false and nothing is held back.
export function splitStream(accumulated: string, streaming: boolean): { visible: string; followups: string } {
  const start = accumulated.indexOf(FOLLOWUP_OPEN);
  if (start === -1) {
    let visible = accumulated;
    if (streaming) {
      for (let n = Math.min(FOLLOWUP_OPEN.length - 1, accumulated.length); n > 0; n--) {
        if (FOLLOWUP_OPEN.startsWith(accumulated.slice(-n))) {
          visible = accumulated.slice(0, -n);
          break;
        }
      }
    }
    return { visible, followups: '' };
  }

  const end = accumulated.indexOf(FOLLOWUP_CLOSE, start);
  return {
    visible: accumulated.slice(0, start),
    followups: accumulated.slice(start + FOLLOWUP_OPEN.length, end === -1 ? undefined : end),
  };
}

// The model sometimes headlines a section "Complementary Keywords"; the website widget rewrites it and so
// does the app, so a reader sees the same wording on both.
//
// It also ends some answers with its own "Sia is an AI assistant; verify critical data independently." —
// sometimes before the follow-ups block, sometimes after it (where it never reaches the screen), sometimes
// not at all, so it can't be relied on. The chat UI shows that line as a fixed footer instead, and the
// model's copy is removed here so a reader never sees it twice.
const MODEL_DISCLAIMER = /\s*Sia is an AI assistant; verify critical data independently\.?\s*$/i;

export function cleanText(text: string): string {
  return text.replace(/Complementary Keywords/gi, 'Relevant Keywords').replace(MODEL_DISCLAIMER, '');
}

// "- What next for inflation?" / "1. Who is affected?" -> plain question text, a handful at most.
export function parseFollowups(block: string): string[] {
  const questions: string[] = [];
  for (const line of block.split('\n')) {
    const clean = line.replace(/^\s*[-*\d.()]+\s*/, '').trim();
    if (clean.length > 3 && questions.length < MAX_FOLLOWUPS) {
      questions.push(clean.slice(0, MAX_FOLLOWUP_CHARS));
    }
  }
  return questions;
}
