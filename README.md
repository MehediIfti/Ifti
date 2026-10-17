# Ifti

Personal notebook site: notes, a monthly now page, work and bookshelf.

Single static file (`index.html`), served with GitHub Pages.

**Monthly update:** edit the block marked `MONTHLY UPDATE` in `index.html` and the "Updated" date in the sidebar.

**Stats radar:** edit the `STATS UPDATE` array in the script at the bottom of `index.html`. Each row is `[chart label, full name, strength, interest]`, scored 0–100. OVR, MVP and Grinding are calculated from it.

**Calendar activity:** the `ACTIVITY UPDATE` block holds meetings per day from the calendar (counts only, no titles). `from` is the first day (a Sunday); each row of `counts` is one week.

**Note tags:** each note's `<article>` has a `data-tags` attribute (space-separated). Tags show in the note's Properties block, and notes that share a tag link to each other in the right column's local graph and linked mentions.

**Research:** the `RESEARCH UPDATE` block in `index.html`. One `<li>` per paper, newest first; each card links to the paper's DOI. The index tiles (publications, citations, h-index, first author, co-authors, active years) are typed in by hand, and citation counts come from Crossref.
