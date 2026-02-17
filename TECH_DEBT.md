# Tech Debt items

## Auth

- [ ] CSRF?
- [ ] Add email verification (better auth probably)
- [ ] On ResetPasswordPage, add a toast to show the user that the password has been reset and they need to check their email (a message is coming from the backend, we can use that one).

## CI

- [ ] Update CI to use bun instead of pnpm
- [ ] Implement git hooks for formatting (no linting, no ts checking, no tests)
- [ ] Limit the type of code on the routes, it must be just the boilerplate pointing to the .page.tsx, no other code should live there since we are ignoring this files from the coverage
- [ ] Add a CI step to check for warnings or errors when running tests

## Misc

- [ ] Add claude code commands for common actions (test, fix-ts, add new endpoint, etc)
- [ ] Update to shadcn v2 (remove radix if possible and move it to base-ui)
- [ ] Implement branded IDs
- [ ] Correctly handle dates and change them to the local timezone, the expected date coming from the API is in UTC, we need to convert it to the local timezone
- [ ] Add scripts to look for: missing tested files, missing storybook stories, unreachable components/functions, read untested files (from test coverage)
- [ ] Fix react debug
- [ ] Read settings local and update claude settings json
- [ ] Fix vitest on vs code extension, test setup is not being called and some tests fail on vs code but not on terminal (src/components/org/forms/update-password.form.test.tsx)
- [ ] Configure mise and add parallel on dev https://mise.jdx.dev/tasks/running-tasks.html
- [ ] Do this: https://www.aihero.dev/a-complete-guide-to-agents-md
- [ ] Create scripts for claude code to do thinks (/fix-test-coverage, /update-storybook-stories /fix-ts-issues /fix-biome-issues, /create-missing-queries-and-mutations)
- [ ] When doing blur on a form it marks everything as error, let's only do it when we interact with the form

## Organizations

- [ ] Show org and teams in sidebar
- [ ] Add an option to create an org and a team in the sidebar
- [ ] Default current organization must be marked somehow on the data layer, that way we don't use the first organization in the list as the default - Use the metadata of the organization to mark it as default
- [ ] Properly name the organization sidebar objects, they are called teams, we will have support for teams in the future so we need to make a clear distinction between teams and orgs
- [ ] Implement the new organization list/create endpoints and remove the direct usage of better-auth sdk

## Missing features on the frontend

- [ ] Audit logging dashboard
