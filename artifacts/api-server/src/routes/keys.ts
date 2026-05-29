import { Router } from "express";
import { db, keysTable } from "@workspace/db";
import { eq, and, isNull, gt, or } from "drizzle-orm";
import { GenerateKeyBody, ValidateKeyParams, RevokeKeyParams } from "@workspace/api-zod";
import { randomBytes } from "crypto";
import { sql } from "drizzle-orm";

const router = Router();

function generateKeyValue(): string {
  return "B13-" + randomBytes(8).toString("hex").toUpperCase();
}

function getExpiresAt(duration: string): Date | null {
  const now = new Date();
  switch (duration) {
    case "1min":
      return new Date(now.getTime() + 60 * 1000);
    case "1day":
      return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    case "3days":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case "7days":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "30days":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case "permanent":
      return null;
    default:
      return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  }
}

function formatKey(key: typeof keysTable.$inferSelect) {
  return {
    id: key.id,
    keyValue: key.keyValue,
    duration: key.duration,
    expiresAt: key.expiresAt ? key.expiresAt.toISOString() : null,
    active: key.active,
    note: key.note ?? null,
    createdAt: key.createdAt.toISOString(),
  };
}

// POST /api/keys/generate
router.post("/keys/generate", async (req, res) => {
  const parsed = GenerateKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { duration, note } = parsed.data;
  const keyValue = generateKeyValue();
  const expiresAt = getExpiresAt(duration);

  const [key] = await db.insert(keysTable).values({
    keyValue,
    duration,
    expiresAt: expiresAt ?? undefined,
    active: true,
    note: note ?? null,
  }).returning();

  res.status(201).json(formatKey(key));
});

// GET /api/keys
router.get("/keys", async (req, res) => {
  const keys = await db.select().from(keysTable).orderBy(sql`${keysTable.createdAt} DESC`);
  res.json(keys.map(formatKey));
});

// GET /api/keys/stats
router.get("/keys/stats", async (req, res) => {
  const all = await db.select().from(keysTable);
  const now = new Date();
  const total = all.length;
  const active = all.filter(k => k.active && (k.expiresAt === null || k.expiresAt > now)).length;
  const expired = all.filter(k => k.expiresAt !== null && k.expiresAt <= now).length;
  const permanent = all.filter(k => k.expiresAt === null && k.active).length;
  res.json({ total, active, expired, permanent });
});

// GET /api/keys/validate/:keyValue
router.get("/keys/validate/:keyValue", async (req, res) => {
  const parsed = ValidateKeyParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ valid: false, message: "Invalid key format" });
    return;
  }

  const { keyValue } = parsed.data;
  const [key] = await db.select().from(keysTable).where(eq(keysTable.keyValue, keyValue));

  if (!key) {
    res.json({ valid: false, message: "Key not found" });
    return;
  }

  if (!key.active) {
    res.json({ valid: false, message: "Key has been revoked", key: formatKey(key) });
    return;
  }

  const now = new Date();
  if (key.expiresAt && key.expiresAt <= now) {
    await db.update(keysTable).set({ active: false }).where(eq(keysTable.id, key.id));
    res.json({ valid: false, message: "Key expired", key: formatKey(key) });
    return;
  }

  res.json({ valid: true, message: "Key is valid", key: formatKey(key) });
});

// DELETE /api/keys/:id
router.delete("/keys/:id", async (req, res) => {
  const parsed = RevokeKeyParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { id } = parsed.data;
  const [key] = await db
    .update(keysTable)
    .set({ active: false })
    .where(eq(keysTable.id, id))
    .returning();

  if (!key) {
    res.status(404).json({ error: "Key not found" });
    return;
  }

  res.json(formatKey(key));
});

export default router;
