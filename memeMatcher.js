function pickRandom(items) {
  if (!items || items.length === 0) {
    return null;
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

export async function createMemeMatcher(url) {
  const response = await fetch(url);
  const entries = await response.json();

  function resolveCandidates(activeTags) {
    const tagSet = new Set(activeTags);
    const matches = entries.filter((entry) => entry.tags.every((tag) => tagSet.has(tag)));
    if (matches.length > 0) {
      return matches;
    }
    const neutral = entries.filter((entry) => entry.tags.includes("neutral"));
    return neutral.length > 0 ? neutral : entries;
  }

  return {
    pickMeme(activeTags) {
      return pickRandom(resolveCandidates(activeTags));
    },
  };
}
