import { render, screen } from '@testing-library/react';
import { FormCard } from './form-card';

describe('FormCard', () => {
  describe('rendering', () => {
    it('renders title, description and children', () => {
      render(
        <FormCard
          title="Settings"
          description="Update your settings"
        >
          <div>Form content</div>
        </FormCard>,
      );
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Update your settings')).toBeInTheDocument();
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts title prop', () => {
      render(
        <FormCard
          title="My Title"
          description="desc"
        >
          <span>child</span>
        </FormCard>,
      );
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('accepts description prop', () => {
      render(
        <FormCard
          title="Title"
          description="My description"
        >
          <span>child</span>
        </FormCard>,
      );
      expect(screen.getByText('My description')).toBeInTheDocument();
    });
  });
});
