import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { Bucket, LogEntry, TriageResult, TriageRule, Level } from './types.js';
import { parseLine, normalizeLevel } from './parse.js';
import { applyRules } from './rules.js';

export async function loadRules(path: string): Promise<TriageRule[]> {
  const txt = await readFile(path, 'utf8');
  const json = JSON.parse(txt);
  if (!Array.isArray(json)) throw new Error('rules file must be an array');
  json.forEach((r, i) => {
    if (!r.id || !r.where || !r.action) throw new Error(`invalid rule at index ${i}`);
  });
  return json;
}

export async function loadLogs(globs: string[]): Promise<LogEntry[]> {
  const files = await fg(globs, { dot: false });
  const out: LogEntry[] = [];
  for (const f of files) {
    const data = await readFile(f, 'utf8');
    const lines = data.split(/\r?\n/);
    for (const line of lines) {
      const e = parseLine(line);
      if (e) out.push(e);
    }
  }
  // Inject source info
  return out.map((e) => ({ ...e, meta: { ...(e.meta ?? {}), source: basename((e.meta as any)?.source ?? '') } }));
}

function initBucket(name: string): Bucket {
  return {
    name,
    count: 0,
    levels: { debug: 0, info: 0, warn: 0, error: 0, fatal: 0 },
    tags: {},
    samples: []
  };
}

export function triage(entries: LogEntry[], rules: TriageRule[], samplePerBucket = 5): TriageResult {
  const buckets: Record<string, Bucket> = {};
  const tags: Record<string, number> = {};
  const rulesApplied = rules.map((r) => r.id);
  const unmatched = initBucket('unmatched');

  let total = 0;
  for (const e0 of entries) {
    total++;
    let e = e0;
    const { buckets: bs, tags: tgs, drop, elevate } = applyRules(e, rules);
    if (drop) continue;
    if (elevate) e = { ...e, level: normalizeLevel(elevate) as Level };

    if (tgs.length) tgs.forEach((t) => (tags[t] = (tags[t] ?? 0) + 1));

    if (!bs.length || (bs.length === 1 && bs[0] === 'unassigned')) {
      bump(unmatched, e, tgs, samplePerBucket);
    } else {
      for (const b of bs) {
        const buck = (buckets[b] ??= initBucket(b));
        bump(buck, e, tgs, samplePerBucket);
      }
    }
  }

  return {
    total,
    buckets,
    unmatched,
    tags,
    generatedAt: new Date().toISOString(),
    rulesApplied
  };
}

function bump(bucket: Bucket, e: LogEntry, tags: string[], samplePerBucket: number) {
  bucket.count++;
  bucket.levels[e.level] = (bucket.levels[e.level] ?? 0) + 1;
  for (const t of tags) bucket.tags[t] = (bucket.tags[t] ?? 0) + 1;
  if (bucket.samples.length < samplePerBucket) bucket.samples.push(e);
}
