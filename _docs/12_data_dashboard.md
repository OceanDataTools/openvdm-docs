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
on the shipboard data warehouse.  Each collection system transfer can have one
[plugin](plugin_overview), which uses one or more parsers to turn incoming files
into maps, charts and data quality results in the web interface.

## How It Works

After each collection system transfer the `data_dashboard` worker receives an
`updateDataDashboard` job with the list of new and updated files.  If the transfer has
a plugin, the worker runs it on each file: the plugin matches the file against its file
type filters, runs the matching parsers, and the worker saves the output as JSON in the
`Dashboard_Data` extra directory (`OpenVDM/DashboardData/` in the cruise).

A **dashboard manifest** (`manifest.json` by default, `DATA_DASHBOARD_MANIFEST_FN` in
[Config.php](config_php)) lists every dashboard file with its raw file and data
type, so the web interface can find them quickly.

If a plugin can't be loaded (e.g. a syntax error or a missing library), that transfer's
files are skipped and the error is logged; other transfers are still processed.

## Dashboard Object Format

Each parser returns a dict with three lists: `visualizerData` (what the dashboard draws),
`qualityTests` and `stats` (shown on the **Data Quality** page).  The entries in
`visualizerData` depend on how the data type is drawn, which is set per tab in
[datadashboard.yaml](config_data_dashboard_yaml):

| Drawn as (`visType`) | `visualizerData` entries |
|---|---|
| Map track or points (`geoJSON`) | GeoJSON `FeatureCollection`s: `LineString`s for a track (e.g. GPS), or `Point`s (e.g. CTD cast positions), whose properties are shown in a popup |
| Map tiles (`tms`) | An object with `tileURL` (a GeoTIFF served by TiTiler) or `tileDirectory` (pre-rendered tiles) |
| Chart (`json`, `json-reversedY`, `json-inverted`, `json-reversedY-inverted`, `json-profile`) | One object per series: `{"label": "Temperature", "unit": "C", "data": [[<ms since epoch>, <value>], ...]}` |

All the chart types use the same series, so a data type can be drawn against time and
as a depth profile without changing its parser.

## Tabs and Charts

Which tabs the dashboard has, and which maps and charts each one shows, is set in
[datadashboard.yaml](config_data_dashboard_yaml).  That page lists the map and
chart types, including depth profiles, and the `lowering` view for vehicle data.

## Basemaps

All maps share the basemaps defined in `www/app/templates/default/js/mapBaseLayers.js`:
OpenStreetMap (the default), Esri Ocean, Esri Dark and Light Gray, and GMRT, with label
and seamark overlays.  None needs an API key, but they're loaded from the internet.  For
use without an internet connection, the installer can set up MapProxy to cache tiles.
The CARTO basemaps used before 2.16 now need an API key and were removed; a site with its
own `custom1.js` should update it from `custom1.js.dist`.

## What's Shown

The dashboard leaves out what has nothing to show: cards and panels for data types
with no files, and, on the **Data Quality** tab, files without stats or quality tests.

## Rebuild Data Dashboard

After adding or changing a plugin or parser, run **Rebuild Data Dashboard** under
**Maintenance Tasks** on the **Configuration** page.  It re-runs the plugins on every
file of every active collection system transfer in the current cruise, regenerates the
dashboard, and deletes dashboard files that are no longer in the manifest.  Earlier
cruises aren't rebuilt.
