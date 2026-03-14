import { RecordingPlaybackSkeleton } from '@components/terminal/pages/recording-playback-skeleton';
import { renderWithProviders } from '@lib/test-wrappers.utils';

describe('RecordingPlaybackSkeleton', () => {
  it('should render skeleton elements', () => {
    const { container } = renderWithProviders(<RecordingPlaybackSkeleton />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should render multiple skeleton placeholders', () => {
    const { container } = renderWithProviders(<RecordingPlaybackSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});
