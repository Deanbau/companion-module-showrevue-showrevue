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
	})
}
