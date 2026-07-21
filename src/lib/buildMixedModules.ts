import { Article, TodayModule } from '../data/types';

// Cycles through the same module vocabulary the (WP-admin-curated) Today feed uses — hero,
// brief rail, section label, card list, tile grid, text list — so that any long list of articles
// (a taxonomy archive, a generated Today extension) reads as a varied magazine layout instead of
// one repeated card style. design.md §6 catalogs each module; this just sequences them.
export function buildMixedModules(pool: Article[], label: string): TodayModule[] {
  const modules: TodayModule[] = [];
  let i = 0;
  let cycle = 0;

  while (i < pool.length) {
    const remaining = pool.length - i;
    const step = cycle % 5;

    if (step === 0 && remaining >= 1) {
      modules.push({ type: 'hero', articleId: pool[i].id });
      i += 1;
    } else if (step === 1 && remaining >= 3) {
      modules.push({ type: 'briefRail', label: `More from ${label}`, articleIds: pool.slice(i, i + 3).map((a) => a.id) });
      i += 3;
    } else if (step === 2 && remaining >= 2) {
      modules.push({ type: 'tileGrid', label: `${label} highlights`, articleIds: pool.slice(i, i + 2).map((a) => a.id) });
      i += 2;
    } else if (step === 3 && remaining >= 4) {
      modules.push({ type: 'textList', label: `Also in ${label}`, articleIds: pool.slice(i, i + 4).map((a) => a.id) });
      i += 4;
    } else {
      const take = Math.min(3, remaining);
      modules.push({ type: 'cardList', articleIds: pool.slice(i, i + take).map((a) => a.id) });
      i += take;
    }
    cycle += 1;
  }

  return modules;
}
