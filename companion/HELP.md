# ShowRevue

Control ShowRevue from a Stream Deck or any Companion surface over OSC, and show live ShowRevue state on your buttons.

## Setup

In ShowRevue, open **Preferences → OSC Control** and note the listener port (default `8001`).

In Companion:

1. Add the **ShowRevue** connection
2. Set the target host to the Mac running ShowRevue
3. Set the target port to the OSC Control port (default `8001`)

For live feedback, also enable **Send feedback to Companion** in ShowRevue → **Preferences → Companion** and point it at this Companion machine (default feedback port `8002`).

## Ports at a glance

| Port | Direction | Carries | Set in |
| --- | --- | --- | --- |
| **8001** | Companion → ShowRevue | OSC **commands** (record, cues, notes, …) | This module's *target port* = ShowRevue → Preferences → OSC Control listener |
| **8002** | ShowRevue → Companion | live **feedback** state (`/showrevue/state/*`) | ShowRevue → Preferences → Companion feedback port |
| **8000** | Companion → ShowRevue | optional **variable polling** over HTTP | ShowRevue's Companion HTTP port |

> **Same machine?** The command port (8001) and the feedback port (8002) **must be different** — two listeners can't share one UDP port on one host. They only ever match when ShowRevue and Companion run on different machines.

## Included Actions

- Record / stop / play / pause
- Cue and timecode navigation
- Frame stepping
- Loop set/go/toggle/clear
- Stage Display custom messages
- Stage Display message presets
- Stage Display output mask on/off/toggle
- **Notes**: send a free-text note, or fire a one-tap quick-note preset, into ShowRevue at the current timecode (pick the department)

## Included Presets

- Transport controls
- Cue and timecode navigation
- Loop controls
- Stage Display mask buttons
- Full operator message preset catalog from ShowRevue

## Feedback

ShowRevue publishes its live state to this module (enable **Send feedback to Companion** in ShowRevue → Preferences → Companion). The module exposes it as variables and a boolean feedback:

**Variables** — use as `$(showrevue:<name>)` on any button:

- `recording` — `1` while recording, `0` when idle
- `timecode` — current timecode `HH:MM:SS`
- `fps` — detected frame rate
- `ltc_status` — LTC lock state (Locked / Weak / No signal)
- `cue_number` — current lighting cue number
- `cue_label` — current lighting cue label
- `time_since_cue` — time since the last cue fired
- `show_name` — the current show name
- `session_name` / `session_type` — e.g. `Show 1` / `Show`
- `show_phase` / `show_timer` — Show State phase + its timer text
- `streaming` / `ndi_sending` — `1`/`0` for RTMP and NDI output
- `note_count` — notes taken this session
- `next_curtain` — next curtain time `HH:MM`
- `source_health` — `ok` / `no signal` / `off`
- `disk_free` — free space on the recording volume, in GB
- `show_timer` — count-up during acts, countdown during intervals (`↓`/`↑`)
- `curtain_countdown` — live countdown to the next curtain during preshow (`− H:MM:SS`)

**Feedback**

- **Recording** — turns a button red while ShowRevue is recording.
- **Source problem** — turns a button amber when the camera/source is `no signal` or `off`.

The **Status** preset group has ready-made read-out buttons for source health, free disk, note count, and a recording lamp.
