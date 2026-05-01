---
permalink: /docs/cdt_overview
title: "Cruise Data Transfers"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

A **Cruise Data Transfer (CDT)** pushes the entire cruise data package from the
shipboard data warehouse to a secondary destination — a backup drive, NAS, or
cloud archive.

## How It Works

1. The **scheduler** submits a `runCruiseDataTransfer` Gearman job for each active,
   non-running cruise data transfer.
2. The worker tests the destination, builds an exclude filter list, then runs
   `rsync` or rclone to mirror `<warehouse_base_dir>/<cruiseID>/` to the destination.
3. Progress is reported back to the Gearman job as a percentage.

## Destination Directory Semantics

How the **Destination Directory** field is interpreted depends on the transfer type:

| Transfer type | Field interpretation |
|---|---|
| Local Directory (no `:`) | Absolute path on the local filesystem — leading `/` required |
| Local Directory (contains `:`) | rclone `remote:path` — no leading slash on the remote name |
| All other types | Relative path appended to the cruise directory on the destination — no leading slash |

## Configuration Fields

### Basic Settings

| Field | Description |
|---|---|
| **Name / Long Name** | Identifiers shown in the UI |
| **Transfer Type** | See [Transfer Types](/docs/transfer_types) |
| **Destination Directory** | Where to write the cruise package (see semantics above) |
| **Enabled** | Whether the scheduler submits jobs for this transfer |

### Exclusions

| Field | Description |
|---|---|
| **Excluded Collection Systems** | Collection system transfers whose destination directories are excluded from this CDT |
| **Excluded Extra Directories** | Extra directories excluded from this CDT |
| **Include OpenVDM Files** | Whether to include OpenVDM metadata files (MD5 summary, cruise config) |
