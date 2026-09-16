import { localSubmissionService } from '../../lib/domain/localSubmissionService';
import type { Employee, SubmissionRecord } from '../../lib/types/domain';

interface SubmissionsPageProps {
  currentUser: Employee;
  onEdit: (record: SubmissionRecord) => void;
}

export function SubmissionsPage({ currentUser, onEdit }: SubmissionsPageProps) {
  const isPrivileged = ['ADMIN', 'CONTENT_MANAGER'].includes(
    currentUser.roleId,
  );
  const records = localSubmissionService
    .list()
    .filter(
      (record) => isPrivileged || record.submittedBy === currentUser.email,
    );

  return (
    <>
      <div className="pageTitle">
        <div>
          <p className="eyebrow">SUBMISSION REGISTRY</p>
          <h1>Submissions</h1>
          <p>Trace processing, destination, version, and support references.</p>
        </div>
      </div>
      <section className="card tableCard">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Document</th>
              <th>Route</th>
              <th>Version</th>
              <th>Status</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.submissionId}>
                <td>
                  <b>{record.submissionId}</b>
                  <small>{record.submittedBy}</small>
                </td>
                <td>{record.metadata.document_title}</td>
                <td>{record.routeKey || 'Unresolved'}</td>
                <td>v{record.submissionVersion}</td>
                <td>
                  <span
                    className={`status ${record.processingStatus.toLowerCase()}`}
                  >
                    {record.processingStatus}
                  </span>
                </td>
                <td>{new Date(record.updatedAt).toLocaleDateString()}</td>
                <td>
                  <button type="button" onClick={() => onEdit(record)}>
                    Correct
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className="empty">No submissions for this user.</div>
        )}
      </section>
    </>
  );
}
