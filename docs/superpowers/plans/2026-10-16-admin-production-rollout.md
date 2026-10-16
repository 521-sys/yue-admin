# Admin Production Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing admin v1 release at `https://gnep.online/admin/` on the current production server without losing existing application, database, audio, or ASR state.

**Architecture:** Add an explicit `/admin/` Vite base and keep the admin API on same-origin `/api`. Deploy in dependency order—database, backend, admin, then user web—using staged artifacts, a single timestamped backup, health gates, and rollback before proceeding past any failed gate.

**Tech Stack:** React 19, Vite 8, Vitest 4, Spring Boot 3.2/Java 21, MySQL 8, Nginx, systemd, PowerShell, POSIX shell

**Spec:** `docs/superpowers/specs/2026-10-16-admin-production-rollout-design.md`

## Global Constraints

- Reuse `https://gnep.online`; the admin entry is exactly `https://gnep.online/admin/` and APIs remain under `https://gnep.online/api`.
- Do not create a server, domain, DNS record, or IP allowlist.
- Do not print, copy into source, or commit database credentials, JWT secrets, admin password hashes, WeChat secrets, or Tencent Cloud secrets.
- Preserve all unrelated uncommitted files in `yue-frontend`, including the voice changes and `dist.tgz`.
- Production Hibernate mode remains `validate`; schema changes run only through the explicit SQL migration.
- The database and `ADMIN_AUDIO_DIR` are one restore unit. Never restore or delete only one side.
- Do not publish a new WeChat production version in this rollout.

## Review Focus

- A direct request to `/admin/` and a refresh with a hash route must load admin assets from `/admin/assets/`, never the user site's `/assets/`.
- Same-origin admin requests must resolve to `/api/admin/**`, while uploaded media paths resolve to `/audio/uploads/**` without duplicating `/api`.
- Re-running migration and seed scripts must not overwrite edited or unpublished operational content.
- A failed backend health check or `nginx -t` must stop the rollout and restore the timestamped application/config backup.
- Existing `/`, `/api/dubbing/**`, static `/audio/**`, ASR budget configuration, and user data must still work after the new routes are loaded.

---

### Task 1: Make the Admin Bundle Safe Under `/admin/`

**Files:**
- Create: `vite.config.ts`
- Create: `src/__tests__/deployment-config.test.ts`
- Modify: `src/api.ts`
- Test: `src/__tests__/deployment-config.test.ts`
- Test: `src/__tests__/api.test.ts`

**Interfaces:**
- Consumes: browser origin `https://gnep.online`, Vite `base`, optional `VITE_API_BASE`.
- Produces: Vite configuration with `base: '/admin/'`; API default `'/api'`; `mediaUrl(path?: string): string` resolving `/audio/**` against the site origin.

- [ ] **Step 1: Write failing deployment tests**

Add assertions that the Vite config base is `/admin/`, the default API base is `/api`, `request('/admin/users')` calls `/api/admin/users`, and `mediaUrl('/audio/uploads/demo')` resolves to the current origin without `/api/audio`.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npm test -- --run src/__tests__/deployment-config.test.ts src/__tests__/api.test.ts`

Expected: FAIL because `vite.config.ts` is absent and the API default is still `http://localhost:8080/api`.

- [ ] **Step 3: Implement the deployment configuration**

Create `vite.config.ts` with `defineConfig`, `@vitejs/plugin-react`, and `base: '/admin/'`. Change only the default in `src/api.ts` to `/api`; keep explicit `VITE_API_BASE` support. Resolve media paths against `location.origin`, not the `/api` URL pathname.

- [ ] **Step 4: Verify tests and production output**

Run: `npm test`

Run: `npm run build`

Run: `Select-String -Path dist/index.html -Pattern '/admin/assets/'`

Expected: all tests pass, build exits 0, and `dist/index.html` references `/admin/assets/`.

- [ ] **Step 5: Commit the admin subpath change**

```bash
git add vite.config.ts src/api.ts src/__tests__/deployment-config.test.ts src/__tests__/api.test.ts
git commit -m "fix: serve admin console under admin path"
```

### Task 2: Make the Production Runbook Exact

**Files:**
- Modify: `../yue-backend/docs/admin-v1-setup.md`
- Modify: `README.md`
- Test: documentation commands and path scan

