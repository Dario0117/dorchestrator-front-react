# Storybook

- Used for component documentation and visual development only — never for testing
- Story files: `[component].stories.tsx` co-located with the component
- Configuration in `.storybook/` with addons: docs, a11y, themes

## Exempt Components (no stories required)

Stories are not required for:
- All `*.page.tsx` files — page-level components that compose other components
- Layout wrappers that only compose children (e.g., authenticated layout, sidebar shells)
- Form system internals — field primitives and action buttons used only inside the form system (`/forms/components/`)
