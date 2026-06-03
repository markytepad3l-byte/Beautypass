# BeautyPass — Web Platform Design Plan

> **Locked from your answers:**
> Soft feminine aesthetic · Anatomical face 3D · Split paths for clients + pros · Pink with user-pickable themes + dark mode

---

## 1. The feel

Soft, warm, premium-but-approachable. Less "clinical white box," more "your favourite skincare brand built a portal." The 3D anatomical face is the one bold creative move; everything around it stays restrained so the face has room to breathe.

**Three words guiding every decision:** *intimate, considered, calm*.

---

## 2. Brand colors

### Signature palette (default theme: **Rose**)
| Role | Color | Hex | Use |
|---|---|---|---|
| Primary | Rose Dust | `#C06078` | Buttons, links, focused states |
| Primary deep | Wine | `#7A3A4D` | Headlines, dark accents |
| Cream | Ivory | `#FBF6F2` | Page background |
| Blush | Peach Mist | `#FCE4D6` | Soft section backgrounds |
| Surface | White | `#FFFFFF` | Cards |
| Ink | Charcoal | `#2A1F24` | Body text |
| Muted | Warm Grey | `#9A8A8E` | Captions, hints |

### User-selectable themes (4 presets)
Same structure, swapped primary/accent — content layout never changes.

1. **Rose** — pink (default, above)
2. **Lavender** — `#9D7BC4` primary, lilac backgrounds
3. **Sage** — `#7E9A7D` primary, soft eucalyptus
4. **Champagne** — `#B89968` primary, warm beige

### Dark mode
Each theme has a dark variant. Backgrounds shift to deep aubergine `#1A1118` rather than pure black, so it still feels warm.

### Theme picker
- Sun/moon icon in top-right of every page
- A small swatch picker beside it (four colored dots) to switch themes
- Choice saved per user (in browser if not logged in; in DB if logged in)

---

## 3. Typography

| Use | Font | Weight |
|---|---|---|
| Headlines | **Fraunces** (serif, soft contemporary) | 400–600 |
| Body | **Inter** | 400–500 |
| UI labels | **Inter** | 500 |

Fraunces has a slight optical softness — fits the feminine direction without being precious. Free, modern, performant. Pair is widely used by premium beauty/wellness brands.

---

## 4. Sitemap

```
beautypass.app
├── /                       Marketing landing (3D face, split paths)
├── /for-clients            What clients get (mobile screenshots, story)
├── /for-professionals      For doctors & clinics (waitlist/apply)
├── /about                  Story, mission, team
├── /privacy                Privacy & safety promises
├── /pricing                (later)
│
├── /login                  Shared auth (role detected on entry)
├── /register
│
├── /app/*                  CLIENT web app (mirror of mobile)
│   ├── /app                Dashboard
│   ├── /app/treatments     List + create
│   ├── /app/treatments/:id Detail
│   ├── /app/photos         Gallery + before/after slider
│   ├── /app/qr             Generate QR
│   ├── /app/permissions    Manage access
│   ├── /app/insights       AI insights
│   └── /app/account        Settings, theme, consent, data
│
└── /pro/*                  PROFESSIONAL portal (doctors + clinics)
    ├── /pro                Dashboard: today's clients, scan widget
    ├── /pro/clients        Client list (everyone who granted access)
    ├── /pro/clients/:id    Client detail, treatment timeline, add notes
    ├── /pro/scan           Connect via code (web version of QR)
    └── /pro/settings
```

---

## 5. The landing page — scene by scene

### Hero
- **Left**: Big serif headline ("Your beauty journey, in one place."), one-line description, **two buttons side-by-side**: *I'm a client* (pink, primary) · *I'm a professional* (outlined).
- **Right**: 3D anatomical face, head-on, gently rotating ±5°. Soft warm lighting. Glow particles around it.
- **As cursor moves**: face subtly follows the cursor like it's looking at you.

### Scroll section 1 — "Map your journey"
Face turns 3/4 view. Treatment zones light up one by one as you scroll: forehead, cheeks, jaw, neck, lips. Each zone has a callout showing the type of treatment tracked there. Headline shifts: "Track every treatment, by zone."

### Scroll section 2 — "Share, on your terms"
Face fades into background. Foreground: an animated QR code morphing into a permission card. Story beat: "Show your QR. They get exactly what you allow. You can revoke anytime."

