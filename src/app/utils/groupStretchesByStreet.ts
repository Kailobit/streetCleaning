import { AbstractStreetData, Stretch } from '../models/models';

export function groupStretchesByStreet(entries: { streetName: string; stretch: Stretch }[]): AbstractStreetData[] {
  const grouped = entries.reduce((acc, entry) => {
    if (!acc.has(entry.streetName)) {
      acc.set(entry.streetName, []);
    }
    acc.get(entry.streetName)!.push(entry.stretch);
    return acc;
  }, new Map<string, Stretch[]>());

  return Array.from(grouped.entries()).map(([streetName, stretches]) => ({
    streetName,
    stretches,
    osmIDs: [] 
  }));
}
