import { describe, it, expect } from 'vitest';
import { applyRules } from '../src/rules.js';
import type { LogEntry, TriageRule } from '../src/types.js';

const e: LogEntry = { ts: new Date().toISOString(), level: 'info', message: 'ETIMEDOUT', raw: 'ETIMEDOUT' };

describe('rules', () => {
  it('matches contains and elevates', () => {
    const rules: TriageRule[] = [
      { id: 'r', where: { contains: 'ETIMEDOUT' }, action: { bucket: 'net', elevate: 'warn' } }
    ];
    const res = applyRules(e, rules);
    expect(res.buckets[0]).toBe('net');
  });
});
