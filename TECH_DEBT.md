# Tech Debt items

## UI Enhancements

- [ ] If we go to a non-team page and try to go back to the team page, we get a 404 error, should we add this to the store?
- [ ] On ResetPasswordPage, add a toast to show the user that the password has been reset and they need to check their email (a message is coming from the backend, we can use that one).
- [ ] Adding a new device, when copying the command it changes the status of the token and not the command
- [ ] Add the device id and user id on the command card
- [ ] For date filters, prevent users from selecting a "to" date after the "from" date it doesn't make sense to add a range that is negative
- [ ] Right now the download of exports does a fetch to download the file and then add the blob to the DOM. we shouldn't control the download of the file, we should just let the browser handle it.
- [ ] Some buttons don't have the hand cursor, we should add it
- [ ] We might need to integrate the device status to the ws system, maybe also a notification to detect when the device list is updated
- [ ] When we don't know where to redirect to in the frontend in terms of team, we should default to the default on the current organization so we don't have wrong states
- [ ] On src/hooks/use-current-team.ts do the same as src/hooks/use-current-organization.ts, specifically this "// biome-ignore lint/style/noNonNullAssertion:" so we don't have to do it everywhere
- [ ] http://localhost:9000/api/v1/organization/set-active is being called on every request
- [ ] Review each folder and component and see if we can identify new patterns to implement through the whole app
- [ ] Tie the real required fields to the form validation, if a field is required on the schema, it should be required on the form and it should happen automatically, that way we don't show invalid information to the user

## Auth

- [ ] CSRF?
- [ ] Add email verification (better auth probably)

## CI

- [ ] Update CI to use bun instead of pnpm
- [ ] Implement git hooks for formatting (no linting, no ts checking, no tests)
- [ ] Limit the type of code on the routes, it must be just the boilerplate pointing to the .page.tsx, no other code should live there since we are ignoring this files from the coverage
- [ ] Add a CI step to check for warnings or errors when running tests

## Misc

- [ ] Add claude code commands for common actions (test, fix-ts, add new endpoint, etc)
- [ ] Implement branded IDs
- [ ] Correctly handle dates and change them to the local timezone, the expected date coming from the API is in UTC, we need to convert it to the local timezone
- [ ] Add scripts to look for: missing tested files, missing storybook stories, unreachable components/functions, read untested files (from test coverage)
- [ ] Fix react debug
- [ ] Read settings local and update claude settings json
- [ ] Fix vitest on vs code extension, test setup is not being called and some tests fail on vs code but not on terminal (src/components/org/forms/update-password.form.test.tsx)
- [ ] Configure mise and add parallel on dev https://mise.jdx.dev/tasks/running-tasks.html
- [ ] Create scripts for claude code to do thinks (/fix-test-coverage, /update-storybook-stories /fix-ts-issues /fix-biome-issues, /create-missing-queries-and-mutations)
- [ ] Side nav loses track of the selected option, for example on commands if I'm in the index it's highlighted, but if I click on the command it's not highlighted
- [ ] Consider adding this as a check: https://github.com/millionco/react-doctor
- [ ] Consider moving wss connection management to zustand
- [ ] Remove logs from testForAgents
- [ ] Find a different icon for session and command and change it on sidebar-data
- [ ] On the terminal session replay, respect the original size of the terminal (for each chunk) so it doesn't break the layout on different screen sizes, if needed add an horizontal scrollbar
- [ ] Do we really need to use refetchInterval in all of those queries? now that we have a ws system, can't we just send an event/notification to trigger a refetch? or not having it at all? because what's the real reason behind needing to have that data refetched?
- [ ] Fix the date time logic because on the URL we have the full UTC iso string, ideally we should only see the date information, if we need the time, we should add another field for it
- [ ] Each component file must only have one component and one export
- [ ] The skeleton components should be on a separate file besides the component file and end it with .skeleton.tsx
- [ ] Look for big components and split them into smaller ones
