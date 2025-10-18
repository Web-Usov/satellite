import * as satellite from 'satellite.js';
import type { GroundStation, PassData } from '../../types';

type EciVector = {
  x: number;
  y: number;
  z: number;
};

type SatellitePosition = {
  position: EciVector | false;
  velocity: EciVector | false;
};

interface PassCandidate {
  startTime: Date;
  maxElevation: number;
  maxElevationTime: Date;
  endTime: Date;
  startAzimuth: number;
  endAzimuth: number;
}

const MINUTES_PER_DAY = 1440;
const STEP_SECONDS = 5;

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function azimuthToCompass(azimuth: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(azimuth / 45) % 8;
  return directions[index];
}

function calculateLookAngles(
  observerGeodetic: { latitude: number; longitude: number; height: number },
  satelliteEci: { position: EciVector; velocity: EciVector },
  gmst: number
): { elevation: number; azimuth: number } | null {
  try {
    const satelliteEcf = satellite.eciToEcf(satelliteEci.position, gmst);
    
    const lookAngles = satellite.ecfToLookAngles(observerGeodetic, satelliteEcf);
    
    return {
      elevation: radiansToDegrees(lookAngles.elevation),
      azimuth: radiansToDegrees(lookAngles.azimuth),
    };
  } catch {
    return null;
  }
}

function getLookAnglesAtTime(
  satrec: satellite.SatRec,
  observerGeodetic: { latitude: number; longitude: number; height: number },
  time: Date
): { elevation: number; azimuth: number } | null {
  const positionAndVelocity = satellite.propagate(satrec, time) as SatellitePosition;
  
  if (!positionAndVelocity || 
      positionAndVelocity.position === false || 
      positionAndVelocity.velocity === false) {
    return null;
  }

  const gmst = satellite.gstime(time);
  const lookAngles = calculateLookAngles(
    observerGeodetic,
    {
      position: positionAndVelocity.position,
      velocity: positionAndVelocity.velocity,
    },
    gmst
  );

  return lookAngles;
}

function refineHorizonCrossing(
  satrec: satellite.SatRec,
  observerGeodetic: { latitude: number; longitude: number; height: number },
  minElevation: number,
  timeBefore: Date,
  timeAfter: Date,
  isRising: boolean
): Date {
  let start = timeBefore;
  let end = timeAfter;
  
  for (let i = 0; i < 20; i++) {
    const mid = new Date((start.getTime() + end.getTime()) / 2);
    const lookAngles = getLookAnglesAtTime(satrec, observerGeodetic, mid);
    
    if (!lookAngles) break;
    
    if (isRising) {
      if (lookAngles.elevation < minElevation) {
        start = mid;
      } else {
        end = mid;
      }
    } else {
      if (lookAngles.elevation >= minElevation) {
        start = mid;
      } else {
        end = mid;
      }
    }
    
    if (end.getTime() - start.getTime() < 100) break;
  }
  
  return isRising ? end : start;
}

function refineMaxElevation(
  satrec: satellite.SatRec,
  observerGeodetic: { latitude: number; longitude: number; height: number },
  timeBefore: Date,
  timeAfter: Date
): { time: Date; elevation: number } {
  const coarseSamples = 50;
  const timeSpan = timeAfter.getTime() - timeBefore.getTime();
  const coarseStep = timeSpan / coarseSamples;
  
  let maxTime = timeBefore;
  let maxElevation = -90;
  
  for (let i = 0; i <= coarseSamples; i++) {
    const currentTime = new Date(timeBefore.getTime() + i * coarseStep);
    const lookAngles = getLookAnglesAtTime(satrec, observerGeodetic, currentTime);
    
    if (lookAngles && lookAngles.elevation > maxElevation) {
      maxElevation = lookAngles.elevation;
      maxTime = currentTime;
    }
  }
  
  const windowBefore = new Date(maxTime.getTime() - coarseStep);
  const windowAfter = new Date(maxTime.getTime() + coarseStep);
  
  const fineSamples = 60;
  const fineSpan = windowAfter.getTime() - windowBefore.getTime();
  const fineStep = fineSpan / fineSamples;
  
  for (let i = 0; i <= fineSamples; i++) {
    const currentTime = new Date(windowBefore.getTime() + i * fineStep);
    const lookAngles = getLookAnglesAtTime(satrec, observerGeodetic, currentTime);
    
    if (lookAngles && lookAngles.elevation > maxElevation) {
      maxElevation = lookAngles.elevation;
      maxTime = currentTime;
    }
  }
  
  return { time: maxTime, elevation: maxElevation };
}

