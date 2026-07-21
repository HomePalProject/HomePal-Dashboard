# HomePal Architecture Decisions

This document records the major architectural decisions made for the HomePal project.

## 1. Web Dashboard Framework (2026-07-21)

**Context:** Need a fast, modern framework for the web dashboard.
**Decision:** We will use **React with Vite** and TypeScript.
**Reasoning:** Vite provides significantly faster HMR and build times compared to Create React App. React is standard and fits the proposal. TypeScript ensures strict typing, reducing runtime errors.

## 2. State Management (2026-07-21)

**Context:** Need to manage global state without excessive boilerplate.
**Decision:** We will use **Zustand**.
**Reasoning:** Zustand is minimal, unopinionated, and avoids the heavy boilerplate of Redux while being more performant for frequent updates than the native Context API.

## 3. Data Fetching & API (2026-07-21)

**Context:** Need robust data fetching to interact with the .NET Core backend.
**Decision:** We will use **Axios** paired with **TanStack React Query**.
**Reasoning:** Axios simplifies request configuration (like JWT interceptors), while React Query handles caching, background updates, and loading/error states automatically.

## 4. Styling Approach (2026-07-21)

**Context:** The project requires strict adherence to `DESIGN.md` AI-First workflows.
**Decision:** We will use **Vanilla CSS with CSS Variables (Tokens)**.
**Reasoning:** Explicitly requested to avoid Tailwind CSS unless required, to ensure full control over the specific design tokens provided in the design system.

## 5. Git Workflow & Consistency (2026-07-21)

**Context:** Need to prevent direct pushes and enforce standard commits/branch names across Team 6.
**Decision:** We will enforce **Husky**, **lint-staged**, and **commitlint** as pre-commit and commit-msg hooks.
**Reasoning:** Automates formatting, catches lint errors before they reach remote branches, and enforces conventional commits `type(scope): message` for clean history.
