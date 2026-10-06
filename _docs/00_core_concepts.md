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
data, processed outputs, data dashboard files, the cruise MD5 checksum manifest and
cruise configuration file live inside this tree.  When a cruise ends the directory
is finalized and can be transferred to a shoreside archive as a complete, self-
describing unit.

## Collection Systems

A **collection system** is any data-acquisition system that produces files OpenVDM
should ingest.  Each collection system is represented in OpenVDM as a **Collection
System Transfer** — a named, configured transfer job that pulls files from the
source into a specific subdirectory of the cruise package.

## Transfers

OpenVDM distinguishes three categories of transfer:

| Category | Direction | Purpose |
|---|---|---|
| **Collection System Transfer (CST)** | Source → Warehouse | Pull raw data from instruments |
| **Cruise Data Transfer (CDT)** | Warehouse → Destination | Push the full cruise package to a secondary location |
| **Ship-to-Shore Transfer (S2S)** | Warehouse → Shoreside | Send selected data to a shoreside data warehouse, by priority |

## Transfer Types

Depending on the transfer category, OpenVDM will support a variety of transfer types.

| Category | Protocol |
|---|---|
| **Collection System Transfer (CST)** | Local Directory, Rsync Server, SMB Server, SSH Server, FTP Server |
| **Cruise Data Transfer (CDT)** | Local Directory, Rsync Server, SMB Server, SSH Server, FTP Server, or an rclone remote (Local Directory with `remote:path`) |
| **Ship-to-Shore Transfer (S2S)** | SSH Server, or an rclone remote |

## Cruises and Lowerings

A **cruise** represents a discrete vessel deployment occurring between two dates.

A **lowering** represents a discrete submersible deployment within a cruise data
package.  When the lowering feature is enabled OpenVDM creates a per-lowering sub-
directory (e.g. `Vehicle/ROV0001/`) and tracks a parallel set of collection system
transfers scoped to lowering-related collection systems.

## The Data Dashboard

Section within the OpenVDM WebUI for visualizing collected data and their
corresponding QA test results. After each collection system transfer OpenVDM runs
any matching **plugins** against the newly ingested files.  Plugins produce JSON
dashboard objects — time-series charts, GeoJSON tracklines, image previews — that
the web interface renders as maps and graphs.

## Hooks

A **hook** is used to attach additional processes to key milestones during a cruise or lowering lifecycle.  There are hooks for after a cruise or lowering is created, before and after a cruise or lowering is finalized, and after a collection system transfer or a data dashboard update completes.  See [Post-Hook Commands](/docs/post_hooks).

## Gearman Workers

All long-running operations (transfers, dashboard updates, cruise setup/finalization)
are dispatched as **Gearman jobs** handled by background worker processes managed by
Supervisor.  The web interface submits jobs and polls their status; workers execute
independently and report progress back to the database.

## Extra Directories

**Extra directories** are additional subdirectories created inside the cruise package
that are not tied to a specific collection system, for example `Documentation/` or
`Tracklines/`.  OpenVDM's own dashboard data goes in the required `Dashboard_Data` extra
directory (`OpenVDM/DashboardData/`).
