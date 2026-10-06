---
permalink: /docs/post_hooks
title: "Post-Hook Commands"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

Post-hook commands let you run arbitrary shell commands automatically after key
OpenVDM lifecycle events.  Common uses include building trackline files, creating
remote directory structures, and triggering external notifications.

## Configuration

Hooks are defined in `server/etc/openvdm.yaml` under the `postHookCommands` key.
See [openvdm.yaml](config_openvdm_yaml#posthookcommands) for the full
configuration reference.

## Example: Build Cruise Tracklines After Each Dashboard Update

`bin/build_cruise_tracks.py` combines a transfer's dashboard GeoJSON into cruise
tracklines, so run it after the dashboard update (`postDataDashboard`), not straight
after the transfer:

```yaml
postHookCommands:
  postDataDashboard:
    - collectionSystemTransferName: OpenRVDAS
      commandList:
        - name: "Build cruise tracklines"
          command:
            - "/opt/openvdm/venv/bin/python"
            - "/opt/openvdm/bin/build_cruise_tracks.py"
            - "OpenRVDAS"
```

Copy the script from its `.dist` template first
(`cp bin/build_cruise_tracks.py.dist bin/build_cruise_tracks.py`).

## Example: Create Remote Directories on Cruise Setup

```yaml
postHookCommands:
  postSetupNewCruise:
    commandList:
      - name: "Create remote data directories"
        command:
          - "/opt/openvdm/venv/bin/python"
          - "/opt/openvdm/bin/build_remote_directory.py"
          - "-s"
```

## Example: Notify a Slack Webhook After Finalization

```yaml
postHookCommands:
  postFinalizeCurrentCruise:
    commandList:
      - name: "Slack notification"
        command:
          - "curl"
          - "-X"
          - "POST"
          - "-H"
          - "Content-type: application/json"
          - "--data"
          - '{"text":"Cruise {cruiseID} has been finalized."}'
          - "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

## Available Token Substitutions

| Token | Available in |
|---|---|
| `{cruiseID}` | All hooks |
| `{loweringID}` | All hooks |
| `{newFiles}` | `postCollectionSystemTransfer`, `postDataDashboard` |
| `{updatedFiles}` | `postCollectionSystemTransfer`, `postDataDashboard` |
| `{collectionSystemTransferID}` | `postCollectionSystemTransfer`, `postDataDashboard` |
| `{collectionSystemTransferName}` | `postCollectionSystemTransfer`, `postDataDashboard` |

## Notes

- Commands run as root, like all the workers, from the OpenVDM install directory.  Use
  full paths, and the venv's Python for OpenVDM's scripts.
- `postFinalizeCurrentCruise` commands run before the cruise data transfers that end
  finalization, so files they write are included in those transfers.
- If a command fails, the others in the list still run; the failure is reported in the
  web interface and in `/var/log/openvdm/post_hooks.log`.
- Commands must be specified as a list of strings (not a shell string) — shell
  features like pipes and redirects are not supported directly.  Wrap in a script
  if needed.
