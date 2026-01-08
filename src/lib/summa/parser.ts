/**
 * Summa Theologica HTML Parser
 *
 * Parses legacy HTML files into structured content.
 * Uses HTML comments (<!--Aquin.: SMT...-->) as structural markers.
 */

export interface SummaArticle {
  part: string;
  question: number;
  article: number;
  title: string;
  thesis: {
    latin: string;
    english: string;
  };
  objections: Array<{
    number: number;
    latin: string;
    english: string;
  }>;
  sedContra: {
    latin: string;
    english: string;
  };
  respondeo: {
    latin: string;
    english: string;
  };
  replies: Array<{
    number: number;
    latin: string;
    english: string;
  }>;
}

export interface SummaQuestion {
  part: string;
  question: number;
  title: string;
  prologue: {
    latin: string;
    english: string;
  };
  articles: SummaArticle[];
}

// Part info for the five parts of the Summa
export const SUMMA_PARTS = {
  FP: { id: 'FP', name: 'First Part', latin: 'Prima Pars', questions: 119 },
  FS: { id: 'FS', name: 'First Part of the Second Part', latin: 'Prima Secundae', questions: 114 },
  SS: { id: 'SS', name: 'Second Part of the Second Part', latin: 'Secunda Secundae', questions: 189 },
  TP: { id: 'TP', name: 'Third Part', latin: 'Tertia Pars', questions: 90 },
  XP: { id: 'XP', name: 'Supplement', latin: 'Supplementum', questions: 99 },
} as const;

/**
 * Extract text content from a table row, separating Latin (first td) and English (second td)
 */
function extractBilingualContent(html: string): { latin: string; english: string } {
  // The legacy HTML often has unclosed tags, so we need a more flexible approach
  // Look for table rows with content split between two cells

  // First, try to find a table row pattern
  const trMatch = html.match(/<tr[^>]*>([\s\S]*?)(?:<\/tr>|(?=<tr)|$)/i);
  if (trMatch) {
    const rowContent = trMatch[1];

    // Try to split on <td - the second td starts with <td
    const tdParts = rowContent.split(/<td[^>]*>/i).filter(p => p.trim());

    if (tdParts.length >= 2) {
      // First part is Latin, second part is English
      // Clean up closing tags that might be there
      const latin = cleanText(tdParts[0].replace(/<\/td>.*/i, ''));
      const english = cleanText(tdParts[1].replace(/<\/td>.*/i, ''));

      if (latin && english) {
        return { latin, english };
      }
    }
  }

  // Alternative: look for the pattern directly in the HTML
  // Match: <td...>LATIN</td><td...>ENGLISH or <td...>LATIN<td...>ENGLISH
  const directMatch = html.match(/<td[^>]*>([\s\S]*?)(?:<\/td>)?\s*<td[^>]*>([\s\S]*?)(?:<\/td>|$)/i);
  if (directMatch) {
    const latin = cleanText(directMatch[1]);
    const english = cleanText(directMatch[2]);
    if (latin && english) {
      return { latin, english };
    }
  }

  // Fallback: just return the text as English
  return {
    latin: '',
    english: cleanText(html),
  };
}

/**
 * Clean HTML text: remove tags, decode entities, normalize whitespace
 */
