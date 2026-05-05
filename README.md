# Vocab Cards

Visual vocabulary learning app. Each word card shows an illustration, IPA, Chinese meaning, and click-to-hear UK pronunciation.

Live: [goodday-94.github.io/vocab-cards](https://goodday-94.github.io/vocab-cards)

---

## Run locally

Requires a local server (plain `file://` won't work).

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Or in VS Code: install **Live Server**, right-click `index.html` → Open with Live Server.

---

## Edit cards in the browser

The app can save edits directly to GitHub — no local setup needed.

**Get a GitHub token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → select `repo` scope → copy it

**Use it in the app:**
1. Click the 🔑 button (top-left of sidebar)
2. Paste your token — it's stored in session only, never saved
3. An **Edit** button appears on the current topic
4. Edit or delete any card, drag to reorder, then hit **Save to GitHub**

---

## Add a new topic

### 1. Create the data file

Add `data/TOPICNAME.json`:

```json
{
  "topic": "kitchen",
  "title": "Kitchen",
  "words": [
    {
      "word": "ladle",
      "type": "noun",
      "ipa": "/ˈleɪ.dəl/",
      "chinese": "长柄勺",
      "svg": "<svg viewBox='0 0 100 80' xmlns='http://www.w3.org/2000/svg'>...</svg>"
    },
    {
      "word": "chop finely",
      "type": "phrase",
      "chinese": "切碎",
      "svg": ""
    }
  ]
}
```

Word types: `noun`, `verb`, `adj`, `phrase`. Phrases have no `ipa` and `"svg": ""`.

### 2. Register in `data/topics.json`

```json
{ "id": "kitchen", "title": "Kitchen", "icon": "🍳", "count": 12, "updatedAt": "2026-05-05" }
```

### 3. Push

```bash
git add data/
git commit -m "Add kitchen topic"
git push
```

---

## Generate a new topic with AI

Ask Claude (or any AI) with this prompt:

```
Generate a vocabulary JSON file for my vocab app on the topic: [TOPIC NAME].

Rules:
- UK English spelling and IPA pronunciation
- B1–B2 level (practical, not too basic)
- 100+ items total: mix nouns, verbs, adjectives, and phrases
- For each word: "word", "type" (noun/verb/adj/phrase), "ipa", "chinese", "svg"
- SVG viewBox="0 0 100 80" — draw a simple illustration of the word
- For phrases: no "ipa", set "svg": ""
- Include collocations like "run out of", "make a decision"

Output the full JSON only, no explanation.

Format reference:
{ "topic": "kitchen", "title": "Kitchen", "words": [ ... ] }
```

Then drop the file into `data/` and add an entry to `data/topics.json`.