**Interfaces:**
- Consumes: `/var/www/yue-admin`, `/opt/yue/admin-audio`, `/etc/nginx/sites-available/yue`, `/opt/yue/backend.env`.
- Produces: one authoritative route/config checklist and rollback procedure for this release.

- [ ] **Step 1: Add concrete production paths and Nginx requirements**

Document the `/admin/` static root and SPA fallback, exact-match/proxy handling for `/audio/uploads/`, 21 MiB admin upload allowance, same-origin `/api`, required environment variable names, and dependency order. Do not include secret values.

- [ ] **Step 2: Add preflight and rollback gates**

Document read-only service/config checks, a timestamped backup containing database dump, JAR, Nginx config, user web, admin web, `backend.env`, and `ADMIN_AUDIO_DIR`, plus the rule that failure stops the next stage.

- [ ] **Step 3: Verify documentation consistency**

Run from the workspace root:

`rg -n "gnep\.online/admin/|/var/www/yue-admin|/opt/yue/admin-audio|21 MiB|SPRING_JPA_HIBERNATE_DDL_AUTO=validate" yue-admin/README.md yue-backend/docs/admin-v1-setup.md`

Expected: every fixed production value is present and no instruction suggests a new server/domain or automatic schema update.

- [ ] **Step 4: Commit in each affected repository**

Commit the admin README as its own documentation change. Commit the backend runbook separately:

```bash
git add README.md
git commit -m "docs: document production admin entry"

# Run from yue-backend
git add docs/admin-v1-setup.md
git commit -m "docs: define admin production rollout steps"
```

### Task 3: Rebuild and Verify All Release Candidates

**Files:**
- Read: all four repository worktrees and Git metadata
- Create locally, do not commit: backend JAR, admin `dist/`, user web `dist/`, checksum manifest, release archives

**Interfaces:**
- Consumes: exact checked-out commits after Tasks 1–2.
- Produces: verified immutable artifacts plus SHA-256 manifest for the production stage directory.

- [ ] **Step 1: Record repository state without changing it**

For each repository run `git status --short --branch`, `git rev-parse HEAD`, and `git remote -v`. Confirm only the known unrelated `yue-frontend` files remain uncommitted.

- [ ] **Step 2: Verify and package the backend**

Run from `yue-backend`: `mvn test` and `mvn package -DskipTests`.

Expected: all enabled tests pass and `target/yue-backend-1.0.0.jar` exists.

- [ ] **Step 3: Verify and build the admin**

Run from `yue-admin`: `npm test` and `npm run build`.

Expected: tests pass; `dist/index.html` references `/admin/assets/`.

- [ ] **Step 4: Verify and build the user web without altering unrelated work**

Run from `yue-frontend`: `npm test` and `npm run build`.

Expected: tests pass and the build exits 0. Do not stage or remove the pre-existing modified/untracked files.

- [ ] **Step 5: Verify the miniprogram compatibility build**

Run from `yue-miniprogram`: `node --test --test-isolation=none tests/*.test.cjs`, `npm run typecheck`, and `npm run build:weapp`.

Expected: tests, type checking, and build exit 0; no WeChat upload is performed.

- [ ] **Step 6: Create release archives and SHA-256 manifest**

Package the backend JAR, admin `dist/`, user web `dist/`, migration SQL, and seed SQL into a new timestamped local staging directory. Generate SHA-256 values with `Get-FileHash`; record commit IDs in the manifest without including secrets.

### Task 4: Perform Read-Only Production Preflight

**Files:**
- Read remotely: service state, Nginx config, environment variable names, filesystem capacity, Java/MySQL/Nginx versions
- Do not modify production in this task

**Interfaces:**
- Consumes: existing authorized production connection and Task 3 manifest.
- Produces: verified live paths, service names, database name, free-space result, and deployment go/no-go decision.

- [ ] **Step 1: Resolve the existing production connection**

Use the same authorized connection used for the 2026-10-14 `gnep.online` deployment. If it is unavailable, stop and ask the user for access; do not create infrastructure or guess credentials.

- [ ] **Step 2: Inspect services and paths without printing secret values**

Check `systemctl is-active nginx yue-backend mysql`, `nginx -t`, `df -h`, Java version, MySQL version, ownership/mode of `/opt/yue/backend.env`, and whether `/var/www/yue`, `/opt/yue/app.jar`, and `/etc/nginx/sites-available/yue` match the recorded live layout.

