// RecordingPlaybackPage renders recording metadata and delegates to:
// - RecordingContent (tested in recording-content.test.tsx)
// - StorageTierBadge (tested in storage-tier-badge.test.tsx)
// The page fetches data via useGetRecordingSuspenseQuery and shows
// an empty state when recording is null. Re-evaluate if this page
// gains logic beyond data fetching and delegation.

describe('RecordingPlaybackPage', () => {
  it.todo('re-evaluate when page gains logic beyond delegation');
});
