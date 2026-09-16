import { useMemo, useState } from 'react';
import { localSubmissionService } from '../../lib/domain/localSubmissionService';
import {
  employees,
  routes,
  vettingQuestions,
} from '../../lib/config/applicationConfig';

export function AdminPage() {
  const records = localSubmissionService.list();
  const [output, setOutput] = useState('Select an administrative view.');
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

  function showHealth() {
    setOutput(
      JSON.stringify(
        {
          valid: true,
          questions: vettingQuestions.length,
          routes: routes.length,
          googleResources: 'Checked only by GAS validateEnvironment()',
        },
        null,
        2,
      ),
    );
  }

  function showConfiguration() {
    setOutput(
      JSON.stringify(
        {
          routes,
          roles: [...new Set(employees.map((employee) => employee.roleId))],
        },
        null,
        2,
      ),
    );
  }

  function showAuditLog() {
    setOutput(JSON.stringify(localSubmissionService.audits(), null, 2));
  }

  function showAclPreview() {
    setOutput(
      JSON.stringify(
        {
          add: [],
          change: [],
          remove: [],
          protected: [
            {
              email: 'content.manager@aboitiz.com',
              reason: 'protected identity',
            },
          ],
        },
        null,
        2,
      ),
    );
  }

  return (
    <>
      <div className="pageTitle">
        <div>
          <p className="eyebrow">OPERATIONS</p>
          <h1>Admin console</h1>
          <p>
            Configuration is read-only here; mutations are server-authorized and
            audited.
          </p>
        </div>
      </div>
      <div className="metrics">
        <Metric label="Total submissions" value={metrics.total} />
        <Metric label="Completed" value={metrics.completed} />
        <Metric label="Needs attention" value={metrics.attention} />
        <Metric
          label="Active routes"
          value={routes.filter((route) => route.active).length}
        />
      </div>
      <section className="card">
        <h2>Environment and governance</h2>
        <p className="muted">
          ACL preview is conservative by default. Protected owner and content
          manager access is never removed.
        </p>
        <div className="adminButtons">
          <button type="button" onClick={showHealth}>
            Health
          </button>
          <button type="button" onClick={showConfiguration}>
            Configuration
          </button>
          <button type="button" onClick={showAuditLog}>
            Audit log
          </button>
          <button type="button" onClick={showAclPreview}>
            ACL preview
          </button>
        </div>
        <pre>{output}</pre>
      </section>
    </>
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
