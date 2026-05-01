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

From this page operators can manually trigger individual transfers, stop running
jobs, and navigate to detailed transfer logs.

## Data Dashboard

The data dashboard renders plugin-generated visualisations for the current cruise
or lowering.  Clicking a collection system name reveals its dashboard panel, which
may contain:

- An interactive Leaflet map showing the GPS trackline
- Chart.js time-series plots for sensor data (depth, temperature, heading, etc.)
- Image previews for camera systems
- Quality test results with pass/fail/warning indicators

## Configuration Menu

The **Configuration** top-level menu provides access to all administrative panels:

| Panel | Purpose |
|---|---|
| Main | Create new/edit current cruise/lowering, finalized current cruise/lowering, run common tasks |
| Collection System Transfers | Add, edit, enable/disable, and delete collection system transfers |
| Extra Directories | Add, edit, enable/disable, and delete subdirectories not associated with collection systems |
| Cruise Data Transfers | Add, edit, enable/disable, and delete transfers cruise data transfers |
| Ship-to-ShoreTransfers | Add, edit, enable/disable, and delete ship-to-shore transfers |
| System | Manage other aspects of the system such as links, and bandwidth settings |

## Cruise / Lowering Management

From the **Main** menu:

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
