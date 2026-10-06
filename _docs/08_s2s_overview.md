---
permalink: /docs/s2s_overview
title: "Ship-to-Shore Transfer"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

The **ship-to-shore transfer** sends selected cruise data to a **Shoreside Data
Warehouse (SSDW)** over the ship's satellite or shore connection.  It's a special,
required cruise data transfer named `SSDW`.  Unlike other cruise data transfers it
doesn't copy the whole cruise: it copies only the files matched by the
**Ship-to-Shore Transfers** rules, highest priority first.

## How It Works

1. The **scheduler** starts the ship-to-shore transfer when it's enabled and not
   already running.
2. The worker lists the cruise directory and matches the files against the enabled
   Ship-to-Shore Transfers rules, in priority order.  The
   [always-ignored files and folders](/docs/cst_overview#always-ignored-files-and-folders)
   are never sent.
3. The matched files are copied, highest priority first.
4. A transfer that has run for an hour is stopped and started again, so files that
   have arrived since it started, which may have a higher priority, aren't held up
   behind a long transfer.

## Shoreside Data Warehouse

Set the destination under **Configuration → System**, on the **Shoreside Data Warehouse
(SSDW)** row:

| Field | Description |
|---|---|
| **Server IP** | The shoreside server |
| **Server Username** | The SSH login on that server |
| **Use SSH Public/Private key?** / **Server Password** | How to log in. See [Using an SSH key](/docs/transfer_types#using-an-ssh-key) |
| **Cruise Data Directory** | An absolute path on the server, or an [rclone](/docs/transfer_types#rclone) `remote:path` |

With a server path, files are copied with `rsync` over SSH.  With a `remote:path`,
they're copied with rclone, to any remote configured in root's rclone configuration
(e.g. cloud storage), and the server fields aren't used.

Click **Test** on the SSDW row to check the connection.  Turn the ship-to-shore transfer
on and off on the **Configuration → Ship-to-Shore Transfers** page.

## Ship-to-Shore Transfers Rules

**Configuration → Ship-to-Shore Transfers** lists the rules that choose what's sent.
Each rule has:

| Field | Description |
|---|---|
| **Name / Long Name** | Identifiers shown in the web interface |
| **Priority** | 1 (highest) to 5 (lowest) |
| **Collection System** | Limit the rule to one collection system transfer's directory |
| **Extra Directory** | Limit the rule to one extra directory |
| **Include Filter** | Glob patterns of the files to send, comma-separated |

A rule needs a Collection System, an Extra Directory, or both.

Rules for the files OpenVDM generates (the dashboard data, the MD5 summary and the
cruise configuration) are listed under **OpenVDM Specific Ship-to-Shore Transfers** on
the **Configuration → System** page.  They can be edited and enabled or disabled, but
not deleted.

## Bandwidth

To avoid filling the ship's link, set the **Ship-to-Shore Transfer Bandwidth Limit**
(in Kbps) under **Configuration → System**.  Give small, important files (navigation, tracklines,
event logs, summaries) priority 1, and give large raw data a low priority or leave it
out.
