import type { OperationStatus, ProcessingStatus } from '../types/domain';

export interface PersistenceState {
  sheetStatus: OperationStatus;
  driveStatus: OperationStatus;
  processingStatus: ProcessingStatus;
}
export interface PersistenceOperations {
  saveSheet: () => void;
  saveDrive: () => void;
}

export function persistIncomplete(
  state: PersistenceState,
  operations: PersistenceOperations,
): PersistenceState {
  let sheetStatus = state.sheetStatus;
  let driveStatus = state.driveStatus;
  if (driveStatus === 'PENDING' || driveStatus === 'FAILED') {
    try {
      operations.saveDrive();
      driveStatus = 'SAVED';
    } catch {
      driveStatus = 'FAILED';
    }
  }
  if (sheetStatus === 'PENDING' || sheetStatus === 'FAILED') {
    try {
      operations.saveSheet();
      sheetStatus = 'SAVED';
    } catch {
      sheetStatus = 'FAILED';
    }
  }
  const successful = [sheetStatus, driveStatus].every(
    (status) => status === 'SAVED' || status === 'NOT_REQUIRED',
  );
  const partial = [sheetStatus, driveStatus].some(
    (status) => status === 'SAVED',
  );
  return {
    sheetStatus,
    driveStatus,
    processingStatus: successful ? 'COMPLETED' : partial ? 'PARTIAL' : 'FAILED',
  };
}

export interface CorrectionPlan {
  verifyBeforeMove: true;
  moveFileIds: string[];
  deactivateFileIds: string[];
  addFileNames: string[];
  routeChanged: boolean;
}
export function planCorrection(
  oldRoute: string,
  newRoute: string,
  activeFileIds: string[],
  removeFileIds: string[],
  addFileNames: string[],
): CorrectionPlan {
  const remove = new Set(removeFileIds);
  return {
    verifyBeforeMove: true,
    moveFileIds:
      oldRoute === newRoute
        ? []
        : activeFileIds.filter((id) => !remove.has(id)),
    deactivateFileIds: activeFileIds.filter((id) => remove.has(id)),
    addFileNames: [...addFileNames],
    routeChanged: oldRoute !== newRoute,
  };
}
