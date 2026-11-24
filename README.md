# Anonymous Message Website

A dark, responsive anonymous inbox built with React, Vite, Tailwind CSS, and Supabase.

## Requirements

- Node.js and npm
- A Supabase project
- A GitHub account for deployment

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Add your Supabase project URL and publishable key to `.env`.

4. Run only `supabase/migrations/202611250001_initial_messages.sql` from the Supabase SQL Editor.

5. Create an admin account in Supabase Authentication, then add the account UUID to `public.admin_users`:

   ```sql
   insert into public.admin_users (user_id)
   values ('ADMIN_AUTH_USER_UUID');
   ```

6. Deploy the rate-limit Edge Function using the steps below, then run `supabase/migrations/202611250002_server_side_rate_limit.sql` in the SQL Editor. The second migration revokes direct public inserts, so deploy the function before running it.

7. Start the app:

   ```bash
   npm run dev
   ```

Open the URL printed by Vite.

## Deploy the message rate-limit function

The public message form sends to the `submit-message` Edge Function. It permits up to five messages per source address per 10-minute window. The address is HMAC-hashed with the server-side service key; the raw address is not stored. Expired rate-limit records are removed in bounded batches.

From the project directory, use the Supabase CLI to log in, link the project, and deploy the function:

```bash
npx supabase login
npx supabase link --project-ref ivvwcuqtzeaezauazzfk
npx supabase functions deploy submit-message --no-verify-jwt
```

The function uses Supabase's server-side `SUPABASE_SERVICE_ROLE_KEY` environment variable. Never put that key into `.env`, Vite variables, or browser code.

## Security model

- `anon` and `authenticated` visitors may insert only validated message content.
- Visitors cannot select, update, or delete messages.
- The `public.admin_users` allowlist is checked by RLS policies and a server-side SQL function.
- Only allowlisted authenticated users can read, mark, or delete messages.
- The frontend uses only `VITE_SUPABASE_URL` and the publishable key.
- Never expose a Supabase `service_role` key in Vite or Vercel frontend variables.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run lint` - run Oxlint
- `npm run preview` - preview the production build
