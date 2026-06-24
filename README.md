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

Point the module at the ShowRevue machine and OSC Control port.

- Host: ShowRevue IP or hostname
- Port: ShowRevue OSC Control port, default `8001`

## Feedback

This first pass is send-only.

ShowRevue currently accepts OSC control but does not emit authoritative OSC state back for playback, record state, masking, or active message presets. Because of that, true Companion feedback would need ShowRevue to publish state on a separate outbound path first.

The module does expose "last command sent" variables so you can reference the last Companion-triggered action in labels if useful, but those are not device-state feedbacks.

## Build

```bash
yarn install
yarn package
```

