---
permalink: /docs/plugin_overview
title: "Plugin Overview"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

Plugins are the mechanism by which OpenVDM extracts meaning from raw instrument
files and feeds the data dashboard.  Each plugin is a Python module that matches
files by pattern, parses them, and returns structured JSON suitable for rendering
in the web interface.

## Plugin Discovery

Each collection system transfer has at most one plugin: the file named after the
transfer, in lower case, in the directory set by `pluginDir` in `openvdm.yaml`
(default `server/plugins/`), with the suffix set by `pluginSuffix` (default
`_plugin.py`).  The sample `CTD` transfer uses `ctd_plugin.py`.  OpenVDM ships
plugins as `.dist` templates; copy one to the transfer's plugin name to use it.

After each transfer, the `data_dashboard` worker loads that transfer's plugin and
calls its module-level functions for the files that were new or updated.
**Rebuild Data Dashboard** does the same for every file of every active transfer.

## Plugin–File Matching

Each plugin defines a list of **file type filters**: a glob pattern, the data type
the matching files produce, and the parser that reads them.  The plugin runs the
matching parsers on each file; a file no filter matches produces no dashboard
data.

## Module-Level Functions

The worker calls these functions in the plugin module:

| Function | Description |
|---|---|
| `process_file(filepath)` | **Required.** Parse one raw file and return its dashboard data (see [Return Types](#return-types)), or an empty dict if there's none |
| `get_source_files(filepath)` | Optional. Return the list of raw files to parse when `filepath` arrives or changes. Without it, each file is parsed itself |

`get_source_files()` is for files that change how *other* files are parsed.  A
Sea-Bird CTD cast's `.hex` is parsed with the calibration in its `.xmlcon`, so
`ctd_plugin.py` returns the cast's `.hex` for an `.xmlcon`: when the `.xmlcon`
arrives after its `.hex`, or is corrected, the cast is parsed again, under the
`.hex`.  The worker removes duplicates, so a `.hex` and `.xmlcon` arriving
together are parsed once.  Paths are absolute.

```python
def get_source_files(filepath):
    """Return the raw files to parse when filepath arrives or changes."""
    if filepath.lower().endswith('.xmlcon'):
        hex_file = ...  # the cast's .hex, or None if it hasn't arrived
        return [hex_file] if hex_file else []
    return [filepath]
```

### Errors

Parsers raise an exception for an error that stops a file (e.g. a missing
calibration file); the plugin catches it and logs it, naming the file.  A file
whose parsing fails gets no dashboard data, and any earlier dashboard data for it
is removed.

## Return Types

`process_file()` returns a dict keyed by data type.  Each data type has three lists:

```
{
  "<data type>": {
    "visualizerData": [...],
    "qualityTests": [...],
    "stats": [...]
  },
  ...
}
```

### Visualizer Data

What the dashboard draws: GeoJSON for map tracks and points, tile information for map
overlays, or a list of series for charts.  The format for each is in
[Data Dashboard](data_dashboard#dashboard-object-format).  Parsers add entries
with `add_visualization_data()`.

### Quality Tests

Pass, warning or fail results for the file, e.g. whether its values are in range.
Parsers add them with `add_quality_test_passed()`, `add_quality_test_warning()` and
`add_quality_test_failed()`.  They're shown on the dashboard's **Data Quality** tab.

### Statistics

Summary values for the file: the time span, value bounds, geographic bounds, the number
of valid rows, and so on.  Parsers add them with `add_bounds_stat()`,
`add_geobounds_stat()`, `add_time_bounds_stat()` and the other `add_*_stat()` methods.
They're shown on the **Data Quality** tab, and the dashboard combines each data type's
stats across files by name.  Files with no stats or quality tests aren't listed there.

Chart data uses milliseconds since the epoch for time.  Times shown as text, such as
the time bounds stat or a point's properties, are ISO 8601 UTC; `format_iso8601()` in
`openvdm_plugin.py` formats a time that way.

## Base Classes

All in `server/lib/openvdm_plugin.py`:

| Class | Use for |
|---|---|
| `OpenVDMPlugin` | A plugin: matches files to data types and runs their parsers |
| `OpenVDMParser` | A parser: holds the file's visualizer data, quality tests and stats |
| `OpenVDMCSVParser` | A parser for timestamped CSV and NMEA-style log files, with cropping to a time window, resampling and rounding built in |
| `OpenVDMParserQualityTest` (and its `...Passed`, `...Warning`, `...Failed` subclasses) | One quality test result |
| `OpenVDMParserStat` (and its `...BoundsStat`, `...GeoBoundsStat`, `...TimeBoundsStat`, ... subclasses) | One statistic |

See [Writing a Plugin](plugin_development) for a step-by-step guide.

## Parsers

Parsers live in `server/plugins/parsers/` and do the work of reading one file format.
A plugin's file type filters name the parser for each pattern.  Like plugins, they ship
as `.dist` templates.

OpenVDM includes parsers for:

- **NMEA sentences:** GGA, VTG, HDT, DBS, DPT, MWD, MWV, XDR, PASHR, PSXN-23/24, ...
- **Shipboard sensors:** thermosalinographs (SBE 21, SBE 45), SBE 38, met stations,
  wind, fluorometers, PAR, oxygen, pH, flow rate, sound velocity, pressure, ...
- **Profiles:** Sea-Bird SBE 9plus CTD casts (`ctd_profile_parser`), MK21 XBT casts
  (`xbt_parser`), sound velocity profiles
- **Grids:** GeoTIFFs, as pre-rendered tiles or served by TiTiler

The sample plugins show how they're used:

| Plugin | For |
|---|---|
| `openrvdas_plugin.py.dist` | An OpenRVDAS logger's files |
| `rov_openrvdas_plugin.py.dist` | An ROV's OpenRVDAS files, cropped to each lowering |
| `ctd_plugin.py.dist` | Sea-Bird SBE 9plus casts: profiles, cast positions, optional PNG plots |
| `xbt_plugin.py.dist` | MK21 XBT casts: profiles and launch positions.  Needs the xbt-edf-qc library, which `requirements.txt` doesn't install |
| `em302_plugin.py.dist` | Kongsberg EM302 multibeam GeoTIFFs, served by TiTiler |
