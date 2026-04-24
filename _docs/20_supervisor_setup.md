---
permalink: /docs/supervisor_setup
title: "Supervisor Setup"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

OpenVDM's Python worker processes are managed by
[Supervisor](http://supervisord.org/), a process control system that ensures
workers restart automatically on failure or system reboot.

The install script writes individual Supervisor configuration files to
`/etc/supervisor/conf.d/`.

## Worker Processes

| Supervisor Name | Worker Script | Purpose |
|---|---|---|
| `openvdm_run_collection_system_transfer` | `run_collection_system_transfer.py` | Gearman worker for ingesting instrument data |
| `openvdm_run_cruise_data_transfer` | `run_cruise_data_transfer.py` | Gearman worker for backup/archive transfers |
| `openvdm_run_ship_to_shore_transfer` | `run_ship_to_shore_transfer.py` | Gearman worker for shore-side sync |
| `openvdm_data_dashboard` | `data_dashboard.py` | Gearman worker for plugin processing |
| `openvdm_md5_summary` | `md5_summary.py` | Gearman worker for checksum management |
| `openvdm_cruise` | `cruise.py` | Gearman worker for cruise setup/finalization |
| `openvdm_lowering` | `lowering.py` | Gearman worker for lowering setup/finalization |
| `openvdm_cruise_directory` | `cruise_directory.py` | Gearman worker for directory management |
| `openvdm_lowering_directory` | `lowering_directory.py` | Gearman worker for lowering directory management |
| `openvdm_post_hooks` | `post_hooks.py` | Gearman worker for post-hook commands |
| `openvdm_stop_job` | `stop_job.py` | Gearman worker for manual job termination |
| `openvdm_scheduler` | `scheduler.py` | Periodic transfer scheduler |
| `openvdm_size_cacher` | `size_cacher.py` | Periodic directory size calculator |

## Common Commands

```bash
# Show status of all OpenVDM workers
sudo supervisorctl status

# Restart all workers (e.g. after a code update)
sudo supervisorctl restart all

# Restart a single worker
sudo supervisorctl restart openvdm_data_dashboard

# View live log output
sudo supervisorctl tail -f openvdm_run_collection_system_transfer
```

## Startup Reset

The `reboot_reset.py` script is run once on system startup (via a `@reboot` cron
job or systemd unit written by the install script).  It resets any transfers or
tasks that were left in a running state due to an ungraceful shutdown, ensuring
the system starts from a clean idle state.
