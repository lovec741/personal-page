const canvas = document.getElementById("canvas")
const c = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight-5

const tiles_width = Math.round(canvas.width/15)+1 // amount of tiles horizontally
const tiles_height = Math.round(canvas.height/15)+1 // amount of tiles vertically

const tile_wid = canvas.width/(tiles_width-1) // width of tiles
const tile_hei = canvas.height/(tiles_height-1) // height of tiles

let crimes_x = []
let crimes_y = []
const B = 6 // buffer zone
const k = 100
const g = 0.67
const f = 0.5

function calculate(c_x, c_y, x, y) {
	let temp = Math.abs(x-c_x)+Math.abs(y-c_y)
	let phi = 0
	if (temp > B)
		phi = 1
	//console.log(phi, Math.abs(x-c_x)+Math.abs(y-c_y))
	let temp1 = phi / temp**f
	let temp21 = (1-phi)*(B**(g-f))
	let temp22 = 1
	if (temp21 != 0) {
		temp22 = (2*B-Math.abs(x-c_x)-Math.abs(y-c_y))**g
	}
	//console.log(temp1, temp21, temp22)
	return temp1 + temp21 / temp22
	//return phi
}

function gen_map() {
	let crime_am = crimes_x.length
	let map = []
	let maximum = -1
	let minimum = -1
	for (let x = 1; x <= tiles_width; x++) {
		map.push([])
		for (let y = 1; y <= tiles_height; y++) {
			let t = 0
			for (let i = 0; i < crime_am; i++) {
				t += calculate(crimes_x[i], crimes_y[i], x, y)
			}
			
			if (t < minimum || minimum == -1)
				minimum = t
			if (t > maximum)
				maximum = t
			map[x-1].push(t)
		}
	}
	return [map, maximum, minimum]
}

function is_crime(x, y) {
	for (let i = 0; i < crimes_x.length; i++) {
		if (crimes_x[i] == x && crimes_y[i] == y)
			return true
	}
	return false
}
function heatMapColorforValue(val){
	let h = (1.0 - val) * 240
	return "hsl(" + h + ", 100%, 50%)";
}
let highlight = 0.01
function draw_map() {
	let res = gen_map()
	let map = res[0]
	let max = res[1]
	let min = res[2]
	if (max == 0) max = 1
	for (let x = 0; x < tiles_width; x++) {
		for (let y = 0; y < tiles_height; y++) {
			let temp = (map[x][y]-min) / (max-min)
			let col = heatMapColorforValue(temp)
			if (is_crime(x+1, y+1)) {
				col = "rgb(0,0,0)"
			}
			if (map[x][y] > max - (max-min)*highlight && crimes_x.length > 1) {
				col = "rgb(255,100,255)"
			}
			if (col[0] > 255) console.log(col[0])
			c.fillStyle = col
			c.fillRect(x*tile_wid-1, y*tile_hei-1, tile_wid+2, tile_hei+2)
		}
	}
	
}
canvas.addEventListener("mousedown", onDown, false);
function onDown(event){
	const rect = canvas.getBoundingClientRect()
	x = event.clientX - rect.left
	y = event.clientY - rect.top
	crimes_x.push(Math.floor(x/tile_wid)+1)
	crimes_y.push(Math.floor(y/tile_hei)+1)
	draw_map()
	console.log(crimes_x, crimes_y)
}
draw_map()