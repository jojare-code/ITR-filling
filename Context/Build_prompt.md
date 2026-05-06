# Build Prompt — ITR Filing Management Platform

You are building a production-ready web application for a real client. All the information you need is in the context files listed below. Read every file completely before writing any code. The documents are authoritative — do not invent requirements, do not skip details, do not add anything not listed.

---

## Context files and what each one is

**`ITR_Product_Specification_v1.md`**
Defines the core features, user roles (Owner, Staff, Client), data architecture, primary workflows, UI/UX structure, and business rules for the platform.

**`ITR_TechStack_v1.md`**
Outlines the technology stack, system architecture, third-party integrations, non-functional requirements, and deployment specifications.

**`Modules.md`**
Specifies the module breakdown and the strict dependency order in which the application must be built.

**`Predev_document_analysis.md`**
Contains the analysis of the project requirements, highlighting edge cases, missing pieces, and strategic recommendations prior to development.

## How to approach the build

1. Read all 4 files fully before writing a single line of code.
2. Build modules in the dependency order defined in `Modules.md`.
3. For each module, cross-reference `ITR_Product_Specification_v1.md` to ensure every business rule, validation, workflow step, and calculation that touches that module is fully implemented.
4. Apply the design system from `ITR_Product_Specification_v1.md` to every screen that has a UI — use the CSS variables exactly as specified.
5. At the end, generate a `SETUP.md` file that compiles all the `MANUAL SETUP` instructions from every module in `Modules.md` into a single ordered deployment checklist for the client.

Build the complete application. Do not scaffold, do not leave placeholders, do not defer anything listed as MVP.
