---
permalink: /docs/upgrading
title: "Upgrading OpenVDM"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

## General Upgrade Procedure

1. **Back up the database** before any upgrade:
   ```bash
   source venv/bin/activate
   python bin/db_backup_restore.py backup
   ```

2. **Pull the latest code:**
   ```bash
   git pull origin master
   ```

3. **Check for database migration scripts** in the `database/` directory.  Scripts
   are named `openvdm_<old>_to_<new>.sql` — run any that apply to your upgrade path:
   ```bash
   mysql -u openvdmDBUser -p openvdm < database/openvdm_214_to_215.sql
   ```

4. **Update Python dependencies:**
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Update PHP/JS dependencies:**
   ```bash
   cd www/
   composer install
   bash post_composer.sh
   npm install
   ```

6. **Re-run the install script** to pick up any new Supervisor configurations,
   Apache vhost changes, or system package requirements:
   ```bash
   bash utils/install-openvdm.sh
   ```

7. **Restart all workers:**
   ```bash
   sudo supervisorctl restart all
   ```

8. **Verify** the web interface loads and all workers show `RUNNING`:
   ```bash
   sudo supervisorctl status
   ```

## Version-Specific Notes

### 2.14 → 2.15

- Transfer log files moved to `OpenVDM/TransferLogs/` inside the cruise directory.
  Run `database/openvdm_214_to_215.sql` to update the database schema.
- PHP 8.2 compatibility fixes applied to the web frontend.

### 2.10 → 2.11

- Run `database/openvdm_210_to_211.sql`.

### 2.7 → 2.8

- Run `database/openvdm_27_to_28.sql`.

### 2.8 → 2.9

- Run `database/openvdm_28_to_29.sql`.