- [ ] **Step 3: Check required environment variable names only**

Confirm presence—not values—of database, JWT, WeChat, Tencent ASR, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_AUDIO_DIR`, and `SPRING_JPA_HIBERNATE_DDL_AUTO`. A missing admin password hash or non-`validate` Hibernate mode is a no-go until safely configured.

- [ ] **Step 4: Snapshot existing public behavior**

Record status codes for `/`, one hashed user-web asset, an unauthenticated protected API, `/api/public/scenes`, and the existing dubbing transcription authorization check. Confirm the current ASR budget file exists without reading or printing its content.

### Task 5: Back Up and Migrate Production Data

**Files:**
- Create remotely: one `/opt/yue/release-backup-<timestamp>/` directory
- Modify remotely: production MySQL schema/data through reviewed SQL only

**Interfaces:**
- Consumes: Task 4 live path inventory; `admin-v1-migration.sql`; `admin-v1-seed.sql`.
- Produces: restorable coordinated backup and migrated schema containing five built-in scenes and 28 seeded lines when absent.

- [ ] **Step 1: Stage artifacts and verify hashes**

Transfer Task 3 artifacts to a new non-public server staging directory and verify every SHA-256 value before using any file.

- [ ] **Step 2: Create the coordinated backup**

With content writes paused, back up the MySQL database, `/opt/yue/app.jar`, `/opt/yue/backend.env`, Nginx site config, `/var/www/yue`, existing `/var/www/yue-admin` if present, and the configured `ADMIN_AUDIO_DIR`. Restrict configuration and database dump permissions to root/service access.

- [ ] **Step 3: Validate that the backup is readable**

List archive members, run `gzip -t` where applicable, and confirm the database dump contains schema definitions. Abort before migration if any required backup component is missing or unreadable.

- [ ] **Step 4: Run migration and seed exactly once for the release**

Load `admin-v1-migration.sql`, then `admin-v1-seed.sql`, using credentials sourced inside the privileged server session without echoing them.

- [ ] **Step 5: Verify migration invariants**

Query information schema for all new columns/tables, verify seed codes and line counts, and confirm the migration's diagnostic query returns no unexpected ownerless non-built-in scenes. Re-run both scripts once and verify counts and edited/unpublished content remain unchanged.

### Task 6: Deploy and Gate the New Backend

**Files:**
- Modify remotely: `/opt/yue/app.jar`, `/opt/yue/backend.env`
- Create remotely: configured persistent `ADMIN_AUDIO_DIR`

**Interfaces:**
- Consumes: migrated database and verified backend JAR.
- Produces: healthy backend exposing admin and public-scene APIs while preserving existing APIs.

- [ ] **Step 1: Configure production admin variable names safely**

Set `ADMIN_AUDIO_DIR=/opt/yue/admin-audio`, ensure a non-empty BCrypt `ADMIN_PASSWORD_HASH`, retain the selected `ADMIN_USERNAME`, and enforce `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`. Preserve every unrelated existing environment entry and file mode.

- [ ] **Step 2: Atomically replace the JAR and restart**

Write the verified JAR to a temporary file on the same filesystem, replace `/opt/yue/app.jar`, restart `yue-backend`, and wait for active state.

- [ ] **Step 3: Run the backend gate**

Verify `systemctl is-active yue-backend`, inspect only non-secret recent logs for schema/config errors, confirm `/api/public/scenes` returns the expected published records, and confirm protected admin/dubbing endpoints reject unauthenticated requests with 401.

- [ ] **Step 4: Roll back immediately on failure**

If the service or any gate fails, restore the old JAR and `backend.env`, restart, verify the Task 4 baseline, preserve the new database columns/tables, and stop the rollout for diagnosis.

### Task 7: Deploy Nginx, Admin, and User Web

**Files:**
- Modify remotely: `/etc/nginx/sites-available/yue`
- Replace remotely after backup: `/var/www/yue-admin`, changed files under `/var/www/yue`

**Interfaces:**
- Consumes: healthy Task 6 backend; admin and web archives.
- Produces: public `/admin/` console and updated user web on the same TLS virtual host.

- [ ] **Step 1: Stage static releases outside live roots**

Extract admin and user-web archives into separate timestamped directories. Reject absolute paths, `..` entries, symlinks, or checksum mismatches.

- [ ] **Step 2: Add narrowly scoped Nginx routes**

Add `/admin/` static serving with SPA fallback to `/admin/index.html`, proxy `/audio/uploads/` to the backend before the static `/audio/` rule, and apply 21 MiB only to admin audio upload endpoints. Preserve the existing dubbing upload route and all TLS settings.

- [ ] **Step 3: Validate before loading configuration**

Run `nginx -t` and stop without reloading if it fails. Restore the backed-up Nginx file if validation changed the live config.

- [ ] **Step 4: Switch static files and reload**

Atomically switch/copy the verified admin release to `/var/www/yue-admin`, update only verified user-web files while retaining existing static audio and old hashed assets, then reload Nginx.

- [ ] **Step 5: Run route and asset gates**

Verify HTTPS 200 for `/`, `/admin/`, admin JS/CSS, and `/api/public/scenes`; verify `/admin/` HTML references `/admin/assets/`; verify unauthenticated `/api/admin/users` and dubbing transcription remain 401.

- [ ] **Step 6: Roll back static/config state on failure**

Restore Nginx and both static roots from the Task 5 backup, run `nginx -t`, reload, and verify the Task 4 public baseline before stopping.

### Task 8: Perform Authenticated Production Acceptance

**Files:**
- No source changes
- Create locally: redacted acceptance notes without tokens or passwords

**Interfaces:**
- Consumes: administrator credentials supplied outside source/log output.
- Produces: evidence that the deployed admin workflow and existing user workflows are usable.

- [ ] **Step 1: Test admin authentication and read-only pages**

Open `https://gnep.online/admin/`, sign in, and verify overview, scene list, audio library, user details, and audit log load without browser console or network errors.

