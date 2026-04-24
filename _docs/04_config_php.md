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
define('DB_TYPE', 'mysql');
define('DB_HOST', 'localhost');
define('DB_NAME', 'openvdm');
define('DB_USER', 'survey');        // Set to your OpenVDM DB username
define('DB_PASS', 'your_password'); // Set to your OpenVDM DB password
```

## Path Settings

```php
define('CRUISEDATA_BASEDIR', '/data/CruiseData');
define('PUBLICDATA_DIR',     '/data/PublicData');
```

`CRUISEDATA_BASEDIR` is the root of the shipboard data warehouse — the directory
that contains per-cruise subdirectories.

`PUBLICDATA_DIR` is an optional shared public data mount (e.g. an NFS share exposed
to science party laptops).  The `From_PublicData` collection system transfer, if
active, syncs from this path into the cruise package.

## Site Settings

```php
define('SITE_ROOT', '/');        // URL path to the OpenVDM web application
define('OPENVDM_VERSION', '2.x');
```

## Gearman

```php
define('GEARMAN_HOST', 'localhost');
define('GEARMAN_PORT', '4730');
```

These must match the `gearmanServer` value in `openvdm.yaml`.
