/* ╔══════════════════════════════════════════════════════════════════╗
   ║  MemoryWall — localStorage Backend (db.js)                      ║
   ║                                                                  ║
   ║  Every function is async and returns the same data shape        ║
   ║  that Firebase would return. To migrate, just replace the       ║
   ║  body of each function with the Firebase call shown in the      ║
   ║  "🔥 Firebase swap:" comment above it.                          ║
   ║                                                                  ║
   ║  Storage keys (all prefixed "mw_"):                              ║
   ║    mw_users       → object  { uid → userDoc }                   ║
   ║    mw_session     → string  (current user uid)                  ║
   ║    mw_posts       → array   [ postDoc ]                         ║
   ║    mw_channels    → object  { channelId → [ messageDoc ] }      ║
   ║    mw_events      → array   [ eventDoc ]                        ║
   ║    mw_skills      → array   [ skillDoc ]  (master list)         ║
   ║    mw_flagged     → array   [ flagDoc ]   (moderation queue)    ║
   ╚══════════════════════════════════════════════════════════════════╝ */

const DB = (() => {

  /* ── HELPERS ─────────────────────────────────────── */
  const uid   = () => 'id_' + Math.random().toString(36).slice(2, 11);
  const now   = () => new Date().toISOString();
  const relTime = iso => {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60)           return 'Just now';
    if (diff < 3600)         return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400)        return Math.floor(diff / 3600) + 'h ago';
    if (diff < 86400 * 2)    return 'Yesterday';
    if (diff < 86400 * 7)    return Math.floor(diff / 86400) + 'd ago';
    return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  };

  const ls = {
    get: (key, fallback = null) => {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    },
    set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.error('Storage full?', e); } },
  };

  /* ── SEED DATA (loads once if localStorage is empty) ─ */
  const SEED = {
    users: {
      'user_rahul': {
        uid: 'user_rahul', name: 'Rahul Kumar', email: 'rahul@college.edu',
        initials: 'RK', role: 'student', branch: 'CSE', batch: '2025',
        bio: 'Passionate about full-stack dev, competitive coding & events. Open to collaborations!',
        location: 'Chennai, India', joinedAt: '2021-08-01T00:00:00.000Z',
        gradIndex: 0,
        tagAffinity: { '#coding': 8, '#placement': 5, '#hackathon': 6, '#webdev': 4, '#research': 2 },
      },
      'user_priya': {
        uid: 'user_priya', name: 'Priya S.', email: 'priya@college.edu',
        initials: 'PS', role: 'student', branch: 'ECE', batch: '2025',
        bio: 'IoT enthusiast. Won TechExpo 2024.', location: 'Chennai, India',
        joinedAt: '2021-08-01T00:00:00.000Z', gradIndex: 1,
        tagAffinity: { '#hackathon': 9, '#coding': 6, '#research': 3 },
      },
      'user_arjun': {
        uid: 'user_arjun', name: 'Arjun M.', email: 'arjun@college.edu',
        initials: 'AM', role: 'student', branch: 'CSE', batch: '2025',
        bio: 'Placed at Infosys. DSA grinder.', location: 'Bangalore, India',
        joinedAt: '2021-08-01T00:00:00.000Z', gradIndex: 2,
        tagAffinity: { '#placement': 10, '#coding': 8, '#academic': 3 },
      },
      'user_admin': {
        uid: 'user_admin', name: 'Admin', email: 'admin@college.edu',
        initials: 'AD', role: 'admin', branch: '', batch: '',
        bio: 'Platform admin.', location: 'Chennai, India',
        joinedAt: '2020-01-01T00:00:00.000Z', gradIndex: 5,
        tagAffinity: {},
      },
    },

    posts: [
      { id:'post_1', title:'Won Best Project at TechExpo! 🏆', content:'Our IoT-based smart irrigation system won the college techfest. We used ESP32 sensors, Firebase Realtime DB for data streaming, and a React dashboard. Months of effort finally paid off — incredible feeling of seeing it all come together!', tags:['#hackathon','#coding'], category:'Hackathon', emoji:'🏆', gradIndex:0, authorId:'user_priya', authorName:'Priya S.', authorInitials:'PS', status:'approved', createdAt:'2025-02-18T08:00:00.000Z', likes:['user_arjun','user_admin'], claps:['user_rahul'] },
      { id:'post_2', title:'Placed at Infosys — My Full Journey', content:'After 8 mock interviews and 3 months of DSA grind, I cracked Infosys SP. Here\'s the honest breakdown: started with arrays/strings, moved to trees/graphs, then DP. The key was consistency over intensity — 2 hrs every day beats 8 hrs on weekends.', tags:['#placement','#coding'], category:'Placement', emoji:'🎉', gradIndex:1, authorId:'user_arjun', authorName:'Arjun M.', authorInitials:'AM', status:'approved', createdAt:'2025-02-18T05:00:00.000Z', likes:['user_rahul','user_priya','user_admin'], claps:['user_rahul','user_arjun'] },
      { id:'post_3', title:'Cultural Night was pure magic 🎭', content:'The drama club\'s performance of "Echoes" was absolutely breathtaking. Three months of late-night rehearsals, costume drama (pun intended), and so many laughs. Standing ovation, tears from the crowd — best night of college without a doubt.', tags:['#cultural','#fests'], category:'Cultural Event', emoji:'🎭', gradIndex:2, authorId:'user_priya', authorName:'Priya S.', authorInitials:'PS', status:'approved', createdAt:'2025-02-17T12:00:00.000Z', likes:['user_arjun'], claps:[] },
      { id:'post_4', title:'Inter-College Cricket Champions! 🏏', content:'We won the finals in the last over! Needing 14 off the last 6 balls, our captain hit 2 sixes to seal it. A memory I\'ll carry forever from this campus. The crowd noise was unreal — our entire batch was in the stands.', tags:['#sports'], category:'Sports', emoji:'🏏', gradIndex:3, authorId:'user_rahul', authorName:'Rahul K.', authorInitials:'RK', status:'approved', createdAt:'2025-02-17T06:00:00.000Z', likes:['user_priya','user_arjun','user_admin'], claps:['user_priya','user_arjun'] },
      { id:'post_5', title:'My Paper Got Published in IEEE 📄', content:'Six months of late nights in the ML lab finally paid off. My paper on LSTM-based traffic prediction got accepted to an IEEE conference. The reviewers called it "a novel approach with strong empirical results". Couldn\'t believe it when I saw the acceptance email!', tags:['#academic','#research','#coding'], category:'Academic', emoji:'📄', gradIndex:4, authorId:'user_arjun', authorName:'Arjun M.', authorInitials:'AM', status:'approved', createdAt:'2025-02-16T09:00:00.000Z', likes:['user_rahul','user_priya','user_admin'], claps:['user_rahul','user_priya','user_admin'] },
      { id:'post_6', title:'Alumni Talk Completely Changed My Path', content:'Met a Google L5 engineer at the Alumni Talk Series. He walked us through his journey — how he pivoted from backend Java to ML after college. That 45-minute conversation made me completely rethink my specialization. Starting Andrew Ng\'s ML course tonight.', tags:['#alumni','#placement'], category:'Alumni', emoji:'🤝', gradIndex:5, authorId:'user_rahul', authorName:'Rahul K.', authorInitials:'RK', status:'approved', createdAt:'2025-02-15T14:00:00.000Z', likes:['user_priya','user_admin'], claps:['user_arjun'] },
    ],

    channels: {
      general: [
        { id:'msg_g1', text:'Welcome to #general! Keep it positive and helpful. 🎓', authorId:'user_admin', authorName:'Admin', authorInitials:'AD', role:'admin', gradIndex:5, createdAt:'2025-02-20T10:00:00.000Z' },
        { id:'msg_g2', text:'Hey everyone! Anyone attending the hackathon this Saturday? Looking for a team!', authorId:'user_priya', authorName:'Priya S.', authorInitials:'PS', role:'student', gradIndex:1, createdAt:'2025-02-20T10:14:00.000Z' },
        { id:'msg_g3', text:'Yes! We have a team of 3 — need a designer. Reply here or DM me.', authorId:'user_arjun', authorName:'Arjun M.', authorInitials:'AM', role:'student', gradIndex:2, createdAt:'2025-02-20T10:16:00.000Z' },
        { id:'msg_g4', text:'Happy to mentor anyone prepping for placements. My LinkedIn is in my profile — feel free to connect 🙌', authorId:'user_admin', authorName:'Dr. Mehta (Alumni \'18)', authorInitials:'DM', role:'alumni', gradIndex:3, createdAt:'2025-02-20T11:32:00.000Z' },
        { id:'msg_g5', text:'That\'s so kind! Connecting now.', authorId:'user_rahul', authorName:'Rahul K.', authorInitials:'RK', role:'student', gradIndex:0, createdAt:'2025-02-20T12:05:00.000Z' },
      ],
      placements: [
        { id:'msg_p1', text:'Infosys pool campus drive on March 10. Register on the careers portal before Feb 28.', authorId:'user_arjun', authorName:'Arjun M.', authorInitials:'AM', role:'student', gradIndex:2, createdAt:'2025-02-20T09:00:00.000Z' },
        { id:'msg_p2', text:'Anyone have previous year TCS NQT aptitude questions? The new pattern is confusing me.', authorId:'user_priya', authorName:'Priya S.', authorInitials:'PS', role:'student', gradIndex:1, createdAt:'2025-02-20T09:20:00.000Z' },
        { id:'msg_p3', text:'I have a compiled PDF covering 2022–24 patterns. Uploading to the shared drive shortly — will share the link here.', authorId:'user_admin', authorName:'Alumni Rohit', authorInitials:'AR', role:'alumni', gradIndex:5, createdAt:'2025-02-20T10:00:00.000Z' },
      ],
      technical: [],
      events: [],
      fests: [],
      'alumni-connect': [],
      mentorship: [],
    },

    events: [
      { id:'ev_1', title:'Hackathon 2025', day:'22', mon:'Feb', sub:'Tech Dept · 24 hrs', tags:['#hackathon','#coding'], registered:[] },
      { id:'ev_2', title:'Alumni Talk Series', day:'28', mon:'Feb', sub:'Auditorium · 3 PM', tags:['#career','#placement'], registered:[] },
      { id:'ev_3', title:'Cultural Fest', day:'05', mon:'Mar', sub:'Ground · 2 days', tags:['#cultural','#fests'], registered:[] },
      { id:'ev_4', title:'Open Source Sprint', day:'12', mon:'Mar', sub:'Lab 3 · Weekend', tags:['#coding','#webdev'], registered:[] },
      { id:'ev_5', title:'Industry Mentorship Day', day:'20', mon:'Mar', sub:'Online · 10 AM', tags:['#placement','#alumni'], registered:[] },
    ],

    skills: [
      { id:'sk_1', name:'Data Structures & Algorithms', tags:['#coding','#placement'], grad:'linear-gradient(90deg,#7c3aed,#9b59f7)', color:'var(--violet)' },
      { id:'sk_2', name:'System Design', tags:['#placement','#coding'], grad:'linear-gradient(90deg,#f0237d,#ff6b9d)', color:'var(--pink)' },
      { id:'sk_3', name:'React / Frontend Dev', tags:['#webdev','#coding'], grad:'linear-gradient(90deg,#0ea5e9,#38bdf8)', color:'var(--sky)' },
      { id:'sk_4', name:'Cloud Platforms (AWS/GCP)', tags:['#placement','#academic'], grad:'linear-gradient(90deg,#ffa500,#ffc248)', color:'var(--amber)' },
      { id:'sk_5', name:'Machine Learning Basics', tags:['#research','#coding'], grad:'linear-gradient(90deg,#22d07a,#4ade80)', color:'var(--lime)' },
      { id:'sk_6', name:'Public Speaking & Leadership', tags:['#cultural','#alumni'], grad:'linear-gradient(90deg,#ff5c5c,#ff8080)', color:'var(--coral)' },
      { id:'sk_7', name:'Database Design (SQL/NoSQL)', tags:['#coding','#academic'], grad:'linear-gradient(90deg,#4f46e5,#7c3aed)', color:'var(--indigo)' },
      { id:'sk_8', name:'Git & Version Control', tags:['#coding','#hackathon'], grad:'linear-gradient(90deg,#f0237d,#7c3aed)', color:'var(--pink)' },
    ],
  };

  function seed() {
    if (!ls.get('mw_seeded')) {
      ls.set('mw_users',    SEED.users);
      ls.set('mw_posts',    SEED.posts);
      ls.set('mw_channels', SEED.channels);
      ls.set('mw_events',   SEED.events);
      ls.set('mw_skills',   SEED.skills);
      ls.set('mw_flagged',  []);
      ls.set('mw_seeded', true);
    }
  }

  /* ══════════════════════════════════════════════
     AUTH
     ══════════════════════════════════════════════ */

  /**
   * Sign in with email + password.
   * 🔥 Firebase swap:
   *   const cred = await signInWithEmailAndPassword(auth, email, password);
   *   if (!cred.user.email.endsWith('@college.edu')) { await signOut(auth); throw new Error('Unauthorized domain'); }
   *   return cred.user;
   */
  async function signIn(email, password) {
    if (!email.endsWith('@college.edu')) throw new Error('Only @college.edu emails are allowed.');
    const users = ls.get('mw_users', {});
    const user = Object.values(users).find(u => u.email === email);
    if (!user) throw new Error('No account found with this email. Please register first.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    ls.set('mw_session', user.uid);
    return { uid: user.uid, email: user.email, displayName: user.name };
  }

  /**
   * Register a new student account.
   * 🔥 Firebase swap:
   *   const cred = await createUserWithEmailAndPassword(auth, email, password);
   *   await updateProfile(cred.user, { displayName: name });
   *   await setDoc(doc(db, 'users', cred.user.uid), { ...profileData });
   */
  async function register(email, password, name, branch, batch) {
    if (!email.endsWith('@college.edu')) throw new Error('Only @college.edu emails are allowed.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    const users = ls.get('mw_users', {});
    if (Object.values(users).find(u => u.email === email)) throw new Error('Account already exists. Please sign in.');
    const newUid = uid();
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const gradIndex = Math.floor(Math.random() * 6);
    const newUser = {
      uid: newUid, name, email, initials, role: 'student',
      branch, batch, bio: '', location: '', gradIndex,
      joinedAt: now(), tagAffinity: {},
    };
    users[newUid] = newUser;
    ls.set('mw_users', users);
    ls.set('mw_session', newUid);
    return { uid: newUid, email, displayName: name };
  }

  /**
   * Sign out the current user.
   * 🔥 Firebase swap: await signOut(auth);
   */
  async function signOut() {
    localStorage.removeItem('mw_session');
  }

  /**
   * Get the currently signed-in user (or null).
   * 🔥 Firebase swap: auth.currentUser
   */
  function currentUser() {
    const uid = ls.get('mw_session');
    if (!uid) return null;
    const users = ls.get('mw_users', {});
    return users[uid] || null;
  }

  /**
   * Listen for auth state changes. Calls cb(user) immediately and on every change.
   * 🔥 Firebase swap: return onAuthStateChanged(auth, cb);
   */
  function onAuthChange(cb) {
    cb(currentUser());
    // Poll every 500ms for localStorage changes (e.g. logout in another tab)
    const interval = setInterval(() => cb(currentUser()), 500);
    return () => clearInterval(interval); // returns unsubscribe fn
  }

  /* ══════════════════════════════════════════════
     USERS / PROFILE
     ══════════════════════════════════════════════ */

  /**
   * Get a user's profile by uid.
   * 🔥 Firebase swap:
   *   const snap = await getDoc(doc(db, 'users', uid));
   *   return snap.exists() ? snap.data() : null;
   */
  async function getUser(userId) {
    const users = ls.get('mw_users', {});
    return users[userId] || null;
  }

  /**
   * Update the current user's profile.
   * 🔥 Firebase swap:
   *   await updateDoc(doc(db, 'users', uid), updates);
   */
  async function updateProfile(userId, updates) {
    const users = ls.get('mw_users', {});
    if (!users[userId]) throw new Error('User not found.');
    users[userId] = { ...users[userId], ...updates };
    ls.set('mw_users', users);
    return users[userId];
  }

  /**
   * Increment tag affinity for a user (called whenever they interact with a tag).
   * 🔥 Firebase swap:
   *   await updateDoc(doc(db, 'users', uid), {
   *     [`tagAffinity.${tag}`]: increment(amount)
   *   });
   */
  async function bumpTagAffinity(userId, tags, amount = 1) {
    const users = ls.get('mw_users', {});
    if (!users[userId]) return;
    tags.forEach(tag => {
      users[userId].tagAffinity[tag] = (users[userId].tagAffinity[tag] || 0) + amount;
    });
    ls.set('mw_users', users);
  }

  /* ══════════════════════════════════════════════
     POSTS
     ══════════════════════════════════════════════ */

  /**
   * Fetch all approved posts, newest first.
   * 🔥 Firebase swap:
   *   const q = query(collection(db, 'posts'), where('status','==','approved'), orderBy('createdAt','desc'), limit(30));
   *   const snap = await getDocs(q);
   *   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
   */
  async function getPosts({ status = 'approved', limit = 30, authorId = null } = {}) {
    let posts = ls.get('mw_posts', []);
    if (status !== 'all') posts = posts.filter(p => p.status === status);
    if (authorId) posts = posts.filter(p => p.authorId === authorId);
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return posts.slice(0, limit).map(p => ({
      ...p,
      timeAgo: relTime(p.createdAt),
      likeCount: p.likes.length,
      clapCount: p.claps.length,
    }));
  }

  /**
   * Create a new post (goes to pending_review first).
   * 🔥 Firebase swap:
   *   const ref = await addDoc(collection(db, 'posts'), {
   *     ...data, createdAt: serverTimestamp(), status: 'pending_review'
   *   });
   *   return ref.id;
   */
  async function createPost({ title, content, tags, category, emoji, authorId }) {
    const user = await getUser(authorId);
    if (!user) throw new Error('Not signed in.');

    // Basic profanity check (extend this list as needed)
    const BAD_WORDS = ['spam','abuse','hate'];
    const combined = (title + ' ' + content).toLowerCase();
    const flagged = BAD_WORDS.some(w => combined.includes(w));

    const post = {
      id: uid(),
      title: title.trim(),
      content: content.trim(),
      excerpt: content.trim().slice(0, 160) + (content.length > 160 ? '…' : ''),
      tags,
      category,
      emoji: emoji || '📝',
      gradIndex: user.gradIndex,
      authorId,
      authorName: user.name,
      authorInitials: user.initials,
      status: flagged ? 'flagged' : 'pending_review',
      createdAt: now(),
      likes: [],
      claps: [],
    };

    const posts = ls.get('mw_posts', []);
    posts.unshift(post);
    ls.set('mw_posts', posts);

    // Update tag affinity for the author
    await bumpTagAffinity(authorId, tags, 2);

    if (flagged) {
      const flagged_list = ls.get('mw_flagged', []);
      flagged_list.push({ type:'post', id: post.id, reason:'keyword_match', flaggedBy:'system', flaggedAt: now() });
      ls.set('mw_flagged', flagged_list);
    }

    return post.id;
  }

  /**
   * Toggle like on a post. Returns new like count.
   * 🔥 Firebase swap:
   *   const ref = doc(db, 'posts', postId);
   *   await updateDoc(ref, { likes: arrayUnion(userId) });  // or arrayRemove
   */
  async function toggleLike(postId, userId) {
    const posts = ls.get('mw_posts', []);
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found.');
    const idx = post.likes.indexOf(userId);
    if (idx === -1) {
      post.likes.push(userId);
      await bumpTagAffinity(userId, post.tags, 1); // liking = weak interest signal
    } else {
      post.likes.splice(idx, 1);
    }
    ls.set('mw_posts', posts);
    return { liked: idx === -1, count: post.likes.length };
  }

  /**
   * Toggle clap on a post.
   * 🔥 Firebase swap: same pattern as toggleLike with claps field
   */
  async function toggleClap(postId, userId) {
    const posts = ls.get('mw_posts', []);
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found.');
    const idx = post.claps.indexOf(userId);
    idx === -1 ? post.claps.push(userId) : post.claps.splice(idx, 1);
    ls.set('mw_posts', posts);
    return { clapped: idx === -1, count: post.claps.length };
  }

  /**
   * Admin: approve or reject a post.
   * 🔥 Firebase swap:
   *   await updateDoc(doc(db, 'posts', postId), { status: newStatus });
   */
  async function moderatePost(postId, newStatus, adminId) {
    const admin = await getUser(adminId);
    if (!admin || admin.role !== 'admin') throw new Error('Unauthorized.');
    const posts = ls.get('mw_posts', []);
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found.');
    post.status = newStatus; // 'approved' | 'rejected'
    ls.set('mw_posts', posts);
    return true;
  }

  /**
   * Flag a post for review.
   * 🔥 Firebase swap: addDoc(collection(db, 'flagged'), {...})
   */
  async function flagPost(postId, userId, reason) {
    const flagged = ls.get('mw_flagged', []);
    flagged.push({ type: 'post', id: postId, reason, flaggedBy: userId, flaggedAt: now() });
    ls.set('mw_flagged', flagged);
    // Also mark the post as under review
    const posts = ls.get('mw_posts', []);
    const post = posts.find(p => p.id === postId);
    if (post && post.status === 'approved') { post.status = 'under_review'; ls.set('mw_posts', posts); }
  }

  /* ══════════════════════════════════════════════
     CHANNELS & MESSAGES
     ══════════════════════════════════════════════ */

  /**
   * Get all messages for a channel, oldest first.
   * 🔥 Firebase swap:
   *   const q = query(collection(db,'channels',channelId,'messages'), orderBy('createdAt','asc'), limit(100));
   *   const snap = await getDocs(q);
   *   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
   */
  async function getMessages(channelId) {
    const channels = ls.get('mw_channels', {});
    const msgs = channels[channelId] || [];
    return msgs.map(m => ({ ...m, timeFormatted: new Date(m.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }));
  }

  /**
   * Send a message to a channel.
   * 🔥 Firebase swap:
   *   await addDoc(collection(db,'channels',channelId,'messages'), {
   *     ...message, createdAt: serverTimestamp()
   *   });
   */
  async function sendMessage(channelId, text, userId) {
    const user = await getUser(userId);
    if (!user) throw new Error('Not signed in.');

    // Basic profanity filter
    const BAD_WORDS = ['spam','abuse','hate'];
    const lower = text.toLowerCase();
    if (BAD_WORDS.some(w => lower.includes(w))) throw new Error('Message flagged for review.');

    const channels = ls.get('mw_channels', {});
    if (!channels[channelId]) channels[channelId] = [];

    const msg = {
      id: uid(),
      text: text.trim(),
      authorId: userId,
      authorName: user.name,
      authorInitials: user.initials,
      role: user.role,
      gradIndex: user.gradIndex,
      createdAt: now(),
    };
    channels[channelId].push(msg);
    ls.set('mw_channels', channels);

    // Bump tag affinity based on which channel they're active in
    const CH_TAGS = {
      general: [], placements: ['#placement'], technical: ['#coding'],
      events: [], fests: ['#cultural'], 'alumni-connect': ['#alumni'], mentorship: ['#placement'],
    };
    if (CH_TAGS[channelId]?.length) await bumpTagAffinity(userId, CH_TAGS[channelId], 1);

    return { ...msg, timeFormatted: new Date(msg.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) };
  }

  /**
   * Subscribe to new messages in a channel.
   * Polls every 2 seconds (simulates Firestore's onSnapshot).
   * 🔥 Firebase swap:
   *   return onSnapshot(
   *     query(collection(db,'channels',channelId,'messages'), orderBy('createdAt')),
   *     snapshot => cb(snapshot.docs.map(d => d.data()))
   *   );
   */
  function subscribeToChannel(channelId, cb) {
    let lastCount = 0;
    const check = async () => {
      const msgs = await getMessages(channelId);
      if (msgs.length !== lastCount) {
        lastCount = msgs.length;
        cb(msgs);
      }
    };
    check(); // fire immediately
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval); // returns unsubscribe fn
  }

  /* ══════════════════════════════════════════════
     EVENTS
     ══════════════════════════════════════════════ */

  /**
   * Get all upcoming events.
   * 🔥 Firebase swap:
   *   const q = query(collection(db,'events'), orderBy('date','asc'));
   *   const snap = await getDocs(q);
   *   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
   */
  async function getEvents() {
    return ls.get('mw_events', []);
  }

  /**
   * Register user for an event (also bumps tag affinity).
   * 🔥 Firebase swap:
   *   await updateDoc(doc(db,'events',eventId), { registered: arrayUnion(userId) });
   */
  async function registerForEvent(eventId, userId) {
    const events = ls.get('mw_events', []);
    const ev = events.find(e => e.id === eventId);
    if (!ev) throw new Error('Event not found.');
    if (ev.registered.includes(userId)) throw new Error('Already registered.');
    ev.registered.push(userId);
    ls.set('mw_events', events);
    await bumpTagAffinity(userId, ev.tags, 3); // registering = strong interest signal
    return true;
  }

  /* ══════════════════════════════════════════════
     RECOMMENDATION ENGINE
     ══════════════════════════════════════════════ */

  /**
   * Compute event recommendations for a user based on tag affinity.
   * Returns events sorted by match score, with percentage.
   * 🔥 Firebase swap: same logic, just fetch user doc and events from Firestore
   */
  async function getEventRecommendations(userId) {
    const [user, events] = await Promise.all([getUser(userId), getEvents()]);
    if (!user) return [];
    const affinity = user.tagAffinity || {};
    const maxScore = Math.max(...Object.values(affinity), 1);

    return events
      .map(ev => {
        const score = ev.tags.reduce((sum, tag) => sum + (affinity[tag] || 0), 0);
        const pct = Math.min(Math.round((score / (maxScore * ev.tags.length)) * 100), 99);
        return { ...ev, score, matchPct: pct || Math.floor(Math.random() * 30) + 10 };
      })
      .filter(ev => !ev.registered.includes(userId))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Compute skill suggestions for a user based on tag affinity.
   * Returns skills sorted by relevance with an estimated proficiency level.
   * 🔥 Firebase swap: same logic, just fetch from Firestore
   */
  async function getSkillSuggestions(userId) {
    const user = await getUser(userId);
    if (!user) return [];
    const affinity = user.tagAffinity || {};
    const allSkills = ls.get('mw_skills', []);

    return allSkills
      .map(skill => {
        const score = skill.tags.reduce((sum, tag) => sum + (affinity[tag] || 0), 0);
        // Level = how much they've engaged, capped at 90%, min 10%
        const totalAffinity = Object.values(affinity).reduce((a, b) => a + b, 0) || 1;
        const level = Math.min(Math.max(Math.round((score / totalAffinity) * 120), 10), 90);
        return { ...skill, score, level, suggestedVia: skill.tags.find(t => affinity[t]) || skill.tags[0] };
      })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /* ══════════════════════════════════════════════
     MODERATION (Admin)
     ══════════════════════════════════════════════ */

  /**
   * Get all items in the moderation queue.
   * 🔥 Firebase swap:
   *   const q = query(collection(db,'posts'), where('status','in',['pending_review','flagged','under_review']));
   */
  async function getModerationQueue(adminId) {
    const admin = await getUser(adminId);
    if (!admin || admin.role !== 'admin') throw new Error('Unauthorized.');
    const posts = ls.get('mw_posts', []);
    return posts.filter(p => ['pending_review', 'flagged', 'under_review'].includes(p.status));
  }

  /* ══════════════════════════════════════════════
     STATS  (for the Home page counters)
     ══════════════════════════════════════════════ */

  /**
   * Get platform-wide stats.
   * 🔥 Firebase swap: use aggregation queries or a cached /stats/summary doc
   */
  async function getStats() {
    const posts    = ls.get('mw_posts', []);
    const users    = ls.get('mw_users', {});
    const userArr  = Object.values(users);
    return {
      totalPosts:   posts.filter(p => p.status === 'approved').length,
      totalStudents: userArr.filter(u => u.role === 'student').length,
      totalAlumni:   userArr.filter(u => u.role === 'alumni').length,
      totalEvents:   (ls.get('mw_events', [])).length,
    };
  }

  /* ══════════════════════════════════════════════
     DEV UTILITIES  (remove before Firebase migration)
     ══════════════════════════════════════════════ */
  function devReset() {
    ['mw_users','mw_posts','mw_channels','mw_events','mw_skills','mw_flagged','mw_session','mw_seeded']
      .forEach(k => localStorage.removeItem(k));
    seed();
    console.log('✅ DB reset to seed data.');
  }

  function devInspect(key) {
    console.table(ls.get('mw_' + key));
  }

  /* ══════════════════════════════════════════════
     INIT & PUBLIC API
     ══════════════════════════════════════════════ */
  seed(); // run once on first load

  return {
    // Auth
    signIn, register, signOut, currentUser, onAuthChange,
    // Users
    getUser, updateProfile, bumpTagAffinity,
    // Posts
    getPosts, createPost, toggleLike, toggleClap, flagPost,
    // Moderation
    moderatePost, getModerationQueue,
    // Channels
    getMessages, sendMessage, subscribeToChannel,
    // Events
    getEvents, registerForEvent,
    // Recommendations
    getEventRecommendations, getSkillSuggestions,
    // Stats
    getStats,
    // Dev
    devReset, devInspect,
    // Helpers exposed for rendering
    relTime,
  };

})();
