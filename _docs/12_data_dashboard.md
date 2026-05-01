---
permalink: /docs/data_dashboard
title: "Data Dashboard"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

The **data dashboard** provides a near-real-time view of instrument data as it arrives
on the shipboard data warehouse.  Each collection system can have one plugin and
mulitple parsers that parse incoming files and produce visualisations rendered in the
web interface.

## How It Works

After each collection system transfer the `data_dashboard` worker receives an
`updateDataDashboard` Gearman job containing the list of new and updated files.  If a
plugin for the Collection system transfer exists, the worker finds any parser whose
file-match pattern matches the filename, runs the psrser, and saves the resulting
JSON output to the `Dashboard_Data` extra directory.

A **dashboard manifest** file (`DashboardData.json` by default) lists every
dashboard file and its associated data type, allowing the web interface to quickly
discover all available visualisations.

## Dashboard Object Format

Plugins return a dict with a `visualizerData` key containing a list of visualiser
objects.  Each visualiser object has a `type` field that determines how the web
interface renders it:

| Type | Rendered as |
|---|---|
| `FeatureCollection` (GeoJSON) | Interactive Leaflet trackline map |
| `timeseries` | Chart.js time-series plot |
| `image` | Inline image preview |
| `text` | Formatted text block |

## Rebuild Data Dashboard

If dashboard files become inconsistent — for example after adding a new plugin or
changing a plugin's output format — use **Configuration → Main → Rebuild Data Dashboard** in the
web UI.  This re-runs all plugins against every file in the cruise directory and
regenerates the complete dashboard from scratch.
