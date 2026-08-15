// ============================================================
//  Enchanted Ghibli Diary — script.js
//  Content now lives in Supabase. If Supabase is unreachable the
//  site quietly falls back to the built-in copy below, so it never
//  shows Madi a blank page.
// ============================================================

/* ---------------- 1. CONNECT ---------------- */

let db = null;
try {
  if (typeof SUPABASE_URL !== "undefined" && SUPABASE_URL.startsWith("http")) {
    db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase not connected, using built-in content.", e);
}

/* ---------------- 2. FALLBACK CONTENT ---------------- */

const FALLBACK = {
  settings: {
    daily_letter:
      "✨ Hi :) i know this is long overdue, but today is your special day my love, look around the website and enjoy it Mads its all yours!! I hope I can make the rest of this day as sepcial as you are to me!🌸 I love you Madi!",
    met_date: "2025-06-21T22:00:00-07:00",
    ping_number: "",   // real number lives in Supabase settings, not in this public file
    ping_message: "Madi, I need you!",
    playlist_url:
      "https://embed.music.apple.com/us/playlist/madi/pl.u-xlyNqLluJEKRDek",
    visitor_pin: "080625",
  },
  entries: [
    {
      id: -1,
      label: "Our dates:",
      body:
        "Hey mads!!! Welcome to my journal, I know you might be wondering what it is, but this is a collection of all the memories we have made together, and I hope you enjoy it as much as I do!\n- I love you 💖",
      position: 1,
    },
  ],
  photos: [
    "IMG_0032.jpg", "IMG_0038.jpg", "IMG_1064.jpg", "IMG_4221.jpg",
    "IMG_4311.jpg", "IMG_4327.jpg", "IMG_4459.jpg", "IMG_4543.jpg",
    "IMG_4571.jpg", "IMG_7905.jpg", "lp_image.jpg",
  ].map((f, i) => ({ id: -(i + 1), url: f, caption: "", position: i })),
};

/* ---------------- 3. STATE ---------------- */

const state = {
  settings: { ...FALLBACK.settings },
  entries: [...FALLBACK.entries],
  photos: [...FALLBACK.photos],
  isAdmin: false,
  editingEntryId: null,
};

let pin = "";
const MAX_PIN_LENGTH = 6;
let timerInterval;

/* ---------------- 4. HELPERS ---------------- */

const $ = (id) => document.getElementById(id);

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textToHtml(s) {
  return esc(s).replace(/\n/g, "<br>");
}

function photoUrl(path) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("photo/")) return path;
  return db.storage.from("memories").getPublicUrl(path).data.publicUrl;
}

function whisper(msg, bad = false) {
  let el = $("whisper");
  if (!el) {
    el = document.createElement("div");
    el.id = "whisper";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = "whisper show" + (bad ? " bad" : "");
  clearTimeout(el._t);
  el._t = setTimeout(() => (el.className = "whisper"), 2600);
}

/* ---------------- 5. LOAD EVERYTHING ---------------- */

async function loadAll() {
  if (!db) return;
  try {
    const [s, e, p] = await Promise.all([
      db.from("settings").select("key,value"),
      db.from("entries").select("*").order("position", { ascending: true }),
      db.from("photos").select("*").order("position", { ascending: true }),
    ]);

    if (s.data) s.data.forEach((r) => (state.settings[r.key] = r.value));
    if (e.data && e.data.length) state.entries = e.data;
    if (p.data && p.data.length) {
      state.photos = p.data.map((r) => ({
        id: r.id,
        path: r.path,
        url: photoUrl(r.path),
        caption: r.caption || "",
        position: r.position,
      }));
    }
  } catch (err) {
    console.warn("Could not reach the grove, using saved copy.", err);
  }

  applySettings();
  populateNotebookTabs();
  populateMemoryAlbumImages();
}

function applySettings() {
  const frame = $("playlistFrame");
  if (frame && state.settings.playlist_url) {
    if (frame.src !== state.settings.playlist_url)
      frame.src = state.settings.playlist_url;
  }
}

/* ---------------- 6. PIN GATE ----------------
   The site is locked until the right key is entered. This is a
   soft gate, not a vault: anything sent to a browser can be read
   by someone determined. It keeps the site private from casual
   eyes, which is what it's for.
   ------------------------------------------------------------ */

const LOCK_ATTEMPTS = 5;          // wrong tries before a cooldown
const LOCK_COOLDOWN = 30;         // seconds

let pinBusy = false;              // ignore input mid-animation
let wrongTries = 0;
let cooldownTimer = null;

function setLocked(locked) {
  document.body.classList.toggle("locked", locked);
}

function enterDigit(digit) {
  if (pinBusy || pin.length >= MAX_PIN_LENGTH) return;
  pin += digit;
  updateDots();
  hidePinError();
  buzz(8);

  // full length? check it without making her hunt for the tick
  if (pin.length === MAX_PIN_LENGTH) setTimeout(submitPin, 180);
}

function clearPin() {
  if (pinBusy || !pin.length) return;
  pin = pin.slice(0, -1);
  updateDots();
  hidePinError();
  buzz(8);
}

function updateDots() {
  document.querySelectorAll(".pin-dot").forEach((dot, i) => {
    dot.classList.toggle("filled", i < pin.length);
  });
}

function hidePinError() {
  const e = $("pinError");
  if (e) e.style.display = "none";
}

function showPinError(msg) {
  const e = $("pinError");
  if (!e) return;
  if (msg) e.textContent = msg;
  e.style.display = "block";
}

function buzz(ms) {
  if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (_) {} }
}

