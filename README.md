# Relay — Admin Dashboard (Next.js)

Portfolio review copy of an administrator interface built with Next.js, React and TypeScript. Connects to the Relay backend API for authentication, users, workspaces and dashboard views.

## Tech stack
- Next.js App Router / React / TypeScript
- Tailwind CSS
- REST API integration with the Relay backend

## Local setup
1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to your own backend address.
3. Run `npm run dev` and open the printed localhost URL.
4. Start the backend separately.

## Security / publication notes
- The sample login email is fictitious. The browser token-storage implementation is preserved from the source and should undergo security review before real-world deployment.
- All committed URLs are localhost examples, not production infrastructure.
- Git history is intentionally not included. Do not publish without checking ownership and any private business logic.
- This has not been verified with a running backend.
