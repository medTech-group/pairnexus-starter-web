# pairnexus-starter-web

A small notes app to start your own project from: write a note, save it, and see it in the list.
To try it, open the try-it link on any pull request (it appears once Cloudflare is connected).
New to building? Start with the workflow kit's quickstart, in [the kit's README](https://github.com/medTech-group/pairnexus-workflow#readme).

There is no live site yet: nothing is published at a public address. That comes later.

## A map of the code

| Where | What it does |
|---|---|
| `src/client/` | The page you see: a form to write a note and the list of notes (React). |
| `src/worker/` | The server: `GET /api/notes` lists the notes, `POST /api/notes` saves one (Hono, on a Cloudflare Worker). |
| `migrations/` | The database's tables, one numbered file per change (D1, Cloudflare's database). |
| `wrangler.toml` | The Worker's settings: its name, the page it serves and its database. |
| `tests/` | The checks: `api.test.ts` tries the server, `e2e/` uses the page in a browser. |

A note has an id, its text (up to 5000 characters) and the time it was made. An empty note is refused with a plain message.

## Running it on your computer

You need Node.js 22 or later. No Cloudflare account is needed: everything runs locally.

```sh
npm ci                           # install
npm run dev                      # build the page, set up the local database, open http://localhost:8787
npm run typecheck                # check the types
npm test                         # the server's checks (Vitest, in Cloudflare's Workers runtime)
npx playwright install chromium  # once, for the browser check
npm run test:e2e                 # the browser check (Playwright)
```

The local database lives in `.wrangler/`; delete that folder to start again with no notes.
