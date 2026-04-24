---
permalink: /docs/lowering_lifecycle
title: "Lowering Lifecycle"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

A **lowering** represents a discrete submersible deployment, ROV dive, or mooring
cast that occurs within a cruise.  Lowering support must be enabled in the OpenVDM
configuration before it is available in the web interface.

## Enabling Lowering Components

In the web UI navigate to **Configuration → Main Configuration** and enable
**Show Lowering Components**.  This activates the lowering menu and causes
collection system transfers with **Cruise or Lowering** set to `Lowering` to be
scoped to individual lowering directories.

## Lowering Directory Structure

Each lowering gets its own subdirectory inside the configured lowering base
directory (default: `Vehicle/`):

```
<cruiseID>/
└── Vehicle/
    ├── J0001/
    │   ├── OpenRVDAS/
    │   └── ...
    └── J0002/
        └── ...
```

## 1. Setup New Lowering

**Web UI:** Main → Setup New Lowering

Provide the **Lowering ID** and optional metadata (start time, location, etc.).
OpenVDM will:

1. Create `<cruiseID>/Vehicle/<loweringID>/` and all required lowering
   subdirectories.
2. Initialise the lowering section of the MD5 summary.
3. Export the current lowering configuration.
4. Run any commands configured under `postSetupNewLowering`.

## 2. Active Lowering

During the lowering, collection system transfers scoped to **Lowering** will write
data into `<cruiseID>/Vehicle/<loweringID>/`.  Cruise-scoped transfers continue
writing to the cruise-level directories unaffected.

## 3. Finalize Current Lowering

**Web UI:** Main → Finalize Current Lowering

1. Runs commands under `preFinalizeCurrentLowering`.
2. Updates the MD5 summary for the lowering directory.
3. Applies permissions to the lowering directory.
4. Exports a final lowering configuration snapshot.
5. Runs commands under `postFinalizeCurrentLowering`.

After finalization the lowering is marked complete.  A new lowering can then be set
up for the next dive.

## Lowering ID Conventions

Lowering IDs typically follow vessel-specific conventions:

- `J0001` — Jason dive number
- `AT-039` — Alvin dive number
- `SL0042` — SuBastian dive number

The lowering ID appears in directory names and exported filenames, so use the
official dive number assigned by the vehicle team.
