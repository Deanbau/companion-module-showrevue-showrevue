const MESSAGE_PRESETS = [
	{ id: 'call-60', buttonLabel: '60 Minute Call', colorHex: '#9bd7ff', isToggle: false, group: 'Messaging: Standard Calls' },
	{ id: 'the-half', buttonLabel: 'The Half', colorHex: '#4da3ff', isToggle: false, group: 'Messaging: Standard Calls' },
	{ id: 'call-30', buttonLabel: '30 Minute Call', colorHex: '#4da3ff', isToggle: false, group: 'Messaging: Standard Calls' },
	{ id: 'call-15', buttonLabel: '15 Minute Call', colorHex: '#4da3ff', isToggle: false, group: 'Messaging: Standard Calls' },
	{ id: 'call-5', buttonLabel: '5 Minute Call', colorHex: '#ff9f2d', isToggle: false, group: 'Messaging: Standard Calls' },
	{ id: 'beginners', buttonLabel: 'Beginners / Places', colorHex: '#ff4545', isToggle: false, group: 'Messaging: Standard Calls' },
	{ id: 'house-open', buttonLabel: 'House is open', colorHex: '#37e86b', isToggle: true, group: 'Messaging: Standard Calls' },
	{ id: 'go', buttonLabel: 'Go / Curtain Up', colorHex: '#ff2d2d', isToggle: false, group: 'Messaging: Standard Calls' },
	{ id: 'interval', buttonLabel: 'Interval', colorHex: '#b06cff', isToggle: true, group: 'Messaging: Interval & Mid-Show' },
	{ id: 'to-interval-10', buttonLabel: '10 Minutes To Interval', colorHex: '#ff9f2d', isToggle: false, group: 'Messaging: Interval & Mid-Show' },
	{ id: 'to-interval-5', buttonLabel: '5 Minutes To Interval', colorHex: '#ff9f2d', isToggle: false, group: 'Messaging: Interval & Mid-Show' },
	{ id: 'interval-10', buttonLabel: 'Interval 10', colorHex: '#ff9f2d', isToggle: false, group: 'Messaging: Interval & Mid-Show' },
	{ id: 'interval-5', buttonLabel: 'Interval 5', colorHex: '#ff9f2d', isToggle: false, group: 'Messaging: Interval & Mid-Show' },
	{ id: 'part-2-beginners', buttonLabel: 'Act 2 / Part 2 Beginners', colorHex: '#ff4545', isToggle: false, group: 'Messaging: Interval & Mid-Show' },
	{ id: 'curtain-up-part-2', buttonLabel: 'Curtain Up Part 2', colorHex: '#ff4545', isToggle: false, group: 'Messaging: Interval & Mid-Show' },
	{ id: 'encore-ready', buttonLabel: 'Encore Ready', colorHex: '#f7d154', isToggle: false, group: 'Messaging: Interval & Mid-Show' },
	{ id: 'show-stop', buttonLabel: 'Show Stop', colorHex: '#ff4545', isToggle: true, group: 'Messaging: Emergency & Safety' },
	{ id: 'show-stop-cleared', buttonLabel: 'Show Stop Cleared', colorHex: '#f2b84b', isToggle: false, group: 'Messaging: Emergency & Safety' },
	{ id: 'evacuation', buttonLabel: 'Evacuation', colorHex: '#ff4545', isToggle: false, group: 'Messaging: Emergency & Safety' },
	{ id: 'hold', buttonLabel: 'Hold', colorHex: '#ff4545', isToggle: false, group: 'Messaging: Emergency & Safety' },
	{ id: 'resume', buttonLabel: 'Resume', colorHex: '#37e86b', isToggle: false, group: 'Messaging: Emergency & Safety' },
	{ id: 'all-clear', buttonLabel: 'All Clear', colorHex: '#37e86b', isToggle: false, group: 'Messaging: Emergency & Safety' },
	{ id: 'show-end-10', buttonLabel: '10 Minutes To End Of Show', colorHex: '#ff9f2d', isToggle: false, group: 'Messaging: Emergency & Safety' },
	{ id: 'doors-open', buttonLabel: 'Doors Open', colorHex: '#37e86b', isToggle: false, group: 'Messaging: Concert / Event' },
	{ id: 'support-act', buttonLabel: 'Support Act', colorHex: '#4da3ff', isToggle: false, group: 'Messaging: Concert / Event' },
	{ id: 'main-act', buttonLabel: 'Main Act', colorHex: '#ff4545', isToggle: false, group: 'Messaging: Concert / Event' },
	{ id: 'sound-check', buttonLabel: 'Sound Check', colorHex: '#b06cff', isToggle: false, group: 'Messaging: Concert / Event' },
	{ id: 'band-on-stage', buttonLabel: 'Band On Stage', colorHex: '#ff9f2d', isToggle: false, group: 'Messaging: Concert / Event' },
]

function buildMessagePresetChoices() {
	return MESSAGE_PRESETS.map((preset) => ({
		id: preset.id,
		label: `${preset.buttonLabel}${preset.isToggle ? ' (toggle-capable)' : ''}`,
	}))
}

function findMessagePreset(id) {
	// 'house-is-open' was briefly its own preset; it is now the one 'house-open' button.
	if (id === 'house-is-open') id = 'house-open'
	return MESSAGE_PRESETS.find((preset) => preset.id === id)
}

function wrapButtonLabel(label) {
	return label
		.replace(' / ', '\n')
		.replace(' Minute Call', ' Min\nCall')
		.replace(' Minutes To ', ' Min To\n')
		.replace('Curtain Up ', 'Curtain Up\n')
		.replace('Part 2 ', 'Part 2\n')
		.replace('Show Stop ', 'Show Stop\n')
		.replace('Band On ', 'Band On\n')
}

// Overlay widget kinds, matching OverlayWidgetKind.rawValue in the app. A
// widget's custom OSC ID (set in the layout inspector) works in their place.
const WIDGET_KINDS = [
	{ id: 'showName', label: 'Show Name' },
	{ id: 'showType', label: 'Show Type' },
	{ id: 'showNumber', label: 'Show Number' },
	{ id: 'ltc', label: 'Timecode' },
	{ id: 'timecodeSource', label: 'Timecode Source' },
	{ id: 'recordingStatus', label: 'Recording Status' },
	{ id: 'cueNumber', label: 'Cue Number' },
	{ id: 'cueLabel', label: 'Cue Label' },
	{ id: 'audioScene', label: 'Audio Scene' },
	{ id: 'cueElapsed', label: 'Time Since Cue' },
	{ id: 'prevCueDuration', label: 'Previous Cue Duration' },
	{ id: 'cueLine', label: 'Cue Line' },
	{ id: 'secondaryCueLine', label: 'Secondary Cue Line' },
	{ id: 'customText', label: 'Custom Text' },
	{ id: 'pngImage', label: 'PNG Image' },
	{ id: 'wallClock', label: 'Wall Clock' },
	{ id: 'numberLine', label: 'Number Line' },
	{ id: 'qlabRunningCues', label: 'QLab Running Cues' },
	{ id: 'showState', label: 'Show State' },
	{ id: 'theatremixCue', label: 'TheatreMix Cue' },
	{ id: 'cueProgress', label: 'Cue Progress' },
	{ id: 'videoSource', label: 'Video Source' },
	{ id: 'positionData', label: 'Position Data' },
]

module.exports = {
	MESSAGE_PRESETS,
	WIDGET_KINDS,
	buildMessagePresetChoices,
	findMessagePreset,
	wrapButtonLabel,
}

