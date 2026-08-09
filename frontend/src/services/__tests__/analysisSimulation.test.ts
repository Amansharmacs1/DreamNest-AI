// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { getSunPosition, analyzeLayout } from '../analysisSimulation';
import type { GeneratedLayout } from '../../types';

describe('Smart Building Analysis & Environmental Simulation', () => {
  
  it('Task 1: Sun Position System - calculates altitude and azimuth', () => {
    // 12:00 PM at Equator on Equinox (simplified mock check)
    const date = new Date('2026-03-21T12:00:00Z');
    const { altitude, azimuth } = getSunPosition(date, 0, 0, 720); // 720 minutes = 12 PM
    
    expect(typeof altitude).toBe('number');
    expect(typeof azimuth).toBe('number');
    expect(altitude).not.toBeNaN();
    expect(azimuth).not.toBeNaN();
  });

  it('Task 7: Space Utilization & Task 9: Parking Analysis', () => {
    const mockLayout: GeneratedLayout = {
      plotDimensions: { width: 50, length: 100, unit: 'Feet' },
      usableArea: { width: 50, length: 100, startX: 0, startY: 0 },
      rooms: [
        { id: '1', name: 'Living Room', category: 'living', floor: 0, x: 0, y: 0, width: 20, length: 20 },
        { id: '2', name: 'Parking', category: 'outdoor', floor: 0, x: 20, y: 0, width: 8, length: 15 }, // Too small!
        { id: '3', name: 'Staircase', category: 'circulation', floor: 0, x: 0, y: 20, width: 10, length: 10 },
      ]
    };

    const result = analyzeLayout(mockLayout as any);
    
    // Check space utilization
    expect(result.spaceUtilization.totalPlotArea).toBe(5000); // 50 * 100
    const expectedBuiltUp = (20*20) + (8*15) + (10*10); // 400 + 120 + 100 = 620
    expect(result.spaceUtilization.builtUpArea).toBe(expectedBuiltUp);
    
    const expectedCirculation = 100;
    expect(result.spaceUtilization.circulationArea).toBe(expectedCirculation);
    
    expect(result.spaceUtilization.usableArea).toBe(expectedBuiltUp - expectedCirculation);

    // Check parking suggestion (Task 9)
    const parkingSuggestion = result.aiSuggestions.find(s => s.id === 'park-2');
    expect(parkingSuggestion).toBeDefined();
    expect(parkingSuggestion?.description).toContain('too small');
  });

  it('Task 4: Window Analysis & Task 10: Garden Analysis', () => {
    const mockLayout: GeneratedLayout = {
      plotDimensions: { width: 50, length: 50, unit: 'Feet' },
      usableArea: { width: 50, length: 50, startX: 0, startY: 0 },
      rooms: [
        { id: '1', name: 'Bedroom 1', category: 'sleeping', floor: 0, x: 0, y: 0, width: 10, length: 10 }, // 0 windows -> Low sunlight
        { id: '2', name: 'Garden', category: 'outdoor', floor: 0, x: 40, y: 0, width: 10, length: 10 }, // x=40 is > centerX (25) -> East side
      ]
    };

    const result = analyzeLayout(mockLayout as any);

    // Check Window analysis for Bedroom 1
    const windowSuggestion = result.aiSuggestions.find(s => s.id === 'win-1');
    expect(windowSuggestion).toBeDefined();
    expect(windowSuggestion?.description).toContain('receives limited direct sunlight');

    // Check Garden analysis
    const gardenSuggestion = result.aiSuggestions.find(s => s.id === 'garden-2');
    expect(gardenSuggestion).toBeDefined();
    expect(gardenSuggestion?.description).toContain('receiving good morning sunlight');
  });
});
