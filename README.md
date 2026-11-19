# INVIS MAFIOSO

Games arcade, Roblox hub, Minecraft hub, social feed and a desktop-style window system.
Built with React + Vite for GitHub Pages.

Live site: https://taiteathailand.github.io/Invis-mafioso/

## Deploy
1. Upload all of these files to the repo (keep the folder structure, including `.github/workflows/deploy.yml`).
2. In the repo go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Open the **Actions** tab. When the "Deploy" run turns green, the site is live.

## Run locally (optional)
```
npm install
npm run dev
```

## Turn on accounts and shared posts (optional)
Without this, the Social page works in local-only mode.
1. Make a free project at supabase.com.
2. Run `supabase.sql` in the SQL Editor.
3. In the repo go to **Settings > Secrets and variables > Actions > Variables** and add:
   - `VITE_SUPABASE_URL` (your project URL)
   - `VITE_SUPABASE_ANON_KEY` (the public "anon" key)
4. Re-run the Deploy workflow.

Never put a service_role key or any secret in this repo. The anon key is meant to be public.

## Notes
- The repo name is set in `vite.config.js` (`base`). If you rename the repo, change it there.
- Roblox and TikTok/Instagram can't be embedded in a website. The Roblox hub links to the official site.
- The Minecraft hub reads live data from Modrinth's public API. Launchers are links only.
