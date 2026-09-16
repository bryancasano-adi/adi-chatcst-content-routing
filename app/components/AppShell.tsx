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
      <header>
        <div className="brand">
          <BrandLogo className="brandLogo" />
          <div>
            <strong>ChatCST Content Routing</strong>
          </div>
        </div>
        <div className="identity">
          <span>
            <strong>{currentUser.name}</strong>
            <small>{currentUser.email}</small>
          </span>
          <span className="role">{currentUser.roleId}</span>
        </div>
      </header>

      <div className="body">
        <nav aria-label="Primary navigation">
          <button
            type="button"
            className={currentPage === 'intake' ? 'active' : ''}
            onClick={onNewSubmission}
          >
            ＋ New submission
          </button>
          <button
            type="button"
            className={currentPage === 'submissions' ? 'active' : ''}
            onClick={() => onPageChange('submissions')}
          >
            ▤ Submissions
          </button>
          {isPrivileged && (
            <button
              type="button"
              className={currentPage === 'admin' ? 'active' : ''}
              onClick={() => onPageChange('admin')}
            >
              ⚙ Admin console
            </button>
          )}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
