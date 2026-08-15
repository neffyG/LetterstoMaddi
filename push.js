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

  /* Safari resolves register() before the worker has actually
     activated, and subscribing to a worker that isn't running
     fails. Wait for it properly.                                */
  function readyRegistration() {
    if (!("serviceWorker" in navigator)) return Promise.reject(new Error("no service worker"));
    return navigator.serviceWorker.ready.then(function (r) { return r || reg; });
  }

  /* ---------- her side: a quiet invitation ---------- */

  function maybeInvite() {
    if (!SUPPORTED) return;
    if (Notification.permission === "granted") return syncSubscription();
    if (Notification.permission === "denied") return;
    if (isIOS() && !isInstalled()) return;      // can't work yet; don't nag

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
      return say("On iPhone: Share to Home Screen first", true);
    }
    if (typeof VAPID_PUBLIC_KEY === "undefined" || !VAPID_PUBLIC_KEY) {
      return say("Notifications aren't configured yet.", true);
    }

    // Safari wants this called straight from the tap, before any await
    var ask;
    try { ask = Notification.requestPermission(); }
    catch (e) { return say("perm: " + e.message, true); }

    if (!ask || typeof ask.then !== "function") {      // very old callback style
      return Notification.requestPermission(function (r) {
        if (r === "granted") syncSubscription(true);
      });
    }

    ask.then(function (result) {
      if (result !== "granted") return say("No worries, nothing will be sent.");
      syncSubscription(true);
    }).catch(function (e) {
      say("perm: " + (e && e.message ? e.message : e), true);
    });
  }

  function syncSubscription(announce) {
    var stage = "worker";

    return readyRegistration()
      .then(function (r) {
        stage = "subscribe";
        if (!r) throw new Error("no registration");
        return r.pushManager.getSubscription().then(function (existing) {
          if (existing) return existing;
          return r.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
          });
        });
      })
      .then(function (sub) {
        stage = "save";
        if (!window.db) throw new Error("no database connection");
        var j = sub.toJSON();
        if (!j.keys || !j.keys.p256dh || !j.keys.auth) throw new Error("subscription had no keys");
        return window.db.from("push_subs").upsert({
          endpoint: sub.endpoint,
          p256dh: j.keys.p256dh,
          auth: j.keys.auth,
          label: isIOS() ? "iPhone" : "browser"
        }, { onConflict: "endpoint" });
      })
      .then(function (res) {
        if (res && res.error) throw new Error(res.error.message || JSON.stringify(res.error));
        if (announce) say("She'll feel it now.");
      })
      .catch(function (e) {
        var msg = (e && e.message) ? e.message : String(e);
        console.warn("push " + stage + " failed:", e);
        // name the real reason; a vague message helps nobody
        if (announce) say(stage + ": " + msg, true);
      });
  }

  /* ---------- his side: send one ---------- */

  function sendGrovePing() {
    if (!window.db) return false;

    var preset = (window.state && state.settings && state.settings.ping_message) || "Thinking about you";
    var text = window.prompt("What should she feel?", preset);
    if (text === null) return true;
    text = text.trim();
    if (!text) return true;

    say("Sending...");

    window.db.auth.getSession().then(function (r) {
      var token = r && r.data && r.data.session && r.data.session.access_token;
      if (!token) { say("Open the gate first", true); return; }

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
          if (!out.j.sent) say("Nobody has turned them on yet.", true);
          else say("Sent to " + out.j.sent + (out.j.sent === 1 ? " device." : " devices."));
        });
    }).catch(function (e) {
      console.warn(e);
      say("Ping failed: " + (e && e.message ? e.message : e), true);
    });

    return true;
  }

  function say(msg, bad) {
    if (typeof window.whisper === "function") window.whisper(msg, !!bad);
  }

  /* ---------- diagnosis you can read on the phone ----------
     Tap the acorn area, or run pushStatus() from a console.   */

  function pushStatus() {
    var lines = [
      "supported: " + SUPPORTED,
      "iOS: " + isIOS(),
      "installed: " + isInstalled(),
      "permission: " + (window.Notification ? Notification.permission : "n/a"),
      "vapid: " + (typeof VAPID_PUBLIC_KEY !== "undefined" ? VAPID_PUBLIC_KEY.length + " chars" : "MISSING"),
      "db object: " + (!!window.db)
    ];

    if (!SUPPORTED) return alert(lines.join("\n"));

    navigator.serviceWorker.getRegistration().then(function (r) {
      lines.push("worker: " + (r ? (r.active ? "active" : "registered, not active") : "none"));
      if (!r) return alert(lines.join("\n"));
      return r.pushManager.getSubscription().then(function (s) {
        lines.push("subscription: " + (s ? "yes" : "no"));
        alert(lines.join("\n"));
      });
    }).catch(function (e) {
      lines.push("error: " + e.message);
      alert(lines.join("\n"));
    });
  }

  /* triple-tap the ping horn to see the diagnosis */
  var taps = 0, tapTimer = null;
  document.addEventListener("DOMContentLoaded", function () {
    var horn = document.querySelector(".blowhorn-icon");
    if (!horn) return;
    horn.addEventListener("touchstart", function () {
      taps++;
      clearTimeout(tapTimer);
      if (taps >= 3) { taps = 0; pushStatus(); return; }
      tapTimer = setTimeout(function () { taps = 0; }, 700);
    });
  });

  window.enablePings = enablePings;
  window.sendGrovePing = sendGrovePing;
  window.pushStatus = pushStatus;
  window.retryPush = function () { syncSubscription(true); };
})();