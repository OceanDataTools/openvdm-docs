---
permalink: /docs/transfer_types
title: "Transfer Types"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM has five transfer types: Local Directory, Rsync Server, SMB Share, SSH Server
and FTP Server.  Each works both as a collection system transfer's source and as a
cruise data transfer's destination; choose it in the transfer's **Transfer Type**
dropdown, which shows that type's connection fields.  Cruise data transfers and the
[ship-to-shore transfer](s2s_overview) can also copy to any [rclone](#rclone)
remote.

## Local Directory

Files are read from or written to a path on the local filesystem.

- **Source path:** absolute path to the data directory on the warehouse server
- **Destination path:** absolute path (leading `/` required), or an rclone remote
  path if a `:` is present (see [rclone](#rclone) below)
- **Mount point option:** when enabled, OpenVDM verifies the directory is a mounted
  filesystem before transferring

## rsync Server

Files are transferred using `rsync` over the rsync daemon protocol (TCP port 873).

- **Rsync Server:** the server and rsync module, as `server/module` (e.g.
  `192.168.4.151/cruise_data`)
- **Username / Password:** the module's credentials
- **Source/Destination Directory:** a path within the module; `/` for its top level

## SMB Share

Files are transferred by mounting a Samba (CIFS/SMB) share and running `rsync`
locally against the mount point.

- **SMB Server/Share:** the server and share, as `//server/share` (e.g.
  `//192.168.4.151/data`).  A Windows-style `\\server\share` is converted
- **Username / Password / Domain:** the share's login.  Use `guest` as the username
  for a share that allows guest access
- **Source/Destination Directory:** a path within the share; `/` for its top level
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

A cruise data transfer or the ship-to-shore transfer can copy to any
[rclone](https://rclone.org) remote: cloud and object storage (S3, Google Cloud Storage,
Backblaze B2, ...) or anything else rclone supports.

For a cruise data transfer, choose **Local Directory** and give the destination
directory as `remote:path`, e.g. `gcs-bucket:cruises`.  The `:` is what marks it as an
rclone remote, so it's allowed only for Local Directory.  For the ship-to-shore
transfer, give `remote:path` as the SSDW's directory.

- No leading slash before the remote name
- The remote must already be set up in root's rclone configuration
  (`sudo rclone config`), since the transfers run as root.  **Test Setup** checks that
  the remote can be reached and written to

### rclone behind other transfer types

SSH Server and FTP Server cruise data transfers, and FTP Server sources, also use rclone.
OpenVDM writes a temporary rclone configuration from the transfer's settings for each
run, so they don't need a remote set up in advance.

## Choosing a Transfer Type

| Scenario | Recommended type |
|---|---|
| Linux-based collection system on the ship network | rsync Server or SSH |
| Windows-based collection system with a shared folder | SMB Share |
| Data volume already connected to the warehouse server | Local Directory |
| Instrument or collection system that only offers FTP | FTP Server |
| Cloud backup or archive | rclone remote (Local Directory with `remote:path`) |
| Shore-side server | SSH Server |
