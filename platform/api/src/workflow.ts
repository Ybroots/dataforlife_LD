export type IncidentStatus =
  | 'submitted'
  | 'received'
  | 'assigned'
  | 'verifying'
  | 'processing'
  | 'resolved'
  | 'closed'
  | 'rejected';

export type SosStatus =
  | 'triggered'
  | 'dispatched'
  | 'acknowledged'
  | 'responding'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'cancelled_by_citizen';

const incidentTransitions: Record<IncidentStatus, readonly IncidentStatus[]> = {
  submitted: ['received'],
  received: ['assigned', 'rejected'],
  assigned: ['verifying', 'processing'],
  verifying: ['processing', 'rejected'],
  processing: ['resolved'],
  resolved: ['closed', 'processing'],
  closed: [],
  rejected: ['closed'],
};

const sosTransitions: Record<SosStatus, readonly SosStatus[]> = {
  triggered: ['dispatched', 'cancelled_by_citizen'],
  dispatched: ['acknowledged', 'escalated', 'cancelled_by_citizen'],
  acknowledged: ['responding', 'escalated'],
  responding: ['resolved', 'escalated'],
  escalated: ['acknowledged', 'responding'],
  resolved: ['closed', 'responding'],
  closed: [],
  cancelled_by_citizen: [],
};

export class WorkflowError extends Error {
  constructor(
    readonly code: 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID_TRANSITION' | 'INVALID_INPUT',
    message: string,
  ) {
    super(message);
  }
}

export function assertIncidentTransition(from: IncidentStatus, to: IncidentStatus): void {
  if (!incidentTransitions[from].includes(to)) {
    throw new WorkflowError(
      'INVALID_TRANSITION',
      `Không thể chuyển phản ánh từ ${from} sang ${to}.`,
    );
  }
}

export function assertSosTransition(from: SosStatus, to: SosStatus): void {
  if (!sosTransitions[from].includes(to)) {
    throw new WorkflowError(
      'INVALID_TRANSITION',
      `Không thể chuyển SOS từ ${from} sang ${to}.`,
    );
  }
}

export function incidentNextStatuses(status: IncidentStatus): readonly IncidentStatus[] {
  return incidentTransitions[status];
}

export function sosNextStatuses(status: SosStatus): readonly SosStatus[] {
  return sosTransitions[status];
}
