---
permalink: /docs/upgrading
title: "Upgrading OpenVDM"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM is upgraded by re-running the install script over the existing install.  The
step-by-step instructions for each release are in
[INSTALL.md](https://github.com/OceanDataTools/openvdm/blob/master/INSTALL.md), and what
changed in each release is in
[CHANGELOG.md](https://github.com/OceanDataTools/openvdm/blob/master/CHANGELOG.md).  This
page summarizes them.

## What the Installer Does and Doesn't Update

Re-running `utils/install-openvdm.sh` is safe on an existing install.  It asks the same
questions as the original install, with your previous answers as the defaults, and:

- pulls the latest code and runs `composer install --no-dev` and `npm install` as the
  OpenVDM user;
- installs Python 3.11 or later, and rebuilds the virtual environment (`venv/`) if it
  was made with another Python version.  Anything you installed into the venv yourself
  has to be installed again;
- **always rewrites `www/app/Core/Config.php`** from `Config.php.dist`;
- builds `server/etc/openvdm.yaml` and `www/etc/datadashboard.yaml` from their `.dist`
  templates **only if they don't exist**;
- copies a plugin, parser or `bin/` script `.dist` template only if your copy doesn't
  exist yet;
- rewrites the Apache, Samba and Supervisor configuration;
- **doesn't change the database.**  Database updates are run by hand (see below).

So before re-running it, set your settings files aside, and afterwards merge your
changes into the new ones.

## Upgrading from 2.15 to 2.16

1. Set OpenVDM to **Off** and wait until no transfers or tasks are running.
2. Set the three settings files aside, as the OpenVDM user, then update the code and
   re-run the installer:
   ```bash
   cd <openvdm_root>
   sudo -u <openvdm_user> cp www/app/Core/Config.php www/app/Core/Config.php.215
   sudo -u <openvdm_user> mv server/etc/openvdm.yaml server/etc/openvdm.yaml.215
   sudo -u <openvdm_user> mv www/etc/datadashboard.yaml www/etc/datadashboard.yaml.215
   sudo -u <openvdm_user> git pull --ff-only
   sudo bash ./utils/install-openvdm.sh
   ```
   `Config.php` is copied rather than moved because the installer reads the worker API
   key from it.
3. Back up the database and run the 2.16 update, which adds the FTP Server transfer
   type:
   ```bash
   sudo bash ./utils/export_openvdm_db.sh > ~/openvdm_backup_before_2.16.sql
   mysql -u root -p openvdm < ./database/openvdm_215_to_216.sql
   ```
   Run it once; a second run stops with `Duplicate column name 'ftpServer'`.
4. Copy the updated `.dist` templates you use over your copies (merge instead if you've
   customized them):
   - the GeoTIFF, TSG45, HPR and GNSS parsers;
   - `server/plugins/rov_openrvdas_plugin.py` (keep your `SEALOG_SERVER_URL` and
     `SEALOG_JWT`);
   - `bin/build_remote_directory.py`;
   - `www/app/templates/default/js/custom1.js` (CARTO basemaps now need an API key).
5. Merge your settings from the `.215` copies into the new files (`diff` shows the
   differences).  Keep the new `openvdm.yaml`'s `workerApiKey` and `transferPublicData`.
   In your `datadashboard.yaml`, remove `lowering` from the Position tab's `jsArray`,
   and add `charts-zoom` to any Lowering tab (see
   [datadashboard.yaml](/docs/config_data_dashboard_yaml)).
6. Restart the workers and set OpenVDM back to **On**:
   ```bash
   sudo supervisorctl restart openvdm:*
   ```
7. Run **Rebuild Data Dashboard** under **Maintenance Tasks** on the **Configuration**
   page.

## Upgrading from 2.14 to 2.16

2.15 moved to PHP 8.2, and 2.16 needs Python 3.11 or later.  There are two routes, and
both run both database updates, in order:

```bash
mysql -u root -p openvdm < ./database/openvdm_214_to_215.sql
mysql -u root -p openvdm < ./database/openvdm_215_to_216.sql
```

- **In place** (Rocky Linux / AlmaLinux 8 or 9): set the settings files aside as `.214`
  copies, check out `master`, and re-run the installer, which moves PHP to 8.2.
- **On a fresh OS** (and always on Debian/Ubuntu, where 2.14 used Apache's PHP 7.3
  module): install 2.16 on a new server, restore the 2.14 database backup, run the two
  updates, and check the Shipboard Data Warehouse settings under **Configuration →
  System**.

Then merge your settings, bring each plugin and parser you use up to its 2.16 `.dist`
template, and run the **Maintenance Tasks** (Rebuild Cruise Directory, Re-export the
OpenVDM Configuration, Rebuild Data Dashboard, Rebuild MD5 Summary).  Follow "Upgrading
from 2.14" in INSTALL.md for the full steps.

2.15 moved transfer logs out of the cruise directory to `/var/log/openvdm`
(`TRANSFER_LOG_DIR` in [Config.php](/docs/config_php)), and `openvdm_214_to_215.sql`
removes the old `Transfer_Logs` extra directory.

## Older Releases

| From | Database update |
|---|---|
| 2.10 → 2.11 | `database/openvdm_210_to_211.sql` |
| 2.8 → 2.9 | `database/openvdm_28_to_29.sql` |
| 2.7 → 2.8 | `database/openvdm_27_to_28.sql` |

INSTALL.md has the steps for each.

## Backing Up First

Back up the database before any upgrade, with `utils/export_openvdm_db.sh` as above or
with the [backup and restore script](/docs/db_backup_restore).  If the server is a
virtual machine, take a snapshot too.
