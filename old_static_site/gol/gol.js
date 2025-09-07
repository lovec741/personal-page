var map = []
const canvas = document.getElementById("canvas")
const c = canvas.getContext("2d")
var tile_size = 10
var sizeX = Math.round((window.innerWidth - 30)/tile_size)
var sizeY = Math.round((window.innerHeight - 50)/tile_size)
var delay = 10

var saved_map = null
var tool = 1
var wide_tool = false

function save() {
	saved_map = JSON.parse(JSON.stringify(map))
}
function load() {
	if (saved_map != null) {
		map = JSON.parse(JSON.stringify(saved_map))
		draw_all()
	}
}

function check() {
	var amap = []
	for (var x = 0; x < sizeX; x++) {
		amap.push([])
		for (var y = 0; y < sizeY; y++) {
			amap[x].push(0)
		}
	}
	for (var x = 0; x < sizeX; x++) {
		for (var y = 0; y < sizeY; y++) {
			var alive = 0
			for (var x1 = -1; x1 < 2; x1++) {
				for (var y1 = -1; y1 < 2; y1++) {
					if (!(x1 == 0 && y1 == 0) && !(x+x1 < 0 || x+x1 >= sizeX || y+y1 < 0 || y+y1 >= sizeY) && map[x+x1][y+y1] == 1) {alive++}
				}
			}
			amap[x][y] = alive
			
		}
	}
	for (var x = 0; x < sizeX; x++) {
		for (var y = 0; y < sizeY; y++) {
			var alive = amap[x][y]
			//console.log(x, y, map[x][y], alive)
			if (map[x][y] == 1) {
				if (alive < 2 || alive > 3) {
					map[x][y] = 0
					draw(x,y,0)
				}
				else {
					map[x][y] = 1
					draw(x,y,1)
				}
			}
			else if (alive == 3) {
				map[x][y] = 1
				draw(x,y,1)
			}
		}
	}
}

function draw(x, y, v) {
	c.beginPath();
	if (v == 0) {
		c.fillStyle = "rgb(0,0,0)"
	} else {
		c.fillStyle = "rgb(255,255,255)"
	}
	c.rect(tile_size*x, tile_size*y, tile_size, tile_size)
	c.fill()
}

function draw_all() {
	for (var x = 0; x < sizeX; x++) {
		for (var y = 0; y < sizeY; y++) {
			c.beginPath();
			if (map[x][y] == 0) {
				c.fillStyle = "rgb(0,0,0)"
			} else {
				c.fillStyle = "rgb(255,255,255)"
			}
			c.rect(tile_size*x, tile_size*y, tile_size, tile_size);
			c.fill();
		}
	}
}
var stop = true
var inter = null
function repeat() {
	stop = false
	inter = setInterval(()=>{
		check()
	}, delay)
}
function change_delay(x) {
	if (delay != x) {
	delay = x
	if (!stop) {
		stop_repeat()
		repeat()
		//setTimeout(()=>{repeat()}, 100)
		
	}}
}
stop_repeat = () => {stop = true; clearInterval(inter)}
canvas.width = tile_size*sizeX
canvas.height = tile_size*sizeY
function clear_it() {
	for (var x = 0; x < sizeX; x++) {
		for (var y = 0; y < sizeY; y++) {
			map[x][y] = 0
		}
	}
	draw_all()
}
function add_random_points() {
	for (var x = 0; x < sizeX; x++) {
		for (var y = 0; y < sizeY; y++) {
			if (Math.round(Math.random()*5) == 5) {map[x][y] = 1}
		}
	}
	draw_all()
}
for (var x = 0; x < sizeX; x++) {
	map.push([])
	for (var y = 0; y < sizeY; y++) {
		map[x].push(0)
	}
}
draw_all()

console.log(map)
var down = false
canvas.addEventListener("mousemove", (e) => {
	var rect = canvas.getBoundingClientRect()
	var x = Math.floor((event.clientX - rect.left)/tile_size)
	var y = Math.floor((event.clientY - rect.top)/tile_size)
	if (down) {
	if (wide_tool) {
	for (var x1 = -1; x1 < 2; x1++) {
		for (var y1 = -1; y1 < 2; y1++) {
			if (!(x+x1 < 0 || x+x1 >= sizeX || y+y1 < 0 || y+y1 >= sizeY)) {
				map[x+x1][y+y1] = tool//!map[x][y]
				draw(x+x1,y+y1,tool)
			}
		}
	}} else {
		map[x][y] = tool//!map[x][y]
		draw(x,y,map[x][y])
	}
	}
})
opos = (x)=>{if (x) {return 0} else {return 1}}

var was_stopped = null
canvas.addEventListener("mousedown", (e) => {
	was_stopped = stop
	stop_repeat()
	down = true
	var rect = canvas.getBoundingClientRect()
	var x = Math.floor((event.clientX - rect.left)/tile_size)
	var y = Math.floor((event.clientY - rect.top)/tile_size)
	if (wide_tool) {
	for (var x1 = -1; x1 < 2; x1++) {
		for (var y1 = -1; y1 < 2; y1++) {
			if (!(x+x1 < 0 || x+x1 >= sizeX || y+y1 < 0 || y+y1 >= sizeY)) {
				map[x+x1][y+y1] = tool//!map[x][y]
				draw(x+x1,y+y1,tool)
			}
		}
	}
	} else {
		map[x][y] = opos(map[x][y])
		draw(x,y,map[x][y])
	}
})

canvas.addEventListener("mouseup", (e) => {
	down = false
	if (!was_stopped) {repeat()}
})