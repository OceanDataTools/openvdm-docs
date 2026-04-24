---
permalink: /docs/config_openvdm_yaml
title: "openvdm.yaml"
layout: single
toc: true
toc_label: "Contents"
toc_icon: "list"
toc_sticky: true
---

`server/etc/openvdm.yaml` is the primary server-side configuration file.  Copy
`openvdm.yaml.dist` to `openvdm.yaml` before starting OpenVDM.

## Top-Level Keys

### gearmanServer

Address of the Gearman job server, in `host:port` format.

```yaml
gearmanServer: localhost:4730
```

### pluginDir

Path to the directory containing data-dashboard plugin modules (`*_plugin.py`).
Relative paths are resolved from the repository root.

```yaml
pluginDir: server/plugins
```

### postHookCommands

Defines shell commands to execute after specific OpenVDM lifecycle events.  Each
top-level key maps to a Gearman task name.

```yaml
postHookCommands:
  postSetupNewCruise:
    commandList:
      - name: "Build remote directories"
        command:
          - python3
          - bin/build_remote_directory.py
          - "--template"
          - /home/survey/RemoteDirectoryTemplate
  postCollectionSystemTransfer:
    - collectionSystemTransferName: OpenRVDAS
      commandList:
        - name: "Build cruise tracklines"
          command:
            - python3
            - bin/build_cruise_tracks.py
            - OpenRVDAS
```

#### Supported hook events

| Key | Fires after… |
|---|---|
| `postSetupNewCruise` | Cruise directory created |
| `postSetupNewLowering` | Lowering directory created |
| `postCollectionSystemTransfer` | A collection system transfer completes |
| `postDataDashboard` | A data-dashboard update completes |
| `preFinalizeCurrentCruise` | Before cruise finalization begins |
| `postFinalizeCurrentCruise` | After cruise finalization completes |
| `preFinalizeCurrentLowering` | Before lowering finalization begins |
| `postFinalizeCurrentLowering` | After lowering finalization completes |

#### Token substitution

Command arguments may include the following tokens, which are replaced at runtime:

| Token | Value |
|---|---|
| `{cruiseID}` | Current cruise identifier |
| `{loweringID}` | Current lowering identifier |
| `{newFiles}` | Space-separated list of newly transferred files |
| `{updatedFiles}` | Space-separated list of updated files |
| `{collectionSystemTransferID}` | Numeric ID of the triggering transfer |
| `{collectionSystemTransferName}` | Short name of the triggering transfer |
