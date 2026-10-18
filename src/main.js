const dgram = require('node:dgram')
const { InstanceBase, InstanceStatus, Regex } = require('@companion-module/base')
const { buildOscPacket, parseOscPacket } = require('./osc')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdatePresets = require('./presets')
const UpdateVariableDefinitions = require('./variables')
class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.socket = null
		this.listenSocket = null
		this.listenPort = null
		// Live state pushed back by ShowRevue over OSC (/showrevue/state/*).
		this.appState = {
			recording: false, timecode: '', fps: '', cue_number: '', cue_label: '', show_name: '',
			time_since_cue: '', ltc_status: '', show_phase: '', show_timer: '',
			session_name: '', session_type: '', streaming: '0', ndi_sending: '0',
			note_count: '0', next_curtain: '', source_health: 'off', disk_free: '',
			curtain_countdown: '', audio_silent_seconds: '0', tc_trigger_state: '',
		}
		this.sentState = this.createInitialSentState()
	}

	createInitialSentState() {
		return {
			lastCommand: '',
			lastMessagePreset: '',
			lastMessageText: '',
			lastMaskCommand: '',
		}
	}

	async init(config) {
		this.config = config
		this.sentState = this.createInitialSentState()

		this.ensureSocket()
		this.ensureListenSocket()
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()
		this.refreshStatus()
		this.refreshVariables()
	}

	async destroy() {
		if (this.socket) {
			this.socket.close()
			this.socket = null
		}
		if (this.listenSocket) {
			this.listenSocket.close()
			this.listenSocket = null
		}
	}

	async configUpdated(config) {
		this.config = config
		this.ensureListenSocket()
		this.refreshStatus()
		this.refreshVariables()
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'Point this module at ShowRevue\'s OSC Control listener. Default port: 8001.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target host',
				width: 8,
				default: '127.0.0.1',
				useVariables: true,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target port',
				width: 4,
				default: '8001',
				regex: Regex.PORT,
			},
			{
				type: 'static-text',
				id: 'feedback_note',
				width: 12,
				label: 'Feedback',
				value: 'ShowRevue can publish live state (record/timecode/cue) back over OSC. Enable "Send feedback to Companion" in ShowRevue → Preferences → Companion and point it at this machine on the port below. Variables: \$(showrevue:recording), \$(showrevue:timecode), \$(showrevue:cue_number)…',
			},
			{
				type: 'textinput',
				id: 'feedbackPort',
				label: 'Feedback listen port',
				width: 4,
				default: '8002',
				regex: Regex.PORT,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updatePresets() {
		UpdatePresets(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	refreshStatus() {
		const host = String(this.config.host ?? '').trim()
		const port = Number(this.config.port)

		if (!host) {
			this.updateStatus(InstanceStatus.BadConfig, 'Enter a target host')
			return
		}

		if (!Number.isInteger(port) || port <= 0 || port > 65535) {
			this.updateStatus(InstanceStatus.BadConfig, 'Enter a valid target port')
			return
		}

		this.updateStatus(InstanceStatus.Ok)
	}

	refreshVariables() {
		this.setVariableValues({
			target_host: String(this.config.host ?? ''),
			target_port: String(this.config.port ?? ''),
			last_command: this.sentState.lastCommand,
			last_message_preset: this.sentState.lastMessagePreset,
			last_message_text: this.sentState.lastMessageText,
			last_mask_command: this.sentState.lastMaskCommand,
			recording: this.appState.recording ? '1' : '0',
			monitor_only: this.appState.monitor_only ? '1' : '0',
			outputs_armed: this.appState.outputs_armed ? '1' : '0',
			tc_trigger_armed: this.appState.tc_trigger_armed ? '1' : '0',
			tc_trigger_state: this.appState.tc_trigger_state,
			timecode: this.appState.timecode,
			fps: this.appState.fps,
			cue_number: this.appState.cue_number,
			cue_label: this.appState.cue_label,
			show_name: this.appState.show_name,
			time_since_cue: this.appState.time_since_cue,
			ltc_status: this.appState.ltc_status,
			show_phase: this.appState.show_phase,
			show_timer: this.appState.show_timer,
			session_name: this.appState.session_name,
			session_type: this.appState.session_type,
			streaming: this.appState.streaming,
			ndi_sending: this.appState.ndi_sending,
			note_count: this.appState.note_count,
			next_curtain: this.appState.next_curtain,
			source_health: this.appState.source_health,
			disk_free: this.appState.disk_free,
			curtain_countdown: this.appState.curtain_countdown,
				audio_silent_seconds: this.appState.audio_silent_seconds,
		})
	}

	// Bind a UDP listener for state ShowRevue pushes back (/showrevue/state/*).
	ensureListenSocket() {
		const port = Number(this.config.feedbackPort)
		if (!Number.isInteger(port) || port <= 0 || port > 65535) return
		if (this.listenSocket && this.listenPort === port) return
		if (this.listenSocket) {
			try {
				this.listenSocket.close()
			} catch {
				// ignore
			}
			this.listenSocket = null
		}
		const sock = require('node:dgram').createSocket('udp4')
		sock.on('error', (error) => {
			this.log('error', `Feedback listener error: ${error.message}`)
		})
		sock.on('message', (msg) => this.handleStateMessage(msg))
		sock.bind(port, () => {
			this.listenPort = port
			this.log('info', `Listening for ShowRevue state feedback on UDP ${port}`)
		})
		this.listenSocket = sock
	}

	// Parse one /showrevue/state/<key> message and update state + feedbacks.
	handleStateMessage(buffer) {
		const msg = parseOscPacket(buffer)
		if (!msg || !msg.address.startsWith('/showrevue/state/')) return
		const key = msg.address.slice('/showrevue/state/'.length)
		const raw = msg.args.length ? msg.args[0] : ''
		// Generic: store any /showrevue/state/<key> ShowRevue sends. Keys with a
		// matching variable definition surface in Companion; the rest are kept too.
		if (key === 'recording' || key === 'monitor_only' || key === 'outputs_armed' || key === 'tc_trigger_armed') {
			this.appState[key] = raw === '1' || raw === 1 || raw === true
		} else {
			this.appState[key] = String(raw)
		}
		this.refreshVariables()
		this.checkFeedbacks('recording', 'source_problem', 'monitor_only', 'outputs_armed', 'tc_trigger_armed', 'tc_trigger_state', 'ltc_locked', 'show_phase', 'streaming', 'ndi_sending', 'audio_silent', 'disk_low')
	}

	recordSentState(update) {
		this.sentState = {
			...this.sentState,
			...update,
		}
		this.refreshVariables()
	}

	ensureSocket() {
		if (this.socket) {
			return
		}

		this.socket = dgram.createSocket('udp4')
		this.socket.on('error', (error) => {
			this.log('error', `OSC socket error: ${error.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, error.message)
		})
	}

	async sendCommand(address, args = [], summary = address, stateUpdate = {}) {
		const host = String(this.config.host ?? '').trim()
		const port = Number(this.config.port)

		if (!host || !Number.isInteger(port) || port <= 0 || port > 65535) {
			this.refreshStatus()
			return
		}

		this.ensureSocket()

		const packet = buildOscPacket(address, args)
		this.log('debug', `SEND ${address} ${args.map((arg) => JSON.stringify(arg)).join(' ')}`.trim())

		await new Promise((resolve, reject) => {
			this.socket.send(packet, port, host, (error) => {
				if (error) {
					reject(error)
				} else {
					resolve()
				}
			})
		})
			.then(() => {
				this.updateStatus(InstanceStatus.Ok)
				this.recordSentState({
					lastCommand: summary,
					...stateUpdate,
				})
			})
			.catch((error) => {
				this.log('error', `Failed to send OSC command "${summary}": ${error.message}`)
				this.updateStatus(InstanceStatus.ConnectionFailure, error.message)
			})
	}
}

module.exports = ModuleInstance
