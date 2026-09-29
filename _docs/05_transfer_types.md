---
permalink: /docs/transfer_types
title: "Transfer Types"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM supports six transfer types.  The transfer type is selected in the web UI
when configuring a transfer.  Most types work for both collection system transfers
(source) and cruise data transfers (destination).  FTP Server is only used for
collection system transfers, and rclone only for cruise data and ship-to-shore
transfers.

## Local Directory

Files are read from or written to a path on the local filesystem.

- **Source path:** absolute path to the data directory on the warehouse server
- **Destination path:** absolute path (leading `/` required), or an rclone remote
  path if a `:` is present (see [rclone](#rclone) below)
- **Mount point option:** when enabled, OpenVDM verifies the directory is a mounted
  filesystem before transferring

## rsync Server

Files are transferred using `rsync` over the rsync daemon protocol (TCP port 873).

- **Server:** hostname or IP address (no leading `/` or `\`)
- **Username / Password:** rsync module credentials
- **Source/Destination path:** path within the rsync module

## SMB Share

Files are transferred by mounting a Samba (CIFS/SMB) share and running `rsync`
locally against the mount point.

- **Server:** hostname or IP address (UNC-style `\\server\share` is automatically
  converted to `/server/share`)
- **Share name:** the SMB share name
- **Username / Password / Domain:** authentication credentials
- OpenVDM auto-detects the SMB protocol version (1.0, 2.0, 2.1, or 3.0) before
  mounting

## SSH Server

Files are transferred using `rsync` over SSH.

- **Server:** hostname or IP address (no leading `/` or `\`)
- **Username:** SSH login user
- **Password or SSH key:** authentication method
- **Source/Destination path:** absolute path on the remote server

## FTP Server

Only used for collection system transfers.  OpenVDM mounts the source directory
on the FTP server with `rclone mount` and runs `rsync` locally against the mount
point, the same way as an SMB share.  File filters, staleness, wildcard source directories and removing
source files work as for other types.

- **Server:** hostname or IP address, followed by `:port` if the server doesn't use
  port 21 (e.g. `ftp.example.org:2121`).  Put an IPv6 address in brackets to add a
  port (`[2001:db8::1]:2121`).  An `ftp://` prefix or a path is removed.
- **Username / Password:** FTP login.  For anonymous access, set the username to
  `anonymous`; no password is needed.
- **Source path:** absolute path on the FTP server (e.g. `/data`)
- The server is mounted read-only unless **Remove Source Files** is enabled.
- Requires FUSE (`fuse3`), which the installer installs.  Only plain FTP is
  supported, not FTPS (FTP over TLS).

`rsync` detects changed files by size and modification time.  FTP servers that
support the `MLSD` command report exact modification times.  Servers that only
support `LIST` often report times to the minute, so a file that changes without
changing size within the same minute as the last transfer isn't copied again until
it changes again.

## rclone

Only used for cruise data and ship-to-shore transfers.  Files are transferred using [rclone](https://rclone.org), enabling support for
cloud and object storage backends (S3, Google Cloud Storage, Backblaze B2, etc.)
as well as SFTP.

An rclone destination is indicated by the presence of a `:` in the destination
directory field, using the `remote:path` format — for example `gcs-bucket:cruises`.

- **No leading slash** on the remote name portion before the `:`
- rclone must be installed and the remote must be configured in rclone's config
  file before use

### rclone for SSH/SFTP and SMB

For SSH-based and SMB-based transfers, OpenVDM generates a temporary rclone config using
the SSH/SMB credentials configured in the transfer.  No pre-configured rclone remote
is required for SSH destinations.

## Choosing a Transfer Type

| Scenario | Recommended type |
|---|---|
| Linux-based collection system on the ship network | rsync Server or SSH |
| Windows-based collection system with a shared folder | SMB Share |
| Data volume already connected to the warehouse server | Local Directory |
| Instrument or collection system that only offers FTP | FTP Server |
| Cloud backup or archive | rclone |
| Shore-side SFTP server | SSH or rclone (SFTP) |