- [ ] **Step 2: Test a reversible content workflow**

Create a clearly labeled temporary draft scene, save one line, preview it, publish it, confirm it appears through `/api/public/scenes` and the user web, then unpublish and delete the temporary scene. Confirm the audit entries reflect each action.

- [ ] **Step 3: Test managed audio with a disposable small file**

Upload a small supported WAV/MP3, verify playback and HTTP range response, associate and disassociate it from the temporary content workflow, then delete it and confirm the database/file cleanup succeeds.

- [ ] **Step 4: Verify unaffected production behavior**

Recheck user login, existing official scene playback, and one short existing authenticated dubbing-ASR request only if it does not exceed the established budget policy. Do not run broad or expensive media tests.

### Task 9: Record, Synchronize, and Close the Release

**Files:**
- Modify: `README.md` at workspace root if needed for current entry links
- Modify: `项目现状总结.md`
- Modify: `yue-admin/docs/admin-v1-progress.md`
- Modify: `yue-admin/docs/admin-v1-validation.md`
- Modify: `yue-backend/docs/admin-v1-setup.md`

**Interfaces:**
- Consumes: actual commit IDs, artifact hashes, backup path, migration results, and smoke-test evidence.
- Produces: accurate current-state documentation and synchronized feature branches; no release tag unless separately requested.

- [ ] **Step 1: Update records with observed facts only**

Record the actual deployment date, repository SHAs, test counts/results, server backup path, migration result, production endpoints, known limitations, and whether remote pushes succeeded. Correct the stale admin SHA in `项目现状总结.md`.

- [ ] **Step 2: Run final local verification**

Run `git diff --check` in every modified repository, rerun focused documentation/config tests, and inspect all four `git status --short --branch` outputs. Ensure unrelated frontend changes are still present and uncommitted.

- [ ] **Step 3: Commit documentation in its owning repositories**

Commit only files belonging to this rollout. Do not add root workspace files to a child repository and do not commit generated archives, credentials, audio, database dumps, or server backups.

- [ ] **Step 4: Push the four `feat/admin-v1` branches after verification**

Push each branch independently and verify the remote SHA equals the local SHA. A push failure does not imply production rollback, but must be reported as an incomplete synchronization state.

- [ ] **Step 5: Deliver the release report**

Report the live admin URL, production verification results, backup/rollback location, exact repository synchronization status, preserved unrelated changes, and remaining WeChat-review limitation.
