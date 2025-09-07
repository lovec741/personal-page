const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
const res = document.getElementById("res")
const lift = document.getElementById("lift")
let flipped = true
canvas.width = 600
canvas.height = 1000
let last = [0, 500]
let list = [[0, 500]]
let x = 0
let y = 0
function draw_line(x, y) {
	c.beginPath()
	c.moveTo(last[0], last[1])
	c.lineTo(x, y)
	c.strokeStyle = "red"
	c.lineWidth = 3
	c.stroke()
}
let down = false
let it = 0
canvas.addEventListener("mouseup", onUp, false);
function onUp(event){
	down = false
}
function draw() {
	let str = ""
	for (let i = 1; i < list.length; i++) {
		if (list[i].length == 2) {
			if (flipped) {
				str += "["+(1000-list[i][1])+","+list[i][0]+"], "
			}
			else {
				str += "["+list[i][0]+","+list[i][1]+"], "
			}
		}
		else {
			str += "["+list[i]+"], "
		}
		
	}
	res.innerHTML = ("["+str.slice(0,-2)+", [\"u\"], [500, 0]]").replace(/\[\"u\"\], \[\"d\"\], \[\"u\"\]/g, "[\"u\"]")	
}
canvas.addEventListener("mousemove", onMove, false);
function onMove(event){
	const rect = canvas.getBoundingClientRect()
	x = Math.round((event.clientX - rect.left)/(rect.right - rect.left)*canvas.width)
	y = Math.round((event.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
	
	if (down && it == 3) {
		draw_line(x, y)
		last = [x, y]
		list.push(last)
		if (lift.checked) {
			list.push('"u"')
			list.push('"d"')
		}
		draw()
		it = 0
	}
	if (down) 
		it++
}
canvas.addEventListener("mousedown", onDown, false);
function onDown(event){
	const rect = canvas.getBoundingClientRect()
	x = Math.round((event.clientX - rect.left)/(rect.right - rect.left)*canvas.width)
	y = Math.round((event.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
	console.log(x, y)
	if (event.button == 0) {
		if (list.length != 1) {
			list.push('"u"')
		}
		//draw_line(x, y)
		last = [x, y]
		list.push([x, y])
		list.push('"d"')
		down = true
		/*if (list.length == 1) {
			list.push('"d"')
		}
		down = true
		draw_line(x, y)
		last = [x, y]
		list.push(last)
		if (lift.checked) {
			list.push('"u"')
			list.push('"d"')
		}*/
	}
	else if (event.button == 1) {
		
	}
	draw()
}
document.addEventListener("keydown", event => {
	if (event.key == "r") {
		if (flipped) {
			canvas.width = 1000
			canvas.height = 600
			canvas.style.width = "315px"
			canvas.style.height = "700px"
			flipped = false
			last = [500, 0]
			list = [[500, 0]]
		}
		else {
			canvas.width = 600
			canvas.height = 1000
			canvas.style.width = "1000px"
			canvas.style.height = "450px"
			flipped = true
			last = [0, 500]
			list = [[0, 500]]
		}
	}
	else if (event.key = "s") {
		if (list.length != 1) {
			list.push('"u"')
		}
		//draw_line(x, y)
		last = [x, y]
		list.push([x, y])
		list.push('"d"')
	}
})
