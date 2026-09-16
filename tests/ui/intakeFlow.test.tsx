// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../../app/App';

afterEach(cleanup);

describe('ChatCST Content Routing intake flow', () => {
  it('advances from Context when Continue is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('ChatCST Content Routing')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Submission Context' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('heading', { name: 'Document Metadata' }),
    ).toBeInTheDocument();
  });

  it('shows visible step-specific validation instead of appearing inert', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Complete the required metadata before continuing.',
    );
    expect(screen.getByText('Document title is required.')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Document Metadata' }),
    ).toBeInTheDocument();
  });

  it('completes the full submission workflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.type(
      screen.getByLabelText('Document title *'),
      'Month-end close',
    );
    await user.type(
      screen.getByLabelText('Description *'),
      'Finance content for governed routing',
    );
    await user.type(screen.getByLabelText('Document date *'), '2026-09-16');
    await user.selectOptions(
      screen.getByLabelText('Business unit *'),
      'Finance',
    );
    await user.type(
      screen.getByLabelText('Process name *'),
      'Record to Report',
    );
    await user.type(screen.getByLabelText('Document owner *'), 'Finance Owner');
    await user.type(screen.getByLabelText('Source system *'), 'Finance ERP');
    await user.selectOptions(
      screen.getByLabelText('Confidentiality *'),
      'Internal',
    );
    await user.type(screen.getByLabelText('Effective date *'), '2026-09-16');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.selectOptions(
      screen.getByLabelText(
        '1. What business process does this document support? *',
      ),
      'Record to Report',
    );
    await user.selectOptions(
      screen.getByLabelText('2. What type of document is this? *'),
      'Financial Statement',
    );
    await user.selectOptions(
      screen.getByLabelText('3. Which business function owns the content? *'),
      'Finance',
    );
    await user.selectOptions(
      screen.getByLabelText('4. What is the confidentiality classification? *'),
      'Internal',
    );
    await user.selectOptions(
      screen.getByLabelText('5. Is this a new document or a correction? *'),
      'New',
    );
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('heading', { name: 'Supporting Attachments' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('heading', { name: 'Review and Submit' }),
    ).toBeInTheDocument();
    expect(screen.getByText('FINANCE_FINANCIAL_STATEMENT')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit Content' }));

    expect(
      screen.getByRole('heading', { name: 'Submission Complete' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Financial Statements')).toBeInTheDocument();
  });

  it('turns an unmatched route into a clear recoverable experience', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(
      screen.getByLabelText('Document title *'),
      'Unmatched content',
    );
    await user.type(
      screen.getByLabelText('Description *'),
      'Content without an approved destination',
    );
    await user.type(screen.getByLabelText('Document date *'), '2026-09-16');
    await user.selectOptions(screen.getByLabelText('Business unit *'), 'HR');
    await user.type(screen.getByLabelText('Process name *'), 'HR Operations');
    await user.type(screen.getByLabelText('Document owner *'), 'HR Owner');
    await user.type(screen.getByLabelText('Source system *'), 'HRIS');
    await user.selectOptions(
      screen.getByLabelText('Confidentiality *'),
      'Internal',
    );
    await user.type(screen.getByLabelText('Effective date *'), '2026-09-16');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.selectOptions(
      screen.getByLabelText(
        '1. What business process does this document support? *',
      ),
      'Hire to Retire',
    );
    await user.selectOptions(
      screen.getByLabelText('2. What type of document is this? *'),
      'Output',
    );
    await user.selectOptions(
      screen.getByLabelText('3. Which business function owns the content? *'),
      'HR',
    );
    await user.selectOptions(
      screen.getByLabelText('4. What is the confidentiality classification? *'),
      'Internal',
    );
    await user.selectOptions(
      screen.getByLabelText('5. Is this a new document or a correction? *'),
      'New',
    );
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Submit Content' }));

    expect(
      screen.getByRole('heading', { name: 'Submission Needs Attention' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No approved destination matches this submission. It has been held for review.',
    );
    expect(screen.queryByText(/"code":/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Update Answers' }));
    expect(
      screen.getByRole('heading', { name: 'Vetting Questions' }),
    ).toBeInTheDocument();
  });
});
