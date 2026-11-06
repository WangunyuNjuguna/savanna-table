// js/cloud-save.js - Phase 9 stub. Safe to ignore in Phase 1.
// If FIREBASE_CONFIG is null/offline, every function below just returns { ok:false, reason:"offline" }.
import { FIREBASE_CONFIG, CLOUD_ENABLED } from "./firebase-config.js";

export async function cloudSync() {
  if (!CLOUD_ENABLED || !FIREBASE_CONFIG) return { ok: false, reason: "Cloud save disabled — playing offline. See README." };
  return { ok: false, reason: "Not wired yet (Phase 9)." };
}
