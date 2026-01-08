/**
 * Generates an inventory of all HTML files in the thomas directory.
 * Run with: npx tsx scripts/generate-inventory.ts
 */

import { readdir, stat, readFile, writeFile, mkdir } from 'fs/promises';
import { join, relative, extname, basename, dirname } from 'path';

interface FileInfo {
  path: string;
  relativePath: string;
  size: number;
  directory: string;
  filename: string;
  category: string;
  language: 'latin-english' | 'english' | 'unknown';
  parentWork?: string;
}

interface Inventory {
  generatedAt: string;
  totalFiles: number;
  totalSizeBytes: number;
  files: FileInfo[];
  byCategory: Record<string, number>;
  byLanguage: Record<string, number>;
}

const THOMAS_DIR = './thomas';
const OUTPUT_FILE = './src/data/inventory.json';

// Categories based on filename patterns and directory structure
function detectCategory(relativePath: string, filename: string): string {
  const lower = filename.toLowerCase();
  const dir = dirname(relativePath).toLowerCase();

  if (dir.includes('summa') || lower.startsWith('fp') || lower.startsWith('fs') ||
      lower.startsWith('ss') || lower.startsWith('tp') || lower.startsWith('xp')) {
    return 'major-theological';
  }
  if (lower.includes('contragentiles')) return 'major-theological';
  if (lower.startsWith('qd')) return 'quaestiones-disputatae';
  if (lower.includes('physics') || lower.includes('ethics') || lower.includes('metaphysics') ||
      lower.includes('decoelo') || lower.includes('deanima') || lower.includes('politics') ||
      lower.includes('perihermeneias') || lower.includes('postanalytica') || lower.includes('gencorrup') ||
      lower.includes('meteora') || lower.includes('memoria')) {
    return 'aristotle-commentary';
  }
  if (lower.includes('psalm') || lower.includes('job') || lower.includes('lamentations') ||
      lower.includes('john') || lower.includes('matthew') || lower.includes('mark') ||
      lower.includes('luke') || lower.includes('cor') || lower.includes('gal') ||
      lower.includes('eph') || lower.includes('phil') || lower.includes('col') ||
      lower.includes('thes') || lower.includes('tim') || lower.includes('titus') ||
      lower.includes('hebrews') || lower.includes('catena') || lower.startsWith('ca') ||
      lower.startsWith('ss')) {
    return 'biblical-commentary';
  }
  if (lower.includes('boethius') || lower.includes('dionysius') || lower.includes('causis') ||
      lower.includes('hebdomad')) {
    return 'other-commentary';
  }
  if (lower.includes('creed') || lower.includes('pater') || lower.includes('avemaria') ||
      lower.includes('commandments') || lower.includes('corpus') || lower.includes('adoro') ||
      lower.includes('sermon')) {
    return 'popular';
  }
  // Default to opuscula for smaller standalone works
  return 'opuscula';
}

function detectLanguage(relativePath: string): 'latin-english' | 'english' | 'unknown' {
  if (relativePath.startsWith('english/')) return 'english';
  // Most files in thomas/ root are latin-english bilingual
  return 'latin-english';
}

function detectParentWork(filename: string): string | undefined {
  const lower = filename.toLowerCase();

  // Summa Theologica parts
  if (lower.match(/^fp[\d-]/i)) return 'summa-theologica';
  if (lower.match(/^fs[\d-]/i)) return 'summa-theologica';
  if (lower.match(/^ss[\d-]/i)) return 'summa-theologica';
  if (lower.match(/^tp[\d-]/i)) return 'summa-theologica';
  if (lower.match(/^xp[\d-]/i)) return 'summa-theologica';

  // Contra Gentiles books
  if (lower.includes('contragentiles')) return 'contra-gentiles';

  // De Veritate questions
  if (lower.match(/^qddever\d/i)) return 'de-veritate';

  // De Potentia questions
  if (lower.match(/^qddepotentia\d/i)) return 'de-potentia';

  // Ethics books
  if (lower.match(/^ethics\d/i)) return 'ethics-commentary';

  // Physics books
  if (lower.match(/^physics\d/i)) return 'physics-commentary';

  // Metaphysics books
  if (lower.match(/^metaphysics\d/i)) return 'metaphysics-commentary';

  return undefined;
}

async function* walkDirectory(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath);
    } else if (entry.isFile() && ['.htm', '.html'].includes(extname(entry.name).toLowerCase())) {
      yield fullPath;
    }
  }
}

async function main() {
  const files: FileInfo[] = [];
  const byCategory: Record<string, number> = {};
  const byLanguage: Record<string, number> = {};
  let totalSize = 0;

  console.log('Scanning thomas directory...');

  for await (const filePath of walkDirectory(THOMAS_DIR)) {
    const relativePath = relative(THOMAS_DIR, filePath);
    const filename = basename(filePath);
    const stats = await stat(filePath);
    const category = detectCategory(relativePath, filename);
    const language = detectLanguage(relativePath);
    const parentWork = detectParentWork(filename);

    const fileInfo: FileInfo = {
      path: filePath,
      relativePath,
      size: stats.size,
      directory: dirname(relativePath) || '.',
      filename,
      category,
      language,
      ...(parentWork && { parentWork }),
    };

    files.push(fileInfo);
    totalSize += stats.size;
    byCategory[category] = (byCategory[category] || 0) + 1;
    byLanguage[language] = (byLanguage[language] || 0) + 1;
  }

  // Sort files by path
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  const inventory: Inventory = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    totalSizeBytes: totalSize,
    files,
    byCategory,
    byLanguage,
  };

  // Ensure output directory exists
  await mkdir(dirname(OUTPUT_FILE), { recursive: true });

  await writeFile(OUTPUT_FILE, JSON.stringify(inventory, null, 2));

  console.log(`\nInventory generated: ${OUTPUT_FILE}`);
  console.log(`Total files: ${files.length}`);
  console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('\nBy category:');
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log('\nBy language:');
  for (const [lang, count] of Object.entries(byLanguage).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${lang}: ${count}`);
  }
}

main().catch(console.error);
