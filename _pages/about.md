---
permalink: /about/
title: "About OpenVDM"
layout: single
author_profile: true
---

**OpenVDM** is a ship-wide data management platform developed by the
[OceanDataTools](https://www.oceandatatools.org) project to support scientific
research vessels and remotely operated vehicles.

It automates the collection, organisation, and distribution of data from multiple
instrument and data-acquisition systems into a unified, consistently structured
cruise data package.  Once a cruise is complete the package can be transferred to a
shoreside archive, submitted to a national data repository, or made available to the
science party with minimal manual effort.

## Key Capabilities

- Automated, scheduled data ingestion from instruments over local networks using
  rsync, SMB, SSH, and rclone
- Web-based administration and real-time operational dashboard
- Plugin architecture for custom per-file parsing and visualisation
- Cruise and lowering lifecycle management with finalization and archival workflows
- Continuous ship-to-shore synchronisation over satellite links
- MD5 checksum tracking for data integrity verification

## License

OpenVDM is released under the [MIT License](https://opensource.org/license/mit).

## Contributing

Bug reports, feature requests, and pull requests are welcome on
[GitHub](https://github.com/OceanDataTools/openvdm).

## Contact

For questions or support contact [info@oceandatatools.org](mailto:info@oceandatatools.org).
