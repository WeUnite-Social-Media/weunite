# Docs Agent Notes

## Scope

This folder owns stable repository documentation that should stay tracked in Git.

## Responsibilities

- Keep architecture notes, runbooks, and durable team-facing docs.
- Document stable boundaries, workflows, and operational guidance.

## Does not own

- Temporary plans, progress logs, or session notes.
- App implementation code or infrastructure manifests.

## Key entrypoints

- `architecture/`
- `domains/`

## Working rules

- Keep docs durable and repo-relevant; move throwaway notes to `tmp/`.
- Keep commands and file paths cross-platform and contributor-safe.
- Update docs when ownership, workflows, or invariants change in a lasting way.

## Validation

- Manually verify referenced paths and commands still exist.

## Keep this file updated when

- Documentation sections are added, removed, or repurposed.
- Stable doc ownership or structure changes.
