# Tech Debt items

- [ ] CSRF?
- [ ] Add email verification
- [ ] On ResetPasswordPage, add a toast to show the user that the password has been reset and they need to check their email (a message is coming from the backend, we can use that one).
- [ ] Update CI to use bun instead of pnpm
- [ ] Add claude code commands for common actions (test, fix-ts, add new endpoint, etc)
- [ ] Update to shadcn v2
- [ ] Implement git hooks for formatting (no linting, no ts checking, no tests)
- [ ] Regenerate the claude.md file
- [ ] Remove the requirement for tests during development, combine this with a command/subagent to create tests to speed up development and only write tests when the code is reviewed and manually tested
- [ ] Show org and teams in sidebar
- [ ] Add an option to create an org and a team in the sidebar
- [ ] Implement structured logging and open telemetry
- [ ] Implement branded IDs
- [ ] Default current organization must be marked somehow on the data layer, that way we don't use the first organization in the list as the default - Use the metadata of the organization to mark it as default
- [ ] Correctly handle dates and change them to the local timezone, the expected date coming from the API is in UTC, we need to convert it to the local timezone
- [ ] Move to bun tests from vitest