function submitPin() {
  if (pinBusy) return;

  const expected = String(state.settings.visitor_pin || "080625");

  if (pin === expected) {
    pinBusy = true;
    wrongTries = 0;
    $("pinPad").classList.add("accepted");
    buzz([12, 60, 22]);
    setTimeout(() => {
      unlockSite();
      pinBusy = false;
    }, 620);
    return;
  }

  // wrong
  pinBusy = true;
  wrongTries++;
  buzz([30, 50, 30]);
  const pad = $("pinPad");
  pad.classList.add("rejected");
  showPinError();

  setTimeout(() => {
    pad.classList.remove("rejected");
    pin = "";
    updateDots();
    pinBusy = false;
    if (wrongTries >= LOCK_ATTEMPTS) startCooldown(LOCK_COOLDOWN);
  }, 520);
}

/* after too many wrong guesses, the pad rests for a bit */
function startCooldown(seconds) {
  const pad = $("pinPad");
  pinBusy = true;
  pad.classList.add("resting");

  const tick = () => {
    showPinError("The grove is resting. Try again in " + seconds + "s 🌙");
    if (seconds-- <= 0) {
      clearInterval(cooldownTimer);
      pad.classList.remove("resting");
      pinBusy = false;
      wrongTries = 0;
      hidePinError();
      const e = $("pinError");
      if (e) e.textContent = "You are not Madi, f off pls 🚫";
    }
  };
  tick();
  cooldownTimer = setInterval(tick, 1000);
}

/* No sessions, no cookies, no stored tokens. The gate is asked
   for on every single visit, every reload. Nothing is kept.      */

function unlockSite() {
  $("pinOverlay").style.display = "none";
  hidePinError();
  setLocked(false);
  closeAllOverlays();
}

/* ---- typing works too, for you on a laptop ---- */

document.addEventListener("keydown", (ev) => {
  if (document.body.classList.contains("locked") === false) return;
  if ($("keeperGate").style.display === "flex") return;   // let the login form type
  if (ev.key >= "0" && ev.key <= "9") { enterDigit(ev.key); ev.preventDefault(); }
  else if (ev.key === "Backspace") { clearPin(); ev.preventDefault(); }
  else if (ev.key === "Enter") { submitPin(); ev.preventDefault(); }
});

/* ---------------- 7. LETTERS / JOURNAL ---------------- */

function openDailyLetter() {
  $("scrollContent").innerHTML = textToHtml(state.settings.daily_letter);
  $("scrollOverlay").style.display = "block";
  closeNotebookPage();
  closeMusicPlayer();
  stopTimer();
}

function openNotebookPage() {
  $("notebookPageOverlay").style.display = "flex";
  populateNotebookTabs();
  closeScroll();
  closeMusicPlayer();
  closeMemoryPage();
  stopTimer();
}

function closeNotebookPage() {
  $("notebookPageOverlay").style.display = "none";
}

