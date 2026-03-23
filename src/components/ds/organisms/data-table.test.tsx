import { DataTable } from '@components/ds/organisms/data-table';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('DataTable', () => {
  it('should render children inside a table', () => {
    renderWithProviders(
      <DataTable>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Test</td>
          </tr>
        </tbody>
      </DataTable>,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render within a bordered container', () => {
    const { container } = renderWithProviders(
      <DataTable>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </DataTable>,
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector('table')).toBeInTheDocument();
  });
});
