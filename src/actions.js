const { buildMessagePresetChoices, findMessagePreset, WIDGET_KINDS } = require('./constants')

// Session types by 1-based index — match SessionType.allCases order in the ShowRevue app.
// The index survives renames, so the choice does not depend on the operator's custom names.
const SESSION_TYPE_CHOICES = [
	{ id: '1', label: '1: Off Venue Rehearsal' },
	{ id: '2', label: '2: Tech Rehearsal' },
	{ id: '3', label: '3: Dress Rehearsal' },
	{ id: '4', label: '4: Show' },
]

// Note departments — match NoteCategory.rawValue in the ShowRevue app.
const NOTE_DEPARTMENTS = [
	{ id: 'lighting', label: 'Lighting' },
	{ id: 'sound', label: 'Sound' },
	{ id: 'video', label: 'Video' },
	{ id: 'automation', label: 'Automation' },
	{ id: 'cast', label: 'Cast' },
	{ id: 'stage_management', label: 'Stage Management' },
	{ id: 'props', label: 'Props' },
	{ id: 'wardrobe', label: 'Wardrobe' },
	{ id: 'scenic', label: 'Scenic' },
	{ id: 'pyro', label: 'Pyro' },
	{ id: 'special_effects', label: 'Special Effects' },
	{ id: 'general', label: 'General' },
]

function parseOptionalNumber(value) {
	if (value === undefined || value === null) {
		return null
	}

	const trimmed = String(value).trim()
	if (!trimmed) {
		return null
	}

	const parsed = Number(trimmed)
	return Number.isFinite(parsed) ? parsed : null
}

