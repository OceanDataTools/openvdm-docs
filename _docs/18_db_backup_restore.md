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

## Verbosity

Add `-v` flags to increase output detail:

```bash
python bin/db_backup_restore.py -v backup    # INFO level
python bin/db_backup_restore.py -vv backup   # DEBUG level
```

## Prerequisites

The MySQL client tools (`mysqldump` and `mysql`) must be installed and on the PATH.
On Ubuntu/Debian:

```bash
sudo apt install mysql-client
```