export function calculateSatellitePasses(
  tleLine1: string,
  tleLine2: string,
  station: GroundStation,
  days: number
): PassData[] {
  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  
  const observerGeodetic = {
    latitude: degreesToRadians(station.latitude),
    longitude: degreesToRadians(station.longitude),
    height: station.altitude / 1000,
  };

  const passes: PassCandidate[] = [];
  const startDate = new Date();
  const totalSeconds = days * MINUTES_PER_DAY * 60;
  
  const horizonElevation = 0;

  let inPass = false;
  let passStartTime: Date | null = null;
  let passMaxElevation = -90;
  let passMaxElevationTime: Date | null = null;
  let passStartAzimuth = 0;
  let passEndAzimuth = 0;
  let previousTime: Date | null = null;
  let previousElevation = -90;

  for (let second = 0; second < totalSeconds; second += STEP_SECONDS) {
    const currentTime = new Date(startDate.getTime() + second * 1000);
    
    const positionAndVelocity = satellite.propagate(satrec, currentTime) as SatellitePosition;
    
    if (!positionAndVelocity || 
        positionAndVelocity.position === false || 
        positionAndVelocity.velocity === false) {
      previousTime = currentTime;
      continue;
    }

    const gmst = satellite.gstime(currentTime);
    
    const lookAngles = calculateLookAngles(
      observerGeodetic,
      {
        position: positionAndVelocity.position,
        velocity: positionAndVelocity.velocity,
      },
      gmst
    );

    if (!lookAngles) {
      previousTime = currentTime;
      continue;
    }

    const { elevation, azimuth } = lookAngles;

    if (elevation >= horizonElevation && !inPass) {
      inPass = true;
      
      if (previousTime && previousElevation < horizonElevation) {
        passStartTime = refineHorizonCrossing(
          satrec,
          observerGeodetic,
          horizonElevation,
          previousTime,
          currentTime,
          true
        );
        
        const startLookAngles = getLookAnglesAtTime(satrec, observerGeodetic, passStartTime);
        passStartAzimuth = startLookAngles ? startLookAngles.azimuth : azimuth;
      } else {
        passStartTime = currentTime;
        passStartAzimuth = azimuth;
      }
      
      passMaxElevation = elevation;
      passMaxElevationTime = currentTime;
    }

    if (inPass) {
      if (elevation > passMaxElevation) {
        passMaxElevation = elevation;
        passMaxElevationTime = currentTime;
      }

      if (elevation < horizonElevation) {
        let passEndTime: Date;
        
        if (previousTime && previousElevation >= horizonElevation) {
          passEndTime = refineHorizonCrossing(
            satrec,
            observerGeodetic,
            horizonElevation,
            previousTime,
            currentTime,
            false
          );
          
          const endLookAngles = getLookAnglesAtTime(satrec, observerGeodetic, passEndTime);
          passEndAzimuth = endLookAngles ? endLookAngles.azimuth : azimuth;
        } else {
          passEndTime = currentTime;
          passEndAzimuth = azimuth;
        }
        
        if (passStartTime && passMaxElevationTime && passMaxElevation >= station.minElevation) {
          const refinedMax = refineMaxElevation(
            satrec,
            observerGeodetic,
            passStartTime,
            passEndTime
          );
          
          passes.push({
            startTime: passStartTime,
            maxElevation: refinedMax.elevation,
            maxElevationTime: refinedMax.time,
            endTime: passEndTime,
            startAzimuth: passStartAzimuth,
            endAzimuth: passEndAzimuth,
          });
        }

        inPass = false;
        passStartTime = null;
        passMaxElevation = -90;
        passMaxElevationTime = null;
      }
    }
    
    previousTime = currentTime;
    previousElevation = elevation;
  }

  if (inPass && passStartTime && passMaxElevationTime && passMaxElevation >= station.minElevation) {
    const endTime = new Date(startDate.getTime() + totalSeconds * 1000);
    const refinedMax = refineMaxElevation(
      satrec,
      observerGeodetic,
      passStartTime,
      endTime
    );
    
    passes.push({
      startTime: passStartTime,
      maxElevation: refinedMax.elevation,
      maxElevationTime: refinedMax.time,
      endTime: endTime,
      startAzimuth: passStartAzimuth,
      endAzimuth: passEndAzimuth,
    });
  }

  return passes.map((pass) => ({
    startUTC: Math.floor(pass.startTime.getTime() / 1000),
    maxUTC: Math.floor(pass.maxElevationTime.getTime() / 1000),
    endUTC: Math.floor(pass.endTime.getTime() / 1000),
    maxEl: Math.round(pass.maxElevation * 100) / 100,
    startAz: Math.round(pass.startAzimuth * 100) / 100,
    endAz: Math.round(pass.endAzimuth * 100) / 100,
    startAzCompass: azimuthToCompass(pass.startAzimuth),
    endAzCompass: azimuthToCompass(pass.endAzimuth),
  }));
}

export function parseTLE(tleString: string | undefined): { line1: string; line2: string } {
  if (!tleString) {
    throw new Error('TLE data is missing or empty');
  }
  
  const lines = tleString.split('\r\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('Invalid TLE format: expected 2 lines');
  }
  
  return {
    line1: lines[0].trim(),
    line2: lines[1].trim(),
  };
}

