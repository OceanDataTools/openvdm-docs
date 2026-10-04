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

1. The **scheduler** worker submits a `runCollectionSystemTransfer` Gearman job at
   the configured interval for each active, non-running transfer.
2. The **run_collection_system_transfer** worker picks up the job, tests the source,
   mounts any required shares, and runs `rsync` (or rclone) to copy new and updated
   files into the destination directory inside the cruise package.
3. On completion, the worker submits an `updateDataDashboard` job so plugins can
   process any newly transferred files.

## Configuration Fields

Navigate to **Configuration → Collection System Transfers → Add/Edit** in the web
interface to manage transfers.

### Basic Settings

| Field | Description |
|---|---|
| **Name** | Short identifier (used in hook token `{collectionSystemTransferName}`) |
| **Long Name** | Human-readable display name |
| **Cruise or Lowering** | Whether this transfer is scoped to a cruise or a lowering |
| **Destination Directory** | Path inside the cruise/lowering directory |
| **Transfer Type** | See [Transfer Types](/docs/transfer_types) |
| **Enabled** | Whether the scheduler should submit jobs for this transfer |

### Source Filters

| Field | Description |
|---|---|
| **Include Filters** | Glob patterns — only matching files are transferred |
| **Exclude Filters** | Glob patterns — matching files are skipped, but will be flagged as incorrectly names |
| **Ignore Filters** | Glob patterns — matching files are skipped |

### Transfer Behaviour

| Field | Description |
|---|---|
| **Skip based on file timestamps** | Transfer only files whose modification time falls within the cruise/lowering start/stop timestamps |
| **Staleness** | Transfer files only if their file sizes have not changes within the specified period |
| **Remove Source Files** | Delete transferred files from the source after a successful copy |
| **Skip Empty Directories** | Do not create empty directories in the destination |
| **Skip Empty Files** | Do not transfer zero-byte files |
| **Sync from Source** | Mirror the source — delete destination files not present in the source |

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
| **Idle** | No job running; waiting for next scheduled run |
| **Running** | Transfer in progress |
| **Error** | Last run encountered an error; see transfer log |
| **Disabled** | Excluded from scheduling |
