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

Each parser returns a dict with three lists: `visualizerData` (what the dashboard draws),
`qualityTests` and `stats` (shown on the **Data Quality** page).  The entries in
`visualizerData` depend on how the data type is drawn, which is set per tab in
[datadashboard.yaml](/docs/config_data_dashboard_yaml):

| Drawn as (`visType`) | `visualizerData` entries |
|---|---|
| Map track (`geoJSON`) | GeoJSON `FeatureCollection`s, e.g. a GPS trackline |
| Map tiles (`tms`) | An object with `tileURL` (a GeoTIFF served by TiTiler) or `tileDirectory` (pre-rendered tiles) |
| Chart (`json`, `json-reversedY`, `json-inverted`, `json-reversedY-inverted`, `json-profile`) | One object per series: `{"label": "Temperature", "unit": "C", "data": [[<ms since epoch>, <value>], ...]}` |

All the chart types use the same series, so a data type can be drawn against time and
as a depth profile without changing its parser.

## Tabs and Charts

Which tabs the dashboard has, and which maps and charts each one shows, is set in
[datadashboard.yaml](/docs/config_data_dashboard_yaml).  That page lists the map and
chart types, including depth profiles, and the `lowering` view for vehicle data.

## Rebuild Data Dashboard

If dashboard files become inconsistent — for example after adding a new plugin or
changing a plugin's output format — use **Configuration → Main → Rebuild Data Dashboard** in the
web UI.  This re-runs all plugins against every file in the cruise directory and
regenerates the complete dashboard from scratch.
