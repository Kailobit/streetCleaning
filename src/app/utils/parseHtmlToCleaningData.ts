import { CleaningData } from "../models/models";

export function parseHtmlToCleaningData(html: string): CleaningData {
  let startDate = new Date(0);
  let endDate = new Date(0);
  let ricorrenza = 'Nessuna ricorrenza';

  try {
    const messaggiNessunaData = [
      "L'ordinanza per questo tratto di strada",
      'ordinanza per questo tratto',
      '&egrave; scaduta',
      'Momentaneamente non sono previste altre ordinanze'
    ];

    if (messaggiNessunaData.some(m => html.includes(m))) {
      return { start: startDate, end: endDate, recurrence: ricorrenza };
    }

    const tag = '\\u00e8:';
    const tagIndex = html.indexOf(tag);
    if (tagIndex === -1) throw new Error('Token "è:" non trovato');

    const relevant = html.slice(tagIndex + tag.length);
    const giorni = ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Domenica'];
    let dataTestuale = '';

    for (const giorno of giorni) {
      const startIdx = relevant.indexOf(giorno);
      const endIdx = relevant.indexOf('<br', startIdx);
      if (startIdx !== -1 && endIdx !== -1) {
        dataTestuale = relevant
          .substring(startIdx + giorno.length, endIdx)
          .trim()
          .replace(/\\\//g, '/');
        break;
      }
    }

    const dataMatch = dataTestuale.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const orarioMatch = relevant.match(/Orario\s+(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})/);

    if (dataMatch && orarioMatch) {
      const [, dd, mm, yyyy] = dataMatch;
      const [, hStart, mStart, hEnd, mEnd] = orarioMatch;
      startDate = new Date(+yyyy, +mm - 1, +dd, +hStart, +mStart);
      endDate = new Date(+yyyy, +mm - 1, +dd, +hEnd, +mEnd);
    }

    const ricorrenza0 = relevant.split('Ogni ')[1];
    ricorrenza = ricorrenza0?.split('<')[0] ?? ricorrenza;

  } catch (err) {
    console.warn('⚠️ Errore nel parsing della risposta:', err);
  }

  return { start: startDate, end: endDate, recurrence: ricorrenza };
}
