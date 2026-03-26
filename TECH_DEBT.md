# Tech Debt items

## Needs backend

- [ ] Add the device id and user id on the command card

## UI Enhancements

- [ ] For date filters, prevent users from selecting a "to" date after the "from" date it doesn't make sense to add a range that is negative
- [ ] Correctly handle dates and change them to the local timezone, the expected date coming from the API is in UTC, we need to convert it to the local timezone
- [ ] Fix the date time logic because on the URL we have the full UTC iso string, ideally we should only see the date information, if we need the time, we should add another field for it
- [ ] Side nav loses track of the selected option, for example on commands if I'm in the index it's highlighted, but if I click on the command it's not highlighted
- [ ] On the terminal session replay, respect the original size of the terminal (for each chunk) so it doesn't break the layout on different screen sizes, if needed add an horizontal scrollbar

## Architecture & Patterns

- [ ] Tie the real required fields to the form validation, if a field is required on the schema, it should be required on the form and it should happen automatically, that way we don't show invalid information to the user
- [ ] Review each folder and component and see if we can identify new patterns to implement through the whole app
- [ ] Each component file must only have one component and one export
- [ ] The skeleton components should be on a separate file besides the component file and end it with .skeleton.tsx (some components still have inline Skeleton usage: device-config-dialog, shared-session.page, create-terminal-session-dialog, stat-cards)
- [ ] Look for big components and split them into smaller ones (organization-settings.page.tsx ~597 lines, session-history-export-dialog.tsx ~398 lines)
- [ ] Implement branded IDs
- [ ] Consider moving wss connection management to zustand

## Real-time & Data Fetching

- [ ] We might need to integrate the device status to the ws system, maybe also a notification to detect when the device list is updated
- [ ] Do we really need to use refetchInterval in all of those queries? now that we have a ws system, can't we just send an event/notification to trigger a refetch? or not having it at all? because what's the real reason behind needing to have that data refetched?

## Auth

- [ ] CSRF?
- [ ] Add email verification (better auth probably)

## Tooling

- [ ] Add claude code commands for common actions (test, fix-ts, add new endpoint, etc)
- [ ] Create scripts for claude code to do things (/fix-test-coverage, /update-storybook-stories /fix-ts-issues /fix-biome-issues, /create-missing-queries-and-mutations)
- [ ] Add scripts to look for: missing tested files, missing storybook stories, unreachable components/functions, read untested files (from test coverage)
- [ ] Fix vitest on vs code extension, test setup is not being called and some tests fail on vs code but not on terminal (src/components/org/forms/update-password.form.test.tsx)
- [ ] Configure mise and add parallel on dev https://mise.jdx.dev/tasks/running-tasks.html
- [ ] Consider adding this as a check: https://github.com/millionco/react-doctor
