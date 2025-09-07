const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

const zoom_display = document.getElementById("zoom")
const itter_display = document.getElementById("itter")
const res_display = document.getElementById("resolution")
const darkn = document.getElementById("darkn")

var width = 100
var height = 100
var lastoffx = 0
var lastoffy = 0
var letx = 0
var lety = 0
var itterations = 1000
var dark = 0.9

if (document.documentElement.clientWidth > document.documentElement.clientHeight) {
	canvas.height = height
	canvas.width = width
	canvas.style.height = "100vh"
	canvas.style.removeProperty("width")
}
else {
	canvas.height = height
	canvas.width = width
	canvas.style.width = "100vw"
	canvas.style.removeProperty("height")
}

function update_ui () {
	zoom_display.innerHTML = "Z:"+zoom
	itter_display.innerHTML = "IT:"+itterations
	res_display.innerHTML = "R:"+width
	darkn.innerHTML = "D:"+dark
}
var zoom = 1

update_ui()
const plus = document.getElementById("button+")
const minus = document.getElementById("button-")


function distance(x1, y1, x2, y2) {
	return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}
function change_size(size) {
	width = size
	height = size
	if (document.documentElement.clientWidth > document.documentElement.clientHeight) {
		canvas.height = size
		canvas.width = size
		canvas.style.height = "100vh"
		canvas.style.removeProperty("width")
	}
	else {
		canvas.height = size
		canvas.width = size
		canvas.style.width = "100vw"
		canvas.style.removeProperty("height")
	}
	update_ui()
	mandelbrot_img(zoom, -lastoffx, -lastoffy, itterations)
}


var do_print = false
function mandelbrot(x, y, it) {
	var z = [0, 0]
	var c1 = [x, y]
	
	for (var i = 0; i < it; i++) {
		z = [z[0]*z[0] - z[1]*z[1] + c1[0], 2*z[0]*z[1] + c1[1]]
		if (Math.abs(z[0]) > 2, Math.abs(z[1]) > 2) {
			break
		}
	}
	return i
}
function find_julia(x, y, it, offx, offy) {
	var z = [x, y]
	var c1 = [offx, offy]
	
	for (var i = 0; i < it; i++) {
		z = [z[0]*z[0] - z[1]*z[1] + c1[0], 2*z[0]*z[1] + c1[1]]
		if (Math.abs(z[0]) > 2, Math.abs(z[1]) > 2) {
			break
		}
	}
	return i
}

var vis = false
var shade = true
function mandelbrot_img (zoom, offx, offy, it, julia=false) {
	//console.log(it)
	var edit_zoom = 1/(2**zoom-1)
	var res = 0
	if (!julia) {
		for (var x = 0; x < canvas.width; x++) {
			for (var y = 0; y < canvas.height; y++) {
				ax = (x - canvas.width/2) / (canvas.width/(4))*edit_zoom  + offx
				ay = (y - canvas.height/2) /  (canvas.height/(4))*edit_zoom  + offy
				place = Math.round(y) * (canvas.width * 4) + Math.round(x) * 4
				res = mandelbrot(ax, ay, it)
				if (do_print) {
					console.log(ax, ay, place)
				}
				if (res == it) {
					c.beginPath()
					if (vis) {c.strokeStyle = "rgb(255,255,0)"}
					else {c.strokeStyle = "rgb(0,0,0)"}
					c.rect(x,y,1,1)
					c.stroke()
				}
				else {
					c.beginPath()
					if (shade) {
						var br = Math.round(255-(res*(255/it)*dark))
						if (br > 255) {
							/*console.log(br);*/ c.strokeStyle = "rgb(255,255,255)"
						}
						else {
							c.strokeStyle = "rgb("+br+","+br+","+br+")"
						}
					}
					else {c.strokeStyle = "rgb(255,255,255)"}
					c.rect(x,y,1,1)
					c.stroke()
				}
			}
		}
	}
	else {
		for (var x = 0; x < canvas.width; x++) {
			for (var y = 0; y < canvas.height; y++) {
				ax = (x - canvas.width/2) / (canvas.width/(4))
				ay = (y - canvas.height/2) /  (canvas.height/(4))
				place = Math.round(y) * (canvas.width * 4) + Math.round(x) * 4
				res = find_julia(ax, ay, it, offx, offy)
				if (do_print) {
					console.log(ax, ay, place)
				}
				if (res == it) {
					c.beginPath()
					if (vis) {c.strokeStyle = "rgb(255,255,0)"}
					else {c.strokeStyle = "rgb(0,0,0)"}
					c.rect(x,y,1,1)
					c.stroke()
				}
				else {
					c.beginPath()
					if (shade) {
						var br = Math.round(255-(res*255/it*dark))
						if (br > 255) {
							/*console.log(br);*/ c.strokeStyle = "rgb(255,255,255)"
						}
						else {
							c.strokeStyle = "rgb("+br+","+br+","+br+")"
						}
					}
					else {c.strokeStyle = "rgb(255,255,255)"}
					c.rect(x,y,1,1)
					c.stroke()
				}
			}
		}
	}
}
mandelbrot_img(zoom, 0, 0, itterations)

