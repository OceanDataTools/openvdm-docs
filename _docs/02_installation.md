---
permalink: /docs/installation
title: "Installation"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM is installed by a single interactive script, `utils/install-openvdm.sh`.  The
full instructions are in
[INSTALL.md](https://github.com/OceanDataTools/openvdm/blob/master/INSTALL.md).

## Prerequisites

- A supported operating system:
  - Debian 12 or 13
  - Ubuntu 22.04, 24.04 or 26.04
  - Rocky Linux or AlmaLinux 8, 9 or 10
- Root access
- Internet access, to install packages
- Disk space for the cruise data, under the data root directory (`/data` by default)

For a remote install, install the SSH server first (`apt install ssh` or
`dnf install openssh-server`).

## Running the Install Script

Download the script and run it as root:

```bash
export OPENVDM_REPO=raw.githubusercontent.com/oceandatatools/openvdm
export BRANCH=master
wget -O install-openvdm.sh https://$OPENVDM_REPO/$BRANCH/utils/install-openvdm.sh
sudo bash ./install-openvdm.sh
```

The script asks these questions.  Press Enter to accept the default.  On a re-run, the
defaults are your previous answers.

| Question | Default | Notes |
|---|---|---|
| Name to assign to host | the current hostname | |
| OpenVDM install root directory | `/opt` | OpenVDM goes in `<root>/openvdm` |
| Repository and branch to install | the OceanDataTools repository, `master` | |
| IP address or URL users will access OpenVDM from | `127.0.0.1` | Used for `siteRoot` in `openvdm.yaml` |
| OpenVDM user to create | `survey` | Owns the data and the web app, and is the MySQL user |
| MySQL root password | | Leave blank on a first install |
| Password for the OpenVDM MySQL user | the MySQL root password | Also used for the user's Samba login |
| Root data directory | `/data` | Holds `CruiseData` and the shares |
| Supervisor web interface | No | Optionally with a username and password |
| MapProxy | No | Caches basemap tiles for use without internet access |
| TiTiler | No | Serves GeoTIFFs (e.g. bathymetry grids) as map tiles |
| PublicData share | Yes | A Samba share copied into each cruise |
| VisitorInformation share | No | A guest-accessible Samba share for visitors |
| Sample data | No | See [Sample Data](#sample-data) |

## What It Installs

- Apache with PHP (8.2 on Rocky/AlmaLinux 8 and 9, 8.3 on Debian/Ubuntu and RHEL 10,
  8.5 on Ubuntu 26.04)
- MySQL or MariaDB
- Python 3.11–3.14, and a virtual environment in `<root>/openvdm/venv`
- Gearman and Supervisor
- Node.js (nvm) and Composer, which build the web app as the OpenVDM user
- Samba and `cifs-utils`, for SMB shares and SMB transfers
- rsync, rclone and `sshpass`, for transfers
- `fuse3`, for FTP Server collection system transfers
- GDAL, used by the GeoTIFF parsers
- an SSH key for root, used by transfers set to use SSH keys (see
  [Using an SSH key](/docs/transfer_types#using-an-ssh-key))
- optionally MapProxy and TiTiler

It also writes `Config.php`, `openvdm.yaml` (with a new worker API key) and
`datadashboard.yaml`, and the Apache, Samba and [Supervisor](/docs/supervisor_setup)
configuration.

## Sample Data

Answering **Yes** to the sample data question installs the
[sample data](https://github.com/OceanDataTools/openvdm_sample_data) and sets OpenVDM up
to use it:

- a sample cruise (in the Gulf of Mexico) and its collection system transfers, with
  sample sources served by a local rsync server, Samba share and FTP server (port 2121);
- the sample plugins and parsers, including the CTD and XBT ones;
- lowering components turned on, a sample lowering, and the example Lowering tab in
  `datadashboard.yaml`.

Use it to try OpenVDM out, not on a server you'll use for real cruises.

## Updating an Existing Installation

Re-run the install script.  It's safe on an existing install, but it rewrites
`Config.php`, and some upgrades need a database update.  See
[Upgrading OpenVDM](/docs/upgrading).

## Directory Layout After Install

```
<install_root>/openvdm/
├── bin/                  Utility scripts (.py.dist templates)
├── database/             Schema and database update scripts
├── server/
│   ├── etc/              openvdm.yaml
│   ├── lib/              Core Python libraries
│   ├── plugins/          Data dashboard plugins
│   │   └── parsers/      Data dashboard parsers
│   └── workers/          Gearman workers
├── utils/                Install script, database export script
├── venv/                 Python virtual environment
└── www/                  Web application
    ├── app/Core/         Config.php
    └── etc/              datadashboard.yaml
```

Transfer logs and the worker logs are in `/var/log/openvdm/`.