function cleanText(html: string): string {
  return html
    // Remove HTML tags but keep content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    // Normalize whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Parse a question file into structured content
 */
export function parseQuestionFile(html: string, part: string, questionNum: number): SummaQuestion {
  const articles: SummaArticle[] = [];

  // Extract question title from the prologue section
  // Pattern 1: TREATISE header followed by specific question title
  // Pattern 2: Direct question title in H3 (may have <br> inside)
  // Pattern 3: Title after TREATISE with single <br>
  let questionTitle = `Question ${questionNum}`;

  // Try to find title after TREATISE header (with one or two <br> tags)
  const treatiseMatch = html.match(/<h3[^>]*>.*?TREATISE[^<]*<br>\s*(?:<br>\s*)?([A-Z][^<]+)/i);
  if (treatiseMatch) {
    questionTitle = cleanText(treatiseMatch[1]);
  } else {
    // Try to find standalone H3 title (not an article question)
    // Look for H3 that contains topic-like text (all caps, may include apostrophes, commas, etc.)
    const h3Match = html.match(/<H3[^>]*>\s*((?:OF\s+)?[A-Z][A-Z\s,'():;]+(?:\([^)]+\))?)\s*<br/i);
    if (h3Match) {
      questionTitle = cleanText(h3Match[1]);
    }
  }

  // Find prologue content (marked with "Out." in comments)
  const prologueMatch = html.match(/<!--Aquin[^>]*Out\.[^>]*-->([\s\S]*?)(?=<!--Aquin|<hr|$)/i);
  const prologue = prologueMatch
    ? extractBilingualContent(prologueMatch[1])
    : { latin: '', english: '' };

  // Find all articles by looking for Thesis markers
  const articleMatches = html.matchAll(/<!--Aquin[^>]*A\[(\d+)\]\s*Thes\.[^>]*-->([\s\S]*?)(?=<!--Aquin[^>]*A\[\d+\]\s*Thes\.|<hr\s*>\s*<A Name="top"|$)/gi);

  // Track which article numbers we found via Thesis markers
  const foundArticles = new Set<number>();

  for (const match of articleMatches) {
    const articleNum = parseInt(match[1], 10);
    foundArticles.add(articleNum);
    const articleContent = match[2];

    // Extract article title (the question being asked)
    const articleTitleMatch = articleContent.match(/<h3[^>]*>([^<]+)/i);
    const articleTitle = articleTitleMatch ? cleanText(articleTitleMatch[1]) : '';

    // Extract thesis
    const thesisContent = articleContent.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    const thesis = thesisContent
      ? extractBilingualContent(thesisContent[1])
      : { latin: '', english: '' };

    // Extract objections
    const objections: SummaArticle['objections'] = [];
    const objMatches = html.matchAll(new RegExp(
      `<!--Aquin[^>]*A\\[${articleNum}\\]\\s*Obj\\.\\s*(\\d+)[^>]*-->([\\s\\S]*?)(?=<!--Aquin|$)`,
      'gi'
    ));
    for (const objMatch of objMatches) {
      const objNum = parseInt(objMatch[1], 10);
      objections.push({
        number: objNum,
        ...extractBilingualContent(objMatch[2]),
      });
    }

    // Extract Sed Contra (On the contrary)
    const otcMatch = html.match(new RegExp(
      `<!--Aquin[^>]*A\\[${articleNum}\\]\\s*OTC[^>]*-->([\\s\\S]*?)(?=<!--Aquin|$)`,
      'i'
    ));
    const sedContra = otcMatch
      ? extractBilingualContent(otcMatch[1])
      : { latin: '', english: '' };

    // Extract Respondeo (I answer that)
    const bodyMatch = html.match(new RegExp(
      `<!--Aquin[^>]*A\\[${articleNum}\\]\\s*Body[^>]*-->([\\s\\S]*?)(?=<!--Aquin|$)`,
      'i'
    ));
    const respondeo = bodyMatch
      ? extractBilingualContent(bodyMatch[1])
      : { latin: '', english: '' };

    // Extract replies to objections
    const replies: SummaArticle['replies'] = [];
    const replyMatches = html.matchAll(new RegExp(
      `<!--Aquin[^>]*A\\[${articleNum}\\]\\s*R\\.O\\.\\s*(\\d+)[^>]*-->([\\s\\S]*?)(?=<!--Aquin|$)`,
      'gi'
    ));
    for (const replyMatch of replyMatches) {
      const replyNum = parseInt(replyMatch[1], 10);
      replies.push({
        number: replyNum,
        ...extractBilingualContent(replyMatch[2]),
      });
    }

    articles.push({
      part,
      question: questionNum,
      article: articleNum,
      title: articleTitle,
      thesis,
      objections,
      sedContra,
      respondeo,
      replies,
    });
  }

  // Fallback: detect articles without Thesis markers by looking for Obj. or Body markers
  // Some questions (like Q71, Q72) don't have Thesis markers but do have content
  const articleNumsFromObj = new Set<number>();
  const objNumMatches = html.matchAll(/<!--Aquin[^>]*A\[(\d+)\]\s*(?:Obj\.\s*\d+|Body|OTC)[^>]*-->/gi);
  for (const objMatch of objNumMatches) {
    const articleNum = parseInt(objMatch[1], 10);
    if (!foundArticles.has(articleNum)) {
      articleNumsFromObj.add(articleNum);
    }
  }

  // Process any articles found only via objection/body markers
  for (const articleNum of articleNumsFromObj) {
    // Extract objections
    const objections: SummaArticle['objections'] = [];
    const objMatches = html.matchAll(new RegExp(
      `<!--Aquin[^>]*A\\[${articleNum}\\]\\s*Obj\\.\\s*(\\d+)[^>]*-->([\\s\\S]*?)(?=<!--Aquin|$)`,
      'gi'
    ));
    for (const objMatch of objMatches) {
      const objNum = parseInt(objMatch[1], 10);
      objections.push({
        number: objNum,
        ...extractBilingualContent(objMatch[2]),
      });
    }

    // Extract Sed Contra (On the contrary)
    const otcMatch = html.match(new RegExp(
      `<!--Aquin[^>]*A\\[${articleNum}\\]\\s*OTC[^>]*-->([\\s\\S]*?)(?=<!--Aquin|$)`,
      'i'
    ));
    const sedContra = otcMatch
      ? extractBilingualContent(otcMatch[1])
      : { latin: '', english: '' };

    // Extract Respondeo (I answer that)
    const bodyMatch = html.match(new RegExp(
      `<!--Aquin[^>]*A\\[${articleNum}\\]\\s*Body[^>]*-->([\\s\\S]*?)(?=<!--Aquin|$)`,
      'i'
    ));
    const respondeo = bodyMatch
      ? extractBilingualContent(bodyMatch[1])
      : { latin: '', english: '' };

    // Extract replies to objections
    const replies: SummaArticle['replies'] = [];
    const replyMatches = html.matchAll(new RegExp(
      `<!--Aquin[^>]*A\\[${articleNum}\\]\\s*R\\.O\\.\\s*(\\d+)[^>]*-->([\\s\\S]*?)(?=<!--Aquin|$)`,
      'gi'
    ));
    for (const replyMatch of replyMatches) {
      const replyNum = parseInt(replyMatch[1], 10);
      replies.push({
        number: replyNum,
        ...extractBilingualContent(replyMatch[2]),
      });
    }

    // Try to extract article title from the question header
    const headerMatch = html.match(/<h3[^>]*>([^<]*\(\s*(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|\d+)\s*ARTICLE[S]?\s*\))[^<]*/i);
    const articleTitle = headerMatch ? `Article ${articleNum}` : '';

    articles.push({
      part,
      question: questionNum,
      article: articleNum,
      title: articleTitle,
      thesis: { latin: '', english: '' },
      objections,
      sedContra,
      respondeo,
      replies,
    });
  }

  // Sort articles by number
  articles.sort((a, b) => a.article - b.article);

  return {
    part,
    question: questionNum,
    title: questionTitle,
    prologue,
    articles,
  };
}

/**
 * Get the file path for a question
 */
export function getQuestionFilePath(part: string, question: number): string {
  const paddedQ = question.toString().padStart(3, '0');
  return `public/thomas/summa/${part}/${part}${paddedQ}.html`;
}

/**
 * Get the URL path for a question
 */
export function getQuestionUrl(part: string, question: number): string {
  return `/thomas/summa/${part}/Q${question}`;
}

/**
 * Get the URL path for an article
 */
export function getArticleUrl(part: string, question: number, article: number): string {
  return `/thomas/summa/${part}/Q${question}/A${article}`;
}
