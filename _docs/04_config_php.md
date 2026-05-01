---
permalink: /docs/config_php
title: "Config.php"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

`www/app/Core/Config.php` configures the web application.  It is generated from
`Config.php.dist` by the install script.  If you need to regenerate it manually,
copy the `.dist` file and update the values below.

## Database Settings

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'openvdm');
define('DB_USER', 'survey');// Set to your OpenVDM DB username
define('DB_PASS', 'your_password'); // Set to your OpenVDM DB password
```

## Site Settings

Define what to call the cruise. (i.e. 'Cruise', 'Expedition', 'Voyage') and define
what to call the lowering. (i.e. 'Lowering', 'Dive', 'Deployment')
```php
define('CRUISE_NAME', 'Cruise');
define('LOWERING_NAME', 'Lowering');
```

Define whether to include cruise dates in UI header
Set a custom title for the WebUI.
```php
define('SHOW_CRUISE_META_IN_UI', false);
define('SITETITLE', 'Open Vessel Data Management v2.15.0');
```

## Path Settings

`CRUISEDATA_BASEDIR` is the root of the shipboard data warehouse — the directory
that contains per-cruise subdirectories.

`PUBLICDATA_DIR` is an optional shared public data mount (e.g. an NFS share exposed
to science party laptops).  The `From_PublicData` collection system transfer, if
active, syncs from this path into the cruise package.

`TRANSFER_LOG_DIR` is the directory where transfer log files are stored.
```php
define('CRUISEDATA_BASEDIR', '/data/CruiseData');
define('PUBLICDATA_DIR',     '/data/PublicData');
define('TRANSFER_LOG_DIR', '/var/log/openvdm');
```

## Transfer Behavior Settings

Directory within cruise directory to store data from lowerings.
```php
define('LOWERINGDATA_BASEDIR', 'Vehicle');
```

Define what to name the cruise and lowering config files.
```php
define('CRUISE_CONFIG_FN', 'cruise_config.json');
define('LOWERING_CONFIG_FN', 'lowering_config.json');
```

Define what to name the MD5 checksum manifest and manifest checksum files.
```php
define('MD5_SUMMARY_FN', 'md5_summary.txt');
define('MD5_SUMMARY_MD5_FN', 'md5_summary.md5');
```

Define what to name the data dashboard manifest file.
```php
define('DATA_DASHBOARD_MANIFEST_FN', 'manifest.json');
```
