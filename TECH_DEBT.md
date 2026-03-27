# Tech Debt items

## Needs backend

- [ ] Add the device id and user id on the command card

## UI Enhancements


## Architecture & Patterns


## Real-time & Data Fetching

- [ ] We might need to integrate the device status to the ws system, maybe also a notification to detect when the device list is updated
- [ ] Do we really need to use refetchInterval in all of those queries? now that we have a ws system, can't we just send an event/notification to trigger a refetch? or not having it at all? because what's the real reason behind needing to have that data refetched?

## Tooling

- [ ] Add claude code commands for common actions (test, fix-ts, add new endpoint, etc)
- [ ] Create scripts for claude code to do things (/fix-test-coverage, /update-storybook-stories /fix-ts-issues /fix-biome-issues, /create-missing-queries-and-mutations)
- [ ] Add scripts to look for: missing tested files, unreachable components/functions, read untested files (from test coverage)
- [ ] Fix vitest on vs code extension, test setup is not being called and some tests fail on vs code but not on terminal (src/components/org/forms/update-password.form.test.tsx)
- [ ] Configure mise and add parallel on dev https://mise.jdx.dev/tasks/running-tasks.html
- [ ] Consider adding this as a check: https://github.com/millionco/react-doctor
