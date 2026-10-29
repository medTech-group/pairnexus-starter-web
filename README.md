# pairnexus-starter-web

A small notes app to start your own project from: write a note, save it, and see it in the list.

To try it, open the try-it link on any pull request (it appears once Cloudflare is connected).

New to building? Start with the workflow kit's quickstart, in [the kit's README](https://github.com/medTech-group/pairnexus-workflow#readme).

There is no live site yet: nothing is published at a public address. That comes later.

## A map of the code

| Where | What it does |
|---|---|
| `src/client/` | The page you see: a box to write a note, a button to save it, and the list of notes. |
| `src/worker/` | The server: it hands the page the list of notes, and saves each new one. |
| `src/shared/` | What a note looks like, used by both the page and the server. |
| `migrations/` | How the notes are stored, one numbered file per change. |
| `wrangler.toml` | The app's settings for Cloudflare: its name, the page it shows and where notes are stored. |
| `tests/` | The checks: `api.test.ts` tries the server on its own, `e2e/` uses the page in a browser. |

A note has a number, its text (up to 5000 characters) and the time it was made. An empty note is refused with a plain message.

The tools, for the curious: the page is made with React and Vite, the server with Hono on a Cloudflare Worker, and notes are kept in D1, Cloudflare's database.

## Running it on your computer

You need Node.js 22 or later. No Cloudflare account is needed: everything runs locally.

```sh
npm ci                           # install
npm run dev                      # build the page, set up the local database, open http://localhost:8787
npm run typecheck                # check the code for mistakes before running it
npm test                         # the server's checks
npx playwright install chromium  # once, for the browser check
npm run test:e2e                 # the browser check (Playwright)
```

The local database lives in `.wrangler/`; delete that folder to start again with no notes.
