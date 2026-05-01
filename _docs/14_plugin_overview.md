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

At startup the `data_dashboard` worker scans the directory defined by `pluginDir`
in `openvdm.yaml` for files matching `*_plugin.py`.  Each file is imported and its
top-level class that subclasses `OpenVDMPlugin` is registered.

## Plugin–File Matching

Each plugin defines a list of **file patterns** (glob strings) that determine which
files it handles.  When the dashboard worker receives a list of newly transferred
files it matches each filename against all registered plugins' patterns and runs
a file-format specific parser for the given file.

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