module.exports = function (self) {
	const messagePresetChoices = buildMessagePresetChoices()

	self.setActionDefinitions({
		record: {
			name: 'Transport: Record',
			callback: async () => {
				await self.sendCommand('/showrevue/record', [], 'Record')
			},
		},
		stop: {
			name: 'Transport: Stop',
			callback: async () => {
				await self.sendCommand('/showrevue/stop', [], 'Stop')
			},
		},
		play: {
			name: 'Transport: Play',
			callback: async () => {
				await self.sendCommand('/showrevue/play', [], 'Play')
			},
		},
		pause: {
			name: 'Transport: Pause',
			callback: async () => {
				await self.sendCommand('/showrevue/pause', [], 'Pause')
			},
		},
		next_cue: {
			name: 'Navigation: Next Cue',
			callback: async () => {
				await self.sendCommand('/showrevue/next/cue', [], 'Next Cue')
			},
		},
		previous_cue: {
			name: 'Navigation: Previous Cue',
			callback: async () => {
				await self.sendCommand('/showrevue/previous/cue', [], 'Previous Cue')
			},
		},
		next_recording: {
			name: 'Navigation: Next Recording',
			callback: async () => {
				await self.sendCommand('/showrevue/next/recording', [], 'Next Recording')
			},
		},
		previous_recording: {
			name: 'Navigation: Previous Recording',
			callback: async () => {
				await self.sendCommand('/showrevue/previous/recording', [], 'Previous Recording')
			},
		},
		next_timecode_segment: {
			name: 'Navigation: Next Timecode Segment',
			callback: async () => {
				await self.sendCommand('/showrevue/next/timecode', [], 'Next Timecode Segment')
			},
		},
		previous_timecode_segment: {
			name: 'Navigation: Previous Timecode Segment',
			callback: async () => {
				await self.sendCommand('/showrevue/previous/timecode', [], 'Previous Timecode Segment')
			},
		},
		forward: {
			name: 'Navigation: Forward',
			options: [
				{
					id: 'seconds',
					type: 'number',
					label: 'Seconds',
					default: 5,
					min: 0,
					max: 3600,
					step: 0.1,
				},
			],
			callback: async (event) => {
				const seconds = Math.abs(Number(event.options.seconds) || 5)
				await self.sendCommand('/showrevue/forward', [seconds], `Forward ${seconds}s`)
			},
		},
		back: {
			name: 'Navigation: Back',
			options: [
				{
					id: 'seconds',
					type: 'number',
					label: 'Seconds',
					default: 5,
					min: 0,
					max: 3600,
					step: 0.1,
				},
			],
			callback: async (event) => {
				const seconds = Math.abs(Number(event.options.seconds) || 5)
				await self.sendCommand('/showrevue/back', [seconds], `Back ${seconds}s`)
			},
		},
		next_frame: {
			name: 'Navigation: Next Frame',
			callback: async () => {
				await self.sendCommand('/showrevue/next/frame', [], 'Next Frame')
			},
		},
		previous_frame: {
			name: 'Navigation: Previous Frame',
			callback: async () => {
				await self.sendCommand('/showrevue/previous/frame', [], 'Previous Frame')
			},
		},
		set_loop_in: {
			name: 'Loop: Set In',
			callback: async () => {
				await self.sendCommand('/showrevue/set/in', [], 'Set Loop In')
			},
		},
		set_loop_out: {
			name: 'Loop: Set Out',
			callback: async () => {
				await self.sendCommand('/showrevue/set/out', [], 'Set Loop Out')
			},
		},
		go_loop_in: {
			name: 'Loop: Go To In',
			callback: async () => {
				await self.sendCommand('/showrevue/go/in', [], 'Go Loop In')
			},
		},
		go_loop_out: {
			name: 'Loop: Go To Out',
			callback: async () => {
				await self.sendCommand('/showrevue/go/out', [], 'Go Loop Out')
			},
		},
		toggle_loop: {
			name: 'Loop: Toggle',
			callback: async () => {
				await self.sendCommand('/showrevue/loop/toggle', [], 'Toggle Loop')
			},
		},
		enable_loop: {
			name: 'Loop: Enable',
			callback: async () => {
				await self.sendCommand('/showrevue/loop/on', [], 'Enable Loop')
			},
		},
		disable_loop: {
			name: 'Loop: Disable',
			callback: async () => {
				await self.sendCommand('/showrevue/loop/off', [], 'Disable Loop')
			},
		},
		stop_loop: {
			name: 'Loop: Stop',
			callback: async () => {
				await self.sendCommand('/showrevue/loop/stop', [], 'Stop Loop')
			},
		},
		clear_loop: {
			name: 'Loop: Clear',
			callback: async () => {
				await self.sendCommand('/showrevue/loop/clear', [], 'Clear Loop')
			},
		},
		set_message: {
			name: 'Message: Set Custom',
			options: [
				{
					id: 'text',
					type: 'textinput',
					label: 'Message text',
					default: 'STANDBY',
					useVariables: true,
				},
				{
					id: 'color',
					type: 'textinput',
					label: 'Optional colour hex (#RRGGBB)',
					default: '',
					useVariables: true,
				},
				{
					id: 'duration',
					type: 'textinput',
					label: 'Optional duration in seconds (blank = persistent)',
					default: '',
					useVariables: true,
				},
			],
			callback: async (event) => {
				const text = String(event.options.text ?? '').trim()
				if (!text) {
					self.log('warn', 'Custom message action ignored because message text is empty')
					return
				}

				const color = String(event.options.color ?? '').trim()
				const duration = parseOptionalNumber(event.options.duration)
				const args = [text]

				if (color) {
					args.push(color)
				}

				if (duration !== null) {
					args.push(duration)
				}

				await self.sendCommand('/showrevue/message/set', args, `Message: ${text}`, {
					lastMessageText: text,
					lastMessagePreset: '',
				})
			},
		},
		clear_message: {
			name: 'Message: Clear',
			callback: async () => {
				await self.sendCommand('/showrevue/message/clear', [], 'Clear Message', {
					lastMessageText: '',
					lastMessagePreset: '',
				})
			},
		},
		message_preset: {
			name: 'Message: Trigger Preset',
			options: [
				{
					id: 'preset',
					type: 'dropdown',
					label: 'Preset',
					default: 'call-30',
					choices: messagePresetChoices,
				},
			],
			callback: async (event) => {
				const presetId = event.options.preset
				const preset = findMessagePreset(presetId)
				if (!preset) {
					self.log('warn', `Unknown message preset: ${presetId}`)
					return
				}

				await self.sendCommand('/showrevue/message/preset', [preset.id], `Message Preset: ${preset.buttonLabel}`, {
					lastMessagePreset: preset.id,
					lastMessageText: preset.buttonLabel,
				})
			},
		},
		message_toggle_preset: {
			name: 'Message: Toggle Preset',
			options: [
				{
					id: 'preset',
					type: 'dropdown',
					label: 'Preset',
					default: 'house-open',
					choices: messagePresetChoices,
				},
			],
			callback: async (event) => {
				const presetId = event.options.preset
				const preset = findMessagePreset(presetId)
				if (!preset) {
					self.log('warn', `Unknown message preset: ${presetId}`)
					return
				}

				await self.sendCommand('/showrevue/message/toggle', [preset.id], `Message Toggle: ${preset.buttonLabel}`, {
					lastMessagePreset: preset.id,
					lastMessageText: preset.buttonLabel,
				})
			},
		},
		mask_on: {
			name: 'Mask: On',
			callback: async () => {
				await self.sendCommand('/showrevue/mask/on', [], 'Mask On', {
					lastMaskCommand: 'on',
				})
			},
		},
		mask_off: {
			name: 'Mask: Off',
			callback: async () => {
				await self.sendCommand('/showrevue/mask/off', [], 'Mask Off', {
					lastMaskCommand: 'off',
				})
			},
		},
		widget_visibility: {
			name: 'Overlay widget: Show / Hide / Toggle',
			options: [
				{
					id: 'kind',
					type: 'dropdown',
					label: 'Widget',
					default: 'cueNumber',
					choices: WIDGET_KINDS.map((w) => ({ id: w.id, label: w.label })),
					allowCustom: true,
					tooltip: 'Pick a widget kind, or type the OSC ID set in the layout inspector.',
				},
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Action',
					default: 'toggle',
					choices: [
						{ id: 'show', label: 'Show' },
						{ id: 'hide', label: 'Hide' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (event) => {
				const kind = String(event.options.kind || '').trim()
				const mode = event.options.mode || 'toggle'
				if (!kind) return
				await self.sendCommand(`/showrevue/widget/${kind}/${mode}`, [], `Widget ${kind} ${mode}`)
			},
		},
		widget_color: {
			name: 'Overlay widget: Set colour',
			options: [
				{
					id: 'kind',
					type: 'dropdown',
					label: 'Widget',
					default: 'cueNumber',
					choices: WIDGET_KINDS.map((w) => ({ id: w.id, label: w.label })),
					allowCustom: true,
				},
				{
					id: 'color',
					type: 'textinput',
					label: 'Colour (hex, or "none" to reset to white)',
					default: '#ff4545',
				},
			],
			callback: async (event) => {
				const kind = String(event.options.kind || '').trim()
				const color = String(event.options.color || '').trim() || 'none'
				if (!kind) return
				await self.sendCommand(`/showrevue/widget/${kind}/color`, [{ type: 's', value: color }], `Widget ${kind} colour ${color}`)
			},
		},
		mask_toggle: {
			name: 'Mask: Toggle',
			callback: async () => {
				await self.sendCommand('/showrevue/mask/toggle', [], 'Mask Toggle', {
					lastMaskCommand: 'toggle',
				})
			},
		},
		send_note: {
			name: 'Note: Send',
			options: [
				{
					id: 'text',
					type: 'textinput',
					label: 'Note text',
					default: '',
					useVariables: true,
				},
				{
					id: 'department',
					type: 'dropdown',
					label: 'Department',
					default: 'lighting',
					choices: NOTE_DEPARTMENTS,
				},
			],
			callback: async (event) => {
				const text = String(event.options.text ?? '').trim()
				if (!text) {
					self.log('warn', 'Note action ignored: empty text')
					return
				}
				const dept = String(event.options.department ?? 'lighting').trim() || 'lighting'
				await self.sendCommand(`/showrevue/note/${dept}`, [text], `Note (${dept}): ${text}`)
			},
		},
		quick_note: {
			name: 'Note: Quick Preset',
			options: [
				{
					id: 'department',
					type: 'dropdown',
					label: 'Department',
					default: 'lighting',
					choices: NOTE_DEPARTMENTS,
				},
				{
					id: 'index',
					type: 'number',
					label: 'Preset number (1-based)',
					default: 1,
					min: 1,
					max: 20,
					step: 1,
				},
			],
			callback: async (event) => {
				const dept = String(event.options.department ?? 'lighting').trim() || 'lighting'
				const index = parseOptionalNumber(event.options.index) ?? 1
				await self.sendCommand(`/showrevue/quicknote/${dept}`, [index], `Quick note (${dept}) #${index}`)
			},
		},
		flag: {
			name: 'Flag: Drop marker',
			options: [
				{ id: 'label', type: 'textinput', label: 'Label (optional)', default: '', useVariables: true },
			],
			callback: async (event) => {
				const label = String(event.options.label ?? '').trim()
				await self.sendCommand('/showrevue/flag', label ? [label] : [], label ? `Flag: ${label}` : 'Flag')
			},
		},
		timewarp_enter: {
			name: 'TimeWarp: Enter (DVR)',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/timewarp', [], 'TimeWarp Enter') },
		},
		timewarp_exit: {
			name: 'TimeWarp: Exit to live',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/timewarp/off', [], 'TimeWarp Exit') },
		},
		go_live: {
			name: 'View: Go to Live view (no recording)',
			description: 'Leaves TimeWarp, or takes Playback back to the Live view. Never starts a take. Needs ShowRevue 1.0 RC 3 or later.',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/live', [], 'Go to Live view') },
		},
		timeline_zoom_in: {
			name: 'Timeline: Zoom in',
			description: 'Zooms the Playback timeline in around the playhead. Needs ShowRevue 1.0 RC 3 or later.',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/zoom/in', [], 'Timeline Zoom In') },
		},
		timeline_zoom_out: {
			name: 'Timeline: Zoom out',
			description: 'Zooms the Playback timeline out. Needs ShowRevue 1.0 RC 3 or later.',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/zoom/out', [], 'Timeline Zoom Out') },
		},
		timeline_zoom_fit: {
			name: 'Timeline: Fit whole recording',
			description: 'Shows the whole recording in the Playback timeline. Needs ShowRevue 1.0 RC 3 or later.',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/zoom/fit', [], 'Timeline Zoom Fit') },
		},
		frame_hold: {
			name: 'Navigation: Step frames while held',
			description:
				'Put this on the button DOWN actions and "Navigation: Stop stepping frames" on the button UP actions. It steps one frame straight away, then keeps stepping at the rate below until you let go (it also stops itself after 30 seconds).',
			options: [
				{
					type: 'dropdown',
					id: 'direction',
					label: 'Direction',
					default: 'next',
					choices: [
						{ id: 'next', label: 'Forward' },
						{ id: 'previous', label: 'Backward' },
					],
				},
				{ type: 'number', id: 'rate', label: 'Frames per second', default: 12, min: 1, max: 30 },
			],
			callback: async (event) => {
				self.frameHold.start(event.options.direction, event.options.rate)
			},
		},
		frame_hold_stop: {
			name: 'Navigation: Stop stepping frames',
			description: 'Use on the button UP actions of "Step frames while held".',
			options: [],
			callback: async () => {
				self.frameHold.stop()
			},
		},
		show_state_preshow: {
			name: 'Show State: Preshow',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/showstate/preshow', [], 'Show State: Preshow') },
		},
		show_state_act: {
			name: 'Show State: Act',
			options: [{ id: 'number', type: 'number', label: 'Act number', default: 1, min: 1, max: 4, step: 1 }],
			callback: async (event) => {
				const n = parseOptionalNumber(event.options.number) ?? 1
				await self.sendCommand('/showrevue/showstate/act', [n], `Show State: Act ${n}`)
			},
		},
		show_state_interval: {
			name: 'Show State: Interval',
			options: [
					{ id: 'number', type: 'number', label: 'Interval number', default: 1, min: 1, max: 3, step: 1 },
					{ id: 'duration', type: 'textinput', label: 'Planned length in seconds (blank = no countdown)', default: '', useVariables: true },
				],
			callback: async (event) => {
				const n = parseOptionalNumber(event.options.number) ?? 1
				const duration = parseOptionalNumber(event.options.duration)
					const args = duration !== null ? [n, duration] : [n]
					await self.sendCommand('/showrevue/showstate/interval', args, `Show State: Interval ${n}`)
			},
		},
		show_state_finished: {
			name: 'Show State: Finished',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/showstate/finished', [], 'Show State: Finished') },
		},
		show_state_reset: {
			name: 'Show State: Reset',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/showstate/reset', [], 'Show State: Reset') },
		},
		show_start: {
			name: 'Show Times: Set next curtain',
			options: [{ id: 'time', type: 'textinput', label: 'Curtain time (HH:MM)', default: '19:30', useVariables: true }],
			callback: async (event) => {
				const t = String(event.options.time ?? '').trim()
				if (!t) return
				await self.sendCommand('/showrevue/showstart', [t], `Show start: ${t}`)
			},
		},
		next_show: {
			name: 'Show Times: Next show',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/nextshow', [], 'Next show') },
		},
		next_note: {
			name: 'Playback: Next Note',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/next/note', [], 'Next Note') },
		},
		previous_note: {
			name: 'Playback: Previous Note',
			options: [],
			callback: async () => { await self.sendCommand('/showrevue/previous/note', [], 'Previous Note') },
		},
		ndi_source: {
			name: 'NDI: Set Output Source',
			options: [
				{
					id: 'source',
					type: 'dropdown',
					label: 'Source',
					default: 'showrevuelive',
					choices: [
						{ id: 'showrevuelive', label: 'Stage Display (camera + overlay)' },
						{ id: 'gui', label: 'GUI Mirror (live / playback)' },
					],
				},
			],
			callback: async (event) => {
				const source = event.options.source === 'gui' ? 'gui' : 'showrevuelive'
				await self.sendCommand('/showrevue/ndi/source', [source], `NDI source: ${source}`)
			},
		},
		monitor_only: {
			name: 'Safety: Monitor Only (kill switch)',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'On: kill all outputs' },
						{ id: 'off', label: 'Off: allow outputs' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (event) => {
				const s = ['on', 'off', 'toggle'].includes(event.options.state) ? event.options.state : 'toggle'
				await self.sendCommand(`/showrevue/monitor/${s}`, [], `Monitor Only ${s}`)
			},
		},
		session_type: {
				name: 'Session: Set type',
				options: [
					{
						id: 'type',
						type: 'dropdown',
						label: 'Session type',
						default: '2',
						choices: SESSION_TYPE_CHOICES,
						allowCustom: true,
						tooltip: 'Pick a type, or type a custom name as it appears in Project Settings.',
					},
				],
				callback: async (event) => {
					const type = String(event.options.type ?? '').trim()
					if (!type) return
					await self.sendCommand('/showrevue/session/type', [type], `Session type ${type}`)
				},
			},
			session_number: {
				name: 'Session: Set next number',
				options: [{ id: 'number', type: 'number', label: 'Next number', default: 1, min: 1, max: 999, step: 1 }],
				callback: async (event) => {
					const n = Math.max(1, Math.trunc(parseOptionalNumber(event.options.number) ?? 1))
					await self.sendCommand('/showrevue/session/number', [n], `Session next number ${n}`)
				},
			},
			session_new: {
				name: 'Session: Start new session',
				options: [],
				callback: async () => {
					await self.sendCommand('/showrevue/session/new', [], 'Start new session')
				},
			},
			arm_outputs: {
			name: 'Safety: Arm outputs (fireback)',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'Arm' },
						{ id: 'off', label: 'Disarm' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (event) => {
				const s = ['on', 'off', 'toggle'].includes(event.options.state) ? event.options.state : 'toggle'
				await self.sendCommand(`/showrevue/arm/${s}`, [], `Arm outputs ${s}`)
			},
		},
		tc_trigger: {
			name: 'Record When Timecode Runs (arm)',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'Arm' },
						{ id: 'off', label: 'Disarm' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (event) => {
				const s = ['on', 'off', 'toggle'].includes(event.options.state) ? event.options.state : 'toggle'
				await self.sendCommand(`/showrevue/tctrigger/${s}`, [], `Record When Timecode Runs ${s}`)
			},
		},
	})
}
