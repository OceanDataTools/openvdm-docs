---
permalink: /docs/plugin_quality_tests
title: "Quality Test Plugins"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

Quality test plugins validate instrument files as they are ingested and surface
pass/fail/warning results in the data dashboard alongside the data visualisations.

## Base Class

Quality test plugins subclass `OpenVDMParserQualityTest` from
`server/lib/openvdm_plugin.py`.

```python
from server.lib.openvdm_plugin import OpenVDMParserQualityTest

class MyInstrumentQualityTest(OpenVDMParserQualityTest):

    def __init__(self):
        self.name = "My Instrument Quality Test"
        self.description = "Validates My Instrument CSV files"
        self.data_type = "my_instrument_qc"
        self.file_patterns = ["*.myinst.csv"]
        super().__init__()

    def run_test(self, filepath):
        """Run quality checks on filepath and return a results list."""
        results = []

        try:
            rows, bad_rows = self._parse_and_validate(filepath)

            results.append({
                "test": "Row count",
                "result": "Pass" if rows > 0 else "Fail",
                "details": f"{rows} valid rows"
            })

            if bad_rows:
                results.append({
                    "test": "Malformed rows",
                    "result": "Warning",
                    "details": f"Bad rows: {', '.join(bad_rows)}"
                })

        except Exception as err:
            results.append({
                "test": "File parse",
                "result": "Fail",
                "details": str(err)
            })

        return results
```

## Result Object Format

Each result in the list returned by `run_test()` should be a dict with:

| Key | Values | Description |
|---|---|---|
| `test` | any string | Name of the individual check |
| `result` | `"Pass"`, `"Fail"`, `"Warning"` | Outcome |
| `details` | any string | Human-readable explanation |

## Condensing Row Numbers

For file-parsing errors that affect many rows, use
`server.lib.condense_to_ranges.condense_to_ranges` to produce compact error
messages:

```python
from server.lib.condense_to_ranges import condense_to_ranges

bad = [1, 2, 3, 7, 8, 100]
msg = "Bad rows: " + ", ".join(condense_to_ranges(bad))
# "Bad rows: 1-3, 7-8, 100"
```

## Combining Data and Quality Tests

A single plugin file can contain both a data plugin class and a quality test class.
The dashboard worker detects each independently based on their base class.
