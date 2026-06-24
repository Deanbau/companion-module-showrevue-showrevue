import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/icons.js')
const SIZE = 72

function svg(body, bg = 'none') {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 72 72">
  ${bg !== 'none' ? `<rect width="72" height="72" fill="${bg}"/>` : ''}
  ${body}
</svg>`
}

async function pngB64(svgStr) {
	const buf = await sharp(Buffer.from(svgStr)).png().toBuffer()
	return buf.toString('base64')
}

// ─── Shape helpers ────────────────────────────────────────────────────────────
const W = 'rgba(255,255,255,0.92)'
const DIM = 'rgba(255,255,255,0.64)'

function circle(cx, cy, r, fill) { return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>` }
function rect(x, y, w, h, fill, rx = 3) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>` }
function poly(points, fill) { return `<polygon points="${points}" fill="${fill}"/>` }
function path(d, fill = W, stroke = 'none', sw = 0) {
	return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`
}
function text(t, x, y, size, fill = W, weight = 700) {
	return `<text x="${x}" y="${y}" font-family="'SF Mono','Menlo','Courier New',monospace" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle" dominant-baseline="middle">${t}</text>`
}
function loopArrow(fill = W) {
	// circular arrow loop shape
	return `<path d="M36 16 A20 20 0 1 1 16.5 46 L12 46 L18 54 L24 46 L20 46 A16 16 0 1 0 36 20Z" fill="${fill}"/>`
}

// ─── Icon definitions ─────────────────────────────────────────────────────────
const icons = {
	// Transport
	record: svg(circle(36, 36, 18, '#ef4444')),
	stop:   svg(rect(15, 15, 42, 42, W, 4)),
	play:   svg(poly('18,12 58,36 18,60', W)),
	pause:  svg(rect(14, 12, 16, 48, W) + rect(42, 12, 16, 48, W)),

	// Navigation – cue
	next_cue: svg(
		poly('12,14 44,36 12,58', W) +
		rect(48, 12, 9, 48, W, 2)
	),
	previous_cue: svg(
		poly('60,14 28,36 60,58', W) +
		rect(15, 12, 9, 48, W, 2)
	),

	// Navigation – timecode segment
	next_timecode_segment: svg(
		poly('8,20 32,36 8,52', W) +
		poly('30,20 54,36 30,52', DIM) +
		rect(58, 16, 8, 40, W, 2)
	),
	previous_timecode_segment: svg(
		poly('64,20 40,36 64,52', W) +
		poly('42,20 18,36 42,52', DIM) +
		rect(6, 16, 8, 40, W, 2)
	),

	// Navigation – skip seconds
	forward: svg(
		poly('8,20 32,36 8,52', W) +
		poly('32,20 56,36 32,52', W) +
		text('+5', 36, 58, 11, DIM, 600)
	),
	back: svg(
		poly('64,20 40,36 64,52', W) +
		poly('40,20 16,36 40,52', W) +
		text('−5', 36, 58, 11, DIM, 600)
	),

	// Navigation – frame
	next_frame: svg(
		poly('14,18 44,36 14,54', W) +
		rect(48, 16, 8, 40, W, 2)
	),
	previous_frame: svg(
		poly('58,18 28,36 58,54', W) +
		rect(16, 16, 8, 40, W, 2)
	),

	// Loop
	set_loop_in: svg(
		loopArrow(DIM) +
		rect(10, 14, 8, 44, W, 2) +
		poly('10,36 22,28 22,44', '#60a5fa')
	),
	set_loop_out: svg(
		loopArrow(DIM) +
		rect(54, 14, 8, 44, W, 2) +
		poly('62,36 50,28 50,44', '#60a5fa')
	),
	go_loop_in: svg(
		loopArrow(DIM) +
		rect(10, 14, 8, 44, W, 2) +
		poly('28,36 14,26 14,46', W)
	),
	go_loop_out: svg(
		loopArrow(DIM) +
		rect(54, 14, 8, 44, W, 2) +
		poly('44,36 58,26 58,46', W)
	),
	toggle_loop: svg(
		loopArrow(W) +
		`<path d="M28 36 L44 36" stroke="${W}" stroke-width="3" stroke-linecap="round"/>` +
		path('M40 30 L46 36 L40 42', 'none', W, 3)
	),
	enable_loop: svg(
		loopArrow(W) +
		circle(54, 54, 12, '#22c55e') +
		path('M48 54 L52 58 L60 50', 'none', '#fff', 3)
	),
	disable_loop: svg(
		loopArrow(DIM) +
		circle(54, 54, 12, '#ef4444') +
		path('M48 54 L60 54', 'none', '#fff', 3)
	),
	stop_loop: svg(
		loopArrow(DIM) +
		rect(44, 44, 20, 20, '#ef4444', 4)
	),
	clear_loop: svg(
		loopArrow(DIM) +
		circle(54, 54, 12, '#6b7280') +
		path('M49 49 L59 59 M59 49 L49 59', 'none', '#fff', 2.5)
	),

	// Mask
	mask_on: svg(
		// eye with strike-through
		`<path d="M10 36 Q36 10 62 36 Q36 62 10 36Z" fill="none" stroke="${W}" stroke-width="3.5"/>` +
		circle(36, 36, 9, W) +
		`<line x1="18" y1="18" x2="54" y2="54" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>`
	),
	mask_off: svg(
		`<path d="M10 36 Q36 10 62 36 Q36 62 10 36Z" fill="none" stroke="${W}" stroke-width="3.5"/>` +
		circle(36, 36, 9, W)
	),
	mask_toggle: svg(
		`<path d="M10 36 Q36 10 62 36 Q36 62 10 36Z" fill="none" stroke="${W}" stroke-width="3"/>` +
		circle(36, 36, 7, W) +
		`<path d="M50 24 L60 24 L60 34" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
		`<path d="M22 48 L12 48 L12 38" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
	),

	// Messages
	clear_message: svg(
		`<rect x="10" y="16" width="52" height="36" rx="6" fill="none" stroke="${W}" stroke-width="3"/>` +
		path('M22 28 L50 44 M50 28 L22 44', 'none', '#ef4444', 3)
	),
	message_generic: svg(
		`<rect x="10" y="18" width="52" height="32" rx="6" fill="none" stroke="${W}" stroke-width="3"/>` +
		`<rect x="18" y="26" width="30" height="3" rx="1.5" fill="${W}"/>` +
		`<rect x="18" y="34" width="20" height="3" rx="1.5" fill="${DIM}"/>`
	),
}

// ─── Generate and write ───────────────────────────────────────────────────────
console.log('Generating icons…')
const entries = {}
for (const [name, svgStr] of Object.entries(icons)) {
	process.stdout.write(`  ${name}… `)
	entries[name] = await pngB64(svgStr)
	console.log('✓')
}

const js = `// Auto-generated by scripts/gen-icons.mjs — do not edit
module.exports = ${JSON.stringify(entries, null, 0).replace(/,"/g, ',\n  "').replace('{"', '{\n  "').replace(/}$/, '\n}')}
`
writeFileSync(OUT, js)
console.log(`\nWrote ${OUT}`)
