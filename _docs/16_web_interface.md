---
permalink: /docs/web_interface
title: "Web Interface Tour"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

The OpenVDM web interface provides both a real-time operational view and a full
administration panel for managing the data management system.

## Main Dashboard

The main dashboard is the primary operational view, showing:

- **System status** (On / Off / Error)
- **Current cruise and lowering** identifiers
- **Transfer status** for every active collection system and cruise data transfer
- **Task status** for background tasks (MD5 summary, data dashboard, etc.)
- **Recent messages** from the system

From this page operators can start individual transfers, stop running jobs, and see
recent transfer logs.  A collection system transfer's incorrectly named files (those
matching its Exclude Filter) are listed in a highlighted panel, since they weren't
transferred.

## Data Dashboard

The data dashboard shows what the [plugins](plugin_overview) made of the current
cruise's files.  Its **Main** page has a tile for each data type with its latest file;
the other tabs are set in [datadashboard.yaml](config_data_dashboard_yaml) and can
show:

- Leaflet maps with tracklines, points (e.g. CTD and XBT cast positions) and GeoTIFF
  overlays
- Chart.js charts of sensor data against time, or as depth profiles, with zoom
- a `lowering` view of one lowering's data

The **Data Quality** tab lists each file's quality tests and statistics.

## Configuration Menu

The **Configuration** top-level menu provides access to all administrative panels:

| Panel | Purpose |
|---|---|
| Main | Set up, edit and finalize the cruise and lowering, and run the maintenance tasks |
| Collection System Transfers | Add, edit, enable/disable, and delete collection system transfers |
| Extra Directories | Add, edit, enable/disable, and delete subdirectories not associated with collection systems |
| Cruise Data Transfers | Add, edit, enable/disable, and delete cruise data transfers |
| Ship-to-Shore Transfers | Turn the ship-to-shore transfer on and off, and manage the rules for what it sends |
| System | The shipboard and shoreside data warehouses, the ship-to-shore bandwidth limit, the MD5 file size limit, OpenVDM's own ship-to-shore rules, and links |

## Cruise / Lowering Management

From **Configuration → Main**:

| Action | Description |
|---|---|
| Setup New Cruise | Create a new cruise and its directory structure |
| Finalize Current Cruise | Lock and finalize the current cruise package |
| Setup New Lowering | Create a new lowering within the current cruise |
| Finalize Current Lowering | Lock and finalize the current lowering |

## System On / Off

The **System Status** toggle in the main dashboard can be set to **Off** to
temporarily pause all scheduled transfers — useful during port calls or periods
when instrument computers are offline.  Individual transfers can also be disabled
independently via their configuration panels.
