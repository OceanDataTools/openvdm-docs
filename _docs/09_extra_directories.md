---
permalink: /docs/extra_directories
title: "Extra Directories"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

**Extra directories** are subdirectories created inside the cruise (or lowering)
data package that are not tied to a specific collection system transfer.  They
provide a place for processed outputs, documentation, and OpenVDM-generated files.

## Required vs. Optional

| Type | Behaviour |
|---|---|
| **Required** | Always created when a new cruise directory is built; cannot be deleted via the UI |
| **Optional** | Created on demand; can be enabled/disabled per cruise |

## Built-in Required Directories

OpenVDM ships with several required extra directories pre-configured:

| Name | Default Path | Purpose |
|---|---|---|
| `Dashboard_Data` | `OpenVDM/DashboardData/` | Plugin-generated dashboard JSON files |
| `Tracklines` | `OpenVDM/Tracklines/` | GeoJSON/KML trackline outputs |
| `Transfer_Logs` | `OpenVDM/TransferLogs/` | Per-transfer rsync log files |
| `From_PublicData` | `From_PublicData/` | Data synced from the public data mount |

## Destination Directory Tokens

Extra directory paths support the same token substitution as collection system
transfers:

| Token | Replaced with |
|---|---|
| `{cruiseID}` | Current cruise identifier |
| `{loweringID}` | Current lowering identifier |
| `{loweringDataBaseDir}` | The configured lowering base directory name (e.g. `Vehicle/`) |

## Adding an Extra Directory

1. Navigate to **Configuration → Extra Directories → Add Extra Directory**.
2. Enter a **Name**, **Long Name**, and **Destination Directory**.
3. Choose **Cruise or Lowering** scope.
4. Set **Required** if this directory should always be created.
5. Save and rebuild the cruise directory if the cruise is already active
   (**Actions → Rebuild Cruise Directory**).
