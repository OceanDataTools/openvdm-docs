---
permalink: /docs/cst_overview
title: "Collection System Transfers"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

A **Collection System Transfer (CST)** pulls raw data files from an instrument or
data-acquisition computer into the shipboard data warehouse on a recurring schedule.

## How It Works

1. The **scheduler** starts each enabled collection system transfer that isn't already
   running, every `transferInterval` minutes (see
   [openvdm.yaml](config_openvdm_yaml)).  A transfer can also be started from the
   main page.
2. The **run_collection_system_transfer** worker tests the source, mounts it if it's an
   SMB share or FTP server, lists the source, and copies new and updated files into the
   transfer's directory in the cruise package with `rsync`.
3. On completion, the worker starts an `updateDataDashboard` job so the transfer's
   [plugin](plugin_overview) can process the new files, an MD5 summary update,
   and any [post-hook commands](post_hooks).

If `rsync` fails, the transfer fails, and the reason includes rsync's error and the
first file that failed.  Files copied before the failure are still processed.

## Configuration Fields

Navigate to **Configuration → Collection System Transfers → Add/Edit**.  The connection
fields for each transfer type (server, username, password, ...) are described in
[Transfer Types](transfer_types).

### Basic Settings

| Field | Description |
|---|---|
| **Name** | Short name, without spaces.  Also names the transfer's [plugin](plugin_overview#plugin-discovery) and is the `{collectionSystemTransferName}` hook token |
| **Long Name** | Name shown in the web interface |
| **Cruise or Lowering?** | Whether the transfer copies into the cruise or into the current lowering.  Shown only when lowering components are on |
| **Transfer Type** | See [Transfer Types](transfer_types) |
| **Source Directory** | Where the files are on the source.  May contain [wildcards](#wildcard-source-directories) |
| **Source Directory is mountpoint?** | Local Directory only: fail if nothing is mounted there |
| **Destination Directory** | Path inside the cruise (or lowering) directory.  May contain [tokens](#destination-directory-tokens) |

### Filters

Each filter is a comma-separated list of glob patterns.

| Field | Description |
|---|---|
| **Include Filter** | Only matching files are transferred |
| **Exclude Filter** | Matching files aren't transferred, and are listed as incorrectly named files on the main page |
| **Ignore Filter** | Matching files aren't transferred, silently |

### Transfer Behaviour

| Field | Description |
|---|---|
| **Skip files created/modified outside of cruise start/stop times?** | Transfer only files whose modification time is within the cruise (or lowering) start and end times |
| **Skip files being actively written to?** | Transfer a file only once its size hasn't changed for the **Time to wait when checking for active writes** |
| **Remove source files after copy?** | Delete files from the source once they've been copied |
| **Skip empty directories** / **Skip empty files** | Don't copy empty directories or zero-byte files |
| **Sync with source directory?** | Delete files from the destination that are no longer on the source |
| **Transfer bandwidth limit** | Maximum rate in kB/s; `0` for no limit |

### Test Setup

**Test Setup** checks the source without copying anything: that the server can be
reached and the login works, and that the source directory exists.  For a transfer that
removes source files, it also checks that OpenVDM can write to the source.

## Always-Ignored Files and Folders

Some files and folders are never instrument data, so every transfer leaves them out,
whatever its filters. Collection system transfers skip these folders while listing the
source, without opening them. A folder the transfer account can't read, such as
`lost+found`, therefore doesn't cause a [listing error](#source-listing-errors), and
large folders such as snapshots aren't scanned on every run. Cruise data and
ship-to-shore transfers leave out the same files and folders.

| Source | Folders (and everything in them) | Files |
|---|---|---|
| OS clutter | `@eaDir` (Synology thumbnails) | `.DS_Store`, `._*`, `Thumbs.db`, `ehthumbs.db`, `desktop.ini` |
| rsync | | Temporary files of transfers still running (`.<name>.XXXXXX`) |
| Linux / NFS | `lost+found`, `.Trash-*` | `.nfs*` (NFS files still in use after deletion) |
| Windows drives, USB, SMB | `$RECYCLE.BIN`, `System Volume Information` | |
| macOS volumes | `.Trashes`, `.Spotlight-V100`, `.fseventsd`, `.TemporaryItems`, `.DocumentRevisions-V100` | |
| NAS | `#recycle` (Synology), `.snapshot` / `~snapshot` (NetApp), `.zfs` (ZFS) | |
| Office apps | | `~$*` (Word/Excel lock files), `.~lock.*#` (LibreOffice lock files) |

These match at any depth in the source, by the whole name (`*` is a wildcard), so
`lost+found.txt` or a folder named `snapshot` is still transferred. Temporary files such as `*.tmp` or
`*.part` aren't on the list, because some instruments use those names; use
**Staleness** to skip files that are still being written, or add them to the
**Ignore Filters**.

## Source Listing Errors

Before copying anything, the transfer lists the source. A listing that fails would
look like a source with missing files, and with **Sync from Source** those files would
be deleted from the destination. So:

- If the source can't be listed at all (e.g. the server is down, the rsync module
  doesn't exist, or the SMB share or FTP server returns an error), the transfer fails,
  and the reason includes the error.
- If an **rsync** or **SSH** source is listed only partly (rsync exit code 23, usually
  a folder the transfer account can't read):
  - with **Sync from Source** on, the transfer fails;
  - with it off, the unreadable paths are logged as warnings and the files that were
    listed are copied.
- For a **Local Directory** source, unreadable folders are logged as warnings and
  skipped. For an **SMB** or **FTP** source, any listing error fails the transfer,
  since there it usually means a network problem.

The same applies to the second listing made when **Staleness** is set. The
[always-ignored folders](#always-ignored-files-and-folders) aren't listed, so they
never cause these errors.

## Wildcard Source Directories

Source directory paths may include glob wildcards (e.g. `data/*/raw/`).  OpenVDM
expands the wildcard against the source filesystem and merges results from all
matching directories into the single configured destination directory.

## Destination Directory Tokens

The destination directory path may include `{cruiseID}` and `{loweringID}` tokens,
which are substituted with the current cruise and lowering identifiers at transfer
time.

## Statuses

| Status | Meaning |
|---|---|
| **Idle** | Enabled, and waiting for its next run |
| **Running** | Transfer in progress |
| **Error** | The last run failed; the reason is on the main page and in the transfer log |
| **Disabled** | Turned off; the scheduler doesn't start it |
