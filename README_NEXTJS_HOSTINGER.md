# How to Run & Deploy Next.js Web App to Hostinger

## 🚀 1. Local Testing & Development
Navigate to `web_app_nextjs` directory and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser to test the full React / Next.js application live!

---

## 📦 2. Export Static HTML Build for Hostinger
To build the static Web App package for Hostinger:

Add `"output": "export"` to `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true }
};
module.exports = nextConfig;
```

Run build:
```bash
npm run build
```

This generates an `out/` directory containing static `index.html` and assets.

---

## 🌐 3. Hostinger Deployment
1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. Go to **File Manager** -> `public_html`.
3. Upload all contents of the `out/` folder directly into `public_html`.
4. Open `https://himistri.techcoders.in` — your live React / Next.js web application is live and synchronized with your Firebase Database!
