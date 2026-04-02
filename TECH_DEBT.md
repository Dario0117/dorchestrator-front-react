# Tech Debt items

- [ ] The coverage command takes a long time to run, we might need to find a way to speed it up
- [ ] We need to reduce the bundle size, we may need to lazy load some components

## Needs backend

- [ ] Add the device id and user id on the command card

## UI Enhancements

- [ ] When we get a form error, we can't submit, to enable submitting we need to make a change to the form, let's fix that
- [ ] Add the experience for the users submitting a different/custom sandbox config and the ability for admins to see and approve/reject the request
- [ ] Decide how sandbox approval notifications should navigate — currently a no-op in `notification-panel.tsx`. Should navigate to the session list, command detail, or approval detail depending on the approval's `requestType` (command vs terminal)

## Architecture & Patterns


## Real-time & Data Fetching

- [ ] Do we really need to use refetchInterval in all of those queries? now that we have a ws system, can't we just send an event/notification to trigger a refetch? or not having it at all? because what's the real reason behind needing to have that data refetched?

## Tooling

- [ ] Add claude code commands for common actions (test, fix-ts, add new endpoint, etc)
- [ ] Create scripts for claude code to do things (/fix-test-coverage, /update-storybook-stories /fix-ts-issues /fix-biome-issues, /create-missing-queries-and-mutations)
- [ ] Add scripts to look for: missing tested files, unreachable components/functions, read untested files (from test coverage)
- [ ] Fix vitest on vs code extension, test setup is not being called and some tests fail on vs code but not on terminal (src/components/org/forms/update-password.form.test.tsx)
- [ ] Configure mise and add parallel on dev https://mise.jdx.dev/tasks/running-tasks.html
- [ ] Consider adding this as a check: https://github.com/millionco/react-doctor
