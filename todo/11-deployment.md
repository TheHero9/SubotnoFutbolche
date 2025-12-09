# Step 11: Deployment to Netlify

## Objective
Deploy the app to Netlify and make it accessible to all players.

## Tasks

### 1. Prepare for Deployment

Update `package.json` to ensure build script is correct:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 2. Test Build Locally

```bash
npm run build
npm run preview
```

Visit the preview URL and test:
- Player selection works
- Animations play correctly
- Charts display properly
- Language toggle works
- Summary card downloads correctly

### 3. Create Netlify Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. Create .gitignore (if not exists)

Create `.gitignore`:

```
# Dependencies
node_modules/

# Build output
dist/
dist-ssr/

# Environment
.env
.env.local
.env.production

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Cache
.cache/
```

### 5. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Football Wrapped 2025 app"
```

### 6. Push to GitHub

Create a new repository on GitHub, then:

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 7. Deploy to Netlify

**Option A: Via Netlify UI**
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and authorize
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

**Option B: Via Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### 8. Configure Custom Domain (Optional)

In Netlify dashboard:
1. Go to Site settings → Domain management
2. Add custom domain or use the free `.netlify.app` subdomain
3. Suggested subdomain: `sabotno-futbolche.netlify.app`

### 9. Post-Deployment Checklist

Test the deployed site:
- [ ] Landing page loads correctly
- [ ] Player selection works
- [ ] Loading animation plays
- [ ] Story cards work (tap through)
- [ ] Scroll section works
- [ ] Charts render correctly
- [ ] Language toggle works (BG/EN)
- [ ] Summary card displays
- [ ] Download image button works
- [ ] Mobile responsive design works
- [ ] All animations smooth

### 10. Share with Players

Once deployed, share the URL with all players:
- Copy the deployment URL
- Share via WhatsApp/Messenger/Email
- Players can access and view their stats

### 11. Update Data for Future Seasons

To update player data:
1. Export new JSON from Google Sheets (using the script from requirements)
2. Replace `src/data/players.json`
3. Commit and push changes
4. Netlify will auto-deploy

## Expected Outcome
- App live on Netlify
- Public URL accessible to all players
- Automatic deployments on git push
- Fast, global CDN delivery
- HTTPS enabled by default
- Mobile-optimized

## Project Complete! 🎉

The Football Wrapped 2025 app is now:
✅ Built with React + Vite
✅ Styled with Tailwind CSS
✅ Animated with Framer Motion
✅ Bilingual (BG/EN)
✅ Deployed to Netlify
✅ Ready for 40-50 players to enjoy!

## Future Enhancements
Consider adding:
- Sound effects on reveals
- Social media share buttons
- Player comparison mode
- All-time leaderboard
- PWA support
