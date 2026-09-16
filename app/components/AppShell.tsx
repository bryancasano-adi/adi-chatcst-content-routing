import type { ReactNode } from 'react';
import type { Employee } from '../../lib/types/domain';
import { BrandLogo } from './BrandLogo';

export type AppPage = 'intake' | 'submissions' | 'admin';

interface AppShellProps {
  children: ReactNode;
  currentPage: AppPage;
  currentUser: Employee;
  onNewSubmission: () => void;
  onPageChange: (page: AppPage) => void;
}

export function AppShell({
  children,
  currentPage,
  currentUser,
  onNewSubmission,
  onPageChange,
}: AppShellProps) {
  const isPrivileged = ['ADMIN', 'CONTENT_MANAGER'].includes(
    currentUser.roleId,
  );

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <BrandLogo className="brandLogo" />
          <span>
            <strong>ChatCST Content Routing</strong>
            <small>Content Intake &amp; Governance</small>
          </span>
        </div>
        <div className="identity">
          <span>
            <strong>{currentUser.name}</strong>
            <small>{currentUser.email}</small>
          </span>
          <span className="role">{currentUser.roleId}</span>
        </div>
      </header>

      <div className="appLayout">
        <nav className="appNav" aria-label="Primary navigation">
          <button
            type="button"
            className={`appNavItem ${currentPage === 'intake' ? 'active' : ''}`}
            onClick={onNewSubmission}
            aria-current={currentPage === 'intake' ? 'page' : undefined}
          >
            <NavIcon name="plus" />
            <span>New Submission</span>
          </button>
          <button
            type="button"
            className={`appNavItem ${currentPage === 'submissions' ? 'active' : ''}`}
            onClick={() => onPageChange('submissions')}
            aria-current={currentPage === 'submissions' ? 'page' : undefined}
          >
            <NavIcon name="registry" />
            <span>Submissions</span>
          </button>
          {isPrivileged && (
            <button
              type="button"
              className={`appNavItem ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => onPageChange('admin')}
              aria-current={currentPage === 'admin' ? 'page' : undefined}
            >
              <NavIcon name="settings" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>
        <main className="contentShell">{children}</main>
      </div>
    </div>
  );
}

function NavIcon({ name }: { name: 'plus' | 'registry' | 'settings' }) {
  if (name === 'plus') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (name === 'registry') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M6 4h12a2 2 0 0 1 2 2v14H4V6a2 2 0 0 1 2-2Z" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09a1.7 1.7 0 0 0-1.1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.65 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.5 4.65a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.36.71.65.99.29.28.67.42 1.07.42H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}
