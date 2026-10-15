# AGENTS.md: the documentation standard

How to write the prose that stays: the documents under `docs/`, the comments that explain a design decision, and the commit messages that record a change. [AGENTS.md](../AGENTS.md) owns the engineering rules; this file owns the writing.

## Where a fact belongs

One fact, one home. A second copy is how the two drift apart.

* [docs/index.md](./index.md) holds the entry point: what the console homepage is and the index of this documentation.
* [docs/quick_start.md](./quick_start.md) holds the tasks: running locally, adding or changing a command, authoring content pages, front matter, variable substitution, and site metadata.
* [docs/architecture.md](./architecture.md) holds the design: principles, repository layout, module responsibilities, execution flows, and built-in shell commands.
* [docs/ai_chat.md](./ai_chat.md) holds the AI assistant: model selection, the `ai:` configuration block, the consent and loading flow, admin commands, and browser requirements.
* [docs/knowledge_base.md](./knowledge_base.md) holds the retrieval engine: indexing, ranking, PDF registration, and the debugging API.
* [docs/deployment.md](./deployment.md) holds publishing: the deploy script, manual push, GitHub Pages settings, and deploy troubleshooting.
* [docs/yaml_parser.md](./yaml_parser.md) holds the contract of `scripts/yaml-parser.js`: the supported subset and its limits.
* [docs/markdown_parser.md](./markdown_parser.md) holds the contract of `scripts/markdown-parser.js`: the syntax it converts, what it does not support, and the test fixture.
* [README.md](../README.md) holds the front door for site users: a short overview and pointers, nothing deep.
* [console.config.yaml](../console.config.yaml) holds the live commands, site metadata, and AI settings. Documents explain how to edit it; none of them copy its lists.
* [content/](../content) holds the site text, one page per command; [help.md](../content/help.md) is the command list users see at `/help`.
* `scripts/` and `styles/` hold the implementation. Header comments explain why a design decision was made; documents state what it does.

## Writing rules

Write for a maintainer who knows the web stack and has not read the engine code. Plain English beats metaphor. Parser references have to be precise and complete.

Document the current state, not the change history. Avoid "previously", "now", and "no longer", and do not cite commits or branches in durable prose; name the live mechanism instead. The commit message records the change.

State the contract: what holds, under which conditions, and what happens when the conditions fail. Parser limitations and the behavior of disabled AI chat are contracts worth stating exactly.

One rule per paragraph. Bold marks the clause that changes behavior and nothing else. Numbers carry their provenance: "the injected context is capped at 1500 characters (`getRelevantContext` in `scripts/knowledge.js`)" is a claim; "the context is short" is not.

Keep the prose concise. Do not append a clarifying clause to every sentence.

## Use natural writing

Use [natural writing](https://github.com/flutter/flutter/blob/fdf8a01bd014798113aa59ac5b4fd3c30573d9eb/.agents/agents/reidbaker-agent/skills/natural-writing/SKILL.md). For example, avoid:

* Puffery ("a testament to", "a pivotal moment").
* Dangling commentary ("highlighting", "reflecting", "showcasing").
* Promotional verbs ("boasts", "features", "leverages", "ensures").
* Copula inflation ("serves as" where "is" is meant).
* Negative parallelism ("not only X but also Y").
* Three adjectives chosen for rhythm.
* False ranges, where "from X to Y" spans nothing.
* Elegant variation: repeat the name instead of finding a synonym.
* Weasel attribution ("it is generally accepted").
* A closing paragraph that speculates about future work; end on the last fact.
* Overused punctuation (curly quotes and en- and em-dashes).

## Formatting

One physical line per paragraph; let the editor soft-wrap. Code blocks, tables, and list structure keep their formatting.

Sentence case headers. Plain `*` bullets, no emoji in prose; sample output inside code blocks keeps whatever the program prints. Straight quotes and apostrophes. Em dashes sparingly; commas and parentheses usually do the same work.

`**Title**:` may open a list item or a paragraph that needs a short title. Tables only where the data is tabular; two facts are a sentence.

Code blocks carry a shell invocation, a YAML snippet that matches the parser's supported subset, a JavaScript call that exists, or sample program output. Every block must be true, because a reader will paste it.

Link with relative paths that resolve, as [quick_start.md](./quick_start.md) inside `docs/` or [console.config.yaml](../console.config.yaml) at the root. Never a bare filename.

## Commit messages

Use the imperative mood: "Add a /blog command", not "Added a /blog command". Explain what changed and why; the diff carries the mechanics.

## The slop checklist

Hunt these in any document you touch. Four are mechanical, so grep first: temporal words ("now", "currently", "previously", "no longer", "used to"), a distinctive phrase from a rule you stated, `**` runs beyond a term's first mention or a small title, and a number with no measurement behind it.

* The same rule stated in two homes. Keep one, link the other.
* Narrated history in durable prose: "previously", "was renamed", a commit cited as a fact about the code.
* Status annotations: "implemented", "planned", "future work". Status rots; name the live behavior instead.
* A hand-maintained inventory that the tree already carries. Model options live in `console.config.yaml`, the command list in `content/help.md`, index statistics come from `knowledgeBase.getStats()`; name where it lives instead of copying it.
* Reasoning transcripts: derivations, alternatives weighed, a walkthrough of a test. Keep the contract.
* The same rationale repeated beside each of several sibling functions. State it once, at the thing they share.
* Paragraph walls: one paragraph carrying several rules and an aside. Split it, or demote the detail to the document that owns it.
* Emphasis inflation. Bold, CAPS, and "critically" everywhere mean nothing stands out.
* A table built for two rows, or a bulleted list of one.
* Numbers with no provenance, and percentages whose denominator is not stated.

Two failures survive every grep, so read the diff for them: a paragraph that grew a second subject, and a passage explaining how you got there rather than what holds.

## Length

Relocate first, condense second, accept the length third.