function populateNotebookTabs() {
  const tabs = $("notebookTabs");
  const area = $("notebookContentArea");
  if (!tabs || !area) return;

  tabs.innerHTML = "";
  area.innerHTML = "";

  state.entries.forEach((entry) => {
    const tab = document.createElement("div");
    tab.className = "notebook-tab";
    tab.dataset.content = entry.id;
    tab.textContent = entry.label;
    tab.onclick = () => showNotebookContent(entry.id);
    tabs.appendChild(tab);

    const div = document.createElement("div");
    div.id = `notebook-${entry.id}`;
    div.innerHTML = textToHtml(entry.body);
    area.appendChild(div);
  });
}

function showNotebookContent(id) {
  document
    .querySelectorAll("#notebookContentArea > div")
    .forEach((d) => d.classList.remove("active"));

  const envelope = $("entryEnvelope");
  envelope.style.display = "block";
  setTimeout(() => {
    const target = $(`notebook-${id}`);
    if (target) target.classList.add("active");
    envelope.style.display = "none";
  }, 800);

  document.querySelectorAll(".notebook-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.content === String(id));
  });
}

function closeEntryContent() {
  document
    .querySelectorAll("#notebookContentArea > div")
    .forEach((d) => d.classList.remove("active"));
  document
    .querySelectorAll(".notebook-tab")
    .forEach((t) => t.classList.remove("active"));
}

/* ---------------- 8. ALBUM ---------------- */

function populateMemoryAlbumImages() {
  const album = $("memoryAlbum");
  if (!album) return;
  album.innerHTML = "";
  state.photos.forEach((p) => {
    const figure = document.createElement("figure");
    figure.className = "memory-figure";
    const img = document.createElement("img");
    img.src = p.url;
    img.alt = p.caption || "Memory";
    img.className = "memory-photo";
    img.loading = "lazy";
    figure.appendChild(img);
    if (p.caption) {
      const cap = document.createElement("figcaption");
      cap.className = "memory-caption";
      cap.textContent = p.caption;
      figure.appendChild(cap);
    }
    album.appendChild(figure);
  });
}

function toggleAlbum() {
  closeNotebookPage();
  closeScroll();
  closeMusicPlayer();
  $("memoryPageOverlay").style.display = "block";
}

function closeMemoryPage() {
  $("memoryPageOverlay").style.display = "none";
}

/* ---------------- 9. TIMER ---------------- */

function openTimeSinceMet() {
  $("scrollContent").innerHTML =
    `<h3>Our Enchanting Journey Together! 💖</h3><div id="timerDisplay"></div>`;
  $("scrollOverlay").style.display = "block";
  closeNotebookPage();
  closeMusicPlayer();
  closeMemoryPage();
  startTimer();
}

