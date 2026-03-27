import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { SubscriptionCard } from './subscription-card';

describe('SubscriptionCard', () => {
  it('renders card title', () => {
    renderWithProviders(<SubscriptionCard />);
    expect(screen.getByText('Subscription & Billing')).toBeInTheDocument();
  });

  it('displays tier when provided', () => {
    renderWithProviders(<SubscriptionCard tier="Pro" />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('displays Free Tier when tier is null', () => {
    renderWithProviders(<SubscriptionCard tier={null} />);
    expect(screen.getByText('Free Tier')).toBeInTheDocument();
  });

  it('displays device limit when provided', () => {
    renderWithProviders(<SubscriptionCard deviceLimit={50} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('displays Unlimited when device limit is null', () => {
    renderWithProviders(<SubscriptionCard deviceLimit={null} />);
    expect(screen.getByText('Unlimited')).toBeInTheDocument();
  });

  it('displays info alert about future billing', () => {
    renderWithProviders(<SubscriptionCard />);
    expect(
      screen.getByText(/Billing tiers and device limits will be enforced/),
    ).toBeInTheDocument();
  });
});
