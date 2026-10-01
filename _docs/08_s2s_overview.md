---
permalink: /docs/s2s_overview
title: "Ship-to-Shore Transfer"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

The **Ship-to-Shore (S2S) transfer** is a special required cruise data transfer
named `SSDW` (Shoreside Data Warehouse) that continuously synchronises selected
cruise data to a shore-side archive over a satellite or shore connection.

## How It Works

1. The **scheduler** submits a `runShipToShoreTransfer` Gearman job each cycle if
   the S2S transfer is enabled.
2. The worker builds a prioritised file list by walking the cruise directory and
   applying the configured include/exclude filter patterns in parallel. The
   [always-ignored files and folders](/docs/cst_overview#always-ignored-files-and-folders)
   are never transferred.
3. Files are transferred using `rsync` or rclone in priority order.
4. After one hour the scheduler automatically stops the running job and starts a
   fresh one to prevent stale connections from blocking new data.

## Priority-Based Filtering

Unlike collection system and cruise data transfers which use simple include/exclude
lists, the S2S transfer uses a **priority-ordered filter** system.  Files are
matched against filter groups in order; the first match determines whether and in
what order the file is transferred.

This allows high-priority data (e.g. navigation, summary products) to be sent first
over limited bandwidth before lower-priority raw data.

## Configuration

The S2S transfer is configured at **Configuration → Shoreside Data Warehouse** in
the web interface.

| Field | Description |
|---|---|
| **Transfer Type** | SSH, or rclone |
| **Server / Credentials** | Destination host and authentication |
| **Destination Directory** | Remote path (relative for non-local, `remote:path` for rclone) |
| **Enabled** | Whether the scheduler should submit S2S jobs |
| **Filter Groups** | Priority-ordered include/exclude glob pattern groups |

## Supported Destination Types

| Type | Notes |
|---|---|
| SSH | rsync over SSH |
| rclone | Any rclone-supported remote; `:` in destination field triggers rclone path |

## Bandwidth Considerations

The S2S transfer runs continuously and is automatically restarted hourly.  To avoid
saturating the satellite link, configure filter groups so that small, high-value
files (tracklines, event logs, summary products) have the highest priority and large
raw data files have lower priority or are excluded entirely.
