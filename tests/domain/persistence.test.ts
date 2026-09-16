import { describe, expect, it, vi } from 'vitest';
import {
  persistIncomplete,
  planCorrection,
} from '../../lib/domain/persistence';

describe('partial persistence and retry', () => {
  it('completes the happy path', () =>
    expect(
      persistIncomplete(
        {
          sheetStatus: 'PENDING',
          driveStatus: 'PENDING',
          processingStatus: 'PROCESSING',
        },
        { saveSheet: () => undefined, saveDrive: () => undefined },
      ).processingStatus,
    ).toBe('COMPLETED'));
  it('represents Drive success / Sheet failure', () =>
    expect(
      persistIncomplete(
        {
          sheetStatus: 'PENDING',
          driveStatus: 'PENDING',
          processingStatus: 'PROCESSING',
        },
        {
          saveSheet: () => {
            throw new Error('sheet');
          },
          saveDrive: () => undefined,
        },
      ),
    ).toMatchObject({
      sheetStatus: 'FAILED',
      driveStatus: 'SAVED',
      processingStatus: 'PARTIAL',
    }));
  it('represents Sheet success / Drive failure', () =>
    expect(
      persistIncomplete(
        {
          sheetStatus: 'PENDING',
          driveStatus: 'PENDING',
          processingStatus: 'PROCESSING',
        },
        {
          saveSheet: () => undefined,
          saveDrive: () => {
            throw new Error('drive');
          },
        },
      ),
    ).toMatchObject({
      sheetStatus: 'SAVED',
      driveStatus: 'FAILED',
      processingStatus: 'PARTIAL',
    }));
  it('retries only an incomplete operation', () => {
    const saveSheet = vi.fn();
    const saveDrive = vi.fn();
    const result = persistIncomplete(
      {
        sheetStatus: 'SAVED',
        driveStatus: 'FAILED',
        processingStatus: 'PARTIAL',
      },
      { saveSheet, saveDrive },
    );
    expect(result.processingStatus).toBe('COMPLETED');
    expect(saveSheet).not.toHaveBeenCalled();
    expect(saveDrive).toHaveBeenCalledOnce();
  });
});

describe('correction planning', () => {
  it('plans metadata-only correction without a file move', () =>
    expect(planCorrection('A', 'A', ['F1'], [], [])).toMatchObject({
      routeChanged: false,
      moveFileIds: [],
    }));
  it('moves retained files only after target verification and deactivates removed files', () =>
    expect(
      planCorrection('A', 'B', ['F1', 'F2'], ['F2'], ['replacement.pdf']),
    ).toEqual({
      verifyBeforeMove: true,
      routeChanged: true,
      moveFileIds: ['F1'],
      deactivateFileIds: ['F2'],
      addFileNames: ['replacement.pdf'],
    }));
});
