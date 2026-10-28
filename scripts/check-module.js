// Offline check, no Companion needed: node scripts/check-module.js
// Loads the action, feedback and preset definitions with a stub instance and fails on anything Companion would
// reject or silently drop: a preset that points at an action or feedback that does not exist, a duplicate id,
// a rotate action with no definition. Also exercises the held-button frame stepper.
const assert = require('node:assert/strict')
const { createFrameHold } = require('../src/frameHold')

const defs = { actions: null, feedbacks: null, presets: null, structure: null }
const self = {
	setActionDefinitions: (a) => { defs.actions = a },
	setFeedbackDefinitions: (f) => { defs.feedbacks = f },
	setPresetDefinitions: (structure, presets) => { defs.structure = structure; defs.presets = presets },
	setVariableDefinitions: () => {},
	sendCommand: async () => {},
	frameHold: { start() {}, stop() {} },
	getVariableValue: () => '',
	appState: {},
}
require('../src/actions')(self)
require('../src/feedbacks')(self)
require('../src/presets')(self)

const actionIds = new Set(Object.keys(defs.actions))
const feedbackIds = new Set(Object.keys(defs.feedbacks))
let presetCount = 0
const problems = []
for (const [key, p] of Object.entries(defs.presets)) {
	presetCount++
	const used = []
	for (const step of p.steps || []) {
		for (const list of [step.down, step.up, step.rotate_left, step.rotate_right]) for (const a of list || []) used.push(a.actionId)
	}
	for (const id of used) if (!actionIds.has(id)) problems.push(`${key}: unknown action ${id}`)
	for (const f of p.feedbacks || []) if (!feedbackIds.has(f.feedbackId)) problems.push(`${key}: unknown feedback ${f.feedbackId}`)
}
for (const g of defs.structure) for (const id of g.definitions) if (!defs.presets[id]) problems.push(`group ${g.id}: missing preset ${id}`)
const grouped = new Set(defs.structure.flatMap((g) => g.definitions))
for (const key of Object.keys(defs.presets)) if (!grouped.has(key)) problems.push(`${key}: not in any group`)

// The new actions and presets are there, and the dials turn the right way.
for (const id of ['go_live', 'timeline_zoom_in', 'timeline_zoom_out', 'timeline_zoom_fit', 'frame_hold', 'frame_hold_stop']) assert(actionIds.has(id), `missing action ${id}`)
const dial = defs.presets.dial_frames.steps[0]
assert.equal(dial.rotate_left[0].actionId, 'previous_frame')
assert.equal(dial.rotate_right[0].actionId, 'next_frame')
assert.equal(defs.presets.scrub_hold_forward.steps[0].up[0].actionId, 'frame_hold_stop')
assert.deepEqual(problems, [], problems.join('\n'))

// Held-button stepper: steps at once, keeps stepping, stops on release and on its own safety timeout.
const run = async () => {
	const sent = []
	const hold = createFrameHold(async (a) => { sent.push(a) }, { maxHoldMs: 400 })
	hold.start('next', 30)
	assert.equal(sent.length, 1, 'steps once straight away')
	await new Promise((r) => setTimeout(r, 140))
	assert(sent.length >= 3, `keeps stepping (${sent.length})`)
	assert.equal(sent[0], '/showrevue/next/frame')
	hold.stop()
	const n = sent.length
	await new Promise((r) => setTimeout(r, 100))
	assert.equal(sent.length, n, 'stops on release')
	assert.equal(hold.isRunning(), false)
	hold.start('previous', 30)
	assert.equal(sent.at(-1), '/showrevue/previous/frame')
	await new Promise((r) => setTimeout(r, 500))
	assert.equal(hold.isRunning(), false, 'stops itself when the release never arrives')
	const m = sent.length
	await new Promise((r) => setTimeout(r, 100))
	assert.equal(sent.length, m)
	const failing = createFrameHold(async () => { throw new Error('socket closed') })
	failing.start('next', 30)
	await new Promise((r) => setTimeout(r, 80))
	failing.stop()
}
run().then(() => console.log(`check-module: ok (${actionIds.size} actions, ${feedbackIds.size} feedbacks, ${presetCount} presets)`)).catch((e) => { console.error(e); process.exit(1) })
