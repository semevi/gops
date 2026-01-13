import type { Turnaround } from '../types';

export const isWideBody = (aircraftType: string): boolean => {
    const wideBodyCodes = ['330', '332', '333', '340', '350', '359', '380', '747', '767', '777', '787', '788', '789'];
    // Check if type contains any of the widebody substrings
    return wideBodyCodes.some(code => aircraftType.includes(code));
};

export const getServiceWindow = (turnaround: Turnaround, type: 'arrival' | 'departure'): [number, number] | null => {
    const isWB = isWideBody(turnaround.aircraftType);
    
    // Durations in minutes
    // Narrow Body: Arr 15, Dep 35
    // Wide Body: Arr 25, Dep 70
    
    if (type === 'arrival' && turnaround.arrival.sta) {
      const start = new Date(turnaround.arrival.sta).getTime();
      const durationMinutes = isWB ? 25 : 15;
      
      // Arrival service starts at STA (On Chocks)
      const end = start + durationMinutes * 60 * 1000;
      return [start, end];
    }
    
    if (type === 'departure' && turnaround.departure.std) {
      const end = new Date(turnaround.departure.std).getTime();
      const durationMinutes = isWB ? 70 : 35;
      
      // Departure service ends at STD (Off Chocks/Pushback)
      const start = end - durationMinutes * 60 * 1000;
      return [start, end];
    }
    
    return null;
};