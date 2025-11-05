import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadLogs, triage, loadRules } from './triage.js';

const argv = await yargs(hideBin(process.argv))
  .option('in', { type: 'array', description: 'Input globs', default: ['sample-logs/*.log'] })
  .option('rules', { type: 'string', description: 'Rules JSON file', default: 'rules.example.json' })
  .option('out', { type: 'string', description: 'Output directory', default: 'out' })
  .option('samples', { type: 'number', description: 'Samples per bucket', default: 5 })
  .strict()
  .parse();

const inputs = (argv.in as string[]).map(String);
const rulesPath = String(argv.rules);
const outDir = String(argv.out);
const samples = Number(argv.samples);

(async () => {
  const entries = await loadLogs(inputs);
  const rules = await loadRules(rulesPath);
  const result = triage(entries, rules, samples);
  await mkdir(resolve(outDir), { recursive: true });
  await writeFile(resolve(outDir, 'triage.json'), JSON.stringify(result, null, 2), 'utf8');

  // Markdown summary
  const md = toMarkdown(result);
  await writeFile(resolve(outDir, 'triage.md'), md, 'utf8');
  console.log(`Triage complete: ${outDir}/triage.json, triage.md`);
})().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

function toMarkdown(r: any): string {
  const lines: string[] = [];
  lines.push(`# Log Triage Report`);
  lines.push(`Generated: ${r.generatedAt}`);
  lines.push(`Total logs: **${r.total}**`);
  lines.push('');
  lines.push(`## Buckets`);
  for (const [name, b] of Object.entries<any>(r.buckets)) {
    lines.push(`### ${name} (${b.count})`);
    lines.push(`- Levels: ${Object.entries(b.levels).map(([k, v]) => `${k}:${v}`).join(', ')}`);
    const tags = Object.entries(b.tags).map(([k, v]) => `${k}(${v})`).join(', ');
    lines.push(`- Tags: ${tags || '—'}`);
    const sampleList = b.samples.slice(0, 3).map((s: any) => `  - ${s.level} ${s.service ?? ''} ${s.message}`);
    if (sampleList.length) {
      lines.push(`- Samples:\n${sampleList.join('\n')}`);
    }
    lines.push('');
  }
  lines.push(`### unmatched (${r.unmatched.count})`);
  lines.push('');
  lines.push(`## Top Tags`);
  const tagRows = Object.entries(r.tags).sort((a: any, b: any) => b[1] - a[1]).slice(0, 20);
  lines.push(tagRows.map(([k, v]) => `- ${k}: ${v}`).join('\n') || '—');
  return lines.join('\n');
}
