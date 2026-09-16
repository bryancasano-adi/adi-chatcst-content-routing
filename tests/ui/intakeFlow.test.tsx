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
      screen.getByRole('heading', { name: 'Submission context' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('heading', { name: 'Document metadata' }),
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
      screen.getByRole('heading', { name: 'Document metadata' }),
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
      screen.getByRole('heading', { name: 'Supporting attachments' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('heading', { name: 'Review and submit' }),
    ).toBeInTheDocument();
    expect(screen.getByText('FINANCE_FINANCIAL_STATEMENT')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit content' }));

    expect(
      screen.getByRole('heading', { name: 'Submission complete' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Financial Statements')).toBeInTheDocument();
  });
});
