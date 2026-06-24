const { combineRgb } = require('@companion-module/base')
const { MESSAGE_PRESETS, wrapButtonLabel } = require('./constants')
const ICONS = require('./icons')

function colorFromHex(hex) {
	const normalized = String(hex || '').replace('#', '')
	if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
		return combineRgb(0, 0, 0)
	}

	return parseInt(normalized, 16)
}

function textColorForBackground(hex) {
	const normalized = String(hex || '').replace('#', '')
	if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
		return combineRgb(255, 255, 255)
	}

	const r = parseInt(normalized.slice(0, 2), 16)
	const g = parseInt(normalized.slice(2, 4), 16)
	const b = parseInt(normalized.slice(4, 6), 16)
	const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
	return luma > 160 ? combineRgb(0, 0, 0) : combineRgb(255, 255, 255)
}

function buildButtonPreset(name, text, bgcolor, actionId, options = {}, iconKey = null, keepText = false) {
	const style = {
		text,
		size: 'auto',
		color: textColorForBackground(bgcolor),
		bgcolor: colorFromHex(bgcolor),
	}
	if (iconKey && ICONS[iconKey]) {
		style.png64 = ICONS[iconKey]
		if (!keepText) style.text = ''
	}
	return {
		type: 'simple',
		name,
		style,
		steps: [
			{
				down: [
					{
						actionId,
						options,
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}
}

module.exports = function (self) {
	const presets = {}
	const structure = []

	const transportDefinitions = []
	presets.transport_record = buildButtonPreset('Record', 'RECORD', '#3a0d0d', 'record', {}, 'record')
	// Light the Record button red while ShowRevue is actually recording (state feedback).
	presets.transport_record.feedbacks = [
		{
			feedbackId: 'recording',
			options: {},
			style: { bgcolor: combineRgb(217, 45, 32), color: combineRgb(255, 255, 255) },
		},
	]
	transportDefinitions.push('transport_record')
	presets.transport_stop = buildButtonPreset('Stop', 'STOP', '#aa1e1e', 'stop', {}, 'stop')
	transportDefinitions.push('transport_stop')
	presets.transport_play = buildButtonPreset('Play', 'PLAY', '#1fa252', 'play', {}, 'play')
	transportDefinitions.push('transport_play')
	presets.transport_pause = buildButtonPreset('Pause', 'PAUSE', '#f2b84b', 'pause', {}, 'pause')
	transportDefinitions.push('transport_pause')
	structure.push({ id: 'transport', name: 'Transport', definitions: transportDefinitions })

	const navigationDefinitions = []
	presets.nav_next_cue = buildButtonPreset('Next Cue', 'NEXT\nCUE', '#1f6feb', 'next_cue', {}, 'next_cue')
	navigationDefinitions.push('nav_next_cue')
	presets.nav_prev_cue = buildButtonPreset('Previous Cue', 'PREV\nCUE', '#1f6feb', 'previous_cue', {}, 'previous_cue')
	navigationDefinitions.push('nav_prev_cue')
	presets.nav_next_tc = buildButtonPreset('Next Timecode Segment', 'NEXT\nTC', '#2563eb', 'next_timecode_segment', {}, 'next_timecode_segment')
	navigationDefinitions.push('nav_next_tc')
	presets.nav_prev_tc = buildButtonPreset('Previous Timecode Segment', 'PREV\nTC', '#2563eb', 'previous_timecode_segment', {}, 'previous_timecode_segment')
	navigationDefinitions.push('nav_prev_tc')
	presets.nav_forward_5 = buildButtonPreset('Forward 5s', '+5s', '#0f766e', 'forward', { seconds: 5 }, 'forward')
	navigationDefinitions.push('nav_forward_5')
	presets.nav_back_5 = buildButtonPreset('Back 5s', '-5s', '#0f766e', 'back', { seconds: 5 }, 'back')
	navigationDefinitions.push('nav_back_5')
	presets.nav_forward_3 = buildButtonPreset('Forward 3s', '+3s', '#0f766e', 'forward', { seconds: 3 })
	navigationDefinitions.push('nav_forward_3')
	presets.nav_back_3 = buildButtonPreset('Back 3s', '-3s', '#0f766e', 'back', { seconds: 3 })
	navigationDefinitions.push('nav_back_3')
	presets.nav_next_note = buildButtonPreset('Next Note', 'NEXT\nNOTE', '#3b6ef6', 'next_note')
	navigationDefinitions.push('nav_next_note')
	presets.nav_prev_note = buildButtonPreset('Previous Note', 'PREV\nNOTE', '#3b6ef6', 'previous_note')
	navigationDefinitions.push('nav_prev_note')
	presets.nav_next_frame = buildButtonPreset('Next Frame', 'NEXT\nFRAME', '#6366f1', 'next_frame', {}, 'next_frame')
	navigationDefinitions.push('nav_next_frame')
	presets.nav_prev_frame = buildButtonPreset('Previous Frame', 'PREV\nFRAME', '#6366f1', 'previous_frame', {}, 'previous_frame')
	navigationDefinitions.push('nav_prev_frame')
	structure.push({ id: 'navigation', name: 'Navigation', definitions: navigationDefinitions })

	const loopDefinitions = []
	presets.loop_set_in = buildButtonPreset('Set Loop In', 'SET\nIN', '#7c3aed', 'set_loop_in', {}, 'set_loop_in')
	loopDefinitions.push('loop_set_in')
	presets.loop_set_out = buildButtonPreset('Set Loop Out', 'SET\nOUT', '#7c3aed', 'set_loop_out', {}, 'set_loop_out')
	loopDefinitions.push('loop_set_out')
	presets.loop_go_in = buildButtonPreset('Go Loop In', 'GO\nIN', '#6d28d9', 'go_loop_in', {}, 'go_loop_in')
	loopDefinitions.push('loop_go_in')
	presets.loop_go_out = buildButtonPreset('Go Loop Out', 'GO\nOUT', '#6d28d9', 'go_loop_out', {}, 'go_loop_out')
	loopDefinitions.push('loop_go_out')
	presets.loop_toggle = buildButtonPreset('Toggle Loop', 'LOOP\nTOGGLE', '#9333ea', 'toggle_loop', {}, 'toggle_loop')
	loopDefinitions.push('loop_toggle')
	presets.loop_enable = buildButtonPreset('Enable Loop', 'LOOP\nON', '#4f46e5', 'enable_loop', {}, 'enable_loop')
	loopDefinitions.push('loop_enable')
	presets.loop_disable = buildButtonPreset('Disable Loop', 'LOOP\nOFF', '#4f46e5', 'disable_loop', {}, 'disable_loop')
	loopDefinitions.push('loop_disable')
	presets.loop_stop = buildButtonPreset('Stop Loop', 'LOOP\nSTOP', '#b45309', 'stop_loop', {}, 'stop_loop')
	loopDefinitions.push('loop_stop')
	presets.loop_clear = buildButtonPreset('Clear Loop', 'LOOP\nCLEAR', '#9a3412', 'clear_loop', {}, 'clear_loop')
	loopDefinitions.push('loop_clear')
	structure.push({ id: 'loop', name: 'Loop', definitions: loopDefinitions })

	const ndiDefinitions = []
	presets.ndi_showrevuelive = buildButtonPreset('NDI: Show Output', 'NDI\nSHOW', '#0e8a8a', 'ndi_source', { source: 'showrevuelive' })
	ndiDefinitions.push('ndi_showrevuelive')
	presets.ndi_gui = buildButtonPreset('NDI: Mirror GUI', 'NDI\nMIRROR', '#0e8a8a', 'ndi_source', { source: 'gui' })
	ndiDefinitions.push('ndi_gui')
	structure.push({ id: 'ndi', name: 'NDI Output', definitions: ndiDefinitions })

	const safetyDefinitions = []
	presets.safety_monitor = buildButtonPreset('Monitor Only', 'MONITOR\nONLY', '#1f1205', 'monitor_only', { state: 'toggle' })
	presets.safety_monitor.feedbacks = [
		{ feedbackId: 'monitor_only', options: {}, style: { bgcolor: combineRgb(220, 120, 0), color: combineRgb(0, 0, 0) } },
	]
	safetyDefinitions.push('safety_monitor')
	presets.safety_arm = buildButtonPreset('Arm Outputs', 'ARM\nOUTPUTS', '#1a1a1a', 'arm_outputs', { state: 'toggle' })
	presets.safety_arm.feedbacks = [
		{ feedbackId: 'outputs_armed', options: {}, style: { bgcolor: combineRgb(200, 0, 0), color: combineRgb(255, 255, 255) } },
	]
	safetyDefinitions.push('safety_arm')
	structure.push({ id: 'safety', name: 'Safety', definitions: safetyDefinitions })

	const messagingDefinitions = []
	presets.mask_on = buildButtonPreset('Mask On', 'MASK\nON', '#111827', 'mask_on', {}, 'mask_on')
	messagingDefinitions.push('mask_on')
	presets.mask_off = buildButtonPreset('Mask Off', 'MASK\nOFF', '#374151', 'mask_off', {}, 'mask_off')
	messagingDefinitions.push('mask_off')
	presets.mask_toggle = buildButtonPreset('Mask Toggle', 'MASK\nTOGGLE', '#1f2937', 'mask_toggle', {}, 'mask_toggle')
	messagingDefinitions.push('mask_toggle')
	presets.clear_message = buildButtonPreset('Clear Message', 'CLEAR\nMSG', '#6b7280', 'clear_message', {}, 'clear_message')
	messagingDefinitions.push('clear_message')

	for (const preset of MESSAGE_PRESETS) {
		const definitionId = `message_${preset.id}`
		presets[definitionId] = buildButtonPreset(
			preset.buttonLabel,
			wrapButtonLabel(preset.buttonLabel),
			preset.colorHex,
			preset.isToggle ? 'message_toggle_preset' : 'message_preset',
			{ preset: preset.id },
			'message_generic',
			true
		)
		messagingDefinitions.push(definitionId)
	}

	structure.push({ id: 'messaging', name: 'Messaging', definitions: messagingDefinitions })

	// ── Show State ──────────────────────────────────────────────
	const showStateDefinitions = []
	presets.showstate_preshow = buildButtonPreset('Show State: Preshow', 'PRE\nSHOW', '#334155', 'show_state_preshow')
	showStateDefinitions.push('showstate_preshow')
	presets.showstate_act1 = buildButtonPreset('Show State: Act 1', 'ACT 1', '#1f6feb', 'show_state_act', { number: 1 })
	showStateDefinitions.push('showstate_act1')
	presets.showstate_act2 = buildButtonPreset('Show State: Act 2', 'ACT 2', '#1f6feb', 'show_state_act', { number: 2 })
	showStateDefinitions.push('showstate_act2')
	presets.showstate_interval1 = buildButtonPreset('Show State: Interval', 'INTER\nVAL', '#b45309', 'show_state_interval', { number: 1 })
	showStateDefinitions.push('showstate_interval1')
	presets.showstate_finished = buildButtonPreset('Show State: Finished', 'END', '#1fa252', 'show_state_finished')
	showStateDefinitions.push('showstate_finished')
	presets.showstate_reset = buildButtonPreset('Show State: Reset', 'RESET', '#6b7280', 'show_state_reset')
	showStateDefinitions.push('showstate_reset')
	presets.show_start = buildButtonPreset('Set Next Curtain', 'CURTAIN\n19:30', '#7c3aed', 'show_start', { time: '19:30' })
	showStateDefinitions.push('show_start')
	presets.next_show = buildButtonPreset('Next Show', 'NEXT\nSHOW', '#6d28d9', 'next_show')
	showStateDefinitions.push('next_show')
	structure.push({ id: 'showstate', name: 'Show State', definitions: showStateDefinitions })

	// ── Notes & Flags ───────────────────────────────────────────
	const notesDefinitions = []
	presets.flag = buildButtonPreset('Drop Flag', 'FLAG', '#eab308', 'flag')
	notesDefinitions.push('flag')
	presets.note_lighting = buildButtonPreset('Quick Note: Lighting #1', 'NOTE\nLX 1', '#3b6ef6', 'quick_note', { department: 'lighting', index: 1 })
	notesDefinitions.push('note_lighting')
	presets.note_sound = buildButtonPreset('Quick Note: Sound #1', 'NOTE\nSND 1', '#16a34a', 'quick_note', { department: 'sound', index: 1 })
	notesDefinitions.push('note_sound')
	structure.push({ id: 'notes', name: 'Notes & Flags', definitions: notesDefinitions })

	// ── TimeWarp (DVR) ──────────────────────────────────────────
	const timewarpDefinitions = []
	presets.timewarp_enter = buildButtonPreset('TimeWarp: Enter', 'DVR', '#0ea5e9', 'timewarp_enter')
	timewarpDefinitions.push('timewarp_enter')
	presets.timewarp_exit = buildButtonPreset('TimeWarp: Exit', 'LIVE', '#0369a1', 'timewarp_exit')
	timewarpDefinitions.push('timewarp_exit')
	// While scrubbing, these reuse the transport verbs to drive the DVR surface.
	presets.tw_prev_cue = buildButtonPreset('TimeWarp: Prev Cue', 'PREV\nCUE', '#0369a1', 'previous_cue')
	timewarpDefinitions.push('tw_prev_cue')
	presets.tw_next_cue = buildButtonPreset('TimeWarp: Next Cue', 'NEXT\nCUE', '#0369a1', 'next_cue')
	timewarpDefinitions.push('tw_next_cue')
	presets.tw_back_5 = buildButtonPreset('TimeWarp: Back 5s', '-5s', '#0e7490', 'back', { seconds: 5 })
	timewarpDefinitions.push('tw_back_5')
	presets.tw_forward_5 = buildButtonPreset('TimeWarp: Forward 5s', '+5s', '#0e7490', 'forward', { seconds: 5 })
	timewarpDefinitions.push('tw_forward_5')
	presets.tw_back_3 = buildButtonPreset('TimeWarp: Back 3s', '-3s', '#0e7490', 'back', { seconds: 3 })
	timewarpDefinitions.push('tw_back_3')
	presets.tw_forward_3 = buildButtonPreset('TimeWarp: Forward 3s', '+3s', '#0e7490', 'forward', { seconds: 3 })
	timewarpDefinitions.push('tw_forward_3')
	structure.push({ id: 'timewarp', name: 'TimeWarp', definitions: timewarpDefinitions })

	// ── Status (display-only) ───────────────────────────────────
	// Read-outs of the live state ShowRevue pushes back. No action on press —
	// they mirror the booth so a Stream Deck shows it at a glance.
	const statusDefinitions = []
	const displayButton = (name, text, bgHex, feedbacks = []) => ({
		type: 'simple',
		name,
		style: { text, size: 'auto', color: combineRgb(255, 255, 255), bgcolor: colorFromHex(bgHex) },
		steps: [],
		feedbacks,
	})
	presets.status_source = displayButton('Status: Source health', 'SRC\n$(showrevue:source_health)', '#1f6feb', [
		{ feedbackId: 'source_problem', options: {}, style: { bgcolor: combineRgb(200, 120, 0), color: combineRgb(255, 255, 255) } },
	])
	statusDefinitions.push('status_source')
	presets.status_disk = displayButton('Status: Free disk (GB)', 'DISK\n$(showrevue:disk_free)G', '#334155')
	statusDefinitions.push('status_disk')
	presets.status_notes = displayButton('Status: Note count', 'NOTES\n$(showrevue:note_count)', '#16a34a')
	statusDefinitions.push('status_notes')
	presets.status_recording = displayButton('Status: Recording lamp', 'REC', '#3a0d0d', [
		{ feedbackId: 'recording', options: {}, style: { bgcolor: combineRgb(217, 45, 32), color: combineRgb(255, 255, 255) } },
	])
	statusDefinitions.push('status_recording')
	// Show State read-outs: live phase + its timer (count-down to curtain in
	// preshow, count-up in acts, countdown in intervals).
	presets.status_showstate = displayButton('Status: Show State + timer', '$(showrevue:show_phase)\n$(showrevue:show_timer)', '#1f6feb')
	statusDefinitions.push('status_showstate')
	presets.status_curtain = displayButton('Status: Countdown to show', 'CURTAIN\n$(showrevue:curtain_countdown)', '#7c3aed')
	statusDefinitions.push('status_curtain')
	presets.status_showtimer = displayButton('Status: Show timer', '$(showrevue:show_timer)', '#334155')
	statusDefinitions.push('status_showtimer')
	structure.push({ id: 'status', name: 'Status', definitions: statusDefinitions })

	self.setPresetDefinitions(structure, presets)
}

