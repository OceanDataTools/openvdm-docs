---
permalink: /docs/config_data_dashboard_yaml
title: "datadashboard.yaml"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

`www/etc/datadashboard.yaml` defines the tabs of the [data dashboard](/docs/data_dashboard):
which maps and charts each tab shows, and which data types go in them.  The installer
copies `datadashboard.yaml.dist` to `datadashboard.yaml` if it doesn't exist yet; edit
the copy, since upgrades don't touch it.  The web app reads it from the path in
`DASHBOARD_CONF` in [Config.php](/docs/config_php).

The file is a list of tabs.  Each tab is a list of panels (placeholders), and each panel
shows one or more data types, the `data_type` values a [plugin](/docs/plugin_overview)
gives its parsers.

```yaml
- title: Seawater
  page: seawater
  view: default
  jsArray:
  - dataDashboardDefault
  - charts
  - charts-zoom
  placeholderArray:
  - plotType: chart
    id: tsg
    heading: Thermosalinograph Sensor
    dataArray:
    - dataType: tsg
      visType: json
```

## Tab Keys

| Key | Description |
|---|---|
| `title` | Tab name in the dashboard's menu |
| `page` | Internal name: lower case, no spaces, unique across tabs. Used in the tab's URL |
| `view` | How the tab is laid out: `default`, `lowering`, or a custom view (see [Views](#views)) |
| `cssArray` | Extra stylesheets. Add `leaflet` for tabs with a map |
| `jsArray` | Scripts. See [Scripts](#scripts) |
| `placeholderArray` | The tab's panels. See [Panels](#panels) |

### Views

| View | Shows |
|---|---|
| `default` | All of the cruise's files for each data type |
| `lowering` | One lowering's files, chosen from a drop-down at the top of the tab |

A custom view is a PHP file in `www/app/views/DataDashboard/`; give its name without
`.php` (e.g. `customView` for `customView.php`).

### Scripts

| Entry | Loads |
|---|---|
| `dataDashboardDefault` | The script that draws a `default` tab's maps and charts |
| `lowering` | The script that draws a `lowering` tab's maps and charts. Use it **instead of** `dataDashboardDefault`, never both: each draws every map and chart on the page |
| `charts` | Chart.js and the dashboard's chart helpers. Needed for any `chart` panel |
| `charts-zoom` | Mouse-wheel and drag zoom on charts, with a reset button |
| `leaflet` | The map library and basemaps. Needed for any `map` panel |

Any other entry loads `www/app/templates/default/js/<entry>.js`.

## Panels

Each entry in `placeholderArray` is one panel on the tab:

| Key | Description |
|---|---|
| `plotType` | `map` or `chart` |
| `id` | The panel's HTML id, unique on the tab. For a `chart` panel it must be the data type (e.g. `tsg`): the chart uses it to fetch the data. A [depth profile](#depth-profiles) is the exception and can have any id |
| `heading` | Text in the panel's header |
| `dataArray` | The data types shown in the panel, each with a `dataType` and a `visType` |

Below a panel, the dashboard lists each data type's files. On a map you can choose which
tracks to show; on a chart you choose which file to plot.

## Map Types

`plotType: map` panels take these `visType`s:

| `visType` | Draws |
|---|---|
| `geoJSON` | Tracklines from GeoJSON (e.g. GPS positions), one per file, plus the latest position (`default` view) or each file's start and end (`lowering` view) |
| `tms` | Map tiles, e.g. a GeoTIFF bathymetry grid |

## Chart Types

`plotType: chart` panels take these `visType`s.  They all use the same parser output, a
list of series, so a data type can be drawn several ways without changing its plugin.

| `visType` | Draws |
|---|---|
| `json` | Each series against time, with time across the bottom and each series on its own y axis |
| `json-reversedY` | The same, with the y axes reversed (values increase downward) |
| `json-inverted` | Each series against time, on its side: time runs down the left, earliest at the top, with the values across |
| `json-reversedY-inverted` | The same, with the value axes reversed |
| `json-profile` | A [depth profile](#depth-profiles) |

A series labelled `Depth` is always drawn on a reversed axis, so depth increases downward
whatever the `visType`.

On all charts, each value axis is coloured like its line, and clicking a legend entry
hides the series together with its axis.  With `charts-zoom` loaded, the mouse wheel or a
shift-drag zooms along time (along depth for profiles), dragging pans, and a reset
button appears in the panel header.  The expand button in the header makes a chart
taller.

### Depth Profiles

`visType: json-profile` puts depth down the vertical axis and one or more measured values
across, each on its own x axis, with the points joined in time order, so a dive's or a
cast's descent and ascent both show.  The tooltip shows the time, the value and the
depth.

| Key | Description |
|---|---|
| `depthSeries` | The series to use for depth. Default: `Depth` |
| `profileSeries` | The series to plot across, in this order. A list, or a comma-separated string. Default: all the series except `depthSeries` |

Each series is matched to the depth series by timestamp.  This example draws the ROV's
CTD data both against time and as a profile:

```yaml
  - plotType: chart
    id: rov-ctd
    heading: ROV CTD
    dataArray:
    - dataType: rov-ctd
      visType: json
  - plotType: chart
    id: rov-ctd-profile
    heading: ROV CTD Profile
    dataArray:
    - dataType: rov-ctd
      visType: json-profile
      profileSeries: [Temperature, Salinity, Sound Velocity]
```

The profile panel needs its own `id` because the time-series panel already uses
`rov-ctd`.  A profile finds its data from the files listed under it, so its `id` can be
anything unique.  If `depthSeries` names a series the data doesn't have, the panel shows an
error instead of the chart.

## Main Dashboard Page

The dashboard's front page shows a small tile for each data type that has dashboard
data, drawing its latest file the way `datadashboard.yaml` draws that data type.  A data
type used only as a depth profile gets a profile tile; one that's also charted against
time gets a time-series tile.  Clicking a chart tile opens the tab that shows it.

## Lowering Tab

`datadashboard.yaml.dist` ends with an example Lowering tab, commented out, for the
ROV OpenRVDAS sample data: the ROV's position on a map, and its sensors as charts,
including a CTD depth profile.  Installing the sample data uncomments it.  To use it for
your own vehicle, uncomment it and change the data types to your plugin's.

A Lowering tab needs `view: lowering`, the `lowering` script in place of
`dataDashboardDefault`, and `charts-zoom` if its charts should zoom.
