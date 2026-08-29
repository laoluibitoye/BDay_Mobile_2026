import type { Article } from '../data/types';
import type { LanguageCode } from '../data/languages';
import { getArticleEntitlement } from './api/entitlement';
import { htmlToParagraphs } from './htmlToText';
import { getSpeakingState, toggleSpeak } from './tts';

// Bug found live: ArticleCard/HeroArticleCard's "Listen" button read only the headline + dek
// (the card's own preview copy) instead of the article, since a feed card only ever holds that
// preview — full body text is fetched lazily by ArticleReaderScreen via the entitlement endpoint,
// same as ArticleReaderScreen.tsx's own `listen`. This does that same fetch from a card, so a
// reader never has to open the article just to listen to it.
export async function listenToArticle(
  article: Article,
  language: LanguageCode | undefined,
  onLoadingChange?: (loading: boolean) => void
): Promise<void> {
  // Toggling off the article already speaking needs no fetch — matches tts.ts's own toggle rule.
  if (getSpeakingState()?.id === article.id) {
    toggleSpeak(article.id, '', article.headline, language);
    return;
  }

  onLoadingChange?.(true);
  try {
    const entitlement = await getArticleEntitlement(article.id);
    const isLocked = entitlement.stage !== 'open';
    const html = (isLocked ? entitlement.preview : entitlement.content) ?? '';
    const paragraphs = htmlToParagraphs(html);
    const text = paragraphs.length > 0 ? `${article.headline}. ${paragraphs.join(' ')}` : `${article.headline}. ${article.dek}`;
    toggleSpeak(article.id, text, article.headline, language);
  } catch {
    // Network failure — fall back to what's already on hand rather than doing nothing.
    toggleSpeak(article.id, `${article.headline}. ${article.dek}`, article.headline, language);
  } finally {
    onLoadingChange?.(false);
  }
}
