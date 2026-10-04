---
permalink: /docs/installation
title: "Installation"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM is designed for Ubuntu/Debian, and Rocky/Alma Linux.  Installation is handled by a single
interactive shell script.

## Prerequisites

- A supported Operating System (Debian 12/13, Ubuntu 22.04/24.04, Alma 8/9, Rocky 8/9)
- A user account with `sudo` privileges
- Internet access (to install packages)
- At least 20 GB of disk space for the application itself (additional space required
  for cruise data)

## Running the Install Script

Download and run the install script as your regular user (not root):

```bash
export OPENVDM_REPO=raw.githubusercontent.com/oceandatatools/openvdm
export BRANCH=master
wget -O install-openvdm.sh https://$OPENVDM_REPO/$BRANCH/utils/install-openvdm.sh
bash ./install-openvdm.sh
```

The script will prompt you for:

| Prompt | Default | Notes |
|---|---|---|
| Install root directory | `/opt` | Parent of the `openvdm/` directory |
| OpenVDM username | `survey` | System user that runs OpenVDM workers |
| Data root directory | `/data` | Parent of `CruiseData/` and `PublicData/` |
| MySQL root password | _(empty on first run)_ | Set during install |
| OpenVDM DB/user password | `survey` | Used for the MySQL OpenVDM user and SMB share |
| Install optional components | No | Titiler, Mapproxy, Sample Configurations | 

The script installs and configures:

- Apache 2 with `mod_rewrite`
- PHP 8.x with required extensions
- MySQL / MariaDB
- Python 3 virtual environment (`venv/`)
- Gearman job server
- Supervisor
- Node.js / npm (for frontend asset building)
- Samba (for optional SMB source mounts)
- Titiler (Optional, used for rastered geo-spacial datasets)
- Mapproxy (Optional, used for caching background map tilesets)

## Updating an Existing Installation

Re-download and re-run the install script against the existing installation root.  It detects an
existing installation and applies only the changes needed for the current version.
Check `database/` for any SQL migration scripts required between your current and
target versions.

## Directory Layout After Install

```
<install_root>/openvdm/
├── bin/                  Sample utility scripts (.py.dist)
├── database/             Schema and migration SQL files
├── server/
│   ├── etc/              openvdm.yaml
│   ├── lib/              Core Python libraries
│   ├── plugins/          Data-dashboard plugins
│   │   └── parsers/      Data-dashboard parsers
│   └── workers/          Gearman worker processes
├── utils/                Install script
├── venv/                 Python virtual environment
└── www/                  PHP/JS web application
    ├── app/Core          Config.php
    └── etc/              datadashboard.yaml
```
