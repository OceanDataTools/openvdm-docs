---
permalink: /docs/plugin_development
title: "Writing a Plugin"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

This page walks through adding dashboard data for a new instrument: a parser that reads
its files, and a plugin that tells OpenVDM which files to give it.  Read
[Plugin Overview](/docs/plugin_overview) first.

The quickest start is to copy the sample plugin and parser closest to your data.  The
`.dist` templates in `server/plugins/` and `server/plugins/parsers/` are complete,
working examples.

## 1. Write a Parser

Most instruments log text lines with a timestamp, and `OpenVDMCSVParser` does most of
the work for those.  This parser, based on `paro_parser.py.dist`, reads lines like
`2026-09-28T12:00:00.000Z,$PARO,1523.402` and draws depth against time:

```python
"""Parser for Paro Scientific depth sensor data.

Parses comma-separated log files containing Paro depth measurements and returns
the JSON-formatted plugin data used by OpenVDM's Data Dashboard.
"""

import logging
import sys
from os.path import dirname, realpath

import pandas as pd

sys.path.append(dirname(dirname(dirname(dirname(realpath(__file__))))))

from server.lib.openvdm_plugin import OpenVDMCSVParser

FIELDS = ['hdr', 'depth']
PROC_COLS = ['date_time', 'depth']
ROUNDING = {'depth': 3}


class ParoParser(OpenVDMCSVParser):
    """Parser for Paro Scientific depth sensor log files."""

    def __init__(self, start_dt=None, stop_dt=None, time_format=None,
                 skip_header=False, use_openvdm_api=False):
        super().__init__(None, PROC_COLS, start_dt=start_dt, stop_dt=stop_dt,
                         time_format=time_format, skip_header=skip_header,
                         use_openvdm_api=use_openvdm_api)

    def parse(self, filepath):
        """Parse the Paro depth sensor file and return plugin data dict."""
        raw_data = {col: [] for col in self.proc_cols}
        errors = []

        for lineno, timestamp_str, _, fields in self.read_lines_with_timestamps(filepath):
            try:
                raw_data['depth'].append(float(dict(zip(FIELDS, fields))['depth']))
                raw_data['date_time'].append(timestamp_str)
            except (KeyError, ValueError):
                errors.append(lineno)

        df = pd.DataFrame(raw_data)
        df['date_time'] = pd.to_datetime(df['date_time'], errors='coerce')
        df = self.crop_data(df.dropna(subset=['date_time']))
        if df.empty:
            logging.warning("No valid data in file: %s", filepath)
            return None

        # Stats and quality tests, shown on the Data Quality tab
        self.add_row_validity_stat([len(df), len(errors)])
        self.add_time_bounds_stat([df['date_time'].min().to_pydatetime(),
                                   df['date_time'].max().to_pydatetime()])
        self.add_bounds_stat([df['depth'].min(), df['depth'].max()], 'Depth Bounds', 'm')
        if len(errors) > 0.25 * (len(df) + len(errors)):
            self.add_quality_test_failed('Rows')
        else:
            self.add_quality_test_passed('Rows')

        # One chart series: [ms since epoch, value] pairs
        df = self.round_data(self.resample_data(df.set_index('date_time')), ROUNDING)
        df = df.set_index('date_time')
        self.add_visualization_data({
            'label': 'Depth',
            'unit': 'm',
            'data': [[int(pd.Timestamp(ts).timestamp() * 1000), row['depth']]
                     for ts, row in df.iterrows() if pd.notna(row['depth'])],
        })

        self.send_error_msg(errors, filepath)
        self.plugin_data = self._sanitize_for_json(self.plugin_data)
        return self.plugin_data


if __name__ == "__main__":
    ParoParser.run_cli()
```

Save it as `server/plugins/parsers/paro_parser.py`.  The helpers it uses:

