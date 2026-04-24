---
permalink: /docs/core_concepts
title: "Core Concepts"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

Understanding a few key concepts will help you get the most out of OpenVDM.

## The Cruise Data Package

OpenVDM organises every research cruise around a single **cruise data package** — a
directory tree rooted at `<warehouse_base_dir>/<cruiseID>/`.  All raw instrument
data, processed outputs, dashboards, MD5 checksums, and transfer logs live inside
this tree.  When a cruise ends the directory is finalized and can be transferred to
a shoreside archive as a complete, self-describing unit.

## Collection Systems

A **collection system** is any instrument or data-acquisition computer that produces
files OpenVDM should ingest.  Each collection system is represented in OpenVDM as a
**Collection System Transfer** — a named, configured transfer job that pulls files
from the source into a specific subdirectory of the cruise package.

## Transfers

OpenVDM distinguishes three categories of transfer:

| Category | Direction | Purpose |
|---|---|---|
| **Collection System Transfer (CST)** | Source → Warehouse | Pull raw data from instruments |
| **Cruise Data Transfer (CDT)** | Warehouse → Destination | Push the full cruise package to a secondary location |
| **Ship-to-Shore Transfer (S2S)** | Warehouse → Shoreside | Continuously sync selected data to a shore-side archive |

All three share the same five underlying **transfer types**: Local Directory, rsync
Server, SMB Share, SSH Server, and rclone remote.

## Lowerings

A **lowering** represents a discrete submersible deployment or dive nested inside a
cruise.  When the lowering feature is enabled OpenVDM creates a per-lowering
subdirectory (e.g. `Vehicle/J0001/`) and tracks a parallel set of collection system
transfers scoped to that lowering.

## The Data Dashboard

After each collection system transfer OpenVDM runs any matching **plugins** against
the newly ingested files.  Plugins produce JSON dashboard objects — time-series
charts, GeoJSON tracklines, image previews — that the web interface renders in
real time.

## Gearman Workers

All long-running operations (transfers, dashboard updates, cruise setup/finalization)
are dispatched as **Gearman jobs** handled by background worker processes managed by
Supervisor.  The web interface submits jobs and polls their status; workers execute
independently and report progress back to the database.

## Extra Directories

**Extra directories** are additional subdirectories created inside the cruise package
that are not tied to a specific collection system.  Common examples include
`Documentation/`, `Tracklines/`, and `Dashboard_Data/`.  Required extra directories
are always created; optional ones are user-managed.
