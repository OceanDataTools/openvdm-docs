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

A plugin returns a json-object with the following schema:
```
{
  <data_dashboard_type>:
    visualizernData: {}
    qualityTests: {}
    stats: {}
  ...
}
```

### Visualizer Data

A data plugin processes a single file and returns one or more **visualiser objects**
— GeoJSON features, time-series arrays, image references, or text blocks — that the
web interface renders on the dashboard.

### Quality Tests

A quality test plugin subclasses `OpenVDMParserQualityTest` and performs validation
checks on a file, returning a list of pass/fail/warning results.  Quality test
results are shown in the **Data Quality** tab of the data dashboard alongside the data
visualisations.

### Statistics

A stats plugin subclasses `OpenVDMParserStats` and tabulated the statistics on a file,
returning the requested results.  Stat results are shown in the **Data Quality** tab of
the data dashboard alongside the data visualisations.

## Base Classes

Both plugin types are defined in `server/lib/openvdm_plugin.py`:

| Class | Use for |
|---|---|
| `OpenVDMPlugin` | Data extraction and visualisation |
| `OpenVDMParserQualityTest` | File validation and quality testing |
| `OpenVDMParserStats` | File statistics |

See [Writing a Plugin](/docs/plugin_development) for a step-by-step guide.

## Parsers

Parsers live in `server/plugins/parsers/` and handle the low-level work of reading
a specific file format (NMEA, CSV, JSON, binary, etc.).  A plugin typically
instantiates one or more parsers to do the heavy lifting and then formats the
output as dashboard objects.

Reusable parsers for common NMEA sentence types (GGA, VTG, HDT, etc.) and common
oceanographic formats are included in the default installation.
