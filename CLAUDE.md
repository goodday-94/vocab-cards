# CLAUDE.md — vocab-cards project instructions

## Working rules

1. **Always ask for permission before making changes.**
   Show what you plan to change, wait for confirmation, and only proceed after the user approves.

2. **Never commit or push.**
   The user handles all git commits and pushes. Do not run `git commit` or `git push`.

3. **Ask when unclear. Code only when clear.**
   If anything is ambiguous, ask first. Get full clarity before writing any code.

## Vocabulary generation rules

When asked to generate a new topic JSON file, always follow this workflow:

1. **Show a simple list first** — word, IPA, Chinese. Wait for user to confirm, remove, or change words before creating the JSON.
2. **Only create the JSON after confirmation.**

### Word rules
- **UK English only** — spelling and pronunciation (e.g. "colour", not "color"; IPA must reflect British pronunciation)
- **Level: B1–B2** (between Intermediate and Upper-intermediate) — practical real-life words the user doesn't already know; avoid very basic vocabulary
- **Mix word types** — not only nouns; include adjectives, verbs, and phrasal verbs
- **Include common combinations (collocations)** — e.g. "make a complaint", "run out of" — collocations have no IPA and no pronunciation audio, just the Chinese meaning
- **~12 items per topic** — mix of single words and collocations
- **Aim for 100+ items per topic** — think like a native English-speaking adult who knows this topic well. Before writing the list, mentally walk through every angle: types/varieties, parts/components, actions/verbs, describing words/adjectives, people/roles, tools/equipment, situations/contexts, feelings, common problems, and everyday phrases. A shallow first pass will miss most of the real vocabulary. Push past the obvious nouns. A native adult's vocabulary on any familiar topic easily reaches 100+ words — match that depth.

### JSON format reminder
- Single words: include `word`, `ipa`, `chinese`, `svg`
- Collocations: include `word` (the phrase), `chinese` only — no `ipa`, no `svg` (use empty string `""` for svg)
