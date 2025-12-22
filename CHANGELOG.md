# Changelog

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
