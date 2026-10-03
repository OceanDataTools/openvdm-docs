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
(source) and cruise data transfers (destination); rclone is only used for cruise
data and ship-to-shore transfers.

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

Collection system and ship-to-shore transfers use `rsync` over SSH. Cruise data
transfers copy (or, with **Sync to Destination**, sync) the cruise to
`<destination path>/<cruise ID>` with rclone over SFTP.

- **Server:** hostname or IP address (no leading `/` or `\`)
- **Username:** SSH login user
- **Password or SSH key:** authentication method
- **Source/Destination path:** absolute path on the remote server

### Using an SSH key

OpenVDM's transfers run as root on the OpenVDM server, so they log in with
root's SSH key. The installer creates one if root has none. It's named after
its type, `/root/.ssh/id_ed25519` on newer systems or `/root/.ssh/id_rsa` on
older ones. To use it for a transfer, authorize it for the transfer's user on
the remote server once. `ssh-copy-id` asks for that user's password and adds
the key:

```
sudo ls /root/.ssh/*.pub
sudo ssh-copy-id -i /root/.ssh/id_ed25519.pub <user>@<server>
```

Then set **Use SSH Public/Private key?** to **Yes** in the transfer and run **Test Setup**.

The key used is the one `ssh` would use: the `IdentityFile` set for the server in
`/root/.ssh/config`, or else the first of root's default keys that exists
(`id_rsa`, `id_ecdsa`, `id_ed25519`, ...). To use a particular key for a server,
add it to `/root/.ssh/config`:

```
Host backup.example.org
    IdentityFile /root/.ssh/backup_key
```

`Host` patterns (`*.example.org`), `Match host` and `Match all` blocks are
followed. Other `Match` criteria and `Include` aren't, for cruise data transfers.

## FTP Server

As a **source** (collection system transfers), OpenVDM mounts the source
directory on the FTP server with `rclone mount` and runs `rsync` locally against
the mount point, the same way as an SMB share.  File filters, staleness, wildcard
source directories and removing source files work as for other types.

As a **destination** (cruise data transfers), OpenVDM copies (or, with
**Sync to Destination**, syncs) the cruise to `<destination path>/<cruise ID>` on
the FTP server with rclone, the same way as an SSH destination.  **Test Setup**
checks the login, the destination directory and write access.

- **Server:** hostname or IP address, followed by `:port` if the server doesn't use
  port 21 (e.g. `ftp.example.org:2121`).  Put an IPv6 address in brackets to add a
  port (`[2001:db8::1]:2121`).  An `ftp://` prefix or a path is removed.
- **Username / Password:** FTP login.  For anonymous access, set the username to
  `anonymous`; no password is needed.
- **Source/Destination path:** absolute path on the FTP server (e.g. `/data`)
- As a source, the directory is mounted read-only unless **Remove Source Files**
  is enabled.  Mounting requires FUSE (`fuse3`), which the installer installs.
- Only plain FTP is supported, not FTPS (FTP over TLS).

For sources, `rsync` detects changed files by size and modification time.  FTP servers that
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
