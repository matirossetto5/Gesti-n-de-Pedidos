import { describe, it, expect } from 'vitest';
import { calculateDeadline, formatDate } from './dateUtils';
import { Project, MaterialLeadTime } from '../types';

describe('dateUtils', () => {
  describe('calculateDeadline', () => {
    it('should calculate the correct deadline', () => {
      const project: Project = {
        id: '1',
        code: 'P1',
        name: 'Project 1',
        ownerId: 'user1',
        responsibleName: 'John',
        createdAt: '2026-01-01',
        fabricationStartDate: '2026-02-01',
      } as Project;

      const lt: MaterialLeadTime = {
        id: 'lt1',
        category: '1.1 Chapones para estructura principal',
        leadTimeDays: 10,
        ownerId: 'user1',
        purchaseTimeDays: 5,
        manufacturingTimeDays: 5,
      };

      // FabricationStartDate: 2026-02-01
      // Rule: offset 1
      // Total days to subtract: 10 + 1 = 11
      // 2026-02-01 - 11 days = 2026-01-21
      const deadline = calculateDeadline(project, lt);
      expect(deadline).toBe('2026-01-21');
    });

    it('should return undefined if rule is not found', () => {
      const project: Project = {
        id: '1',
        code: 'P1',
        name: 'Project 1',
        ownerId: 'user1',
        responsibleName: 'John',
        createdAt: '2026-01-01',
      } as Project;

      const lt: MaterialLeadTime = {
        id: 'lt1',
        category: 'Unknown Category',
        leadTimeDays: 10,
        ownerId: 'user1',
        purchaseTimeDays: 5,
        manufacturingTimeDays: 5,
      };

      const deadline = calculateDeadline(project, lt);
      expect(deadline).toBeUndefined();
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      expect(formatDate('2026-01-21')).toBe('21/01/2026');
    });

    it('should return empty string for empty input', () => {
      expect(formatDate('')).toBe('');
    });
  });
});
