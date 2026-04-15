import type { ProgramDay } from '../schemas/course-date.js';

export type NormalizedProgramDay = {
  tag: string;
  time: string;
  title: string;
  topics: Array<{ text: string; children: Array<{ text: string; children: any[] }> }>;
  description: string;
  kind: 'bullets' | 'paragraph';
};

const TIME_IN_TAG_REGEX = /\s*[·•\-–—]\s*(\d{1,2}:\d{2}\s*(?:às|a)\s*\d{1,2}:\d{2})\s*$/i;

export function normalizeProgramDays(days: ProgramDay[]): NormalizedProgramDay[] {
  return days.map(day => {
    let tag = day.tag;
    let time = day.time || '';

    // Extrair horário do tag se time estiver vazio
    if (!time) {
      const match = tag.match(TIME_IN_TAG_REGEX);
      if (match) {
        time = match[1]!;
        tag = tag.replace(TIME_IN_TAG_REGEX, '').trim();
      }
    }

    // Garantir children em cada topic
    const topics = (day.topics || []).map(t => ({
      text: t.text,
      children: (t.children || []).map(c => ({
        text: c.text,
        children: c.children || [],
      })),
    }));

    const kind: 'bullets' | 'paragraph' = topics.length > 0 ? 'bullets' : 'paragraph';

    return { tag, time, title: day.title, topics, description: day.description || '', kind };
  });
}
