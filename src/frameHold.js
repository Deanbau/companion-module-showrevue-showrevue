// "Step frames while held": a Stream Deck button has no native repeat, so a press starts a timer that sends
// next or previous frame, and the release stops it. The timer also stops by itself after maxHoldMs, so a lost
// button-up (Companion restart, cable pulled) can never leave ShowRevue stepping on its own.

function createFrameHold(send, { maxHoldMs = 30000 } = {}) {
	let timer = null
	let guard = null

	const stop = () => {
		if (timer) clearInterval(timer)
		if (guard) clearTimeout(guard)
		timer = null
		guard = null
	}

	const start = (direction, perSecond) => {
		stop()
		const previous = direction === 'previous'
		const address = previous ? '/showrevue/previous/frame' : '/showrevue/next/frame'
		const summary = previous ? 'Previous Frame (held)' : 'Next Frame (held)'
		const rate = Math.min(30, Math.max(1, Number(perSecond) || 12))
		const fire = () => Promise.resolve(send(address, [], summary)).catch(() => {})
		fire()
		timer = setInterval(fire, Math.round(1000 / rate))
		guard = setTimeout(stop, maxHoldMs)
	}

	return { start, stop, isRunning: () => timer !== null }
}

module.exports = { createFrameHold }