function startTimer() {
  stopTimer();
  updateTimeSinceMet();
  timerInterval = setInterval(updateTimeSinceMet, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
}

function updateTimeSinceMet() {
  const el = $("timerDisplay");
  if (!el) return;
  const metDate = new Date(state.settings.met_date);
  const seconds = Math.floor((new Date() - metDate) / 1000);
  const days = Math.floor(seconds / 86400);
  const hrs = String(Math.floor((seconds % 86400) / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  el.textContent = `${days} days, ${hrs}h ${mins}m ${secs}s`;
}

/* ---------------- 10. MISC OVERLAYS ---------------- */

function closeScroll() {
  $("scrollOverlay").style.display = "none";
  stopTimer();
}

function openMusicPlayer() {
  $("musicOverlay").style.display = "flex";
  closeScroll();
  closeNotebookPage();
  closeMemoryPage();
  stopTimer();
}

function closeMusicPlayer() {
  $("musicOverlay").style.display = "none";
}

function closeAllOverlays() {
  closeScroll();
  closeNotebookPage();
  closeMusicPlayer();
  closeMemoryPage();
  stopTimer();
}

function pingMadi() {
  // Send a real notification if push is wired up...
  if (typeof window.sendGrovePing === "function" && window.sendGrovePing()) return;

  // ...otherwise fall back to opening a text message.
  const num = state.settings.ping_number || "";
  if (!num) return whisper("No number saved, and push isn't ready yet.", true);
  const msg = encodeURIComponent(state.settings.ping_message || "Hi!");
  window.location.href = `sms:${num}?body=${msg}`;
}

/* ============================================================
   11. THE KEEPER'S GATE  (admin)
   ============================================================ */

function openKeeperGate() {
  if (state.isAdmin) {
    openAdminPanel();
    return;
  }
  $("keeperGate").style.display = "flex";
  $("keeperEmail").focus();
}

function closeKeeperGate() {
  $("keeperGate").style.display = "none";
  $("keeperError").textContent = "";
}

async function keeperSignIn() {
  if (!db) {
    $("keeperError").textContent = "The grove isn't connected yet (check config.js).";
    return;
  }
  const email = $("keeperEmail").value.trim();
  const password = $("keeperPassword").value;
  $("keeperError").textContent = "Knocking on the door…";

  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) {
    $("keeperError").textContent = "That key doesn't fit. " + error.message;
    return;
  }
  state.isAdmin = true;
  $("keeperPassword").value = "";
  closeKeeperGate();
  unlockSite();
  showKeeperBadge();
  openAdminPanel();
  whisper("🌿 Welcome back, keeper.");
}

async function keeperSignOut() {
  if (db) await db.auth.signOut();
  state.isAdmin = false;
  closeAdminPanel();
  const badge = $("keeperBadge");
  if (badge) badge.style.display = "none";
  whisper("🍃 Signed out.");
}

function showKeeperBadge() {
  const badge = $("keeperBadge");
  if (badge) badge.style.display = "flex";
}

function openAdminPanel() {
  $("adminPanel").style.display = "block";
  adminTab("journal");
}

function closeAdminPanel() {
  $("adminPanel").style.display = "none";
}

function adminTab(name) {
  ["journal", "album", "letter", "settings"].forEach((t) => {
    const pane = $("admin-" + t);
    if (pane) pane.style.display = t === name ? "block" : "none";
    const btn = $("adminTab-" + t);
    if (btn) btn.classList.toggle("active", t === name);
  });
  if (name === "journal") renderAdminEntries();
  if (name === "album") renderAdminPhotos();
  if (name === "letter") $("adminDailyLetter").value = state.settings.daily_letter || "";
  if (name === "settings") {
    $("adminMetDate").value = state.settings.met_date || "";
    $("adminPin").value = state.settings.visitor_pin || "";
    $("adminPingNumber").value = state.settings.ping_number || "";
    $("adminPingMessage").value = state.settings.ping_message || "";
    $("adminPlaylist").value = state.settings.playlist_url || "";
  }
}

/* ---- journal admin ---- */

function renderAdminEntries() {
  const list = $("adminEntryList");
  list.innerHTML = state.entries
    .map(
      (e) => `
      <div class="admin-row">
        <span class="admin-row-label">${esc(e.label)}</span>
        <button class="admin-mini" onclick="editEntry(${e.id})">edit</button>
        <button class="admin-mini danger" onclick="deleteEntry(${e.id})">×</button>
      </div>`
    )
    .join("");
}

function newEntry() {
  state.editingEntryId = null;
  $("entryLabel").value = "";
  $("entryDate").value = "";
  $("entryBody").value = "";
  $("entryPosition").value = state.entries.length + 1;
  $("entryFormTitle").textContent = "A new page";
  $("entryForm").style.display = "block";
}

function editEntry(id) {
  const e = state.entries.find((x) => x.id === id);
  if (!e) return;
  state.editingEntryId = id;
  $("entryLabel").value = e.label || "";
  $("entryDate").value = e.entry_date || "";
  $("entryBody").value = e.body || "";
  $("entryPosition").value = e.position ?? 0;
  $("entryFormTitle").textContent = "Editing this page";
  $("entryForm").style.display = "block";
}

function cancelEntryForm() {
  $("entryForm").style.display = "none";
  state.editingEntryId = null;
}

async function saveEntry() {
  if (!db) return whisper("Not connected to the grove.", true);
  const payload = {
    label: $("entryLabel").value.trim() || "Untitled",
    body: $("entryBody").value,
    entry_date: $("entryDate").value || null,
    position: parseInt($("entryPosition").value || "0", 10),
  };

  let res;
  if (state.editingEntryId) {
    res = await db.from("entries").update(payload).eq("id", state.editingEntryId);
  } else {
    res = await db.from("entries").insert(payload);
  }
  if (res.error) return whisper(res.error.message, true);

  cancelEntryForm();
  await loadAll();
  renderAdminEntries();
  whisper("🌱 Page saved.");
}

async function deleteEntry(id) {
  if (!confirm("Tear this page out for good?")) return;
  const { error } = await db.from("entries").delete().eq("id", id);
  if (error) return whisper(error.message, true);
  await loadAll();
  renderAdminEntries();
  whisper("🍂 Page removed.");
}

/* ---- album admin ---- */

function renderAdminPhotos() {
  const list = $("adminPhotoList");
  list.innerHTML = state.photos
    .map(
      (p) => `
      <div class="admin-photo">
        <img src="${esc(p.url)}" alt="">
        <input class="admin-input tiny" value="${esc(p.caption)}"
               placeholder="a little caption…"
               onchange="savePhotoCaption(${p.id}, this.value)">
        <button class="admin-mini danger" onclick="deletePhoto(${p.id})">×</button>
      </div>`
    )
    .join("");
}

async function uploadPhotos(input) {
  if (!db) return whisper("Not connected to the grove.", true);
  const files = Array.from(input.files || []);
  if (!files.length) return;
  $("uploadStatus").textContent = `Planting ${files.length} memory(ies)…`;

  let n = state.photos.length;
  for (const file of files) {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}_${safe}`;
    const up = await db.storage.from("memories").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (up.error) {
      whisper(up.error.message, true);
      continue;
    }
    await db.from("photos").insert({ path, caption: "", position: n++ });
  }

  input.value = "";
  $("uploadStatus").textContent = "";
  await loadAll();
  renderAdminPhotos();
  whisper("📸 Memories added.");
}

async function savePhotoCaption(id, caption) {
  const { error } = await db.from("photos").update({ caption }).eq("id", id);
  if (error) return whisper(error.message, true);
  await loadAll();
  whisper("✍️ Caption saved.");
}

async function deletePhoto(id) {
  const p = state.photos.find((x) => x.id === id);
  if (!p || !confirm("Let this memory go?")) return;
  if (p.path) await db.storage.from("memories").remove([p.path]);
  const { error } = await db.from("photos").delete().eq("id", id);
  if (error) return whisper(error.message, true);
  await loadAll();
  renderAdminPhotos();
  whisper("🍃 Memory removed.");
}

/* ---- settings admin ---- */

async function saveSetting(key, value) {
  if (!db) return whisper("Not connected to the grove.", true);
  const { error } = await db.from("settings").upsert({ key, value });
  if (error) return whisper(error.message, true);
  state.settings[key] = value;
  applySettings();
  whisper("✨ Saved.");
}

async function saveDailyLetter() {
  await saveSetting("daily_letter", $("adminDailyLetter").value);
}

async function saveAllSettings() {
  await saveSetting("met_date", $("adminMetDate").value);
  await saveSetting("visitor_pin", $("adminPin").value);
  await saveSetting("ping_number", $("adminPingNumber").value);
  await saveSetting("ping_message", $("adminPingMessage").value);
  await saveSetting("playlist_url", $("adminPlaylist").value);
}

/* ---------------- 12. BOOT ---------------- */

document.addEventListener("DOMContentLoaded", async () => {
  setLocked(true);
  populateNotebookTabs();
  populateMemoryAlbumImages();
  await loadAll();

  // clean up after the older "remember me" build, if it ran here
  try { localStorage.removeItem("grove.remembered"); } catch (_) {}

  if (db) {
    const { data } = await db.auth.getSession();
    if (data && data.session) {
      state.isAdmin = true;
      showKeeperBadge();
    }
  }
});

/* expose for inline onclick handlers, and for push.js */
Object.assign(window, {
  db, state, whisper,
  enterDigit, clearPin, submitPin, unlockSite,
  openDailyLetter, openNotebookPage, closeNotebookPage, closeEntryContent,
  toggleAlbum, closeMemoryPage, openTimeSinceMet,
  closeScroll, openMusicPlayer, closeMusicPlayer, pingMadi,
  openKeeperGate, closeKeeperGate, keeperSignIn, keeperSignOut,
  openAdminPanel, closeAdminPanel, adminTab,
  newEntry, editEntry, cancelEntryForm, saveEntry, deleteEntry,
  uploadPhotos, savePhotoCaption, deletePhoto,
  saveDailyLetter, saveAllSettings,
});