# Changelog

## [1.2.0] - 2026-01-05

### The Design & E-commerce Update 🎨🛒

#### Added

- **Global Theme Switcher**:
  - Curated professional themes (Midnight, Ruby, Forest, etc.) with unified color palettes and typography.
  - "Global Design" shortcut in the sidebar for instant project-wide aesthetic shifts.
- **Multi-page Architecture**:
  - Full support for adding, deleting, and managing multiple pages within a single project.
  - Internal navigation support (linking buttons/links to other builder pages).
- **E-commerce Power-up**:
  - Functional "Add to Cart" actions for any button, integrated with `useCart`.
  - Discount pricing display support (`price` vs `originalPrice`).
  - Size and Quantity selectors for product detail views.
- **UX Refinements**:
  - Sidebar "Global Design" shortcut for better visibility.
  - Real-time image URL previews in the sidebar.
  - Enhanced field access for deeply nested product and section data.

#### Improved

- **State Management**: Optimized Pinia store for better multi-page reactivity and history sync.
- **Preview Stability**: Replaced fragile alias imports with stable relative paths for core design tokens.
- **API Architecture**: Centralized backend endpoints, significantly reducing code duplication and improving security.

#### Fixed

- **Sidebar Visibility**: Resolved an issue where "Site Settings" was hidden during active section editing.
- **Deep Nesting Updates**: Fixed a bug in `updateField` that prevented correct updates to deeply nested object properties.
- **Cart Calculations**: Ensured discount prices are correctly used in cart totals and quantity updates.

## [Unreleased]

### Added

- **New Templates**:
  - **Portfolio**: Added support for creative and minimalist portfolio sites (Hero -> Features/Projects -> Testimonials -> CTA).
  - **SaaS**: Added specialized structure for B2B and AI startups (Hero -> Stats -> Features -> Pricing -> FAQ).
- **UI Polish**:
  - **Color-Coded Tags**: Implemented distinct colors for each template type (Landing=Indigo, SaaS=Violet, etc.) in both the Explore Gallery and Sidebar.
  - **Sidebar Redesign**: Restyled the "Project Brief" input to match the Explore Cards for better visual consistency.
  - **High Contrast Inputs**: Improved accessibility by increasing label contrast in Dark Mode.
- **UX Improvements**:
  - **Confirmation Modals**: Replaced native browser alerts with custom `ConfirmModal` for Save/Publish actions.
  - **Smart Defaults**: Sidebar now correctly inherits template and brief from the selected example.

### Fixed

- **Template Selection Bug**: Fixed an issue where selecting a template from the "Explore" page didn't correctly propagate to the Builder due to missing query parameter handling.
- **Input Styling**: Fixed duplicate disabled attributes and contrast issues in `BaseInput`, `BaseSelect`, and `BaseTextarea`.
