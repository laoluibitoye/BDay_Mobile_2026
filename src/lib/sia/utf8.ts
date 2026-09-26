// Boundary-safe UTF-8 decoding for a streamed response body.
//
// A fetch ReadableStream hands back raw bytes in arbitrary-sized pieces, so a multi-byte character can
// be split across two reads — and Sia's replies are full of them: the Naira sign (₦) is 3 bytes, and so
// are em dashes and curly quotes; an emoji is 4. Decoding each piece on its own would turn one split
// character into two replacement characters. React Native's TextDecoder is documented as "not
// spec-compliant" on native platforms, and whether it honours `{ stream: true }` isn't something to bet a
// currency symbol on — so this holds back an incomplete trailing sequence itself and only ever decodes
// whole characters. Deliberately free of any React Native import so it can be tested directly under Node.

const REPLACEMENT = 0xfffd;
const BATCH = 4096;

// Decodes UTF-8 exactly the way the WHATWG standard (and so `TextDecoder`) does, including for malformed
// input: a bad or truncated sequence becomes one U+FFFD per "maximal subpart" and decoding carries on. It
// never throws, since a garbled byte shouldn't abort an answer the reader is mid-way through.
export function decodeUtf8(bytes: Uint8Array): string {
  const parts: string[] = [];
  let batch: number[] = [];
  const flush = () => {
    if (batch.length > 0) {
      parts.push(String.fromCodePoint(...batch));
      batch = [];
    }
  };

  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    let codePoint = REPLACEMENT;
    let used = 1;

    if (b0 < 0x80) {
      codePoint = b0;
    } else {
      // Sequence length, the payload bits of the lead byte, and the allowed range of the *second* byte
      // (that's where overlong forms, UTF-16 surrogates and values above U+10FFFF are excluded).
      let needed = 0;
      let payload = 0;
      let lo = 0x80;
      let hi = 0xbf;
      if (b0 >= 0xc2 && b0 <= 0xdf) {
        needed = 2;
        payload = b0 & 0x1f;
      } else if (b0 >= 0xe0 && b0 <= 0xef) {
        needed = 3;
        payload = b0 & 0x0f;
        if (b0 === 0xe0) lo = 0xa0;
        if (b0 === 0xed) hi = 0x9f;
      } else if (b0 >= 0xf0 && b0 <= 0xf4) {
        needed = 4;
        payload = b0 & 0x07;
        if (b0 === 0xf0) lo = 0x90;
        if (b0 === 0xf4) hi = 0x8f;
      }

      if (needed > 0) {
        let j = 1;
        for (; j < needed; j++) {
          const b = bytes[i + j];
          if (b === undefined || b < (j === 1 ? lo : 0x80) || b > (j === 1 ? hi : 0xbf)) break;
          payload = (payload << 6) | (b & 0x3f);
        }
        if (j === needed) {
          codePoint = payload;
          used = needed;
        } else {
          used = j; // the valid prefix (lead byte + good continuation bytes) collapses into ONE replacement
        }
      }
    }

    batch.push(codePoint);
    i += used;
    if (batch.length >= BATCH) flush();
  }
  flush();
  return parts.join('');
}

// How many leading bytes of `data` end on a character boundary — i.e. everything except a trailing
// lead byte that is still waiting for its continuation bytes.
function completeLength(data: Uint8Array): number {
  const length = data.length;
  for (let back = 1; back <= 3 && back <= length; back++) {
    const byte = data[length - back];
    if ((byte & 0xc0) === 0x80) continue; // a continuation byte — keep looking for its lead byte
    const needed = byte >= 0xf0 && byte <= 0xf4 ? 4 : byte >= 0xe0 && byte <= 0xef ? 3 : byte >= 0xc2 && byte <= 0xdf ? 2 : 1;
    return needed > back ? length - back : length;
  }
  return length;
}

export class Utf8StreamDecoder {
  private pending: Uint8Array = new Uint8Array(0);

  // Returns the text for every *complete* character received so far; an incomplete trailing sequence is
  // held back until the next push() (or flush()).
  push(chunk: Uint8Array): string {
    let data = chunk;
    if (this.pending.length > 0) {
      data = new Uint8Array(this.pending.length + chunk.length);
      data.set(this.pending, 0);
      data.set(chunk, this.pending.length);
    }
    const end = completeLength(data);
    // slice() copies: a stream may reuse its chunk buffer, so a held-back tail can't be a view of it.
    this.pending = end < data.length ? data.slice(end) : new Uint8Array(0);
    return decodeUtf8(data.subarray(0, end));
  }

  // Call once the stream has ended. Whatever is left was never completed, so it decodes to U+FFFD.
  flush(): string {
    const rest = this.pending;
    this.pending = new Uint8Array(0);
    return rest.length > 0 ? decodeUtf8(rest) : '';
  }
}
