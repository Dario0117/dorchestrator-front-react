/**
 * Reads coverage/coverage-final.json and reports files without 100% coverage,
 * including uncovered code paths (statements, functions, branches).
 * Usage: bun scripts/check-coverage-gaps.ts
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const COVERAGE_PATH = resolve(ROOT, 'coverage/coverage-final.json');

interface Location {
  start: { line: number; column: number };
  end: { line: number; column: number | null };
}

interface FnMapEntry {
  name: string;
  decl: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number | null };
  };
  line: number;
}

interface BranchMapEntry {
  loc: Location;
  type: string;
  locations: Location[];
  line: number;
}

interface CoverageEntry {
  statementMap: Record<string, Location>;
  fnMap: Record<string, FnMapEntry>;
  branchMap: Record<string, BranchMapEntry>;
  s: Record<string, number>;
  f: Record<string, number>;
  b: Record<string, number[]>;
}

interface CoverageMetric {
  covered: number;
  total: number;
  pct: number;
}

interface UncoveredDetail {
  uncoveredStatementLines: number[];
  uncoveredFunctions: { name: string; line: number }[];
  uncoveredBranches: {
    line: number;
    type: string;
    branchIndex: number;
    totalBranches: number;
  }[];
}

interface FileCoverage {
  file: string;
  statements: CoverageMetric;
  functions: CoverageMetric;
  branches: CoverageMetric;
  detail: UncoveredDetail;
}

function pct(covered: number, total: number): number {
  return total === 0 ? 100 : Math.round((covered / total) * 10000) / 100;
}

function analyze(entry: CoverageEntry): {
  statements: CoverageMetric;
  functions: CoverageMetric;
  branches: CoverageMetric;
  detail: UncoveredDetail;
} {
  const sValues = Object.values(entry.s);
  const fValues = Object.values(entry.f);
  const bValues = Object.values(entry.b).flat();

  const sCovered = sValues.filter((v) => v > 0).length;
  const fCovered = fValues.filter((v) => v > 0).length;
  const bCovered = bValues.filter((v) => v > 0).length;

  const uncoveredStatementLines = Object.entries(entry.s)
    .filter(([, hits]) => hits === 0)
    .map(([id]) => entry.statementMap[id]?.start.line)
    .filter((line): line is number => line !== undefined);

  const uncoveredFunctions = Object.entries(entry.f)
    .filter(([, hits]) => hits === 0)
    .map(([id]) => {
      const fn = entry.fnMap[id];
      if (!fn) {
        return null;
      }
      const name =
        fn.name === '(anonymous_0)' || fn.name.startsWith('(anonymous_')
          ? `<anonymous> at L${fn.line}`
          : fn.name;
      return { name, line: fn.line };
    })
    .filter((v): v is { name: string; line: number } => v !== null);

  const uncoveredBranches: UncoveredDetail['uncoveredBranches'] = [];
  for (const [id, hits] of Object.entries(entry.b)) {
    const branch = entry.branchMap[id];
    if (!branch) {
      continue;
    }
    for (let i = 0; i < hits.length; i++) {
      if (hits[i] === 0) {
        uncoveredBranches.push({
          line: branch.line,
          type: branch.type,
          branchIndex: i,
          totalBranches: hits.length,
        });
      }
    }
  }

  return {
    statements: {
      covered: sCovered,
      total: sValues.length,
      pct: pct(sCovered, sValues.length),
    },
    functions: {
      covered: fCovered,
      total: fValues.length,
      pct: pct(fCovered, fValues.length),
    },
    branches: {
      covered: bCovered,
      total: bValues.length,
      pct: pct(bCovered, bValues.length),
    },
    detail: { uncoveredStatementLines, uncoveredFunctions, uncoveredBranches },
  };
}

function collapseLineRanges(lines: number[]): string[] {
  if (lines.length === 0) {
    return [];
  }
  const sorted = [...new Set(lines)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0] as number;
  let end = start;

  for (let i = 1; i < sorted.length; i++) {
    const line = sorted[i] as number;
    if (line === end + 1) {
      end = line;
    } else {
      ranges.push(start === end ? `L${start}` : `L${start}-${end}`);
      start = line;
      end = line;
    }
  }
  ranges.push(start === end ? `L${start}` : `L${start}-${end}`);
  return ranges;
}

let raw: string;
try {
  raw = readFileSync(COVERAGE_PATH, 'utf-8');
} catch {
  // biome-ignore lint/suspicious/noConsole: CLI script needs console output
  console.error(`Could not read ${COVERAGE_PATH}`);
  // biome-ignore lint/suspicious/noConsole: CLI script needs console output
  console.error('Run "mise run coverageForAgents" first.');
  process.exit(1);
}

const coverage = JSON.parse(raw) as Record<string, CoverageEntry>;

const gaps: FileCoverage[] = [];

for (const [filePath, entry] of Object.entries(coverage)) {
  const result = analyze(entry);
  const is100 =
    result.statements.pct === 100 &&
    result.functions.pct === 100 &&
    result.branches.pct === 100;

  if (!is100) {
    gaps.push({ file: filePath.replace(`${ROOT}/`, ''), ...result });
  }
}

if (gaps.length === 0) {
  console.log('All files have 100% coverage!');
  process.exit(0);
}

gaps.sort((a, b) => {
  const aMin = Math.min(a.statements.pct, a.functions.pct, a.branches.pct);
  const bMin = Math.min(b.statements.pct, b.functions.pct, b.branches.pct);
  return aMin - bMin;
});

console.log(`\n${gaps.length} file(s) below 100% coverage:\n`);

for (const g of gaps) {
  console.log('='.repeat(100));
  console.log(`  ${g.file}`);
  console.log(
    `  Stmts: ${g.statements.pct}%  (${g.statements.covered}/${g.statements.total})  |  Funcs: ${g.functions.pct}%  (${g.functions.covered}/${g.functions.total})  |  Branches: ${g.branches.pct}%  (${g.branches.covered}/${g.branches.total})`,
  );

  const { detail } = g;

  if (detail.uncoveredStatementLines.length > 0) {
    const ranges = collapseLineRanges(detail.uncoveredStatementLines);
    console.log(`\n  Uncovered statements: ${ranges.join(', ')}`);
  }

  if (detail.uncoveredFunctions.length > 0) {
    console.log('\n  Uncovered functions:');
    for (const fn of detail.uncoveredFunctions) {
      console.log(`    - ${fn.name} (L${fn.line})`);
    }
  }

  if (detail.uncoveredBranches.length > 0) {
    console.log('\n  Uncovered branches:');
    const byLine = new Map<number, { type: string; indices: string[] }>();
    for (const br of detail.uncoveredBranches) {
      const existing = byLine.get(br.line);
      const label =
        br.type === 'if'
          ? 'else'
          : `path ${br.branchIndex}/${br.totalBranches - 1}`;
      if (existing) {
        existing.indices.push(label);
      } else {
        byLine.set(br.line, { type: br.type, indices: [label] });
      }
    }
    for (const [line, info] of byLine) {
      console.log(`    - L${line}: ${info.type} — ${info.indices.join(', ')}`);
    }
  }

  console.log('');
}

console.log(`Total: ${gaps.length} file(s) with incomplete coverage`);
