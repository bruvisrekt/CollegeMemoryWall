# ⬡ MemoryWall
### Your College, Forever.

A single-file web application for college students and alumni to share memories, connect through real-time channels, discover events, and get personalized skill recommendations — all powered by localStorage with a Firebase-ready backend layer.

---

## 🚀 Getting Started

No installs. No setup. No internet required.

1. Download **`memorywall.html`**
2. Double-click it to open in any browser
3. Sign in with the demo credentials below

That's it.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | `rahul@college.edu` | `password123` |
| Admin | `admin@college.edu` | `password123` |

The app auto-signs in as Rahul after 1.5 seconds if the login screen is left untouched.

To test as a new user, click **"New here? Create account →"** and register with any `@college.edu` email.

---

## ✨ Features

### 🧱 Memory Wall
- Post college memories with a title, story, category, tags and emoji
- Upload images or files (up to 5MB) per post
- Like and clap reactions on posts
- Tag-based filtering and keyword search
- Report posts for review

### 💬 Channels
Three channel groups, each with its own sub-channels:

| Group | Channels |
|-------|----------|
| General | general, events, fests |
| Placements | placements |
| Alumni Connect | alumni-connect, mentorship |

- Real-time-simulated chat (polls every 2 seconds)
- Image and file attachments in chat
- Role badges — Student, Alumni, Admin
- Your own messages appear on the right

### 🎯 Recommendation Engine
- Every interaction (posting, liking, joining events, sending messages) updates a **tag affinity profile**
- Events and skills are ranked by overlap with your tag profile
- Personalized match percentage shown for each recommendation

### 👤 Profile
- Editable name, branch, batch, bio, location, LinkedIn, GitHub
- Auto-generated tag interest cloud based on activity
- Skill suggestions with animated progress bars
- Post history with like and clap counts
- Registered event history

### 🔔 Notifications
Priority-sorted notification feed:
- **High** — Upcoming events matching your tag interests
- **Medium** — Likes, claps and new channel messages
- **Low** — New posts by others, system updates

Mark all read, clear all, and per-notification click-through navigation.

### ⚙️ Settings
- Notification toggles (likes, events, posts, messages)
- Profile visibility (everyone / students only / alumni only)
- Email digest frequency (daily / weekly / never)
- Appearance options
- Reset tag interest profile

### 🔐 Authentication
- Sign in / Register with `@college.edu` email
- Domain restriction enforced — no other email domains accepted
- Session persisted in localStorage across page reloads
- Sign out from sidebar

---

## 🗂 File Structure

```
memorywall.html     ← Everything in one file (use this)
index.html          ← Frontend only (requires db.js)
db.js               ← localStorage backend (requires index.html)
README.md           ← This file
```

`memorywall.html` is `index.html` + `db.js` merged into a single self-contained file. Use it for sharing and testing. Use `index.html` + `db.js` only if you want to edit them separately via a local server.

---

## 🗄 Data Layer (`db.js`)

All data is stored in `localStorage` under these keys:

| Key | Contents |
|-----|----------|
| `mw_users` | User profiles, tag affinity maps, settings |
| `mw_posts` | Memory wall posts with status, likes, claps |
| `mw_channels` | Messages per channel |
| `mw_events` | Upcoming events with registrations |
| `mw_skills` | Master skill list for recommendations |
| `mw_notifications` | Per-user notification history |
| `mw_flagged` | Moderation queue |
| `mw_session` | Current logged-in user UID |

### Tag Affinity Scoring

| Action | Score |
|--------|-------|
| Post with a tag | +2 |
| Like a post with a tag | +1 |
| Register for an event | +3 |
| Message in a topic channel | +1 |

---

## 🔥 Firebase Migration

Every function in `db.js` has a `🔥 Firebase swap:` comment showing the exact replacement. The migration path is:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google), **Firestore**, and **Storage**
3. Replace each `db.js` function body with its Firebase equivalent
4. `index.html` requires zero changes

### Firestore Collections

```
/users/{uid}                        → profile, tagAffinity, settings
/posts/{postId}                     → title, content, tags, status, likes, claps
/channels/{channelId}/messages/{id} → text, authorId, role, imageUrl
/events/{eventId}                   → title, date, tags, registered[]
/skills/{skillId}                   → name, tags, grad, color
/notifications/{uid}/{notifId}      → type, priority, title, body, read
```

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 🛠 Local Development

If editing `index.html` and `db.js` separately, you need a local server (browsers block external scripts over `file://`).

**VS Code — Live Server** (recommended)
Install the Live Server extension → right-click `index.html` → Open with Live Server

**Python**
```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Node.js**
```bash
npx serve .
```

### Dev Utilities (browser console)

```js
DB.devReset()        // wipe localStorage and reseed demo data
DB.devInspect('posts')    // console.table any collection
DB.devInspect('users')
DB.devInspect('notifications')
```

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Fonts | Nunito, Space Grotesk (Google Fonts) |
| Storage | localStorage (Firebase-ready) |
| Auth | localStorage session (Firebase Auth-ready) |
| Hosting | Any static host — Firebase, Netlify, GitHub Pages |

No frameworks. No build tools. No dependencies.

---

## 📋 Roadmap

- [x] Memory Wall with tags, reactions and image uploads
- [x] Grouped channel system with unique chat histories
- [x] Tag affinity recommendation engine
- [x] Editable profile page
- [x] Priority-sorted notifications panel
- [x] Settings panel with toggles
- [x] File attachments in posts and chat
- [ ] Admin moderation dashboard
- [ ] Post comment threads
- [ ] Alumni vs student badges on wall posts
- [ ] Unified search across posts, people and events
- [ ] Firebase backend migration
- [ ] Push notifications

---

## 👥 Seed Accounts

| Name | Email | Role | Branch |
|------|-------|------|--------|
| Rahul Kumar | rahul@college.edu | Student | CSE |
| Priya S. | priya@college.edu | Student | ECE |
| Arjun M. | arjun@college.edu | Student | CSE |
| Admin | admin@college.edu | Admin | — |

---

## 📄 License

Built for educational and demonstration purposes.
