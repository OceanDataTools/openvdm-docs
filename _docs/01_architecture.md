---
permalink: /docs/architecture
title: "Architecture"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM is a three-tier distributed system.

## Tier 1 — Web Frontend

**Location:** `www/`

The web frontend is a PHP/JavaScript application built on a lightweight custom MVC
framework.  It provides:

- A **REST API** (`www/app/Controllers/Api/`) consumed by the Gearman workers and
  external scripts.
- An **admin UI** (`www/app/Controllers/Config/`) for managing collection systems,
  transfers, extra directories, plugins, hooks, and cruise/lowering metadata.
- A **data dashboard** that renders plugin-generated visualisations (charts, maps,
  image previews) for the current cruise or lowering.

JavaScript dependencies (Bootstrap, Chart.js, Leaflet, DataTables, Luxon, jQuery)
are managed via `package.json`, and PHP dependencies via Composer.  The basemaps for all
maps come from one helper, `mapBaseLayers.js`.

## Tier 2 — Python Backend

**Location:** `server/`

The Python backend provides the business logic that the workers execute.  Key
libraries:

| Module | Purpose |
|---|---|
| `server/lib/openvdm.py` | Primary interface to the MySQL database via the PHP REST API |
| `server/lib/connection_utils.py` | Connection tests, SMB and FTP mounts, and rsync/rclone command building for each transfer type |
| `server/lib/transfer_utils.py` | Runs rsync and rclone transfers, collects the new, updated and deleted files, and raises an error when a transfer fails |
| `server/lib/openvdm_plugin.py` | Base classes for custom plugins and quality tests |
| `server/lib/file_utils.py` | Directory creation, file listing, permissions, purging |
| `server/lib/geojson_utils.py` | Build GeoJSON/KML trackline files from dashboard data |

The `server/lib/` modules have Google-style docstrings; API documentation can be built
from them with [pdoc](https://pdoc.dev).

The Python backend **never connects directly to MySQL** — all database reads and
writes go through the PHP REST API.

## Tier 3 — Gearman Workers

**Location:** `server/workers/`

Each worker process registers one or more Gearman task handlers and runs
indefinitely under Supervisor.

| Worker | Gearman Tasks |
|---|---|
| `run_collection_system_transfer.py` | `runCollectionSystemTransfer` |
| `run_cruise_data_transfer.py` | `runCruiseDataTransfer` |
| `run_ship_to_shore_transfer.py` | `runShipToShoreTransfer` |
| `data_dashboard.py` | `updateDataDashboard`, `rebuildDataDashboard` |
| `md5_summary.py` | `updateMD5Summary`, `rebuildMD5Summary` |
| `test_collection_system_transfer.py` | `testCollectionSystemTransfer` |
| `test_cruise_data_transfer.py` | `testCruiseDataTransfer` |
| `cruise.py` | `setupNewCruise`, `finalizeCurrentCruise`, `exportOVDMConfig`, `rsyncPublicDataToCruiseData` |
| `lowering.py` | `setupNewLowering`, `finalizeCurrentLowering`, `exportLoweringConfig` |
| `cruise_directory.py` | `createCruiseDirectory`, `rebuildCruiseDirectory`, `setCruiseDataDirectoryPermissions` |
| `lowering_directory.py` | `createLoweringDirectory`, `rebuildLoweringDirectory`, `setLoweringDataDirectoryPermissions` |
| `post_hooks.py` | `postCollectionSystemTransfer`, `postDataDashboard`, `postSetupNewCruise`, `postSetupNewLowering`, `preFinalizeCurrentCruise`, `postFinalizeCurrentCruise`, `preFinalizeCurrentLowering`, `postFinalizeCurrentLowering` |
| `stop_job.py` | `stopJob` |
| `scheduler.py` | _(periodic, not Gearman-registered)_ |
| `size_cacher.py` | _(periodic, not Gearman-registered)_ |
| `reboot_reset.py` | _(run once on startup)_ |

## Plugins and Parsers

**Location:** `server/plugins/`

Plugins are Python modules with the suffix `_plugin.py` (configurable in
`openvdm.yaml`).  They subclass `OpenVDMPlugin` from
`server/lib/openvdm_plugin.py` and are loaded dynamically by the
`data_dashboard` worker after each collection system transfer.

Parsers (in `server/plugins/parsers/`) handle per-format data extraction and are
imported by plugins.

## Database

OpenVDM uses **MySQL**.  The schema is in `database/openvdm_db.sql`.  Migration
scripts for version upgrades live in `database/`.  The Python backend communicates
with MySQL exclusively through the PHP REST API — no direct DB connections from
Python.

## Process Management

In production, all workers and the scheduler are managed by **Supervisor**.  The
install script writes their configuration; see [Supervisor Setup](/docs/supervisor_setup).

## Component Diagram

```
┌──────────────────────┐        ┌──────────────────────────────┐
│ Browser / Admin UI   │        │ Python workers (Supervisor)  │
└──────────┬───────────┘        └───────┬──────────────┬───────┘
           │ HTTP                       │ REST API     │ Gearman jobs
┌──────────▼────────────────────────────▼───┐   ┌──────▼───────┐
│        Apache / PHP web app               │──▶│   Gearman    │
│   Controllers/Config  Controllers/Api     │   └──────────────┘
└──────────┬────────────────────────────────┘
           │ SQL
┌──────────▼───────────┐        workers ── rsync / SMB / SSH / FTP / rclone ──▶
│    MySQL database    │        collection systems and destinations
└──────────────────────┘
```

The web app submits jobs to Gearman (e.g. when you click **Run** on a transfer), and
the workers read and update OpenVDM's state through the web app's REST API.
