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

> **Same machine?** The command port (8001) and the feedback port (8002) **must be different**. Two listeners can't share one UDP port on one host. They only ever match when ShowRevue and Companion run on different machines.

## Included Actions

- Record / stop / play / pause
- Cue and timecode navigation
- Next / previous recording in the Library (stopped Playback only)
- Frame stepping, and **step frames while a button is held** (put it on the button down, with **Stop stepping frames** on the button up)
- **Timeline zoom** (in, out, fit the whole recording) and **Go to Live view** without recording. These need ShowRevue 1.0 RC 3 or later; an older ShowRevue ignores them
- Loop set/go/toggle/clear
- Stage Display custom messages
- Stage Display message presets
- Stage Display output mask on/off/toggle
- **Notes**: send a free-text note, or fire a one-tap quick-note preset, into ShowRevue at the current timecode (pick the department)
- **Overlay widgets**: show, hide, toggle or recolour any overlay widget by kind (Cue Number, Timecode, Show State, Custom Text…) or by its custom OSC ID
- **Show State**: preshow, act N, interval (with an optional planned length in seconds), finished, reset
- **Session**: set the session type (1 to 4, or a custom name), set the next session number, start a new session
- **Record When Timecode Runs**: arm, disarm or toggle the timecode record trigger. Arming does not start a take by itself; a take starts when timecode runs for a full second
- **Safety**: Monitor Only kill switch, arm outputs

## Included Presets

Drag any of these onto a button. Groups appear in this order on the Presets tab:

- **Transport**: Record, Stop, Play, Pause. Record lights red while recording.
- **Navigation**: next and previous cue, timecode segment, recording and note, forward and back, frame stepping.
- **Loop**: set and go to in and out, toggle, enable, disable, stop, clear.
- **Timeline & View**: zoom in, out and fit, Go to Live view, and a dial for timeline zoom.
- **Frame scrub**: hold to step forward or back, and dials for frame by frame and cue by cue. A dial preset needs a surface with a rotary, such as a Stream Deck+; pressing the dial pauses.
- **TimeWarp**: enter and exit the DVR, and scrub buttons.
- **Show State**: Preshow, Acts 1 to 4, Intervals 1 to 3, Finished, Reset, next curtain and next show. Each phase button lights while the show is in that phase.
- **Session**: the four session types, Start New, and next number 1.
- **Safety**: Monitor Only, Arm Outputs and Record When Timecode Runs, each as a toggle with On and Off buttons. They light from state.
- **Stage Display Mask**: mask on, off, toggle.
- **Stage Display Messages**: clear, a custom STANDBY message, and the full operator message catalog.
- **Notes & Flags**: drop a flag, a checking note for lighting, and a quick note preset #1 for each department.
- **NDI Output**: Show Output and Mirror GUI.
- **Overlay Widgets**: toggles for the eight widgets a booth flips most, and Cue Number red and reset.
- **Status**: read-outs with live feedback. Recording, source health, timecode and LTC lock, frame rate, Show State and its timers, cue number and label, time since cue, show and session name, next curtain, streaming, NDI output, audio silence, free disk, note count, the timecode trigger state (separate buttons for a stop that was refused, and for timecode running on a take the trigger did not start), and the last OSC command and message sent.

## Feedback

ShowRevue publishes its live state to this module (enable **Send feedback to Companion** in ShowRevue → Preferences → Companion). The module exposes it as variables and boolean feedbacks.

**Variables**: use as `$(showrevue:<name>)` on any button:

- `recording`: `1` while recording, `0` when idle
- `timecode`: current timecode `HH:MM:SS`
- `fps`: detected frame rate
- `ltc_status`: LTC lock state (LTC LOCKED / LTC WEAK / NO LTC)
- `cue_number`: current lighting cue number
- `cue_label`: current lighting cue label
- `time_since_cue`: time since the last cue fired
- `show_name`: the current show name
- `session_name` / `session_type`: for example `Show 1` / `Show`
- `show_phase` / `show_timer`: Show State phase and its timer text
- `streaming` / `ndi_sending`: `1` or `0` for RTMP and NDI output
- `note_count`: notes taken this session
- `next_curtain`: next curtain time `HH:MM`
- `source_health`: `ok`, `no signal` or `off`
- `disk_free`: free space on the recording volume, in GB
- `curtain_countdown`: live countdown to the next curtain during preshow
- `monitor_only`, `outputs_armed`: `1` or `0`
- `tc_trigger_armed`: `1` or `0` for Record When Timecode Runs
- `tc_trigger_state`: `idle`, `starting`, `running`, `stopping`, `stop_refused` (ShowRevue could not stop the take and is retrying) or `running_not_owned` (timecode is running, but the trigger did not start the take, so it will not end it)
- `audio_silent_seconds`: seconds live audio has been silent (`0` when not silent)

**Feedbacks** (boolean, for button colour and style):

- **Recording**: lights while ShowRevue is recording
- **Source problem**: lights when the camera or source is `no signal` or `off`
- **Monitor Only**: lights while the kill switch is on
- **Outputs armed**: lights while fireback is armed
- **LTC locked**: lights while timecode is locked
- **Show phase**: preshow, act, interval or finished
- **Streaming** and **NDI output on**
- **Record When Timecode Runs armed**: lights while the timecode trigger is armed
- **Record When Timecode Runs state**: pick idle, starting, running, stopping, stop refused, or running but not started by the trigger
- **Audio silent**: lights when live audio has been silent for at least N seconds (set N, default 10)
- **Disk space low**: lights when free space is below N GB (default 20)

The **Status** preset group has ready-made read-out buttons for these.
