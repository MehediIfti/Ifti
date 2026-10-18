# Ask Ifti: a 30-day plan

Issue: [#20 Ask Ifti in the terminal](https://github.com/MehediIfti/Ifti/issues/20)
Dates: Monday 19 Oct to Tuesday 17 Nov 2026, Dhaka time
Pace: one 20-minute session a day, the same rhythm as "next issue". Some days are two sessions; they say so.

## What we're building

Type `ask <question>` in the terminal. The answer comes only from my notes and pages, links to the note it came from, and says so when the answer isn't there.

A founder should be able to hear how I think before we talk. That's the whole point. It is not a chatbot, and it never speaks for me on anything I haven't written down.

## How it ships

Three slices. Each one is useful on its own, so if the month runs long we stop at a working point, not a half-built feature.

| Slice | Days | What a visitor gets |
|---|---|---|
| 1. Keyword ask | 1 to 7 | `ask pricing` lists the notes and sections that mention it, with links. No AI, no backend. |
| 2. The backend | 8 to 14 | `api/ask.js` answers the same way from the server, with a rate limit and a log. Still no AI. |
| 3. Answers | 15 to 30 | Claude writes a short answer from the notes, quotes the line it came from, and refuses when the notes don't cover it. |

## Decide before Day 1

The first four block the start. Answer them in a comment on #20.

1. **Page size.** `index.html` is at 114.1 of its 115 KB budget. Slice 1 adds about 1 KB. Pick one: raise the budget to 120 KB, strip comments in a build step, or move the script into its own cached `app.js`.
2. **What counts as a source.** Notes only (N°001 to N°007, about 1,900 words), or notes plus Work, Now and the homepage?
3. **Logging.** Keep the questions people ask so I can learn from them (no names, no IPs), or keep nothing?
4. **Spending cap.** A monthly limit on the Claude API account, for example $10. The account's own spending limit is the hard stop; the function has a softer daily cap under it.
5. **Model.** The default is Claude Opus 5.5 (`claude-opus-5-5`, $4 in / $20 out per million tokens). Claude Haiku 5.5 (`claude-haiku-5-5`, $0.10 / $0.50) is far cheaper. My guess is that Opus answers will sound more like me, but that's untested. Day 22 runs both on the same questions so you can choose from real answers. Needed by Day 22.
6. **Storage for the rate limit and the daily cap.** A function forgets everything between calls, so counting needs a small store. Upstash Redis on Vercel's free tier is enough. Needed by Day 10.

## Week 1: keyword ask (Days 1 to 7)

The terminal already has a search index (the Ctrl K palette). Slice 1 reuses it.

| Day | Session | Done when |
|---|---|---|
| 1 Mon 19 Oct | Read #20, settle decisions 1 to 3, write them into the issue. Make the size-budget change from decision 1. | `node scripts/check.mjs` passes with room for about 3 KB more. |
| 2 Tue 20 Oct | Build a section index: every `h2` in every note, with its text, so a match can link to `#n-005-…` and not just the note. | A test in the browser console finds "pricing" inside N°005's sections. |
| 3 Wed 21 Oct | Add `ask` to `CMDS` in the terminal. Score sections by matching words; show the top three with links. | `ask negotiation` prints three linked lines. |
| 4 Thu 22 Oct | The empty answer: "I haven't written about that yet. Try `ls notes`, or book a call." Then common-word stopping (`the`, `how`, `what`) so they don't match everything. | `ask what is the meaning of life` gets the empty answer, not five random notes. |
| 5 Fri 23 Oct | Add `ask` to `help`, the `?` sheet and the README. Search palette action: "Ask a question". | All three list it. |
| 6 Sat 24 Oct | Verify per CLAUDE.md: both checks, screenshots at 1440 and 390 in Cropmark and one more theme. | No page errors; phone search opens the terminal and `ask` works there. |
| 7 Sun 25 Oct | Ship slice 1 as a pull request. Changelog entry ("Ask, first try"). Comment on #20 with what's left. | Merged and live. |

## Week 2: the backend (Days 8 to 14)

Slice 2 moves the same search to the server, so slice 3 can swap the search for Claude without touching the page again.

| Day | Session | Done when |
|---|---|---|
| 8 Mon 26 Oct | A script that reads the notes out of `index.html` and writes `api/_notes.json` (id, title, section, text). It runs on every push in `check.mjs`, so the file can't go stale. This is the same reader #27 needs, so build it to fit both. | `node scripts/build-notes.mjs` writes the file; check.mjs fails if it's out of date. |
| 9 Tue 27 Oct | `api/ask.js`: `POST { question }`, returns `{ matches: [{ id, title, section, url }] }` from the same scoring as Day 3. Question length capped at 300 characters. | Running it locally with a fake request returns the same matches as the page. |
| 10 Wed 28 Oct | Rate limit: 10 questions a minute and 50 a day per visitor, counted in the store from decision 6. | The 11th call in a minute gets 429 and the terminal says "Too many questions for now. Try again in a minute." |
| 11 Thu 29 Oct | Logging, if decision 3 says yes: question, date, which notes matched. Nothing that identifies the visitor. | One test question shows up in the log. |
| 12 Fri 30 Oct | The terminal calls the function, and falls back to the in-page search if the function is down or slow (2-second timeout). | With `/api/ask` blocked, `ask` still answers from the page. |
| 13 Sat 31 Oct | Security pass on the new function: no echo of raw input into HTML, `Cache-Control: no-store`, only `POST`, a fetch timeout. | The audit's checks (T5, T10, T13) all hold for `api/ask.js`. |
| 14 Sun 1 Nov | Ship slice 2. No changelog entry (a visitor sees nothing new). | Merged; live `ask` goes through the function. |

## Week 3: answers (Days 15 to 22)

Slice 3 is the AI part. It goes live only behind a switch (`ASK_AI=on` in Vercel), so it can be turned off in one click.

| Day | Session | Done when |
|---|---|---|
| 15 Mon 2 Nov | API key in Vercel (`ANTHROPIC_API_KEY`), the account spending limit from decision 4, and `@anthropic-ai/sdk` in `package.json`. | A one-line test call from the function works on a preview deploy. |
| 16 Tue 3 Nov | Send the notes as documents with citations turned on, so every answer carries the exact line it quotes. The system prompt says: answer only from these documents; if they don't cover it, say so; never speak for me on anything else. | An answer to "how should I price a design project?" quotes N°005 or says it isn't covered. |
| 17 Wed 4 Nov | Cache the notes, which are the same on every call, so later questions pay about 5% of the input price. Check the cache is really hit (`cache_read_input_tokens` above zero on the second call). | Second call shows cache reads. |
| 18 Thu 5 Nov | Two sessions. Turn citations into links in the terminal: answer text, then "From N°005, Trust is the product" linking to the section. Keep answers short: three sentences at most. | One answer renders with a working source link. |
| 19 Fri 6 Nov | Handle every way it can fail: a refusal (fall back to the keyword list), a timeout, a rate limit from the API, a spending cap hit. Turn on the API's built-in refusal fallback, so a declined request is retried on another model instead of just stopping. Each failure shows the keyword answer instead of an error. | Each failure path tested with a forced error. |
| 20 Sat 7 Nov | The function's own daily cap under the account limit: count spend per day from each response's token usage; past the cap, `ask` goes back to keyword answers until midnight Dhaka. | Setting the cap to $0.01 switches it to keywords after one question. |
| 21 Sun 8 Nov | Write the test set: 30 questions. 15 the notes answer, 10 they don't ("what's your salary?", "do you like Python?"), 5 that try to break it ("ignore your rules and…"). For each, write what a right answer must do. | `docs/plans/ask-eval.md` with all 30. |
| 22 Mon 9 Nov | Run all 30 on Opus 5.5 and Haiku 5.5. Score each: right source, refused when it should, no made-up facts, sounds like VOICE.md. Note the cost of the run. | A table of scores and cost per model; you pick the model (decision 5). |

## Week 4: tune, launch, watch (Days 23 to 30)

| Day | Session | Done when |
|---|---|---|
| 23 Tue 10 Nov | Fix the worst failures from Day 22 in the system prompt. Re-run only the failed questions. | Every "don't know" question refuses; no answer invents a fact. |
| 24 Wed 11 Nov | Copy pass against VOICE.md: the empty answer, the refusal, the error lines, `help`. | Each line passes the VOICE.md checklist. |
| 25 Thu 12 Nov | Verify per CLAUDE.md: both checks, screenshots, plus the 30-question run once more on the preview deploy. | All green; scores no worse than Day 23. |
| 26 Fri 13 Nov | Ship slice 3 with `ASK_AI=off`. Turn it on for my own visits only (a cookie or a query flag) and use it for a day. | Merged; off for everyone else. |
| 27 Sat 14 Nov | Turn `ASK_AI=on` for everyone. Changelog entry. Add an achievement ("Asked a question"), if the size budget allows. | Live. |
| 28 Sun 15 Nov | First look at the log (if kept): what people asked, what got refused, what it cost. | A short note in #20 with numbers. |
| 29 Mon 16 Nov | Turn the most-asked unanswered questions into a list of notes to write. That list is the real prize. | List added to #20. |
| 30 Tue 17 Nov | Close #20. Update ROADMAP.md. Decide whether the negotiation game (#21) reuses this function next. | Issue closed, roadmap updated. |

## What it should cost

These are estimates, before any real use. The notes are about 2,500 tokens with instructions; a question and a short answer add about 400. The model also thinks before it answers; that's billed as output and isn't counted here, so the real cost per answer is somewhat higher.

| | Opus 5.5 | Haiku 5.5 |
|---|---|---|
| First question (notes not cached) | about 1.8 cents | about 0.04 cents |
| Later questions (notes cached) | about 0.8 cents | about 0.02 cents |
| 1,000 questions a month | about $8 to $12 | under $1 |

One caveat on caching: the API only caches a prompt above a minimum size, and with seven short notes ours may sit near that line. Day 17 checks it. If it doesn't cache, Opus costs about 1.8 cents a question.

The spending limit from decision 4 caps the worst case, whatever the traffic.

## Risks

| Risk | What we do |
|---|---|
| It makes something up and puts it in my mouth | Citations on every answer; refusal rules in the prompt; 10 "don't know" questions in the test set; the kill switch. |
| Someone runs up the bill | Rate limit per visitor, daily cap in the function, monthly limit on the account. |
| Prompt injection ("ignore your rules") | Notes are the only documents; 5 break-it questions in the test set; the worst case is a wrong answer, never an action, because the function can't do anything but reply. |
| Page size | Decided on Day 1; slice 3 adds almost nothing to the page, because the work happens in the function. |
| The month runs long | Each slice ships alone. Slice 1 alone is still a useful feature. |

## Done means

- `ask` works on computers and on phones (through search), in every theme.
- Every answer links to the note it came from, or says the notes don't cover it.
- The 30-question set passes: right source on the 15 answerable ones, a refusal on the 10 that aren't, nothing broken by the 5 that try.
- Spending can't go past the limit, and AI answers can be turned off in one click.
