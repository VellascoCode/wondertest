import type { NextApiRequest, NextApiResponse } from 'next';
import { runPocketWatch } from './whiterabbit/pocket_watch';
import { runLookingGlass } from './whiterabbit/looking_glass';
import { loadGlassSnapshot } from './whiterabbit/discover';
import { findDrinkMeRecords } from './drink_me/fetch';

interface StepResult {
  key: string;
  success: boolean;
  durationMs: number;
  summary?: Record<string, unknown>;
  error?: string;
  meta?: Record<string, unknown>;
}

async function executeStep<T>(
  key: string,
  action: () => Promise<T>,
  summarizer?: (data: T) => Record<string, unknown>
): Promise<{ data: T | null; step: StepResult }> {
  const started = Date.now();
  try {
    const data = await action();
    const summary = summarizer ? summarizer(data) : undefined;
    return {
      data,
      step: {
        key,
        success: true,
        durationMs: Date.now() - started,
        summary,
      },
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Erro inesperado');
    const meta = (error as { meta?: Record<string, unknown> })?.meta;
    return {
      data: null,
      step: {
        key,
        success: false,
        durationMs: Date.now() - started,
        error: err.message || 'Erro inesperado ao executar etapa',
        meta,
      },
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed. Utilize GET para orquestrar as rotinas.' });
  }

  const steps: StepResult[] = [];

  const pocketWatch = await executeStep('whiteRabbit.pocketWatch', runPocketWatch, (data) => ({
    coins: data.count,
    trackedIds: data.coins.map((coin) => coin.id),
  }));
  steps.push(pocketWatch.step);

  const lookingGlass = await executeStep(
    'whiteRabbit.lookingGlass',
    () => runLookingGlass({ force: true }),
    (data) => ({
      counts: data.counts,
      thresholds: { best: data.threshold, worst: data.worstThreshold },
      updatedAt: data.updatedAt.toISOString?.() ?? data.updatedAt,
    })
  );
  steps.push(lookingGlass.step);

  const discover = await executeStep('whiteRabbit.discover', loadGlassSnapshot, (data) => ({
    counts: data.counts,
    marketStatus: data.marketStatus,
    updatedAt: data.updatedAt,
    threshold: data.threshold,
    worstThreshold: data.worstThreshold,
  }));
  steps.push(discover.step);

  const drinkMe = await executeStep(
    'drinkMe.fetch',
    () => findDrinkMeRecords({ limit: 20, hours: 24 }),
    (data) => ({
      returned: data.records.length,
      total: data.stats.total,
      possibleScams: data.stats.possibleScams,
      goldenOpportunities: data.stats.goldenOpportunities,
      byNetwork: data.stats.byNetwork,
      bySubType: data.stats.bySubType,
    })
  );
  steps.push(drinkMe.step);

  const success = steps.every((step) => step.success);

  return res.status(success ? 200 : 207).json({
    success,
    steps,
    timestamp: new Date().toISOString(),
  });
}
