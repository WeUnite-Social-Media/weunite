# Reporting Domain

## Purpose

The reporting system allows users to report posts and opportunities and gives administrators the data needed to review and act on those reports.

## Backend ownership

The API reports module owns:

- the `Report` domain entity
- report DTOs
- report repository queries
- report creation and query services
- report-related API handlers

## Admin relationship

- Regular report submission flows are public reporting concerns.
- Moderation and resolution actions are coordinated through the admin module.

## Current API direction

- Keep existing `/api/reports/...` behavior stable during the monorepo migration.
- Keep reporting payloads and data access centralized in the API.
