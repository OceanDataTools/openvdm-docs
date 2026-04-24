---
permalink: /docs/installation
title: "Installation"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM is designed for Ubuntu/Debian Linux.  Installation is handled by a single
interactive shell script.

## Prerequisites

- Ubuntu 20.04 LTS or later (or Debian equivalent)
- A user account with `sudo` privileges
- Internet access (to install packages)
- At least 20 GB of disk space for the application itself (additional space required
  for cruise data)

## Running the Install Script

Clone the repository and run the install script as your regular user (not root):

```bash
git clone https://github.com/OceanDataTools/openvdm.git
cd openvdm
bash utils/install-openvdm.sh
```

The script will prompt you for:

| Prompt | Default | Notes |
|---|---|---|
| Install root directory | `/opt` | Parent of the `openvdm/` directory |
| OpenVDM username | `survey` | System user that runs OpenVDM workers |
| Data root directory | `/data` | Parent of `CruiseData/` and `PublicData/` |
| MySQL root password | _(empty on first run)_ | Set during install |
| OpenVDM DB/user password | `survey` | Used for the MySQL OpenVDM user and SMB share |

The script installs and configures:

- Apache 2 with `mod_rewrite`
- PHP 8.x with required extensions
- MySQL / MariaDB
- Python 3 virtual environment (`venv/`)
- Gearman job server
- Supervisor
- Node.js / npm (for frontend asset building)
- Samba (for optional SMB source mounts)

## Post-Install Steps

### Copy configuration files

```bash
cp server/etc/openvdm.yaml.dist server/etc/openvdm.yaml
```

Edit `server/etc/openvdm.yaml` to configure the Gearman server address, plugin
directory, and any post-hook commands.

### Activate the Python virtual environment

```bash
source venv/bin/activate
```

### Build frontend assets

```bash
cd www/
npm install
```

### Verify Supervisor workers are running

```bash
sudo supervisorctl status
```

All OpenVDM workers should show `RUNNING`.

## Updating an Existing Installation

Re-run the install script against the existing installation root.  It detects an
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
│   └── workers/          Gearman worker processes
├── utils/                Install script
├── venv/                 Python virtual environment
└── www/                  PHP/JS web application
```
