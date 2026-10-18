const { combineRgb } = require('@companion-module/base')

module.exports = function (self) {
	self.setFeedbackDefinitions({
		// True while ShowRevue is recording (state pushed back over OSC). Use to
		// make a button glow red on a live record.
		recording: {
			name: 'Recording',
			type: 'boolean',
			label: 'When ShowRevue is recording',
			defaultStyle: {
				bgcolor: combineRgb(200, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.appState?.recording === true,
		},
		// Source problem — camera/source isn't delivering frames (no signal / off).
		// Glow amber so the booth notices a dead input at a glance.
		source_problem: {
			name: 'Source problem',
			type: 'boolean',
			label: 'When the camera/source is not OK (no signal / off)',
			defaultStyle: {
				bgcolor: combineRgb(200, 120, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				const h = self.appState?.source_health
				return h !== undefined && h !== 'ok'
			},
		},
		// Monitor Only — global kill switch engaged (all outbound dead). Glow orange so
		// the booth knows why a fired cue isn't reaching the desk.
		monitor_only: {
			name: 'Monitor Only',
			type: 'boolean',
			label: 'When Monitor Only (kill switch) is engaged',
			defaultStyle: {
				bgcolor: combineRgb(220, 120, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => self.appState?.monitor_only === true,
		},
		// LTC locked — timecode is arriving and decoded.
		ltc_locked: {
			name: 'LTC locked',
			type: 'boolean',
			label: 'When timecode is locked',
			defaultStyle: {
				bgcolor: combineRgb(0, 140, 60),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => String(self.appState?.ltc_status || '').toLowerCase().includes('lock'),
		},
		// Show phase — light a button while the show is in a given phase.
		show_phase: {
			name: 'Show phase',
			type: 'boolean',
			label: 'When the show is in this phase',
			defaultStyle: {
				bgcolor: combineRgb(120, 60, 200),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'phase',
					type: 'dropdown',
					label: 'Phase',
					default: 'act',
					choices: [
						{ id: 'preshow', label: 'Preshow' },
						{ id: 'act', label: 'Any act' },
						{ id: 'interval', label: 'Interval' },
						{ id: 'finished', label: 'Finished' },
					],
				},
			],
			callback: (feedback) => {
				const phase = String(self.appState?.show_phase || '').toLowerCase()
				const want = feedback.options.phase || 'act'
				if (want === 'act') return phase.startsWith('act')
				return phase.startsWith(want)
			},
		},
		// Streaming — RTMP/SRT output is live.
		streaming: {
			name: 'Streaming',
			type: 'boolean',
			label: 'When ShowRevue is streaming',
			defaultStyle: {
				bgcolor: combineRgb(0, 90, 200),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.appState?.streaming === true || self.appState?.streaming === '1',
		},
		// NDI output on.
		ndi_sending: {
			name: 'NDI output on',
			type: 'boolean',
			label: 'When NDI output is on',
			defaultStyle: {
				bgcolor: combineRgb(0, 120, 120),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.appState?.ndi_sending === true || self.appState?.ndi_sending === '1',
		},
		// Outputs armed — fireback is enabled this session.
		outputs_armed: {
			name: 'Outputs armed',
			type: 'boolean',
			label: 'When outputs are armed (fireback enabled)',
			defaultStyle: {
				bgcolor: combineRgb(200, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.appState?.outputs_armed === true,
		},
		// Timecode trigger state: idle / starting / running / stopping, as ShowRevue reports it.
			tc_trigger_state: {
				name: 'Record When Timecode Runs state',
				type: 'boolean',
				label: 'When the Record When Timecode Runs state matches',
				defaultStyle: {
					bgcolor: combineRgb(0, 140, 60),
					color: combineRgb(255, 255, 255),
				},
				options: [
					{
						id: 'state',
						type: 'dropdown',
						label: 'State',
						default: 'running',
						choices: [
							{ id: 'idle', label: 'Idle (waiting for timecode)' },
							{ id: 'starting', label: 'Starting (confirming)' },
							{ id: 'running', label: 'Running (timecode moving)' },
							{ id: 'stopping', label: 'Stopping (grace period)' },
							{ id: 'stop_refused', label: 'Stop refused (retrying)' },
							{ id: 'running_not_owned', label: 'Running, not started by the trigger' },
						],
					},
				],
				callback: (feedback) => self.appState?.tc_trigger_state === feedback.options.state,
			},
			// Audio silent for at least N seconds. ShowRevue publishes 0 when audio is
			// fine or the show is not live, so N below 1 never matches.
			audio_silent: {
				name: 'Audio silent',
				type: 'boolean',
				label: 'When live audio has been silent for at least N seconds',
				defaultStyle: {
					bgcolor: combineRgb(200, 120, 0),
					color: combineRgb(255, 255, 255),
				},
				options: [
					{
						id: 'threshold',
						type: 'number',
						label: 'Seconds of silence',
						default: 10,
						min: 1,
						max: 3600,
						step: 1,
					},
				],
				callback: (feedback) => {
					const silent = Number(self.appState?.audio_silent_seconds)
					const threshold = Math.max(1, Number(feedback.options.threshold) || 10)
					return Number.isFinite(silent) && silent >= threshold
				},
			},
			// Free space on the recording volume below N GB. disk_free is only sent
			// once the recording folder is known, so a missing value never lights it.
			disk_low: {
				name: 'Disk space low',
				type: 'boolean',
				label: 'When free space on the recording volume is below N GB',
				defaultStyle: {
					bgcolor: combineRgb(200, 0, 0),
					color: combineRgb(255, 255, 255),
				},
				options: [
					{
						id: 'gb',
						type: 'number',
						label: 'Free space below (GB)',
						default: 20,
						min: 0,
						max: 100000,
						step: 1,
					},
				],
				callback: (feedback) => {
					const free = parseFloat(self.appState?.disk_free)
					return Number.isFinite(free) && free < Number(feedback.options.gb)
				},
			},
			// Record When Timecode Runs is armed (the trigger is on, not whether a take is running).
		tc_trigger_armed: {
			name: 'Record When Timecode Runs armed',
			type: 'boolean',
			label: 'When Record When Timecode Runs is armed',
			defaultStyle: {
				bgcolor: combineRgb(180, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.appState?.tc_trigger_armed === true,
		},
	})
}
