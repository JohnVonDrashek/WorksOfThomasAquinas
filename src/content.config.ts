import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const works = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    latinTitle: z.string().optional(),
    abbreviation: z.string().optional(),
    category: z.enum([
      'major-theological',
      'quaestiones-disputatae',
      'opuscula',
      'aristotle-commentary',
      'biblical-commentary',
      'other-commentary',
      'popular',
    ]),
    languages: z.object({
      latinEnglish: z.string().optional(),
      english: z.string().optional(),
    }),
    parts: z.array(z.object({
      id: z.string(),
      title: z.string(),
      path: z.string().optional(),
    })).optional(),
    source: z.string().optional(),
    translator: z.string().optional(),
    restricted: z.boolean().optional(),
  }),
});

export const collections = { works };
