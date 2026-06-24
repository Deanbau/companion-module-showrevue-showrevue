const { buildMessagePresetChoices, findMessagePreset } = require('./constants')

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
					self.log('warn', 'Note action ignored — empty text')
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
			options: [{ id: 'number', type: 'number', label: 'Interval number', default: 1, min: 1, max: 3, step: 1 }],
			callback: async (event) => {
				const n = parseOptionalNumber(event.options.number) ?? 1
				await self.sendCommand('/showrevue/showstate/interval', [n], `Show State: Interval ${n}`)
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
						{ id: 'showrevuelive', label: 'ShowRevueLive (camera + overlay)' },
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
						{ id: 'on', label: 'On — kill all outputs' },
						{ id: 'off', label: 'Off — allow outputs' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (event) => {
				const s = ['on', 'off', 'toggle'].includes(event.options.state) ? event.options.state : 'toggle'
				await self.sendCommand(`/showrevue/monitor/${s}`, [], `Monitor Only ${s}`)
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
	})
}
