---
permalink: /docs/cst_overview
title: "Collection System Transfers"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

A **Collection System Transfer (CST)** pulls raw data files from an instrument or
data-acquisition computer into the shipboard data warehouse on a recurring schedule.

## How It Works

1. The **scheduler** worker submits a `runCollectionSystemTransfer` Gearman job at
   the configured interval for each active, non-running transfer.
2. The **run_collection_system_transfer** worker picks up the job, tests the source,
   mounts any required shares, and runs `rsync` (or rclone) to copy new and updated
   files into the destination directory inside the cruise package.
3. On completion, the worker submits an `updateDataDashboard` job so plugins can
   process any newly transferred files.

## Configuration Fields

Navigate to **Configuration → Collection System Transfers → Add/Edit** in the web
interface to manage transfers.

### Basic Settings

| Field | Description |
|---|---|
| **Name** | Short identifier (used in hook token `{collectionSystemTransferName}`) |
| **Long Name** | Human-readable display name |
| **Cruise or Lowering** | Whether this transfer is scoped to a cruise or a lowering |
| **Destination Directory** | Path inside the cruise/lowering directory |
| **Transfer Type** | See [Transfer Types](/docs/transfer_types) |
| **Enabled** | Whether the scheduler should submit jobs for this transfer |

### Source Filters

| Field | Description |
|---|---|
| **Include Filters** | Glob patterns — only matching files are transferred |
| **Exclude Filters** | Glob patterns — matching files are skipped |
| **Start/End Date Offset** | Transfer only files whose modification time falls within a rolling time window (hours) |

### Transfer Behaviour

| Field | Description |
|---|---|
| **Staleness** | Minutes of inactivity before a transfer is considered stale and re-queued |
| **Remove Source Files** | Delete transferred files from the source after a successful copy |
| **Skip Empty Directories** | Do not create empty directories in the destination |
| **Skip Empty Files** | Do not transfer zero-byte files |
| **Sync from Source** | Mirror the source — delete destination files not present in the source |

## Wildcard Source Directories

Source directory paths may include glob wildcards (e.g. `data/*/raw/`).  OpenVDM
expands the wildcard against the source filesystem and merges results from all
matching directories into the single configured destination directory.

## Destination Directory Tokens

The destination directory path may include `{cruiseID}` and `{loweringID}` tokens,
which are substituted with the current cruise and lowering identifiers at transfer
time.

## Statuses

| Status | Meaning |
|---|---|
| **Idle** | No job running; waiting for next scheduled run |
| **Running** | Transfer in progress |
| **Error** | Last run encountered an error; see transfer log |
| **Disabled** | Excluded from scheduling |
