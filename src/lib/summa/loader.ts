/**
 * Summa Theologica Data Loader
 *
 * Loads and parses all Summa HTML files at build time.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseQuestionFile, SUMMA_PARTS, type SummaQuestion, type SummaArticle } from './parser';

// Cache for parsed questions
const questionCache = new Map<string, SummaQuestion>();

/**
 * Get the file path for a question HTML file
 */
function getQuestionFilePath(part: string, question: number): string {
  const paddedQ = question.toString().padStart(3, '0');
  return path.join(process.cwd(), 'public', 'thomas', 'summa', part, `${part}${paddedQ}.html`);
}

/**
 * Load and parse a single question
 */
export function loadQuestion(part: string, question: number): SummaQuestion | null {
  const cacheKey = `${part}-${question}`;

  if (questionCache.has(cacheKey)) {
    return questionCache.get(cacheKey)!;
  }

  const filePath = getQuestionFilePath(part, question);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseQuestionFile(html, part, question);
    questionCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Load all questions for a part
 */
export function loadPart(part: keyof typeof SUMMA_PARTS): SummaQuestion[] {
  const partInfo = SUMMA_PARTS[part];
  const questions: SummaQuestion[] = [];

  for (let q = 1; q <= partInfo.questions; q++) {
    const question = loadQuestion(part, q);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

/**
 * Get a specific article from a question
 */
export function getArticle(part: string, question: number, article: number): SummaArticle | null {
  const q = loadQuestion(part, question);
  if (!q) return null;

  return q.articles.find(a => a.article === article) || null;
}

/**
 * Get all static paths for Part pages
 */
export function getPartPaths() {
  return Object.keys(SUMMA_PARTS).map(part => ({
    params: { part },
  }));
}

/**
 * Get all static paths for Question pages
 */
export function getQuestionPaths() {
  const paths: Array<{ params: { part: string; question: string } }> = [];

  for (const [part, info] of Object.entries(SUMMA_PARTS)) {
    for (let q = 1; q <= info.questions; q++) {
      // Check if the question file exists
      const filePath = getQuestionFilePath(part, q);
      if (fs.existsSync(filePath)) {
        paths.push({
          params: { part, question: q.toString() },
        });
      }
    }
  }

  return paths;
}

/**
 * Get all static paths for Article pages
 */
export function getArticlePaths() {
  const paths: Array<{ params: { part: string; question: string; article: string } }> = [];

  for (const [part, info] of Object.entries(SUMMA_PARTS)) {
    for (let q = 1; q <= info.questions; q++) {
      const question = loadQuestion(part, q);
      if (question) {
        for (const article of question.articles) {
          paths.push({
            params: {
              part,
              question: q.toString(),
              article: article.article.toString(),
            },
          });
        }
      }
    }
  }

  return paths;
}

/**
 * Get question info for Part index page (lighter weight than full parse)
 */
export function getQuestionInfoForPart(part: keyof typeof SUMMA_PARTS): Array<{
  number: number;
  title: string;
  articleCount: number;
}> {
  const partInfo = SUMMA_PARTS[part];
  const questions: Array<{ number: number; title: string; articleCount: number }> = [];

  for (let q = 1; q <= partInfo.questions; q++) {
    const question = loadQuestion(part, q);
    if (question) {
      questions.push({
        number: q,
        title: question.title,
        articleCount: question.articles.length,
      });
    }
  }

  return questions;
}
