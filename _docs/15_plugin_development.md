---
permalink: /docs/plugin_development
title: "Writing a Plugin"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

This guide walks through creating a data-dashboard plugin from scratch.

## Prerequisites

- Familiarity with Python 3
- An understanding of the file format you want to parse
- A running OpenVDM installation with a collection system that ingests your files

## Plugin File Naming

Plugin files must end in `_plugin.py` and live in the directory configured by
`pluginDir` in `openvdm.yaml` (default: `server/plugins/`).

## Minimal Plugin Structure

```python
from server.lib.openvdm_plugin import OpenVDMPlugin

class MyInstrumentPlugin(OpenVDMPlugin):

    def __init__(self):
        self.name = "My Instrument Plugin"
        self.description = "Parses My Instrument CSV files"
        self.data_type = "my_instrument"
        self.file_patterns = ["*.myinst.csv", "*_MyInstrument_*.csv"]
        super().__init__()

    def process_file(self, filepath):
        """Parse a single file and return dashboard data."""
        results = []

        try:
            # ... parse filepath ...
            lats, lons, times = self._parse_csv(filepath)

            if lats:
                results.append({
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": list(zip(lons, lats))
                        },
                        "properties": {
                            "name": "My Instrument Track",
                            "coordTimes": times
                        }
                    }]
                })

        except Exception as err:
            self.send_error_msg(f"Failed to parse {filepath}: {err}")

        return results

    def _parse_csv(self, filepath):
        # your parsing logic here
        ...
```

## Key Attributes

| Attribute | Type | Description |
|---|---|---|
| `name` | `str` | Human-readable plugin name |
| `description` | `str` | Brief description shown in the dashboard |
| `data_type` | `str` | Unique key used in the dashboard manifest |
| `file_patterns` | `list[str]` | Glob patterns matched against ingested filenames |

## Key Methods

| Method | Description |
|---|---|
| `process_file(filepath)` | **Required.** Parse a file; return a list of visualiser dicts. |
| `send_error_msg(msg)` | Record a non-fatal error in the dashboard output. |
| `run_cli(cmd)` | Run an external command and capture output. |

## Visualiser Object Types

### GeoJSON TrackLine

```python
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": [[lon, lat], ...]},
        "properties": {"name": "Track", "coordTimes": ["2024-01-01T00:00:00Z", ...]}
    }]
}
```

### Time-Series

```python
{
    "type": "timeseries",
    "data": {
        "x": ["2024-01-01T00:00:00Z", ...],
        "y": [1.23, 4.56, ...]
    },
    "label": "Depth (m)"
}
```

## Installing the Plugin

1. Copy your `my_instrument_plugin.py` to `server/plugins/`.
2. Restart the `data_dashboard` Supervisor worker:
   ```bash
   sudo supervisorctl restart openvdm_data_dashboard
   ```
3. Trigger a **Rebuild Data Dashboard** from the web UI to process existing files.

## Using an Existing Parser

For common NMEA and oceanographic formats, use a parser from
`server/plugins/parsers/` rather than writing your own:

```python
from server.plugins.parsers.gga_parser import GGAParser

class MyGPSPlugin(OpenVDMPlugin):
    def process_file(self, filepath):
        parser = GGAParser()
        return parser.parse(filepath)
```