### Scroll section 3 — split for audiences
Page splits into two columns:
- **Left (clients)**: phone mockup, mobile app screenshots cycling.
- **Right (professionals)**: dashboard mockup, treatment list cycling.
Each side has its own CTA at the bottom.

### Scroll section 4 — "Built with care"
Three soft cards: *Encrypted at rest* · *You own your data* · *AI you control*. Each card has a small custom icon (not stock).

### Footer
Minimal. Logo, links, theme switcher, language picker (future).

---

## 6. The 3D face — what's involved

- **Model**: a stylized human head (not photorealistic — soft, slightly abstracted to stay on-brand). Either licensed from Sketchfab (~$30) or commissioned.
- **Tech**: React Three Fiber (the standard React way to use Three.js). Drei for camera and lighting helpers.
- **Performance**:
  - Desktop: full 3D scene
  - Mobile: static rendered image of the face instead (3D is heavy on phones)
  - Respects `prefers-reduced-motion` — if user has that on, no rotation
- **Loading**: shows a soft skeleton outline while the model loads (~500KB–1MB)

### Honest cost
This is the most technically expensive piece. Realistic time: **2–3 days** to get a polished 3D face that works well across devices. The rest of the landing page is faster — maybe 2 days.

---

## 7. Client web app

Same features as the mobile app — same backend, same flows. UX is rebuilt for the web (wider screens, mouse-friendly).

- Sidebar nav on the left (not bottom tabs)
- Dashboard layout uses two columns: timeline of treatments on left, AI insight + quick stats on right
- Photos page has a proper before/after **slider** (drag to compare — the mobile version was simpler)
- QR page shows a printable QR card option
- Account page exposes the **theme picker** and dark mode toggle prominently

---

## 8. Professional portal

Different visual register from the marketing site — more serious, more compact, more data-dense. Same theme system but feels more "workhorse."

- **Dashboard**: today's appointments (when we add scheduling), recent client activity, quick "scan code" button
- **Clients page**: searchable table of all clients who granted permission, with status badges
- **Client detail page**: chronological treatment timeline, side panel for adding professional notes, photo viewer
- **Scan page**: large field to paste a code OR open camera (laptop webcam)
- **Settings**: profile, license/credentials, theme

Doctors and clinics share this portal but see slightly different defaults (clinics see a team management section).

---

## 9. What we're building with

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Fast pages, great SEO for landing, server components for the portals |
| Styling | **Tailwind CSS** + CSS variables | Theme system done cleanly — change variables, every component updates |
| Components | **shadcn/ui** | Beautiful, accessible defaults — we adapt them to our brand |
| 3D | **React Three Fiber + Drei** | The standard for 3D in React, performant |
| Animations | **Framer Motion** | The smooth scroll-driven animations on the landing |
| Auth | Reuses **the backend you already have** | No rebuild — same API |
| Hosting | **Vercel** (later) | One-click deploy, free for our scale |

---

## 10. Phases

| Phase | What | Why it's first |
|---|---|---|
| **1** | Design tokens + theme system + dark mode foundation | Everything else depends on this |
| **2** | Marketing landing page (with 3D face) | The "wow" piece; investor/user-facing |
| **3** | Auth pages (web login/register) | Gate to the apps |
| **4** | Client web app (mirrors mobile) | Reach clients on laptop |
| **5** | Professional portal | Where doctors and clinics work |
| **6** | Polish, copy, micro-interactions | Make it feel premium |

Reasonable total effort to do this well: **10–15 working days** of focused build. Could go faster if we cut the 3D face down or skip the pro portal initially.

---

## 11. Decisions still open

1. **Logo / wordmark** — do you have one, or do we design one (simple wordmark in Fraunces is fine for v1)?
2. **Domain** — what's the URL? `beautypass.app` is a placeholder.
3. **The 3D face model** — buy a stylized one (~$30, faster) or commission a custom one (~$200–500, on-brand)?
4. **Language** — English only for v1, or do we plan i18n now?
5. **Pricing** — is BeautyPass free for clients? Paid for clinics? This shapes the "For professionals" page.

---

## Next step

Read this through. Tell me which sections feel right, which feel off, and answer the 5 open decisions. Once we're aligned, I'll mock the landing page hero as a static image first so you can see it before I write any code.
