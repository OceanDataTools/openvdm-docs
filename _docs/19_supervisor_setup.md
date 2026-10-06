---
permalink: /docs/supervisor_setup
title: "Supervisor Setup"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM's Python workers are run by [Supervisor](http://supervisord.org/), which starts
them at boot and restarts them if they stop.

The installer writes the Supervisor configuration, and rewrites it on every run:

| OS | File |
|---|---|
| Debian / Ubuntu | `/etc/supervisor/conf.d/openvdm.conf` |
| Rocky / AlmaLinux | `/etc/supervisord.d/openvdm.ini` |

The workers are in one group, `openvdm`, so each is addressed as `openvdm:<name>`.  Their
logs are in `/var/log/openvdm/`.

## Workers

| Name | Script (`server/workers/`) | Purpose |
|---|---|---|
| `run_collection_system_transfer` | `run_collection_system_transfer.py` | Runs collection system transfers |
| `run_cruise_data_transfer` | `run_cruise_data_transfer.py` | Runs cruise data transfers |
| `run_ship_to_shore_transfer` | `run_ship_to_shore_transfer.py` | Runs the ship-to-shore transfer |
| `test_collection_system_transfer` | `test_collection_system_transfer.py` | **Test Setup** for collection system transfers |
| `test_cruise_data_transfer` | `test_cruise_data_transfer.py` | **Test Setup** for cruise data transfers |
| `data_dashboard` | `data_dashboard.py` | Runs the plugins and updates the data dashboard |
| `md5_summary` | `md5_summary.py` | Updates the MD5 checksum summary |
| `cruise` | `cruise.py` | Cruise setup, finalization and configuration export |
| `lowering` | `lowering.py` | Lowering setup, finalization and configuration export |
| `cruise_directory` | `cruise_directory.py` | Creates and rebuilds the cruise directory |
| `lowering_directory` | `lowering_directory.py` | Creates and rebuilds lowering directories |
| `post_hooks` | `post_hooks.py` | Runs [post-hook commands](/docs/post_hooks) |
| `stop_job` | `stop_job.py` | Stops running jobs |
| `scheduler` | `scheduler.py` | Starts transfers on schedule |
| `size_cacher` | `size_cacher.py` | Keeps the cruise and lowering directory sizes up to date |
| `reboot_reset` | `reboot_reset.py` | Runs once at startup (see below) |

The three `run_*` transfer workers run two processes each, so two transfers of each kind
can run at once.  Their process names end in a number (e.g.
`openvdm:run_collection_system_transfer_0`); both processes write to the same log.
All the workers run as root.

## Common Commands

```bash
# Status of all OpenVDM workers
sudo supervisorctl status

# Restart all workers, e.g. after an upgrade or after changing a plugin
sudo supervisorctl restart openvdm:*

# Restart one worker
sudo supervisorctl restart openvdm:data_dashboard

# Follow a worker's log
sudo tail -f /var/log/openvdm/data_dashboard.log
```

## Startup Reset

`reboot_reset` runs once when Supervisor starts (it isn't restarted when it exits).  It
resets transfers and tasks left marked as running by an unclean shutdown, so OpenVDM
starts from a clean, idle state.

## Supervisor Web Interface

The installer can turn on Supervisor's web interface (port 9001), optionally with a
username and password.  The username defaults to the OpenVDM user, and the password to
that user's database password.