document.onwheel = function(e) {
	if (width >= 300) {
		change_size(100)
	}
	//console.log(e.deltaY)
	if (zoom > 1 && e.deltaY > 0 && zoom - 0.5 >= 1) {
		zoom -= 0.5
		if (zoom == 1) {
			lastoffx = 0
			lastoffy = 0
		}	
		mandelbrot_img(zoom, -lastoffx, -lastoffy, itterations)
	}
	else if (e.deltaY < 0) {
		if (zoom + 0.5 <= 47) {
			zoom += 0.5
			mandelbrot_img(zoom, -lastoffx, -lastoffy, itterations)
		}
	}
	update_ui()
	//console.log(lastoffx, lastoffy)
	
}
var mousedownID = -1

var cursorX;
var cursorY;
document.onmousemove = function(event){
	
	const rect = canvas.getBoundingClientRect()
	var edit_zoom = 1/(2**zoom-1)
	cursorX = ((event.clientX - rect.left) / ((rect.right-rect.left)/width) - width/2) / (width/4)*edit_zoom + letx
	cursorY = ((event.clientY - rect.top) / ((rect.bottom-rect.top)/height) - height/2) / (height/4)*edit_zoom + lety
	
	//console.log(edit_xy(lastoffx, lastoffy))
}


function mousedown(event) {
	if (event.which == 1) {
		if(mousedownID == -1)  {
			mousedownID = setInterval(whilemousedown, 60)
		}
	}
	else if (event.which == 2) {
		if (width < 300) {
			change_size(500)
		}
		else {change_size(100)}
	}

}
function mouseup(event) {
	if (event.which == 1) {
		if(mousedownID != -1) {
			letx = lastoffx
			lety = lastoffy
			//console.log(letx, lety)
			clearInterval(mousedownID)
			mousedownID = -1
		}
	}
}
function whilemousedown() {
	if (width >= 300) {
		change_size(100)
	}
	lastoffx = cursorX
	lastoffy = cursorY
	//console.log(lastoffx, lastoffy)
	mandelbrot_img(zoom, -lastoffx, -lastoffy, itterations)

}
var nums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
var save = null
var saves = [null, null, null, null, null, null, null, null, null, null]
var holdingkey = false
document.addEventListener("keydown", (event) => {
	console.log(event.key)
	if (event.key == "s") {shade = !shade}
	else if (event.key == "v") {vis = !vis}
	else if (event.key == "e") {if (dark != 2.0) {dark = Math.round((dark + 0.1)*10)/10}}
	else if (event.key == "d") {if (dark != 0.1) {dark = Math.round((dark - 0.1)*10)/10}}
	else if (event.key == "h") {change_size(1000)}
	else if (event.key == "j") {
		change_size(500)
		mandelbrot_img(zoom, -lastoffx, -lastoffy, itterations, julia=true)
	}
	else if (event.key == "k") {
		change_size(1000)
		mandelbrot_img(zoom, -lastoffx, -lastoffy, itterations, julia=true)
	}
	else if (event.key == "p") {console.log(-lastoffx, -lastoffy, zoom)}
	else if (nums.indexOf(event.key) >= 0) {
		save = parseInt(event.key)
		if (saves[save] != null) {
			mandelbrot_img(saves[save][0], -saves[save][1], -saves[save][2], saves[save][3])
			lastoffx = saves[save][1]
			lastoffy = saves[save][2]
			zoom = saves[save][0]
			letx = lastoffx
			lety = lastoffy
			itterations = saves[save][3]
			update_ui()
		}
		else {
			saves[save] = [zoom, lastoffx, lastoffy, itterations]
		}
	}
	else {
		var divi = 1
		if (holdingkey) {
			divi = 5
		}
		if (event.key == "+") {
			if (itterations >= 500) {
				itterations += Math.ceil(100/divi)
			}
			else if (itterations >= 50) {
				itterations += Math.ceil(50/divi)
			}
			else if (itterations >= 10) {
				itterations += Math.ceil(10/divi)
			}
			else if (itterations >= 1) {
				itterations += Math.ceil(1/divi)
			}
		}
		else if (event.key == "-") {
			if (itterations > 500) {
				itterations -= Math.ceil(100/divi)
			}
			else if (itterations > 50) {
				itterations -= Math.ceil(50/divi)
			}
			else if (itterations > 10) {
				itterations -= Math.ceil(10/divi)
			}
			else if (itterations > 1) {
				itterations -= Math.ceil(1/divi)
			}
		}
	}
	if (["-", "+", "s", "v", "e", "d"].indexOf(event.key) >= 0) {
		mandelbrot_img(zoom, -lastoffx, -lastoffy, itterations)
		update_ui()
	}
	if (event.key == "Shift") {holdingkey = true}
	
})
document.addEventListener("keyup", (event) => {
	if (event.key == "Shift") {holdingkey = false}
})
document.addEventListener("mousedown", mousedown)
document.addEventListener("mouseup", mouseup)
//document.addEventListener("mouseout", mouseup)