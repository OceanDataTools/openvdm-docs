---
permalink: /docs/cdt_overview
title: "Cruise Data Transfers"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

A **Cruise Data Transfer (CDT)** copies the whole cruise data package from the
shipboard data warehouse to another location: a backup drive, a NAS, a server or cloud
storage.

## How It Works

1. The **scheduler** starts each enabled cruise data transfer that isn't already running,
   every `transferInterval` minutes (see [openvdm.yaml](/docs/config_openvdm_yaml)).  A
   transfer can also be started from the main page, and they all run at the end of
   [Finalize Current Cruise](/docs/cruise_lifecycle#3-finalize-current-cruise).
2. The worker tests the destination, builds the list of what to leave out, then copies
   `<warehouse_base_dir>/<cruiseID>/` to the destination with `rsync` or rclone.  The
   list always includes the
   [always-ignored files and folders](/docs/cst_overview#always-ignored-files-and-folders).
3. Progress is shown as a percentage on the main page.

If `rsync` or rclone fails, the transfer fails, and the reason includes the tool's error
and the first file that failed.

## Destination Directory

How the **Destination Directory** is used depends on the transfer type.  The cruise is
copied into `<destination directory>/<cruiseID>`.

| Transfer type | Destination Directory |
|---|---|
| Local Directory | An absolute path on the OpenVDM server (leading `/`), e.g. `/mnt/backup` |
| Local Directory, containing `:` | An [rclone](/docs/transfer_types#rclone) `remote:path`, e.g. `s3-archive:cruises` |
| Rsync Server | A path within the rsync module given in the **Rsync Server** field; `/` for the module's top level |
| SMB Share | A path within the share given in the **SMB Server/Share** field; `/` for the share's top level |
| SSH Server | An absolute path on the server (leading `/`) |
| FTP Server | An absolute path on the FTP server (leading `/`) |

A `:` is allowed only for Local Directory.

## Configuration Fields

Navigate to **Configuration → Cruise Data Transfers → Add/Edit**.  The connection fields
for each transfer type are described in [Transfer Types](/docs/transfer_types).

| Field | Description |
|---|---|
| **Name / Long Name** | Identifiers shown in the web interface |
| **Transfer Type** | See [Transfer Types](/docs/transfer_types) |
| **Destination Directory** | See [above](#destination-directory) |
| **Destination Directory is mountpoint?** | Local Directory only: fail if nothing is mounted there, rather than filling the OpenVDM server's disk |
| **Skip empty directories** / **Skip empty files** | Don't copy empty directories or zero-byte files |
| **Sync with source directory** | Delete files at the destination that are no longer in the cruise |
| **Transfer bandwidth limit** | Maximum rate in kB/s; `0` for no limit |
| **Include OpenVDM generated files?** | Include the cruise and lowering configuration files and the MD5 summary |
| **Collection Systems to EXCLUDE** | Collection system transfers whose directories aren't copied |
| **Extra Directories to EXCLUDE** | Extra directories that aren't copied |

## Test Setup

**Test Setup** checks the destination without copying anything: that the server can be
reached and the login works, that the destination directory exists, and that OpenVDM can
write to it.  Fix any failed check before running the transfer.
