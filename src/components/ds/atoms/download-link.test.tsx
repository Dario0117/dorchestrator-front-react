import { DownloadLink } from '@components/ds/atoms/download-link';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('DownloadLink', () => {
  it('renders link with href', () => {
    renderWithProviders(
      <DownloadLink
        href="/files/report.csv"
        download="report.csv"
      >
        Download Report
      </DownloadLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/files/report.csv');
    expect(link).toHaveAttribute('download', 'report.csv');
  });

  it('renders link text', () => {
    renderWithProviders(
      <DownloadLink
        href="/file.txt"
        download="file.txt"
      >
        Get file
      </DownloadLink>,
    );
    expect(screen.getByText('Get file')).toBeInTheDocument();
  });
});
