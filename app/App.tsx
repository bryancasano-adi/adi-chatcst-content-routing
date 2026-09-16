import { useState } from 'react';
import { AdminPage } from './components/AdminPage';
import { AppShell, type AppPage } from './components/AppShell';
import { IntakePage } from './components/IntakePage';
import { SubmissionsPage } from './components/SubmissionsPage';
import { localConfiguredEmployee } from '../lib/config/applicationConfig';
import type { SubmissionRecord } from '../lib/types/domain';

export function App() {
  const [page, setPage] = useState<AppPage>('intake');
  const currentUser = localConfiguredEmployee;
  const userEmail = currentUser.email;
  const [editingSubmission, setEditingSubmission] =
    useState<SubmissionRecord | null>(null);
  const [registryVersion, setRegistryVersion] = useState(0);

  function openNewSubmission() {
    setEditingSubmission(null);
    setPage('intake');
  }

  function openCorrection(submission: SubmissionRecord) {
    setEditingSubmission(submission);
    setPage('intake');
  }

  function finishSubmission() {
    setEditingSubmission(null);
    setRegistryVersion((version) => version + 1);
    setPage('submissions');
  }

  return (
    <AppShell
      currentPage={page}
      currentUser={currentUser}
      onNewSubmission={openNewSubmission}
      onPageChange={setPage}
    >
      {page === 'intake' && (
        <IntakePage
          key={editingSubmission?.submissionId ?? 'new'}
          initialSubmission={editingSubmission}
          userEmail={userEmail}
          onSaved={finishSubmission}
        />
      )}
      {page === 'submissions' && (
        <SubmissionsPage
          key={`${userEmail}-${registryVersion}`}
          currentUser={currentUser}
          onEdit={openCorrection}
        />
      )}
      {page === 'admin' && <AdminPage />}
    </AppShell>
  );
}
