<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Local development

Node.js 22 and npm are on the PATH in login shells. The app is Next.js with a checked-in SQLite database at `prisma/dev.db`.

`DATABASE_URL` must be `file:./dev.db`. Prisma resolves that path from the `prisma/` directory. Create `.env` with that value before `prisma` or `next` commands. `.env` is gitignored.

```bash
npm ci
npx prisma generate
npm run dev -- --hostname 0.0.0.0 --port 3000
```

`npm run lint` is the linter. `npm run build` is the production build and typecheck. There is no test script.
