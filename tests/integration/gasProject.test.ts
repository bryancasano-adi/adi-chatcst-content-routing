import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const root = new URL('../../', import.meta.url);

describe('Apps Script project contract', () => {
  it('keeps server and client JavaScript syntactically valid', async () => {
    const serverFiles = [
      'AccessControlRepository.gs',
      'AccessControlService.gs',
      'AuditRepository.gs',
      'AuthService.gs',
      'Code.gs',
      'ConfigService.gs',
      'DataSummaryRepository.gs',
      'DriveRepository.gs',
      'EnvironmentService.gs',
      'ErrorService.gs',
      'IdempotencyService.gs',
      'RoutingService.gs',
      'SetupService.gs',
      'SubmissionRepository.gs',
      'SubmissionService.gs',
      'ValidationService.gs',
      'VettingResponseRepository.gs',
      'VettingService.gs',
    ];

    for (const filename of serverFiles) {
      const source = await readFile(new URL(`gas/${filename}`, root), 'utf8');
      expect(() => new Function(source), filename).not.toThrow();
    }

    const clientHtml = await readFile(
      new URL('gas/JavaScript.html', root),
      'utf8',
    );
    const clientSource = clientHtml
      .replace(/^<script>\s*/, '')
      .replace(/\s*<\/script>\s*$/, '');
    expect(() => new Function(clientSource)).not.toThrow();
  });

  it('preserves identity, locking, routing, and product-name invariants', async () => {
    const code = await readFile(new URL('gas/Code.gs', root), 'utf8');
    const auth = await readFile(new URL('gas/AuthService.gs', root), 'utf8');
    const idempotency = await readFile(
      new URL('gas/IdempotencyService.gs', root),
      'utf8',
    );
    const routing = await readFile(
      new URL('gas/RoutingService.gs', root),
      'utf8',
    );
    const html = await readFile(new URL('gas/Index.html', root), 'utf8');

    expect(code).toContain("setTitle('ChatCST Content Routing')");
    expect(html).toContain('ChatCST Content Routing');
    expect(html).toContain("include('Logo')");
    expect(auth).toContain('Session.getActiveUser().getEmail()');
    expect(idempotency).toContain('LockService.getScriptLock()');
    expect(routing).not.toContain('getFolderByName');
    expect(html).not.toContain('Preview as');
    expect(code).toContain('function deleteSubmission(submissionId)');
    const forbiddenRuntimeModes = [
      ['sam', 'ple'].join(''),
      ['develop', 'ment'].join(''),
    ];
    forbiddenRuntimeModes.forEach((mode) =>
      expect(`${code}\n${html}`.toLowerCase()).not.toContain(mode),
    );
  });

  it('keeps production configuration and response boundaries fail-closed', async () => {
    const setup = await readFile(new URL('gas/SetupService.gs', root), 'utf8');
    const config = await readFile(
      new URL('gas/ConfigService.gs', root),
      'utf8',
    );
    const summary = await readFile(
      new URL('gas/DataSummaryRepository.gs', root),
      'utf8',
    );
    const submissions = await readFile(
      new URL('gas/SubmissionService.gs', root),
      'utf8',
    );
    const acl = await readFile(
      new URL('gas/AccessControlService.gs', root),
      'utf8',
    );
    const drive = await readFile(
      new URL('gas/DriveRepository.gs', root),
      'utf8',
    );

    expect(setup).toContain('MetadataFields');
    expect(config).toContain("readTable('MetadataFields')");
    expect(summary).toContain('ConfigService.metadataFields()');
    expect(submissions).toContain('file_token:r.submission_file_id');
    expect(submissions).toContain('delete visibleRecord.target_sheet_id');
    expect(submissions).toContain('delete visibleRecord.target_folder_id');
    expect(acl).toContain('Session.getEffectiveUser().getEmail()');
    expect(acl).toContain("['ADMIN','CONTENT_MANAGER']");
    expect(submissions).toContain("processing_status='DELETED'");
    expect(submissions).toContain("'SUBMISSION_DELETED'");
    expect(drive).toContain('setTrashed(true)');
    expect(drive).toContain("'FILE_TRASHED'");
  });

  it('keeps the React and Apps Script surfaces on the same UI contract', async () => {
    const reactShell = await readFile(
      new URL('app/components/AppShell.tsx', root),
      'utf8',
    );
    const reactIntake = await readFile(
      new URL('app/components/IntakePage.tsx', root),
      'utf8',
    );
    const reactStepper = await readFile(
      new URL('app/components/StepIndicator.tsx', root),
      'utf8',
    );
    const reactStyles = await readFile(new URL('app/styles.css', root), 'utf8');
    const gasIndex = await readFile(new URL('gas/Index.html', root), 'utf8');
    const gasClient = await readFile(
      new URL('gas/JavaScript.html', root),
      'utf8',
    );
    const gasStyles = await readFile(
      new URL('gas/Stylesheet.html', root),
      'utf8',
    );

    const sharedClasses = [
      'topbar',
      'appLayout',
      'appNav',
      'appNavItem',
      'contentShell',
      'pageTitle',
      'stepper',
      'card',
      'actions',
    ];
    sharedClasses.forEach((className) => {
      expect(`${reactShell}\n${reactIntake}\n${reactStepper}`).toContain(
        className,
      );
      expect(`${gasIndex}\n${gasClient}`).toContain(className);
      expect(reactStyles).toContain(`.${className}`);
      expect(gasStyles).toContain(`.${className}`);
    });

    const sharedCopy = [
      'Content Intake &',
      'Route Content to ChatCST',
      'Submission Context',
      'Document Metadata',
      'Vetting Questions',
      'Supporting Attachments',
      'Review and Submit',
    ];
    sharedCopy.forEach((text) => {
      expect(`${reactShell}\n${reactIntake}`).toContain(text);
      expect(`${gasIndex}\n${gasClient}`).toContain(text);
    });

    expect(reactStyles).toContain('--brand: #a43b31');
    expect(gasStyles).toContain('--brand: #a43b31');
    expect(gasIndex).not.toContain('aclSyncButton');
    expect(gasClient).not.toContain('JSON.stringify(await run');
    expect(gasClient).toContain('formatConditions(route.conditions)');
    expect(gasClient).not.toContain('esc(route.conditions)');
  });
});
