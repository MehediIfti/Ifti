# Ifti

Personal notebook site: notes, a monthly now page, work and bookshelf.

Single static file (`index.html`), served with GitHub Pages.

**Monthly update:** edit the block marked `MONTHLY UPDATE` in `index.html` and the "Updated" date in the sidebar.

**Stats radar:** edit the `STATS UPDATE` array in the script at the bottom of `index.html`. Each row is `[chart label, full name, strength, interest]`, scored 0–100. OVR, MVP and Grinding are calculated from it.

**Calendar activity:** the `ACTIVITY UPDATE` block holds meetings per day from the calendar (counts only, no titles). `from` is the first day (a Sunday); each row of `counts` is one week.

**Note tags:** each note's `<article>` has a `data-tags` attribute (space-separated). Tags show in the note's Properties block, and notes that share a tag link to each other in the right column's local graph and linked mentions.

**Research:** the `RESEARCH UPDATE` block in `index.html`. One `<li>` per paper, newest first; each card links to the paper's DOI. The index tiles (Research Interest, citations, h-index, papers, preprints, first author) are copied from ResearchGate by hand.

**Education:** the `EDUCATION UPDATE` block in `index.html`, one `<li>` per school, newest first. It sits under the Academia heading in the left rail with Research.

**Playground:** agent and workflow pages (Paperclip, Hermes Agent), under the Playground heading in the left rail, above Academia. On phones, the tab bar's More button opens the full index with Playground and Academia.
