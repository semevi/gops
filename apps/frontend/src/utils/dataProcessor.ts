
import type { Turnaround } from '../types';

export const createTurnaroundFromLegs = (arrival: any, departure: any): Turnaround => {
    const primary = arrival || departure;
    const id = primary.flightNumber 
        ? `${primary.flightNumber}_${new Date(primary.sta).getTime()}`
        : `turn_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        id: id,
        aircraftType: primary.type || '320',
        aircraftRegistration: primary.reg || '',
        stand: primary.stand || '',
        requiredTeamSize: 3,
        arrival: arrival ? {
            flightNumber: arrival.flightNumber,
            city: arrival.origin,
            sta: arrival.sta,
            eta: arrival.estimated,
            ata: arrival.actual,
        } : {},
        departure: departure ? {
            flightNumber: departure.flightNumber,
            city: departure.destination,
            std: departure.sta,
            etd: departure.estimated,
            atd: departure.actual,
            slot: departure.slot
        } : {},
        arrivalRemarks: arrival?.status,
        departureRemarks: departure?.status
    };
};

export const processApiData = (jsonData: any): Turnaround[] => {
  const flightsData = jsonData?.Flights || (Array.isArray(jsonData) ? jsonData : []);
  if (!Array.isArray(flightsData)) return [];

  const mapStatus = (code: string | undefined) => {
      switch (code) {
          case 'S': return 'Scheduled';
          case 'A': return 'Active';
          case 'L': return 'Landed';
          case 'D': return 'Diverted';
          case 'C': return 'Cancelled';
          case 'X': return 'Cancelled';
          case 'F': return 'Final Approach';
          case 'E': return 'Estimated';
          case 'O': return 'On Block';
          case 'Z': return 'Off Block';
          default: return code;
      }
  };

  const normalize = (record: any) => {
    const fId = record.FlightIdentification || {};
    const fData = record.FlightData || {};
    const opsTimes = fData.OperationalTimes || {};
    const cdm = record.CDMInfoFields || {};
    const airport = fData.Airport || {};
    const standInfo = airport.Stand || {};
    const aircraft = fData.Aircraft || {};
    const flightMisc = fData.Flight || {};

    const flightNumber = fId.FlightIdentity;
    const codeShareStatus = fId.CodeShareStatus;
    
    const dirString = fId.FlightDirection;
    let direction: 'arrival' | 'departure' | 'unknown' = 'unknown';
    if (dirString === 'Arrival') direction = 'arrival';
    else if (dirString === 'Departure') direction = 'departure';

    const sta = opsTimes.ScheduledDateTime;

    let estimated = opsTimes.EstimatedDateTime;
    if (direction === 'arrival' && opsTimes.EstimatedOnBlocksDateTime) {
        estimated = opsTimes.EstimatedOnBlocksDateTime;
    } else if (direction === 'departure' && opsTimes.EstimatedOffBlocksDateTime) {
        estimated = opsTimes.EstimatedOffBlocksDateTime;
    }

    let actual = undefined;
    if (direction === 'arrival') {
        actual = opsTimes.ActualOnBlocksDateTime || opsTimes.WheelsDownDateTime;
    } else if (direction === 'departure') {
        actual = opsTimes.ActualOffBlocksDateTime || opsTimes.WheelsUpDateTime;
    }

    const slot = cdm.CalculatedTakeOffDateTime;
    const reg = aircraft.AircraftRegistration;
    const type = aircraft.AircraftTypeICAOCode;
    const stand = standInfo.StandPosition;
    const origin = flightMisc.OriginAirportIATACode;
    const destination = flightMisc.DestinationAirportIATACode;
    const status = mapStatus(flightMisc.FlightStatusCode);

    return { flightNumber, codeShareStatus, direction, sta, estimated, actual, slot, reg, type, stand, origin, destination, status, raw: record };
  };

  const flights = flightsData.map(normalize).filter(f => {
      if (!f.flightNumber || !f.sta) return false;
      if (f.codeShareStatus) {
          const csNum = parseInt(f.codeShareStatus, 10);
          if (!isNaN(csNum) && csNum > 0) return false;
          if (f.codeShareStatus === 'S') return false;
      }
      return true;
  });

  const turnarounds: Turnaround[] = [];
  const flightsByReg: Record<string, typeof flights> = {};
  const singles: typeof flights = [];

  flights.forEach(f => {
    if (f.reg) {
      if (!flightsByReg[f.reg]) flightsByReg[f.reg] = [];
      flightsByReg[f.reg].push(f);
    } else {
      singles.push(f);
    }
  });

  const getAirlineScore = (f: any) => {
        const prefix = f.flightNumber.substring(0, 2).toUpperCase();
        const numberPart = parseInt(f.flightNumber.replace(/\D/g, ''), 10) || 0;
        if (['EI', 'BA', 'IB', 'VY', 'QF', 'AY'].includes(prefix) && numberPart >= 4000) return 1;
        if (prefix === 'EI') return 20;
        if (prefix === 'EA') return 18;
        if (['AA', 'UA', 'DL', 'AC', 'TS', 'ET', 'EK', 'QR', 'BA', 'IB', 'VY'].includes(prefix)) return 15;
        return 5;
  };

  Object.values(flightsByReg).forEach(group => {
    group.sort((a, b) => {
        const timeDiff = new Date(a.sta).getTime() - new Date(b.sta).getTime();
        if (timeDiff !== 0) return timeDiff;
        const getRegScore = (f: any) => {
            const reg = (f.reg || '').toUpperCase();
            const prefix = f.flightNumber.substring(0, 2).toUpperCase();
            if (reg.startsWith('EI') && prefix === 'EI') return 100;
            if (reg.startsWith('G') && prefix === 'BA') return 100;
            if (reg.startsWith('N') && prefix === 'AA') return 100;
            return 0;
        };
        const regScoreDiff = getRegScore(b) - getRegScore(a);
        if (regScoreDiff !== 0) return regScoreDiff;
        const getCodeShareScore = (f: any) => (f.codeShareStatus === 'P' ? 10 : 5);
        const csScoreDiff = getCodeShareScore(b) - getCodeShareScore(a);
        if (csScoreDiff !== 0) return csScoreDiff;
        const scoreDiff = getAirlineScore(b) - getAirlineScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        return a.flightNumber.localeCompare(b.flightNumber);
    });

    const uniqueGroup: typeof flights = [];
    if (group.length > 0) {
        uniqueGroup.push(group[0]);
        for (let i = 1; i < group.length; i++) {
            const current = group[i];
            const prev = uniqueGroup[uniqueGroup.length - 1];
            const isSameTime = new Date(current.sta).getTime() === new Date(prev.sta).getTime();
            const isSameDirection = current.direction === prev.direction;
            if (isSameTime && isSameDirection) continue;
            uniqueGroup.push(current);
        }
    }
    
    let pendingArrival = null;
    for (const flight of uniqueGroup) {
      if (flight.direction === 'arrival') {
        if (pendingArrival) turnarounds.push(createTurnaroundFromLegs(pendingArrival, null));
        pendingArrival = flight;
      } else if (flight.direction === 'departure') {
        if (pendingArrival) {
          const arrTime = new Date(pendingArrival.sta).getTime();
          const depTime = new Date(flight.sta).getTime();
          if (depTime > arrTime && (depTime - arrTime) < 18 * 3600 * 1000) {
            turnarounds.push(createTurnaroundFromLegs(pendingArrival, flight));
            pendingArrival = null;
          } else {
            turnarounds.push(createTurnaroundFromLegs(pendingArrival, null));
            turnarounds.push(createTurnaroundFromLegs(null, flight));
            pendingArrival = null;
          }
        } else {
          turnarounds.push(createTurnaroundFromLegs(null, flight));
        }
      } else {
          turnarounds.push(createTurnaroundFromLegs(null, flight));
      }
    }
    if (pendingArrival) turnarounds.push(createTurnaroundFromLegs(pendingArrival, null));
  });

  const singlesGrouped: Record<string, typeof flights> = {};
  singles.forEach(f => {
      const route = f.direction === 'arrival' ? f.origin : f.destination;
      const key = `${f.direction}_${new Date(f.sta).getTime()}_${route}`;
      if (!singlesGrouped[key]) singlesGrouped[key] = [];
      singlesGrouped[key].push(f);
  });

  Object.values(singlesGrouped).forEach(group => {
      group.sort((a, b) => {
        const getCodeShareScore = (f: any) => (f.codeShareStatus === 'P' ? 10 : 5);
        const csScoreDiff = getCodeShareScore(b) - getCodeShareScore(a);
        if (csScoreDiff !== 0) return csScoreDiff;
        const scoreDiff = getAirlineScore(b) - getAirlineScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        return a.flightNumber.localeCompare(b.flightNumber);
      });
      const main = group[0];
      if(main.direction === 'arrival') turnarounds.push(createTurnaroundFromLegs(main, null));
      else turnarounds.push(createTurnaroundFromLegs(null, main));
  });

  return turnarounds;
};
