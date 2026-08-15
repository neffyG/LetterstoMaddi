/* ============================================================
   push.js — notifications.
   She subscribes once. He taps the horn. She gets a nudge.

   Additive: if anything here fails, the site carries on exactly
   as before and the horn falls back to opening a text message.
   ============================================================ */

(function () {
  "use strict";

  var SUPPORTED = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  var reg = null;

  /* iOS only allows web push when the site has been added to the
     Home Screen. Detect that so we can explain rather than fail. */
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }
  function isInstalled() {
    return window.navigator.standalone === true ||
           window.matchMedia("(display-mode: standalone)").matches;
  }

  function urlB64ToUint8Array(base64) {
    var padding = "=".repeat((4 - (base64.length % 4)) % 4);
    var b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    var raw = atob(b64);
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  /* ---------- register the worker ---------- */

  if (SUPPORTED) {
    navigator.serviceWorker.register("sw.js")
      .then(function (r) { reg = r; maybeInvite(); })
      .catch(function (e) { console.warn("Service worker did not register.", e); });
  }

  /* ---------- her side: a quiet invitation ---------- */

  function maybeInvite() {
    if (!SUPPORTED) return;
    if (Notification.permission === "granted") return syncSubscription();
    if (Notification.permission === "denied") return;
    if (isIOS() && !isInstalled()) return;      // can't work yet; don't nag

    // wait until she's actually through the gate
    var check = setInterval(function () {
      if (document.body.classList.contains("locked")) return;
      clearInterval(check);
      setTimeout(showInvite, 2500);
    }, 800);
  }

  function showInvite() {
    if (document.getElementById("pushInvite")) return;

    var card = document.createElement("div");
    card.id = "pushInvite";
    card.className = "push-invite";
    card.innerHTML =
      '<div class="push-invite-text">' +
        '<strong>Let him tap you on the shoulder?</strong>' +
        '<span>A little firefly, now and then. Nothing else.</span>' +
      '</div>' +
      '<div class="push-invite-actions">' +
        '<button class="push-yes">Yes please</button>' +
        '<button class="push-no">Not now</button>' +
      '</div>';

    document.body.appendChild(card);
    requestAnimationFrame(function () { card.classList.add("show"); });

    card.querySelector(".push-no").onclick = function () { dismiss(card); };
    card.querySelector(".push-yes").onclick = function () {
      dismiss(card);
      enablePings();
    };
  }

  function dismiss(card) {
    card.classList.remove("show");
    setTimeout(function () { card.remove(); }, 400);
  }

  /* ---------- subscribe ---------- */

  function enablePings() {
    if (!SUPPORTED) return say("This browser can't do notifications.", true);

    if (isIOS() && !isInstalled()) {
      return say("On iPhone: Share → Add to Home Screen first 🌱", true);
    }
    if (typeof VAPID_PUBLIC_KEY === "undefined" || !VAPID_PUBLIC_KEY) {
      return say("Notifications aren't configured yet.", true);
    }

    Notification.requestPermission().then(function (result) {
      if (result !== "granted") return say("No worries — nothing will be sent.");
      syncSubscription(true);
    });
  }

  function syncSubscription(announce) {
    if (!reg || !window.db) return;

    reg.pushManager.getSubscription()
      .then(function (existing) {
        if (existing) return existing;
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      })
      .then(function (sub) {
        var j = sub.toJSON();
        return window.db.from("push_subs").upsert({
          endpoint: sub.endpoint,
          p256dh: j.keys.p256dh,
          auth: j.keys.auth,
          label: isIOS() ? "iPhone" : "browser"
        }, { onConflict: "endpoint" });
      })
      .then(function (res) {
        if (res && res.error) throw res.error;
        if (announce) say("🌿 She'll feel it now.");
      })
      .catch(function (e) {
        console.warn("Could not subscribe.", e);
        if (announce) say("That didn't take. Try again?", true);
      });
  }

  /* ---------- his side: send one ---------- */

  function sendGrovePing() {
    if (!window.db) return false;

    var preset = (window.state && state.settings && state.settings.ping_message) || "Thinking about you 🌿";
    var text = window.prompt("What should she feel?", preset);
    if (text === null) return true;                       // cancelled
    text = text.trim();
    if (!text) return true;

    say("Sending…");

    window.db.auth.getSession().then(function (r) {
      var token = r && r.data && r.data.session && r.data.session.access_token;
      if (!token) { say("Open the gate first 🌰", true); return; }

      return fetch(SUPABASE_URL + "/functions/v1/send-ping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ body: text })
      })
        .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, j: j }; }); })
        .then(function (out) {
          if (!out.ok) throw new Error(out.j.error || "failed");
          if (!out.j.sent) say("She hasn't turned them on yet.", true);
          else say("🌿 Sent to " + out.j.sent + (out.j.sent === 1 ? " device." : " devices."));
        });
    }).catch(function (e) {
      console.warn(e);
      say("It didn't get through.", true);
    });

    return true;
  }

  function say(msg, bad) {
    if (typeof window.whisper === "function") window.whisper(msg, !!bad);
  }

  window.enablePings = enablePings;
  window.sendGrovePing = sendGrovePing;
})();
