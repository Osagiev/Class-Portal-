// One-time (or whenever the class list changes) admin script to seed the
// Firestore "roster" collection from a CSV. Run with the Firebase Admin
// SDK (service account), NOT the client app -- the app itself has no
// permission to create roster entries (see firestore.rules). This only
// needs Firestore, which works on the free Spark plan.
//
// Usage:
//   1. Download a service account key from Firebase console:
//      Project settings -> Service accounts -> Generate new private key
//      Save it as scripts/serviceAccountKey.json (already gitignored).
//   2. Prepare scripts/roster.csv next to this script with columns:
//        matric,fullName,birthday,isAdmin
//      birthday is "MM-DD" (e.g. 03-17), isAdmin is "true"/"false".
//      Leave birthday blank if unknown -- the student just won't get a
//      birthday post until it's filled in.
//   3. Run: node scripts/seed-roster.mjs
//
// Safe to re-run: existing entries are updated (merge), already-claimed
// accounts are left untouched (claimed status comes only from the app's
// own claim flow, never overwritten here).
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const serviceAccountPath = join(__dirname, "serviceAccountKey.json");
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
} catch {
  console.error(
    `Couldn't read ${serviceAccountPath}.\n` +
      "Download a service account key from Firebase console " +
      "(Project settings -> Service accounts -> Generate new private key) " +
      "and save it at that path."
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const csvPath = join(__dirname, "roster.csv");
let csvRaw;
try {
  csvRaw = readFileSync(csvPath, "utf-8");
} catch {
  console.error(
    `Couldn't read ${csvPath}.\n` +
      "Create it with columns: matric,fullName,birthday,isAdmin"
  );
  process.exit(1);
}

function parseCsv(raw) {
  const lines = raw.trim().split("\n").filter(Boolean);
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

function normalizeMatric(raw) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

const rows = parseCsv(csvRaw);
console.log(`Found ${rows.length} roster row(s) in roster.csv.`);

let created = 0;
let updated = 0;

for (const row of rows) {
  if (!row.matric || !row.fullName) {
    console.warn("Skipping row with missing matric/fullName:", row);
    continue;
  }
  const matric = normalizeMatric(row.matric);
  const ref = db.collection("roster").doc(matric);
  const existing = await ref.get();

  const data = {
    matric,
    fullName: row.fullName,
    birthday: row.birthday || null,
    isAdmin: String(row.isAdmin).toLowerCase() === "true",
    // claimed is preserved if the doc already exists; new entries start
    // unclaimed so the student can run through first-login signup.
    claimed: existing.exists ? existing.data().claimed : false,
  };

  await ref.set(data, { merge: true });
  if (existing.exists) updated++;
  else created++;
}

console.log(`Done. Created ${created}, updated ${updated} roster entries.`);
