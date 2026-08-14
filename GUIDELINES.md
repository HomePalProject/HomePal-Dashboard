# HomePal Team Development Guidelines

Welcome to the HomePal development team! To maintain consistency across Team 6, please adhere strictly to these guidelines.

## 1. Git Workflow & Branching

- **Never push directly to `main` or `development`.** All work happens in feature branches.
- **Branch Naming:** Format your branches as `<type>/<description>`.
  - Valid types: `feat`, `fix`, `chore`, `refactor`, `docs`.
  - Example: `feat/meal-planner-ui`
- **Pull Requests:** Must target `development`. Must pass CI checks. Must have 1+ approvals.

## 2. Commit Standards

- We strictly use **Conventional Commits**.
- Format: `<type>(<scope>): <description>`
  - `feat(auth): add login form`
  - `fix(pantry): sort items by expiration date`
  - `chore(deps): update react-query`
- **Automated Enforcement:** Our repository uses `Husky` and `commitlint`. If your commit message format is invalid, the commit will be rejected locally.

## 3. Project Folder Structure

To keep the dashboard organized, all team members must place their files into the following architecture inside the `src/` directory:

```text
src/
├── assets/             # Images, SVGs, and static files
├── components/         # Reusable UI components (Buttons, Cards, Inputs)
├── features/           # Feature-specific logic (e.g., auth, pantry, meals)
├── hooks/              # Custom React hooks used across multiple components
├── layouts/            # Page layout wrappers (e.g., DashboardLayout)
├── pages/              # Route components (e.g., Home, Analytics)
├── services/           # API calls (.NET Core endpoints) and external services
├── styles/             # Global CSS and Design System Tokens
└── utils/              # Helper functions and formatters
```

## 4. Coding Standards (Web Dashboard)

- **TypeScript First:** `any` types are prohibited. Define strict interfaces for all props and API responses.
- **Component Structure:** Use Functional Components with Hooks. Break complex components down using progressive disclosure (keep UI clean, extract logic to hooks).
- **Styling:** Do NOT hardcode colors, spacing, or fonts. ALWAYS use the CSS variables defined in `src/styles/tokens.css` (e.g., `var(--color-primary)`).
- **Formatting:** `lint-staged` is configured. Every time you commit, Prettier and ESLint will format and check your staged files automatically.

## 5. UI/UX Principles

- Review `DESIGN.md` for our AI-First design rules.
- Mobile First: Design for 390px (iPhone 14) first.
- Ensure all touch targets are at least 44x44px.
- Use progressive disclosure: hide advanced options until requested.

## 6. Workflow Automation (For AI Assistants)

- When generating new features, AI assistants must follow the steps defined in the `implementation_plan.md` style.
- Always check `DECISIONS.md` before suggesting a new library.
