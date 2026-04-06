import 'dotenv/config';
import express from 'express';
import { getSupabaseClient } from './infrastructure/database/supabase';
import { AesEncryptionService } from './infrastructure/encryption/AesEncryptionService';
import { SupabaseUserProfileRepository } from './infrastructure/repositories/SupabaseUserProfileRepository';
import { IdentityEngine } from './infrastructure/engine/IdentityEngine';
import { createUserProfileRouter } from './adapters/routes/userProfileRoutes';
import { createEngineRouter } from './adapters/routes/engineRoutes';

const app = express();
app.use(express.json());

// ── Dependency wiring ────────────────────────────────────────────────────────
const supabase    = getSupabaseClient();
const encryption  = new AesEncryptionService(process.env.ENCRYPTION_KEY ?? '');
const profileRepo = new SupabaseUserProfileRepository(supabase);
const engine      = new IdentityEngine(process.env.OPENAI_API_KEY ?? '');

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/profiles', createUserProfileRouter(profileRepo, encryption));
app.use('/api/engine',   createEngineRouter(profileRepo, encryption, engine));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cortex-eia', timestamp: new Date().toISOString() });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`[EIA] Server running on port ${PORT}`);
});

export default app;
