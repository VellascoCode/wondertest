#!/usr/bin/env node
/* eslint-disable no-console */
const { randomBytes, scryptSync } = require("crypto");
const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");
const dotenvPath = path.resolve(process.cwd(), ".env.local");

if (fs.existsSync(dotenvPath)) {
  require("dotenv").config({ path: dotenvPath });
} else {
  require("dotenv").config();
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

async function ensureAdmin(db) {
  const users = db.collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ id: 1 }, { unique: true });

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@wonder.land").toLowerCase();
  const adminName = process.env.SEED_ADMIN_NAME ?? "Queen Admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Wonderland#2024";

  const now = new Date();
  const existing = await users.findOne({ email: adminEmail });

  if (!existing) {
    const id = randomBytes(12).toString("hex");
    await users.insertOne({
      id,
      name: adminName,
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      type: 9,
      status: 0,
      createdAt: now,
      updatedAt: now
    });
    return { created: true, updated: false };
  }

  const update = await users.updateOne(
    { _id: existing._id },
    {
      $set: {
        name: adminName,
        type: existing.type >= 8 ? existing.type : 9,
        status: existing.status === 2 ? 0 : existing.status,
        updatedAt: now
      }
    }
  );

  return { created: false, updated: update.modifiedCount > 0 };
}

async function ensureSystemStatus(db) {
  const collection = db.collection("system_status");
  await collection.createIndex({ status: 1 });
  await collection.updateOne(
    { _id: "global" },
    {
      $setOnInsert: {
        status: 1,
        label: "Operacional",
        message: "Tudo funcionando normalmente",
        updatedAt: null
      }
    },
    { upsert: true }
  );
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI não definido. Configure-o em .env.local ou nas variáveis de ambiente.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const dbName = client.db().databaseName;
    const db = client.db();

    const adminResult = await ensureAdmin(db);
    await ensureSystemStatus(db);

    console.log(`✅ Seed concluído na base "${dbName}"`);
    if (adminResult.created) {
      console.log("• Usuário admin criado com sucesso (confira as variáveis SEED_ADMIN_*)");
    } else if (adminResult.updated) {
      console.log("• Usuário admin atualizado e garantido como ativo");
    } else {
      console.log("• Usuário admin já existente mantido");
    }
    console.log("• Documento global de status do sistema garantido");
  } catch (error) {
    console.error("❌ Falha ao executar seed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