| Method | Does |
|---|---|
| `read_lines_with_timestamps(filepath)` | Yields each line's number, timestamp, remainder and comma-separated fields; skips lines without a timestamp |
| `crop_data(df)` | Keeps the rows between `start_dt` and `stop_dt`, when given (e.g. a lowering's start and end) |
| `resample_data(df)` | Averages to one row per minute, so long files stay small enough to chart |
| `round_data(df, precision)` | Rounds the columns given in `precision` |
| `add_visualization_data()`, `add_*_stat()`, `add_quality_test_*()` | Add to the parser's output (see [Return Types](/docs/plugin_overview#return-types)) |
| `send_error_msg(errors, filepath)` | Logs the lines that couldn't be parsed |
| `run_cli()` | Lets the parser be run from the command line for testing |

To fail a whole file (e.g. a required calibration file is missing), raise an exception.
The plugin logs it, and the file gets no dashboard data.

For map data, add GeoJSON `FeatureCollection`s instead of series: a `LineString` for a
track, or `Point`s for positions, with ISO 8601 times (`format_iso8601()`) in their
properties.  `gga_parser.py.dist` and the CTD and XBT position parsers are examples.

## 2. Test the Parser

Run it on a sample file from the OpenVDM root with the venv's Python:

```bash
cd /opt/openvdm
./venv/bin/python server/plugins/parsers/paro_parser.py --help
./venv/bin/python server/plugins/parsers/paro_parser.py /path/to/sample.txt
```

It prints the plugin data as JSON: check the series, stats and quality tests.

## 3. Write the Plugin

The plugin is named after the collection system transfer: for a transfer named `ROV`,
it's `server/plugins/rov_plugin.py`.  Copy `openrvdas_plugin.py.dist`, which runs every
parser whose pattern matches, and change its filters and parsers:

```python
from server.plugins.parsers.paro_parser import ParoParser

fileTypeFilters = [
    {"data_type": "paro", "regex": "*/paro/*.txt", "parser": "Paro", "parser_options": {}},
]

class ROVPlugin(OpenVDMPlugin):
    PARSER_MAP = {
        "Paro": ParoParser,
    }
    ...
```

Each filter has:

| Key | Description |
|---|---|
| `data_type` | The name the dashboard uses for this data, in [datadashboard.yaml](/docs/config_data_dashboard_yaml).  Lower case, no spaces |
| `regex` | A glob pattern matched against the file's full path |
| `parser` | The parser's key in `PARSER_MAP` |
| `parser_options` | Options passed to the parser's constructor, e.g. `{"time_format": "%Y-%m-%dT%H:%M:%S.%fZ"}` |

Several filters can match the same file, each producing its own data type.  The module
must define `process_file(filepath)`, and can define `get_source_files(filepath)` (see
[Module-Level Functions](/docs/plugin_overview#module-level-functions)).

Test the plugin the same way as the parser:

```bash
./venv/bin/python server/plugins/rov_plugin.py /path/to/cruise/ROV/paro/sample.txt
```

## 4. Show the Data

Add a panel for the new data type to a tab in
[datadashboard.yaml](/docs/config_data_dashboard_yaml).  For a chart panel, the panel's
`id` is the data type:

```yaml
  - plotType: chart
    id: paro
    heading: ROV Depth
    dataArray:
    - dataType: paro
      visType: json-reversedY
```

## 5. Run It

Restart the data dashboard worker so it loads the new plugin, then rebuild the dashboard
to process the files already transferred:

```bash
sudo supervisorctl restart openvdm:data_dashboard
```

Then run **Rebuild Data Dashboard** under **Maintenance Tasks** on the **Configuration**
page.  New files are processed after each transfer from then on.  Problems are logged in
`/var/log/openvdm/data_dashboard.log`.

## Libraries

If a parser needs a Python package that isn't in `requirements.txt`, install it into
OpenVDM's venv (`/opt/openvdm/venv/bin/pip install <package>`).  The installer
rebuilds the venv when it changes Python versions, so note what you've added and
install it again after an upgrade.
