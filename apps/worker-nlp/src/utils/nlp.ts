import nlp from 'compromise';
import * as chrono from 'chrono-node';
import { logger } from '@resume-hub/logger';
import { educationKeywords, KNOWN_SKILLS } from '../constants';

export const extractStructuredData = async (rawText: string, jobId: string) => {
  try {
    logger.info(`[Job ${jobId}]  Running compromise + chrono-node NLP extraction...`);

    const doc = nlp(rawText);

    // Extract Skills
    const foundSkills = new Set<string>();
    const normalizedText = rawText.toLowerCase();

    KNOWN_SKILLS.forEach((skill) => {
      // avoid partial matches
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalizedText)) {
        foundSkills.add(skill);
      }
    });

    // Extract Experience
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
      skills: Array.from(foundSkills),
      experience: uniqueOrgs.length > 0 ? uniqueOrgs : ['No distinct organizations found'],
      education: educationArr.length > 0 ? educationArr : ['No distinct education found'],
      datesFound: dateStrings,
    };

    return structuredData;
  } catch (error) {
    logger.error(`[Job ${jobId}]  NLP Extraction Failed:`, error);
    throw error;
  }
};
