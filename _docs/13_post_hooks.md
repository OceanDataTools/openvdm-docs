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
See [openvdm.yaml](/docs/config_openvdm_yaml#posthookcommands) for the full
configuration reference.

## Example: Build Cruise Tracklines After Every Transfer

```yaml
postHookCommands:
  postCollectionSystemTransfer:
    - collectionSystemTransferName: OpenRVDAS
      commandList:
        - name: "Build cruise tracklines"
          command:
            - "python3"
            - "bin/build_cruise_tracks.py"
            - "OpenRVDAS"
```

## Example: Create Remote Directories on Cruise Setup

```yaml
postHookCommands:
  postSetupNewCruise:
    commandList:
      - name: "Create remote data directories"
        command:
          - "python3"
          - "bin/build_remote_directory.py"
          - "--template"
          - "/home/survey/RemoteDirectoryTemplate"
          - "--create_source"
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

- Commands run as the OpenVDM system user (typically `survey`).
- A hook failure is reported in the web interface but does not prevent subsequent
  hooks or the next transfer from running.
- Commands must be specified as a list of strings (not a shell string) — shell
  features like pipes and redirects are not supported directly.  Wrap in a script
  if needed.
