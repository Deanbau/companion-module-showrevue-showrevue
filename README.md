# ShowRevue Companion Module

Bitfocus Companion module for controlling ShowRevue over its OSC remote-control port.

Version 0.8.1 covers the OSC control surface in `ShowRevue/ShowRevue/Managers/OSCManager.swift`:

- Transport: record, stop, play, pause
- Navigation: next/previous cue, next/previous timecode segment, next/previous frame, forward/back, next/previous recording
- Loop control: set/go loop in/out, enable/disable/toggle/stop/clear loop
- Stage Display messaging: custom message set/clear, preset trigger, preset toggle
- Stage Display masking: on, off, toggle
- NDI output: set source (Stage Display / GUI Mirror)
- Show State: preshow, act, interval (optional planned length), finished, reset, next curtain, next show
- Session: set session type, set next session number, start a new session
- Record When Timecode Runs: arm, disarm, toggle
- Safety: Monitor Only kill switch (on/off/toggle) and arm outputs, with feedback and presets

## Configuration

Point the module at the ShowRevue machine.

- **Host**: ShowRevue IP or hostname
- **Command port**: ShowRevue OSC Control port, default `8001`
- **Feedback**: enable **Send feedback to Companion** in ShowRevue → **Preferences → Companion** (default port `8002`)

## Feedback (two-way)

The module is two-way. ShowRevue publishes its live state back to Companion over OSC
(`/showrevue/state/*`) on a separate outbound path. Turn on **Send feedback to Companion** in
ShowRevue → **Preferences → Companion**. If ShowRevue and Companion run on the same machine, the
command port (`8001`) and the feedback port (`8002`) must differ.

**Variables** (use in button text): `recording`, `timecode`, `fps`, `cue_number`, `cue_label`,
`show_name`, `time_since_cue`, `ltc_status`, `show_phase`, `show_timer`, `session_name`,
`session_type`, `streaming`, `ndi_sending`, `note_count`, `next_curtain`, `source_health`,
`disk_free`, `curtain_countdown`, `monitor_only`, `outputs_armed`, `tc_trigger_armed`,
`tc_trigger_state`, `audio_silent_seconds`.

**Feedbacks** (boolean, for button colour and style): **Recording**, **Source problem**,
**Monitor Only**, **Outputs armed**, **LTC locked**, **Show phase**, **Streaming**, **NDI output on**,
**Record When Timecode Runs armed**, **Record When Timecode Runs state**, **Audio silent** (with a
configurable seconds threshold), and **Disk space low** (with a configurable GB threshold).

**Overlay widgets**: show, hide, toggle or recolour any overlay widget by kind (`cueNumber`,
`ltc`, `showState`, `customText`, …) or by the custom OSC ID set in the layout inspector. The
Overlay Widgets preset group has a toggle button for the eight most flipped.

## Build

```bash
./node_modules/.bin/companion-module-build
```

Use the local binary, not `yarn package`, which collides with the yarn 4 built-in.
