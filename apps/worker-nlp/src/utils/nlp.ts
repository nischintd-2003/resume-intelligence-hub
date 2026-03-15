import nlp from 'compromise';
import * as chrono from 'chrono-node';
import { logger } from '@resume-hub/logger';
import { educationKeywords } from '../constants';
import { extractAndNormalizeSkills } from './normalizer';

export const extractStructuredData = async (rawText: string, jobId: string) => {
  try {
    logger.info(`[Job ${jobId}] Running compromise + chrono-node NLP extraction...`);

    const doc = nlp(rawText);

    // Extract Skills
    const skills = extractAndNormalizeSkills(rawText);

    logger.info(`[Job ${jobId}] Skills found (normalized): ${skills.join(', ') || 'none'}`);

    // Extract Experience (organisations)
    const organizations = doc.organizations().out('array') as string[];
    const uniqueOrgs = [...new Set(organizations)].filter((org) => org.length > 2);

    // Extract Education
    const educationArr: string[] = [];

    doc.sentences().forEach((sentence) => {
      const txt = sentence.text().toLowerCase();
      if (educationKeywords.some((kw) => txt.includes(kw))) {
        educationArr.push(sentence.text().trim());
      }
    });

    // Extract Dates
    const parsedDates = chrono.parse(rawText);
    const dateStrings = parsedDates.map((d) => d.text);

    const structuredData = {
      skills,
      experience: uniqueOrgs.length > 0 ? uniqueOrgs : ['No distinct organizations found'],
      education: educationArr.length > 0 ? educationArr : ['No distinct education found'],
      datesFound: dateStrings,
    };

    return structuredData;
  } catch (error) {
    logger.error(`[Job ${jobId}] NLP extraction failed:`, error);
    throw error;
  }
};
