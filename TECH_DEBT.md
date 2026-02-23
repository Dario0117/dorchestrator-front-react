# Tech Debt items

## UI Enhancements

- [ ] Update to shadcn v2 (remove radix if possible and move it to base-ui)
- [ ] On ResetPasswordPage, add a toast to show the user that the password has been reset and they need to check their email (a message is coming from the backend, we can use that one).
- [ ] When doing blur on a form it marks everything as error, let's only do it when we interact with the form
- [ ] Abstract the pagination logic, we are duplicating it in some components
- [ ] Adding a new device, when copying the command it changes the status of the token and not the command
- [ ] Add the device id and user id on the command card

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
