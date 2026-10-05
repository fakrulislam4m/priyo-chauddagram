var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/apiRouter.ts
var import_express = __toESM(require("express"), 1);

// server/noticeSync.ts
var import_https = __toESM(require("https"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var cheerio = __toESM(require("cheerio"), 1);
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
function getDb() {
  const configPath = import_path.default.resolve(process.cwd(), "firebase-applet-config.json");
  if (!import_fs.default.existsSync(configPath)) {
    throw new Error("firebase-applet-config.json not found");
  }
  const config = JSON.parse(import_fs.default.readFileSync(configPath, "utf8"));
  const appName = "notice-sync-app";
  const existingApp = (0, import_app.getApps)().find((a) => a.name === appName);
  const app = existingApp || (0, import_app.initializeApp)({
    apiKey: config.apiKey,
    projectId: config.projectId,
    appId: config.appId,
    authDomain: config.authDomain
  }, appName);
  return (0, import_firestore.getFirestore)(app, config.firestoreDatabaseId);
}
async function fetchGovernmentNoticesFromPortal() {
  const url = "https://chauddagram.comilla.gov.bd/pages/notices";
  const agent = new import_https.default.Agent({ rejectUnauthorized: false });
  return new Promise((resolve, reject) => {
    const req = import_https.default.get(url, {
      agent,
      headers: {
        "User-Agent": "PriyoChauddagram-NoticeSync/1.0 (+https://chauddagram.comilla.gov.bd; info@priyodigitallab.com)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "bn-BD,bn;q=0.9,en;q=0.8"
      },
      timeout: 15e3
    }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Government portal returned HTTP status ${res.statusCode}`));
      }
      let rawData = "";
      res.on("data", (chunk) => {
        if (rawData.length + chunk.length > 10 * 1024 * 1024) {
          req.destroy();
          return reject(new Error("Response size limit exceeded (max 10MB)"));
        }
        rawData += chunk;
      });
      res.on("end", () => {
        try {
          const $ = cheerio.load(rawData);
          const notices = [];
          $("table tr").each((idx, tr) => {
            const cells = $(tr).find("td");
            if (cells.length >= 3) {
              const serial = $(cells[0]).text().trim();
              const titleEl = $(cells[1]);
              const title = titleEl.text().trim();
              const files = [];
              $(tr).find("a").each((_, a) => {
                const href = $(a).attr("href");
                if (href) {
                  const fullHref = href.startsWith("http") ? href : `https://chauddagram.comilla.gov.bd${href}`;
                  if (fullHref.match(/\.(pdf|jpe?g|png|docx?)/i) || fullHref.includes("/files/")) {
                    if (!files.includes(fullHref)) {
                      files.push(fullHref);
                    }
                  }
                }
              });
              let noticeUrl = "";
              $(tr).find("a").each((_, a) => {
                const href = $(a).attr("href");
                if (href && (href.includes("/pages/notices/") || href.includes("/notice/"))) {
                  noticeUrl = href.startsWith("http") ? href : `https://chauddagram.comilla.gov.bd${href}`;
                }
              });
              let publishedDate = "";
              for (let c = 2; c < cells.length; c++) {
                const text = $(cells[c]).text().trim();
                if (/\d{1,2}[-/.]\d{1,2}[-/.]\d{4}/.test(text) || text.includes("\u09E8\u09E6\u09E8") || text.includes("202")) {
                  publishedDate = text;
                  break;
                }
              }
              if (title && title !== "\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE") {
                notices.push({
                  serial,
                  title,
                  publishedDate: publishedDate || "\u09B8\u09BE\u09AE\u09CD\u09AA\u09CD\u09B0\u09A4\u09BF\u0995",
                  files,
                  noticeUrl: noticeUrl || `https://chauddagram.comilla.gov.bd/pages/notices`
                });
              }
            }
          });
          resolve(notices);
        } catch (parseErr) {
          reject(new Error(`HTML Parsing error: ${parseErr.message}`));
        }
      });
    });
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Connection timed out to chauddagram.comilla.gov.bd"));
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}
async function runNoticeSync(triggeredBy = "scheduled_job") {
  const runId = `sync_${Date.now()}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const errors = [];
  let fetchedCount = 0;
  let addedCount = 0;
  let updatedCount = 0;
  let runRef = null;
  try {
    const db = getDb();
    runRef = (0, import_firestore.doc)(db, "sync_runs", runId);
    try {
      await (0, import_firestore.setDoc)(runRef, {
        id: runId,
        status: "Running",
        started_at: now,
        completed_at: null,
        notices_fetched: 0,
        notices_added: 0,
        notices_updated: 0,
        errors: [],
        triggered_by: triggeredBy,
        server_sync_verified: true
      });
    } catch (setErr) {
      console.warn("[Sync] Could not write initial sync run doc:", setErr.message);
    }
    const rawNotices = await fetchGovernmentNoticesFromPortal();
    fetchedCount = rawNotices.length;
    for (const item of rawNotices) {
      try {
        const hashInput = `${item.title.trim()}_${item.publishedDate.trim()}_${item.noticeUrl}`;
        const sourceHash = import_crypto.default.createHash("sha256").update(hashInput).digest("hex").substring(0, 16);
        const noticeId = `gov_${sourceHash}`;
        const noticeDocRef = (0, import_firestore.doc)(db, "government_notices", noticeId);
        const existingSnap = await (0, import_firestore.getDoc)(noticeDocRef);
        if (!existingSnap.exists()) {
          await (0, import_firestore.setDoc)(noticeDocRef, {
            id: noticeId,
            source_domain: "chauddagram.comilla.gov.bd",
            source_title_bn: item.title,
            source_title_en: item.title,
            // Can be refined by admin
            published_date: item.publishedDate,
            original_notice_url: item.noticeUrl,
            original_file_urls: item.files,
            source_hash: sourceHash,
            status: "Published",
            imported_from: "https://chauddagram.comilla.gov.bd/pages/notices",
            fetched_at: now,
            first_seen_at: now,
            last_seen_at: now,
            attribution_bn: "\u0989\u09CE\u09B8: \u099A\u09CC\u09A6\u09CD\u09A6\u0997\u09CD\u09B0\u09BE\u09AE \u0989\u09AA\u099C\u09C7\u09B2\u09BE \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F",
            attribution_en: "Source: Chauddagram Upazila Government Website",
            created_at: now,
            updated_at: now,
            server_sync_verified: true
          });
          addedCount++;
        } else {
          await (0, import_firestore.setDoc)(noticeDocRef, {
            last_seen_at: now,
            updated_at: now,
            original_file_urls: item.files.length > 0 ? item.files : existingSnap.data().original_file_urls || [],
            server_sync_verified: true
          }, { merge: true });
          updatedCount++;
        }
      } catch (itemErr) {
        errors.push(`Notice "${item.title.substring(0, 30)}": ${itemErr.message}`);
      }
    }
    const finishTime = (/* @__PURE__ */ new Date()).toISOString();
    await (0, import_firestore.setDoc)(runRef, {
      status: errors.length > 0 && addedCount === 0 ? "Partial Failure" : "Success",
      completed_at: finishTime,
      notices_fetched: fetchedCount,
      notices_added: addedCount,
      notices_updated: updatedCount,
      errors,
      server_sync_verified: true
    }, { merge: true });
    return {
      success: true,
      message: `Sync finished: ${fetchedCount} fetched, ${addedCount} added, ${updatedCount} updated.`,
      noticesFetched: fetchedCount,
      noticesAdded: addedCount,
      noticesUpdated: updatedCount,
      errors,
      runId
    };
  } catch (err) {
    const finishTime = (/* @__PURE__ */ new Date()).toISOString();
    const errMsg = err.message || "Unknown sync error";
    errors.push(errMsg);
    if (runRef) {
      try {
        await (0, import_firestore.setDoc)(runRef, {
          status: "Failed",
          completed_at: finishTime,
          notices_fetched: fetchedCount,
          notices_added: addedCount,
          notices_updated: updatedCount,
          errors,
          server_sync_verified: true
        }, { merge: true });
      } catch (logErr) {
        console.warn("[Sync] Failed to write error status to runRef:", logErr);
      }
    }
    return {
      success: false,
      message: `Sync failed: ${errMsg}`,
      noticesFetched: fetchedCount,
      noticesAdded: addedCount,
      noticesUpdated: updatedCount,
      errors,
      runId
    };
  }
}

// server/apiRouter.ts
var import_app2 = require("firebase/app");
var import_firestore2 = require("firebase/firestore");
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var apiRouter = import_express.default.Router();
apiRouter.use(import_express.default.json());
function getDb2() {
  const configPath = import_path2.default.resolve(process.cwd(), "firebase-applet-config.json");
  const config = JSON.parse(import_fs2.default.readFileSync(configPath, "utf8"));
  const appName = "priyo-server-api-app";
  const existingApp = (0, import_app2.getApps)().find((a) => a.name === appName);
  const app = existingApp || (0, import_app2.initializeApp)(config, appName);
  return (0, import_firestore2.getFirestore)(app, config.firestoreDatabaseId);
}
var PRIMARY_ADMIN_EMAILS = [
  "matelecom.cb71@gmail.com",
  "fakrul@priyodigitallab.com"
];
async function verifyIsAdmin(email) {
  if (!email || typeof email !== "string") {
    return { isAdmin: false, role: "user", name: "" };
  }
  const cleanEmail = email.toLowerCase().trim();
  if (PRIMARY_ADMIN_EMAILS.includes(cleanEmail)) {
    return { isAdmin: true, role: "primary_admin", name: "Fakrul Islam" };
  }
  try {
    const db = getDb2();
    const adminDoc = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "admin_users", cleanEmail));
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      const role = data.role || "admin";
      if (["admin", "super_admin", "primary_admin"].includes(role)) {
        return {
          isAdmin: true,
          role,
          name: data.name || "Admin"
        };
      }
    }
  } catch (err) {
    console.error("Error verifying admin in Firestore:", err);
  }
  return { isAdmin: false, role: "user", name: "" };
}
async function requireAdminMiddleware(req, res, next) {
  const emailHeader = req.headers["x-admin-email"] || req.body?.adminEmail || req.body?.email || req.query?.adminEmail;
  const verification = await verifyIsAdmin(emailHeader);
  if (!verification.isAdmin) {
    return res.status(403).json({
      error: "Access denied: Admin privileges required (403 Forbidden)",
      message: "\u0986\u09AA\u09A8\u09BE\u09B0 \u098F\u0987 \u09AA\u09CD\u09B0\u09B6\u09BE\u09B8\u09A8\u09BF\u0995 \u0985\u09AA\u09BE\u09B0\u09C7\u09B6\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09BE\u09B0 \u0985\u09A8\u09C1\u09AE\u09A4\u09BF \u09A8\u09C7\u0987\u0964",
      status: 403
    });
  }
  req.adminUser = verification;
  next();
}
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Priyo Chauddagram",
    version: "1.0.0",
    location: "Chauddagram, Cumilla, Bangladesh",
    developer: "Fakrul Islam",
    studio: "Priyo Digital Lab",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.all("/admin/verify", async (req, res) => {
  try {
    const email = req.body?.email || req.query?.email || req.headers["x-admin-email"];
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const verification = await verifyIsAdmin(email);
    return res.json({
      isAdmin: verification.isAdmin,
      role: verification.role,
      name: verification.name,
      email: email.toLowerCase().trim()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.post("/sync/notices", requireAdminMiddleware, async (req, res) => {
  try {
    const email = req.adminUser?.email || "Admin";
    const result = await runNoticeSync(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
apiRouter.get("/sync/history", async (req, res) => {
  try {
    const db = getDb2();
    const snap = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(db, "sync_runs"));
    const runs = [];
    snap.forEach((d) => runs.push(d.data()));
    runs.sort((a, b) => (b.started_at || "").localeCompare(a.started_at || ""));
    res.json({ runs: runs.slice(0, 15) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.post("/audit/log", requireAdminMiddleware, async (req, res) => {
  try {
    const { adminEmail, adminName, action, targetCollection, targetId, details } = req.body;
    const db = getDb2();
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "audit_logs", logId), {
      id: logId,
      admin_email: adminEmail || "Admin",
      admin_name: adminName || "Fakrul Islam",
      action,
      target_collection: targetCollection,
      target_id: targetId,
      details: details || "",
      timestamp: now,
      server_sync_verified: true,
      admin_signature: "fakrul_islam_priyo_chauddagram_auth"
    });
    res.json({ success: true, logId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.post("/admin/notice", requireAdminMiddleware, async (req, res) => {
  try {
    const notice = req.body.notice;
    if (!notice || !notice.title_bn) {
      return res.status(400).json({ error: "Notice title_bn is required" });
    }
    const db = getDb2();
    const id = notice.id || `gov_notice_${Date.now()}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const isEmergency = !!notice.is_emergency || notice.priority === "urgent";
    const noticeDoc = {
      ...notice,
      id,
      title_bn: notice.title_bn,
      source_title_bn: notice.source_title_bn || notice.title_bn,
      description_bn: notice.description_bn || "",
      priority: isEmergency ? "urgent" : notice.priority || "normal",
      is_emergency: isEmergency,
      source_domain: notice.source_domain || "chauddagram.comilla.gov.bd",
      attribution_bn: notice.attribution_bn || "\u0989\u09CE\u09B8: \u099A\u09CC\u09A6\u09CD\u09A6\u0997\u09CD\u09B0\u09BE\u09AE \u0989\u09AA\u099C\u09C7\u09B2\u09BE \u09AA\u09CD\u09B0\u09B6\u09BE\u09B8\u09A8",
      status: notice.status || "Published",
      created_at: notice.created_at || now,
      updated_at: now,
      admin_signature: "fakrul_islam_priyo_chauddagram_auth"
    };
    await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "government_notices", id), noticeDoc, { merge: true });
    res.json({ success: true, notice: noticeDoc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.delete("/admin/notice/:id", requireAdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb2();
    await (0, import_firestore2.deleteDoc)((0, import_firestore2.doc)(db, "government_notices", id));
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.post("/admin/service-card", requireAdminMiddleware, async (req, res) => {
  try {
    const card = req.body.card;
    if (!card || !card.id || !card.name_bn) {
      return res.status(400).json({ error: "Card id and name_bn are required" });
    }
    const db = getDb2();
    await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "service_cards", card.id), {
      ...card,
      admin_signature: "fakrul_islam_priyo_chauddagram_auth",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, { merge: true });
    res.json({ success: true, card });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.delete("/admin/service-card/:id", requireAdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb2();
    await (0, import_firestore2.deleteDoc)((0, import_firestore2.doc)(db, "service_cards", id));
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.post("/admin/emergency-contact", requireAdminMiddleware, async (req, res) => {
  try {
    const contact = req.body.contact;
    if (!contact || !contact.name_bn || !contact.phone) {
      return res.status(400).json({ error: "Contact name_bn and phone are required" });
    }
    const db = getDb2();
    const id = contact.id || `emg_${Date.now()}`;
    const payload = {
      ...contact,
      id,
      admin_signature: "fakrul_islam_priyo_chauddagram_auth",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "emergency_contacts", id), payload, { merge: true });
    res.json({ success: true, contact: payload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.delete("/admin/emergency-contact/:id", requireAdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb2();
    await (0, import_firestore2.deleteDoc)((0, import_firestore2.doc)(db, "emergency_contacts", id));
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.post("/admin/chat-settings", requireAdminMiddleware, async (req, res) => {
  try {
    const settings = req.body.settings;
    const db = getDb2();
    await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "chat_settings", "general"), {
      ...settings,
      admin_signature: "fakrul_islam_priyo_chauddagram_auth",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, { merge: true });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.post("/admin/donor/status", requireAdminMiddleware, async (req, res) => {
  try {
    const { donor_id, status, rejection_reason } = req.body;
    if (!donor_id || !status) {
      return res.status(400).json({ error: "donor_id and status are required" });
    }
    const db = getDb2();
    const donorRef = (0, import_firestore2.doc)(db, "blood_donors", donor_id);
    const updateData = {
      status,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (status === "verified") {
      updateData.verified_at = (/* @__PURE__ */ new Date()).toISOString();
      updateData.verified_by = req.adminUser?.name || "Admin";
      updateData.rejection_reason = "";
    } else if (status === "rejected") {
      updateData.rejection_reason = rejection_reason || "\u09A4\u09A5\u09CD\u09AF \u09AF\u09BE\u099A\u09BE\u0987\u09DF\u09C7 \u0985\u09B8\u0999\u09CD\u0997\u09A4\u09BF \u09AA\u09BE\u0993\u09DF\u09BE \u0997\u09C7\u099B\u09C7";
    }
    await (0, import_firestore2.updateDoc)(donorRef, updateData);
    res.json({ success: true, donor_id, status, updateData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.post("/admin/officer", requireAdminMiddleware, async (req, res) => {
  try {
    const officer = req.body.officer;
    if (!officer || !officer.officer_name_bn || !officer.office_name_bn) {
      return res.status(400).json({ error: "Officer and Office name required" });
    }
    const db = getDb2();
    const id = officer.id || `off_${Date.now()}`;
    const payload = {
      ...officer,
      id,
      admin_signature: "fakrul_islam_priyo_chauddagram_auth",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "office_directory", id), payload, { merge: true });
    res.json({ success: true, officer: payload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.delete("/admin/officer/:id", requireAdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb2();
    await (0, import_firestore2.deleteDoc)((0, import_firestore2.doc)(db, "office_directory", id));
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.get("/chat/messages", async (req, res) => {
  try {
    const db = getDb2();
    const snap = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(db, "community_chat"));
    const messages = [];
    snap.forEach((d) => messages.push(d.data()));
    messages.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.post("/chat/send", async (req, res) => {
  try {
    const { text, sender_name, sender_union, sender_id, sender_email, is_admin, role } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }
    const db = getDb2();
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMsg = {
      id: msgId,
      text: text.trim().slice(0, 1e3),
      sender_name: (sender_name || "\u099A\u09CC\u09A6\u09CD\u09A6\u0997\u09CD\u09B0\u09BE\u09AE\u09AC\u09BE\u09B8\u09C0").trim().slice(0, 100),
      sender_union: sender_union || "\u099A\u09CC\u09A6\u09CD\u09A6\u0997\u09CD\u09B0\u09BE\u09AE",
      sender_id: sender_id || `user_${Date.now()}`,
      sender_email: sender_email || "",
      is_admin: !!is_admin,
      role: role || (is_admin ? "admin" : "resident"),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      pinned: false,
      likes_count: 0,
      reactions: {}
    };
    await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "community_chat", msgId), newMsg);
    res.json({ success: true, message: newMsg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
apiRouter.delete("/chat/message/:id", requireAdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb2();
    await (0, import_firestore2.deleteDoc)((0, import_firestore2.doc)(db, "community_chat", id));
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// server/scheduler.ts
var schedulerInterval = null;
function startNoticeSyncScheduler(intervalMinutes = 60) {
  if (schedulerInterval) return;
  console.log(`[Scheduler] Starting government notice background sync every ${intervalMinutes} minutes.`);
  setTimeout(async () => {
    try {
      console.log("[Scheduler] Running scheduled notice sync check...");
      await runNoticeSync("background_scheduled_job");
    } catch (e) {
      console.error("[Scheduler] Initial sync failed:", e.message);
    }
  }, 3e4);
  schedulerInterval = setInterval(async () => {
    try {
      console.log("[Scheduler] Triggering periodic notice sync...");
      await runNoticeSync("background_scheduled_job");
    } catch (e) {
      console.error("[Scheduler] Scheduled sync error:", e.message);
    }
  }, intervalMinutes * 60 * 1e3);
}

// server.ts
async function startServer() {
  const app = (0, import_express2.default)();
  const PORT = 3e3;
  app.use(import_express2.default.json());
  app.use("/api", apiRouter);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Priyo Chauddagram Server] Running on http://0.0.0.0:${PORT}`);
    startNoticeSyncScheduler(60);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
