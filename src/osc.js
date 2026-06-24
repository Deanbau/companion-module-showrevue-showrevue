function paddedStringBuffer(value) {
	const stringBuffer = Buffer.from(`${value}\0`, 'utf8')
	const padding = (4 - (stringBuffer.length % 4)) % 4
	return padding ? Buffer.concat([stringBuffer, Buffer.alloc(padding)]) : stringBuffer
}

function int32Buffer(value) {
	const buffer = Buffer.alloc(4)
	buffer.writeInt32BE(value, 0)
	return buffer
}

function float32Buffer(value) {
	const buffer = Buffer.alloc(4)
	buffer.writeFloatBE(value, 0)
	return buffer
}

function buildOscPacket(address, args = []) {
	const typeTags = [',']
	const buffers = [paddedStringBuffer(address)]

	for (const arg of args) {
		if (typeof arg === 'string') {
			typeTags.push('s')
		} else if (typeof arg === 'number') {
			typeTags.push(Number.isInteger(arg) ? 'i' : 'f')
		} else if (typeof arg === 'boolean') {
			typeTags.push(arg ? 'T' : 'F')
		} else {
			throw new Error(`Unsupported OSC argument type for ${address}`)
		}
	}

	buffers.push(paddedStringBuffer(typeTags.join('')))

	for (const arg of args) {
		if (typeof arg === 'string') {
			buffers.push(paddedStringBuffer(arg))
		} else if (typeof arg === 'number') {
			buffers.push(Number.isInteger(arg) ? int32Buffer(arg) : float32Buffer(arg))
		}
	}

	return Buffer.concat(buffers)
}

module.exports = {
	buildOscPacket,
	parseOscPacket,
}

// Read a null-terminated, 4-byte-aligned OSC string at `offset`.
function readOscString(buffer, offset) {
	let end = offset
	while (end < buffer.length && buffer[end] !== 0) end++
	const value = buffer.toString('utf8', offset, end)
	let next = end + 1
	next += (4 - (next % 4)) % 4
	return { value, next }
}

// Minimal OSC message parser → { address, args } or null. Supports s/i/f/T/F.
function parseOscPacket(buffer) {
	try {
		if (!buffer || buffer.length < 4 || buffer[0] !== 0x2f /* '/' */) return null
		const addrRes = readOscString(buffer, 0)
		const address = addrRes.value
		let offset = addrRes.next
		if (offset >= buffer.length) return { address, args: [] }
		const tagRes = readOscString(buffer, offset)
		offset = tagRes.next
		const tags = tagRes.value
		if (tags[0] !== ',') return { address, args: [] }
		const args = []
		for (let i = 1; i < tags.length; i++) {
			const t = tags[i]
			if (t === 's') {
				const r = readOscString(buffer, offset)
				args.push(r.value)
				offset = r.next
			} else if (t === 'i') {
				args.push(buffer.readInt32BE(offset))
				offset += 4
			} else if (t === 'f') {
				args.push(buffer.readFloatBE(offset))
				offset += 4
			} else if (t === 'T') {
				args.push(true)
			} else if (t === 'F') {
				args.push(false)
			}
		}
		return { address, args }
	} catch {
		return null
	}
}

