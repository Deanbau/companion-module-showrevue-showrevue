const { combineRgb } = require('@companion-module/base')
const { MESSAGE_PRESETS, WIDGET_KINDS, wrapButtonLabel } = require('./constants')
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

// A feedback that recolours a button while the state holds. The colour is the
// lit colour; the text colour is picked for contrast.
function lit(feedbackId, options, bgHex) {
	return {
		feedbackId,
		options,
		style: { bgcolor: colorFromHex(bgHex), color: textColorForBackground(bgHex) },
	}
}

// A display-only button: no press action, just a read-out with feedbacks.
function displayButton(name, text, bgHex, feedbacks = []) {
	return {
		type: 'simple',
		name,
		style: { text, size: 'auto', color: combineRgb(255, 255, 255), bgcolor: colorFromHex(bgHex) },
		steps: [],
		feedbacks,
	}
}

module.exports = function (self) {
	const presets = {}
	const structure = []

	// Adds one preset group in Presets-tab order. A duplicate id throws, so the
	// test harness fails on it instead of a button silently losing its preset.
	const addGroup = (id, name, entries) => {
		const definitions = []
		for (const [key, preset] of entries) {
			if (presets[key]) throw new Error(`Duplicate preset id: ${key}`)
			presets[key] = preset
			definitions.push(key)
		}
		structure.push({ id, name, definitions })
	}

	// ── Transport ───────────────────────────────────────────────
	const recordPreset = buildButtonPreset('Record', 'RECORD', '#3a0d0d', 'record', {}, 'record')
	recordPreset.feedbacks = [lit('recording', {}, '#d92d20')]
	addGroup('transport', 'Transport', [
		['transport_record', recordPreset],
		['transport_stop', buildButtonPreset('Stop', 'STOP', '#aa1e1e', 'stop', {}, 'stop')],
		['transport_play', buildButtonPreset('Play', 'PLAY', '#1fa252', 'play', {}, 'play')],
		['transport_pause', buildButtonPreset('Pause', 'PAUSE', '#f2b84b', 'pause', {}, 'pause')],
	])

	// ── Navigation ──────────────────────────────────────────────
	addGroup('navigation', 'Navigation', [
		['nav_next_cue', buildButtonPreset('Next Cue', 'NEXT\nCUE', '#1f6feb', 'next_cue', {}, 'next_cue')],
		['nav_prev_cue', buildButtonPreset('Previous Cue', 'PREV\nCUE', '#1f6feb', 'previous_cue', {}, 'previous_cue')],
		['nav_next_tc', buildButtonPreset('Next Timecode Segment', 'NEXT\nTC', '#2563eb', 'next_timecode_segment', {}, 'next_timecode_segment')],
		['nav_prev_tc', buildButtonPreset('Previous Timecode Segment', 'PREV\nTC', '#2563eb', 'previous_timecode_segment', {}, 'previous_timecode_segment')],
		['nav_next_recording', buildButtonPreset('Next Recording', 'NEXT\nRECORDING', '#1f6feb', 'next_recording')],
		['nav_prev_recording', buildButtonPreset('Previous Recording', 'PREV\nRECORDING', '#1f6feb', 'previous_recording')],
		['nav_forward_5', buildButtonPreset('Forward 5s', '+5s', '#0f766e', 'forward', { seconds: 5 }, 'forward')],
		['nav_back_5', buildButtonPreset('Back 5s', '-5s', '#0f766e', 'back', { seconds: 5 }, 'back')],
		['nav_forward_3', buildButtonPreset('Forward 3s', '+3s', '#0f766e', 'forward', { seconds: 3 })],
		['nav_back_3', buildButtonPreset('Back 3s', '-3s', '#0f766e', 'back', { seconds: 3 })],
		['nav_next_frame', buildButtonPreset('Next Frame', 'NEXT\nFRAME', '#6366f1', 'next_frame', {}, 'next_frame')],
		['nav_prev_frame', buildButtonPreset('Previous Frame', 'PREV\nFRAME', '#6366f1', 'previous_frame', {}, 'previous_frame')],
		['nav_next_note', buildButtonPreset('Next Note', 'NEXT\nNOTE', '#3b6ef6', 'next_note')],
		['nav_prev_note', buildButtonPreset('Previous Note', 'PREV\nNOTE', '#3b6ef6', 'previous_note')],
	])

	// ── Loop ────────────────────────────────────────────────────
	addGroup('loop', 'Loop', [
		['loop_set_in', buildButtonPreset('Set Loop In', 'SET\nIN', '#7c3aed', 'set_loop_in', {}, 'set_loop_in')],
		['loop_set_out', buildButtonPreset('Set Loop Out', 'SET\nOUT', '#7c3aed', 'set_loop_out', {}, 'set_loop_out')],
		['loop_go_in', buildButtonPreset('Go Loop In', 'GO\nIN', '#6d28d9', 'go_loop_in', {}, 'go_loop_in')],
		['loop_go_out', buildButtonPreset('Go Loop Out', 'GO\nOUT', '#6d28d9', 'go_loop_out', {}, 'go_loop_out')],
		['loop_toggle', buildButtonPreset('Toggle Loop', 'LOOP\nTOGGLE', '#9333ea', 'toggle_loop', {}, 'toggle_loop')],
		['loop_enable', buildButtonPreset('Enable Loop', 'LOOP\nON', '#4f46e5', 'enable_loop', {}, 'enable_loop')],
		['loop_disable', buildButtonPreset('Disable Loop', 'LOOP\nOFF', '#4f46e5', 'disable_loop', {}, 'disable_loop')],
		['loop_stop', buildButtonPreset('Stop Loop', 'LOOP\nSTOP', '#b45309', 'stop_loop', {}, 'stop_loop')],
		['loop_clear', buildButtonPreset('Clear Loop', 'LOOP\nCLEAR', '#9a3412', 'clear_loop', {}, 'clear_loop')],
	])

	// ── TimeWarp (DVR) ──────────────────────────────────────────
	// While scrubbing, the cue and seek buttons reuse the transport verbs.
	addGroup('timewarp', 'TimeWarp', [
		['timewarp_enter', buildButtonPreset('TimeWarp: Enter', 'DVR', '#0ea5e9', 'timewarp_enter')],
		['timewarp_exit', buildButtonPreset('TimeWarp: Exit', 'LIVE', '#0369a1', 'timewarp_exit')],
		['tw_prev_cue', buildButtonPreset('TimeWarp: Prev Cue', 'PREV\nCUE', '#0369a1', 'previous_cue')],
		['tw_next_cue', buildButtonPreset('TimeWarp: Next Cue', 'NEXT\nCUE', '#0369a1', 'next_cue')],
		['tw_back_5', buildButtonPreset('TimeWarp: Back 5s', '-5s', '#0e7490', 'back', { seconds: 5 })],
		['tw_forward_5', buildButtonPreset('TimeWarp: Forward 5s', '+5s', '#0e7490', 'forward', { seconds: 5 })],
		['tw_back_3', buildButtonPreset('TimeWarp: Back 3s', '-3s', '#0e7490', 'back', { seconds: 3 })],
		['tw_forward_3', buildButtonPreset('TimeWarp: Forward 3s', '+3s', '#0e7490', 'forward', { seconds: 3 })],
	])

	// ── Show State ──────────────────────────────────────────────
	// Each phase button lights while the show is in that phase (show_phase feedback).
	const phaseLit = (phase) => lit('show_phase', { phase }, '#783cc8')
	const actButton = (n) => {
		const preset = buildButtonPreset(`Show State: Act ${n}`, `ACT ${n}`, '#1f6feb', 'show_state_act', { number: n })
		preset.feedbacks = [phaseLit('act')]
		return preset
	}
	const intervalButton = (n) => {
		const preset = buildButtonPreset(`Show State: Interval ${n}`, n === 1 ? 'INTER\nVAL' : `INTER\nVAL ${n}`, '#b45309', 'show_state_interval', { number: n, duration: '' })
		preset.feedbacks = [phaseLit('interval')]
		return preset
	}
	const preshow = buildButtonPreset('Show State: Preshow', 'PRE\nSHOW', '#334155', 'show_state_preshow')
	preshow.feedbacks = [phaseLit('preshow')]
	const finished = buildButtonPreset('Show State: Finished', 'END', '#1fa252', 'show_state_finished')
	finished.feedbacks = [phaseLit('finished')]
	addGroup('showstate', 'Show State', [
		['showstate_preshow', preshow],
		['showstate_act1', actButton(1)],
		['showstate_act2', actButton(2)],
		['showstate_act3', actButton(3)],
		['showstate_act4', actButton(4)],
		['showstate_interval1', intervalButton(1)],
		['showstate_interval2', intervalButton(2)],
		['showstate_interval3', intervalButton(3)],
		['showstate_finished', finished],
		['showstate_reset', buildButtonPreset('Show State: Reset', 'RESET', '#6b7280', 'show_state_reset')],
		['show_start', buildButtonPreset('Set Next Curtain', 'CURTAIN\n19:30', '#7c3aed', 'show_start', { time: '19:30' })],
		['next_show', buildButtonPreset('Next Show', 'NEXT\nSHOW', '#6d28d9', 'next_show')],
	])

	// ── Session ─────────────────────────────────────────────────
	addGroup('session', 'Session', [
		['session_off_venue', buildButtonPreset('Session: Off Venue Rehearsal', 'OFF\nVENUE', '#334155', 'session_type', { type: '1' })],
		['session_tech', buildButtonPreset('Session: Tech Rehearsal', 'TECH\nREHEARSAL', '#334155', 'session_type', { type: '2' })],
		['session_dress', buildButtonPreset('Session: Dress Rehearsal', 'DRESS\nREHEARSAL', '#334155', 'session_type', { type: '3' })],
		['session_show', buildButtonPreset('Session: Show', 'SHOW', '#334155', 'session_type', { type: '4' })],
		['session_new', buildButtonPreset('Session: Start New', 'NEW\nSESSION', '#6d28d9', 'session_new')],
		['session_number_1', buildButtonPreset('Session: Next number 1', 'NEXT\nNUMBER 1', '#334155', 'session_number', { number: 1 })],
	])

	// ── Safety ──────────────────────────────────────────────────
	// Kill switch, output arming and the timecode record trigger. Each has a
	// toggle, an on and an off button. The toggles and on/off buttons light from state.
	const monitorFb = lit('monitor_only', {}, '#dc7800')
	const armFb = lit('outputs_armed', {}, '#c80000')
	const tcFb = lit('tc_trigger_armed', {}, '#b40000')
	const withFb = (preset, fb) => {
		preset.feedbacks = [fb]
		return preset
	}
	addGroup('safety', 'Safety', [
		['safety_monitor', withFb(buildButtonPreset('Monitor Only', 'MONITOR\nONLY', '#1f1205', 'monitor_only', { state: 'toggle' }), monitorFb)],
		['safety_monitor_on', withFb(buildButtonPreset('Monitor Only: On', 'MONITOR\nON', '#1f1205', 'monitor_only', { state: 'on' }), monitorFb)],
		['safety_monitor_off', withFb(buildButtonPreset('Monitor Only: Off', 'MONITOR\nOFF', '#1f1205', 'monitor_only', { state: 'off' }), monitorFb)],
		['safety_arm', withFb(buildButtonPreset('Arm Outputs', 'ARM\nOUTPUTS', '#1a1a1a', 'arm_outputs', { state: 'toggle' }), armFb)],
		['safety_arm_on', withFb(buildButtonPreset('Arm Outputs: On', 'ARM\nON', '#1a1a1a', 'arm_outputs', { state: 'on' }), armFb)],
		['safety_arm_off', withFb(buildButtonPreset('Arm Outputs: Off', 'ARM\nOFF', '#1a1a1a', 'arm_outputs', { state: 'off' }), armFb)],
		['safety_tc_trigger', withFb(buildButtonPreset('Record When Timecode Runs', 'TC\nTRIGGER', '#1a1a1a', 'tc_trigger', { state: 'toggle' }), tcFb)],
		['safety_tc_on', withFb(buildButtonPreset('Record When Timecode Runs: Arm', 'TC\nARM', '#1a1a1a', 'tc_trigger', { state: 'on' }), tcFb)],
		['safety_tc_off', withFb(buildButtonPreset('Record When Timecode Runs: Disarm', 'TC\nDISARM', '#1a1a1a', 'tc_trigger', { state: 'off' }), tcFb)],
	])

	// ── Stage Display: mask and messages ────────────────────────
	addGroup('mask', 'Stage Display Mask', [
		['mask_on', buildButtonPreset('Mask On', 'MASK\nON', '#111827', 'mask_on', {}, 'mask_on')],
		['mask_off', buildButtonPreset('Mask Off', 'MASK\nOFF', '#374151', 'mask_off', {}, 'mask_off')],
		['mask_toggle', buildButtonPreset('Mask Toggle', 'MASK\nTOGGLE', '#1f2937', 'mask_toggle', {}, 'mask_toggle')],
	])

	const messageEntries = [
		['clear_message', buildButtonPreset('Clear Message', 'CLEAR\nMSG', '#6b7280', 'clear_message', {}, 'clear_message')],
		['message_custom', buildButtonPreset('Message: Standby (custom text)', 'STANDBY', '#f2b84b', 'set_message', { text: 'STANDBY' })],
	]
	for (const preset of MESSAGE_PRESETS) {
		messageEntries.push([
			`message_${preset.id}`,
			buildButtonPreset(
				preset.buttonLabel,
				wrapButtonLabel(preset.buttonLabel),
				preset.colorHex,
				preset.isToggle ? 'message_toggle_preset' : 'message_preset',
				{ preset: preset.id },
				'message_generic',
				true
			),
		])
	}
	addGroup('messaging', 'Stage Display Messages', messageEntries)

	// ── Notes & Flags ───────────────────────────────────────────
	const departments = [
		['lighting', 'Lighting', 'LX'],
		['sound', 'Sound', 'SND'],
		['video', 'Video', 'VID'],
		['automation', 'Automation', 'AUTO'],
		['cast', 'Cast', 'CAST'],
		['stage_management', 'Stage Management', 'SM'],
		['props', 'Props', 'PROPS'],
		['wardrobe', 'Wardrobe', 'WARD'],
		['scenic', 'Scenic', 'SCN'],
		['pyro', 'Pyro', 'PYRO'],
		['special_effects', 'Special Effects', 'FX'],
		['general', 'General', 'GEN'],
	]
	const noteEntries = [
		['flag', buildButtonPreset('Drop Flag', 'FLAG', '#eab308', 'flag')],
		['note_check_lighting', buildButtonPreset('Note: Check lighting', 'NOTE\nCHECK LX', '#3b6ef6', 'send_note', { text: 'Check lighting', department: 'lighting' })],
	]
	for (const [dept, label, short] of departments) {
		noteEntries.push([
			`note_${dept}`,
			buildButtonPreset(`Quick Note: ${label} #1`, `NOTE\n${short} 1`, '#3b6ef6', 'quick_note', { department: dept, index: 1 }),
		])
	}
	addGroup('notes', 'Notes & Flags', noteEntries)

	// ── NDI Output ──────────────────────────────────────────────
	addGroup('ndi', 'NDI Output', [
		['ndi_showrevuelive', buildButtonPreset('NDI: Show Output', 'NDI\nSHOW', '#0e8a8a', 'ndi_source', { source: 'showrevuelive' })],
		['ndi_gui', buildButtonPreset('NDI: Mirror GUI', 'NDI\nMIRROR', '#0e8a8a', 'ndi_source', { source: 'gui' })],
	])

	// ── Overlay Widgets ─────────────────────────────────────────
	// One toggle per kind the booth is likely to want on and off during a run.
	// The rest are reachable through the action.
	const widgetEntries = []
	for (const w of WIDGET_KINDS.filter((k) => ['cueNumber', 'cueLabel', 'ltc', 'showState', 'customText', 'wallClock', 'cueProgress', 'qlabRunningCues'].includes(k.id))) {
		widgetEntries.push([
			`widget_${w.id}`,
			buildButtonPreset(`Widget: ${w.label}`, w.label.toUpperCase().replace(' ', '\n'), '#1e2a44', 'widget_visibility', {
				kind: w.id,
				mode: 'toggle',
			}),
		])
	}
	widgetEntries.push([
		'widget_cueNumber_red',
		buildButtonPreset('Widget colour: Cue Number red', 'CUE\nRED', '#ff4545', 'widget_color', { kind: 'cueNumber', color: '#ff4545' }),
	])
	widgetEntries.push([
		'widget_cueNumber_reset',
		buildButtonPreset('Widget colour: Cue Number reset', 'CUE\nRESET', '#6b7280', 'widget_color', { kind: 'cueNumber', color: 'none' }),
	])
	addGroup('widgets', 'Overlay Widgets', widgetEntries)

	// ── Status (display-only) ───────────────────────────────────
	// Read-outs of the live state ShowRevue pushes back. No action on press.
	// Each one mirrors a published value; the feedbacks light them from state.
	addGroup('status', 'Status', [
		['status_recording', displayButton('Status: Recording lamp', 'REC', '#3a0d0d', [lit('recording', {}, '#d92d20')])],
		['status_source', displayButton('Status: Source health', 'SRC\n$(showrevue:source_health)', '#1f6feb', [lit('source_problem', {}, '#c87800')])],
		['status_timecode', displayButton('Status: Timecode', 'TC\n$(showrevue:timecode)', '#1e293b', [lit('ltc_locked', {}, '#008c3c')])],
		['status_fps', displayButton('Status: Frame rate', 'FPS\n$(showrevue:fps)', '#1e293b')],
		['status_ltc', displayButton('Status: LTC lock', '$(showrevue:ltc_status)', '#1e293b', [lit('ltc_locked', {}, '#008c3c')])],
		['status_showstate', displayButton('Status: Show State + timer', '$(showrevue:show_phase)\n$(showrevue:show_timer)', '#1f6feb')],
		['status_curtain', displayButton('Status: Countdown to show', 'CURTAIN\n$(showrevue:curtain_countdown)', '#7c3aed')],
		['status_showtimer', displayButton('Status: Show timer', '$(showrevue:show_timer)', '#334155')],
		['status_next_curtain', displayButton('Status: Next curtain', 'NEXT\nCURTAIN $(showrevue:next_curtain)', '#7c3aed')],
		['status_show_name', displayButton('Status: Show name', '$(showrevue:show_name)', '#334155')],
		['status_session', displayButton('Status: Session', '$(showrevue:session_name)\n$(showrevue:session_type)', '#334155')],
		['status_cue_number', displayButton('Status: Cue number', 'CUE\n$(showrevue:cue_number)', '#1e2a44')],
		['status_cue_label', displayButton('Status: Cue label', '$(showrevue:cue_label)', '#1e2a44')],
		['status_since_cue', displayButton('Status: Time since cue', 'SINCE\n$(showrevue:time_since_cue)', '#1e2a44')],
		['status_disk', displayButton('Status: Free disk (GB)', 'DISK\n$(showrevue:disk_free)G', '#334155', [lit('disk_low', { gb: 20 }, '#c80000')])],
		['status_notes', displayButton('Status: Note count', 'NOTES\n$(showrevue:note_count)', '#16a34a')],
		['status_streaming', displayButton('Status: Streaming', 'STREAM', '#0f3d6b', [lit('streaming', {}, '#005ac8')])],
		['status_ndi', displayButton('Status: NDI output', 'NDI', '#0e5c5c', [lit('ndi_sending', {}, '#007878')])],
		['status_audio_silent', displayButton('Status: Audio silence', 'SILENT\n$(showrevue:audio_silent_seconds)s', '#334155', [lit('audio_silent', { threshold: 10 }, '#c87800')])],
		['status_tc_trigger', displayButton('Status: Timecode trigger', 'TC TRIGGER\n$(showrevue:tc_trigger_state)', '#334155', [lit('tc_trigger_state', { state: 'running' }, '#008c3c')])],
		['status_tc_running_not_owned', displayButton('Status: Timecode running (not started by trigger)', 'TC RUNNING\n(not ours)', '#4b5563', [lit('tc_trigger_state', { state: 'running_not_owned' }, '#4b5563')])],
		['status_tc_stop_refused',displayButton('Status: Trigger stop refused', 'TC STOP\nREFUSED', '#334155', [lit('tc_trigger_state', { state: 'stop_refused' }, '#c026d3')])],
		['status_last_command', displayButton('Status: Last OSC command', 'LAST\n$(showrevue:last_command)', '#334155')],
		['status_last_message', displayButton('Status: Last message sent', 'MSG\n$(showrevue:last_message_text)', '#334155')],
	])

	self.setPresetDefinitions(structure, presets)
}
