// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { AdminPage } from '../../app/components/AdminPage';

afterEach(cleanup);

describe('Admin Console', () => {
  it('renders read-only visual views instead of JSON output', async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    expect(
      screen.getByRole('heading', { name: 'Admin Console' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Governed Configuration' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^\{/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Health' }));
    expect(
      screen.getByRole('heading', { name: 'Environment Health' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Audit Log' }));
    expect(
      screen.getByRole('heading', { name: 'Recent Audit Activity' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'ACL Preview' }));
    expect(
      screen.getByRole('heading', { name: 'ACL Change Preview' }),
    ).toBeInTheDocument();
  });
});
