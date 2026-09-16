import { useMemo, useState } from 'react';
import { localSubmissionService } from '../../lib/domain/localSubmissionService';
import {
  employees,
  metadataFields,
  routes,
  vettingQuestions,
} from '../../lib/config/applicationConfig';

type AdminView = 'health' | 'configuration' | 'audit' | 'acl';

export function AdminPage() {
  const records = localSubmissionService.list();
  const [view, setView] = useState<AdminView>('configuration');
  const metrics = useMemo(
    () => ({
      total: records.length,
      completed: records.filter(
        (record) => record.processingStatus === 'COMPLETED',
      ).length,
      attention: records.filter((record) =>
        ['FAILED', 'PARTIAL', 'REQUIRES_REVIEW'].includes(
          record.processingStatus,
        ),
      ).length,
    }),
    [records],
  );

  return (
    <>
      <div className="pageTitle">
        <div>
          <p className="eyebrow">OPERATIONS</p>
          <h1>Admin Console</h1>
          <p>
            Configuration is read-only here; mutations are server-authorized and
            audited.
          </p>
        </div>
      </div>
      <div className="metrics">
        <Metric label="Total Submissions" value={metrics.total} />
        <Metric label="Completed" value={metrics.completed} />
        <Metric label="Needs Attention" value={metrics.attention} />
        <Metric
          label="Active Routes"
          value={routes.filter((route) => route.active).length}
        />
      </div>
      <section className="card adminCard">
        <div className="adminHeader">
          <div>
            <h2>Environment and Governance</h2>
            <p className="muted">
              Review application health, governed configuration, audit activity,
              and proposed access changes.
            </p>
          </div>
          <span className="readOnlyBadge">Read Only</span>
        </div>
        <div className="adminButtons" role="tablist" aria-label="Admin Views">
          <AdminTab
            current={view}
            id="health"
            label="Health"
            onChange={setView}
          />
          <AdminTab
            current={view}
            id="configuration"
            label="Configuration"
            onChange={setView}
          />
          <AdminTab
            current={view}
            id="audit"
            label="Audit Log"
            onChange={setView}
          />
          <AdminTab
            current={view}
            id="acl"
            label="ACL Preview"
            onChange={setView}
          />
        </div>
        <div className="adminOutput" role="tabpanel">
          {view === 'health' && <HealthView />}
          {view === 'configuration' && <ConfigurationView />}
          {view === 'audit' && <AuditView />}
          {view === 'acl' && <AclView />}
        </div>
      </section>
    </>
  );
}

function AdminTab({
  current,
  id,
  label,
  onChange,
}: {
  current: AdminView;
  id: AdminView;
  label: string;
  onChange: (view: AdminView) => void;
}) {
  return (
    <button
      type="button"
      className={current === id ? 'active' : ''}
      role="tab"
      aria-selected={current === id}
      onClick={() => onChange(id)}
    >
      {label}
    </button>
  );
}

function HealthView() {
  const checks = [
    [
      'Local Application',
      true,
      'React workflow and domain services are available.',
    ],
    [
      'Metadata Configuration',
      metadataFields.length > 0,
      `${metadataFields.length} active fields`,
    ],
    [
      'Vetting Configuration',
      vettingQuestions.length > 0,
      `${vettingQuestions.length} active questions`,
    ],
    [
      'Route Configuration',
      routes.some((route) => route.active),
      `${routes.filter((route) => route.active).length} active routes`,
    ],
    [
      'Google Resources',
      true,
      'Validated only by the deployed GAS environment.',
      'External Check',
    ],
  ] as const;

  return (
    <div>
      <div className="sectionHeading">
        <div>
          <h3>Environment Health</h3>
          <p>Local configuration is ready for interface testing.</p>
        </div>
        <span className="status completed">Local Ready</span>
      </div>
      <div className="checkList">
        {checks.map(([name, ok, detail, status]) => (
          <div key={name}>
            <span className={ok ? 'checkIcon ok' : 'checkIcon'}>
              {ok ? '✓' : '!'}
            </span>
            <span>
              <strong>{name}</strong>
              <small>{detail}</small>
            </span>
            <b>{status ?? (ok ? 'Passed' : 'Needs Attention')}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfigurationView() {
  const roleCount = new Set(employees.map((employee) => employee.roleId)).size;
  return (
    <div>
      <div className="sectionHeading">
        <div>
          <h3>Governed Configuration</h3>
          <p>
            {metadataFields.length} metadata fields · {vettingQuestions.length}{' '}
            vetting questions · {roleCount} roles
          </p>
        </div>
      </div>
      <div className="adminTableWrap">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Destination</th>
              <th>Allowed Roles</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.routeKey}>
                <td>
                  <b>{route.routeKey}</b>
                </td>
                <td>{route.dataSummaryTab}</td>
                <td>{route.allowedRoles.join(', ')}</td>
                <td>
                  <span className={`status ${route.active ? 'completed' : ''}`}>
                    {route.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditView() {
  const events = localSubmissionService.audits().slice().reverse();
  return (
    <div>
      <div className="sectionHeading">
        <div>
          <h3>Recent Audit Activity</h3>
          <p>Immutable workflow events, newest first.</p>
        </div>
        <span className="countBadge">{events.length} Events</span>
      </div>
      {events.length ? (
        <div className="adminTableWrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Submission</th>
                <th>Actor</th>
                <th>Result</th>
                <th>Occurred</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.auditId}>
                  <td>
                    <b>{event.eventType.replaceAll('_', ' ')}</b>
                  </td>
                  <td>{event.submissionId || 'System'}</td>
                  <td>{event.actorEmail}</td>
                  <td>
                    <span
                      className={`status ${event.result === 'SUCCESS' ? 'completed' : 'failed'}`}
                    >
                      {event.result}
                    </span>
                  </td>
                  <td>{new Date(event.occurredAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="emptyState">
          <strong>No Audit Events</strong>
          <span>Workflow activity will appear here.</span>
        </div>
      )}
    </div>
  );
}

function AclView() {
  const protectedUsers = employees.filter(
    (employee) =>
      employee.active && ['ADMIN', 'CONTENT_MANAGER'].includes(employee.roleId),
  );
  return (
    <div>
      <div className="sectionHeading">
        <div>
          <h3>ACL Change Preview</h3>
          <p>
            Read-only access reconciliation preview. No changes are applied.
          </p>
        </div>
      </div>
      <div className="aclSummary">
        <Metric label="Add" value={0} />
        <Metric label="Change" value={0} />
        <Metric label="Remove" value={0} />
        <Metric label="Protected" value={protectedUsers.length} />
      </div>
      <div className="checkList">
        {protectedUsers.map((employee) => (
          <div key={employee.email}>
            <span className="checkIcon protected">●</span>
            <span>
              <strong>{employee.name}</strong>
              <small>{employee.email}</small>
            </span>
            <b>{employee.roleId.replaceAll('_', ' ')}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
