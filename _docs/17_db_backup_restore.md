---
permalink: /docs/db_backup_restore
title: "Database Backup & Restore"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM includes a utility script for backing up and restoring the MySQL database.
The script reads database credentials directly from `www/app/Core/Config.php` so
no separate credentials file is required.

## Setup

The script is provided as a template in `bin/db_backup_restore.py.dist`.  Copy it
before use:

```bash
cp bin/db_backup_restore.py.dist bin/db_backup_restore.py
```

Backup files are stored in `database/backups/` by default (created automatically
on first run).  This directory is excluded from version control.

## Creating a Backup

```bash
source venv/bin/activate
python bin/db_backup_restore.py backup
```

The script creates a timestamped SQL file:

```
database/backups/openvdm_20240115_143022.sql
```

**What is backed up:**
- All table structures (schema)
- All table data, with one exception

**What is excluded from data:**
- `OVDM_Messages` rows — message history is ephemeral and excluded to keep backups
  small.  The table structure is still preserved so the database can be restored
  cleanly.

### Custom Backup Directory

```bash
python bin/db_backup_restore.py backup --output-dir /mnt/backup_drive/openvdm_db/
```

## Restoring from a Backup

### Interactive Selection

Run without arguments to choose from available backups:

```bash
python bin/db_backup_restore.py restore
```

```
Available backups:
  1) openvdm_20240115_143022.sql
  2) openvdm_20240110_090000.sql
  3) openvdm_20240105_120000.sql
  0) Cancel

Select backup to restore [0-3]:
```

### Direct Restore

```bash
python bin/db_backup_restore.py restore database/backups/openvdm_20240115_143022.sql
```

## Another Config.php

The credentials are read from `www/app/Core/Config.php` by default.  Use `--config` to
read them from another file:

```bash
python bin/db_backup_restore.py --config /path/to/Config.php backup
```

## Verbosity

Add `-v` flags to increase output detail:

```bash
python bin/db_backup_restore.py -v backup    # INFO level
python bin/db_backup_restore.py -vv backup   # DEBUG level
```

## Prerequisites

The script uses the MySQL client tools (`mysqldump` and `mysql`), which the OpenVDM
installer installs with the database server.

## The Database Export Script

`utils/export_openvdm_db.sh` is a simpler alternative, used in the
[upgrade](upgrading) instructions.  Run as root, it dumps the database (also
without the message rows) to standard output, asking for the MySQL root password twice:

```bash
sudo bash ./utils/export_openvdm_db.sh > ~/openvdm_backup.sql
```
