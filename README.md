# ShowRevue Companion Module

Bitfocus Companion module for controlling ShowRevue over its OSC remote-control port.

This module covers the current OSC control surface implemented in `ShowRevue/ShowRevue/Managers/OSCManager.swift`:

- Transport: record, stop, play, pause
- Navigation: next/previous cue, next/previous timecode segment, next/previous frame, forward/back
- Loop control: set/go loop in/out, enable/disable/toggle/stop/clear loop
- Stage Display messaging: custom message set/clear, preset trigger, preset toggle
- Stage Display masking: on, off, toggle
- NDI output: set source (ShowRevueLive / GUI Mirror)
- Safety: Monitor Only kill switch (on/off/toggle) + Arm outputs — with feedback (Monitor Only / Outputs armed) and presets

## Configuration

Point the module at the ShowRevue machine.

- **Host**: ShowRevue IP or hostname
- **Command port**: ShowRevue OSC Control port, default `8001`
- **Feedback**: enable **Send feedback to Companion** in ShowRevue → **Preferences → Companion** (default port `8002`)

## Feedback (two-way)

The module is **fully two-way**. ShowRevue publishes its live state back to Companion over OSC
(`/showrevue/state/*`) on a separate outbound path — turn on **Send feedback to Companion** in
ShowRevue → **Preferences → Companion**. (Same machine? The command port `8001` and the feedback
port `8002` must differ.)

**Variables** (use in button text): `recording`, `timecode`, `fps`, `cue_number`, `cue_label`,
`show_name`, `time_since_cue`, `ltc_status`, `show_phase`, `show_timer`, `session_name`,
`session_type`, `streaming`, `ndi_sending`, `note_count`, `next_curtain`, `source_health`,
`disk_free`, `curtain_countdown`, `monitor_only`, `outputs_armed`.

**Feedbacks** (boolean, for button colour/style): **Recording**, **Source problem**, **Monitor
Only**, **Outputs armed** — plus ready-made Status presets that wire these up.

## Build

```bash
./node_modules/.bin/companion-module-build
```

(Use the local binary, **not** `yarn package` — it collides with the yarn-4 builtin.)

