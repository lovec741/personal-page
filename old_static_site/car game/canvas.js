let canvas = document.querySelector("canvas")
let size = [800, 800]
canvas.width = size[0]
canvas.height = size[1]

let score_el = document.getElementById("score");

let fps = 60
let wait = Math.round(1000/fps)

let c = canvas.getContext("2d")

let loop = false

function rand(start, end) {
	return Math.floor(Math.random() * (end-start+1))+start;
}

class Car{
	constructor(start=[150,200], rotation=-30, colors="red", keys=["w", "s", "a", "d", " "]) {
		this.car_wid = 20
		this.car_hei = 40
		this.loc = start
		this.rot = rotation
		this.dir = [0, 1]
		this.speed = 0
		this.col = colors
		
		this.forward = false
		this.back = false
		this.right = false
		this.left = false
		this.braking = false
		
		this.mult_x_speed = 1
		this.mult_y_speed = 1

		this.speed_up_for = 1
		this.speed_up_back = 0.5
		this.slowdown = 0.7
		this.max_speed_for = 10
		this.max_speed_back = -5
		this.break_speed = 0.5
		this.rot_speed = 7

		this.speed_up_for = this.speed_up_for/30*wait
		this.speed_up_back = this.speed_up_back/30*wait
		this.slowdown = this.slowdown/30*wait
		this.max_speed_for = this.max_speed_for/30*wait
		this.max_speed_back = this.max_speed_back/30*wait
		this.break_speed = this.break_speed/30*wait
		this.rot_speed = this.rot_speed/30*wait
		
		//this.dir = this.draw_car()
		setInterval(this.game_loop.bind(this), wait)
		
		document.addEventListener("keydown", event => {
			//console.log(event.key)
			if (event.key == keys[0]) {
				this.forward = true
			}
			if (event.key == keys[1]) {
				this.back = true
			}
			if (event.key == keys[2]) {
				this.left = true
			}
			if (event.key == keys[3]) {
				this.right = true
			}
			if (event.key == keys[4] && !this.braking) {
				this.braking = true
				this.max_speed_for = this.max_speed_for*2
			}
		})
		document.addEventListener("keyup", event => {
			if (event.key == keys[0]) {
				this.forward = false
			}
			if (event.key == keys[1]) {
				this.back = false
			}
			if (event.key == keys[2]) {
				this.left = false
			}
			if (event.key == keys[3]) {
				this.right = false
			}
			if (event.key == keys[4]) {
				this.braking = false
				this.max_speed_for = this.max_speed_for/2
			}
		})
	}
	draw_car() {
		let wid = Math.round(this.car_wid/2)
		let hei = Math.round(this.car_hei/2)
		let car_points = [[this.loc[0], hei+(hei/7)+this.loc[1]], [wid+this.loc[0], hei+this.loc[1]], [wid+this.loc[0], -hei+this.loc[1]], [-wid+this.loc[0], -hei+this.loc[1]], [-wid+this.loc[0], hei+this.loc[1]], [this.loc[0], hei+(hei/7)+this.loc[1]]]
		for (let i=0; i<5; i++) {
			draw_line(rotate(car_points[i], this.loc, this.rot), rotate(car_points[i+1], this.loc, this.rot), this.col)
		}
		
		return rotate([0,1],[0,0],this.rot)
	}
	game_loop() {
		if (this.forward) {
			if (this.speed < this.max_speed_for) {
				this.speed += this.speed_up_for
			}
		}
		if (this.back) {
			if (this.speed > this.max_speed_back) {
				this.speed -= this.speed_up_back
			}
		}
		if (this.left) {
			if (this.speed > 0) {
				this.rot -= this.rot_speed
			} else if (this.speed < 0) {
				this.rot += this.rot_speed
			}
		}
		if (this.right) {
			if (this.speed > 0) {
				this.rot += this.rot_speed
			} else if (this.speed < 0) {
				this.rot -= this.rot_speed
			}
		}
		/*if (this.braking) {
			if (this.speed != 0 && Math.abs(this.speed) > this.break_speed) {
				if (this.speed > 0) {
					this.speed -= this.break_speed
				}
				else {
					this.speed += this.break_speed
				}
			}
			else {
				this.speed = 0
			}
		}*/
		if (this.speed >= this.speed_up_for*this.slowdown) {
			this.speed -= this.speed_up_for*this.slowdown
		}
		else if (this.speed <= -this.speed_up_back*this.slowdown) {
			this.speed += this.speed_up_back*this.slowdown
		}
		else {
			this.speed = 0 
		}
		let temp = this.loc
		this.loc = [this.loc[0]+this.dir[0]*this.speed, this.loc[1]+this.dir[1]*this.speed]
		if (this.loc[0] >= size[0]) {
			if (loop) {
				this.loc[0] = 0
			}
			else {
				this.mult_x_speed = 0
			}
		}
		else if (this.loc[0] < 0) {
			if (loop) {
				this.loc[0] = size[0]-1
			}
			else {
				this.mult_x_speed = 0
			}
		}
		else {this.mult_x_speed = 1}
		if (this.loc[1] >= size[1]) {
			if (loop) {
				this.loc[1] = 0
			}
			else {
				this.mult_y_speed = 0
			}
		}
		else if (this.loc[1] < 0) {
			if (loop) {
				this.loc[1] = size[1]-1
			}
			else {
				this.mult_y_speed = 0
			}
		}
		else {this.mult_y_speed = 1}
		if (!loop) {
		this.loc = [temp[0]+this.dir[0]*(this.speed*this.mult_x_speed), temp[1]+this.dir[1]*(this.speed*this.mult_y_speed)]
		}
		//this.dir = this.draw_car()
	}
}
let a = new Car([650,600], 135, "red")
let b = new Car([150,200], -45, "blue", ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","0"])
let car_list = [a, b]
let it = 0
let circles = []
let circle_size = 50
let points = [0, 0]
for (let i=0; i < 4; i++) {
	circles.push([rand(circle_size, size[0]-circle_size), rand(circle_size, size[1]-circle_size), "gray"])
}
setInterval(()=>{
	c.clearRect(0, 0, canvas.width, canvas.height)
	for (var i=0; i<2; i++) {
		car_list[i].dir = car_list[i].draw_car()
	}
	if (it % 100 == 0) {
		circles = circles.slice(1)
		circles.push([rand(circle_size, size[0]-circle_size), rand(circle_size, size[1]-circle_size), "gray"])
	}  
	for (let i = 0; i < circles.length; i++) {
		dist_a = dist(circles[i][0], circles[i][1], a.loc[0], a.loc[1])
		dist_b = dist(circles[i][0], circles[i][1], b.loc[0], b.loc[1])
		if (dist_a <= circle_size+5 && dist_b <= circle_size+5) {
			circles[i][2] = "gray"
		}
		else if (dist_a <= circle_size+5) {
			circles[i][2] = "red"
		}
		else if (dist_b <= circle_size+5) {
			circles[i][2] = "blue"
		}
		if (circles[i][2] == "red" && it % 20 == 0) {points[0]++; points[1]--}
		else if (circles[i][2] == "blue" && it % 20 == 0) {points[1]++; points[0]--}
		//else if (it % 20 == 0) {points[1]--; points[0]--}
		if (points[0] < 0) {points[0] = 0}
		if (points[1] < 0) {points[1] = 0}
		draw_circle(circles[i][0], circles[i][1], circles[i][2], circle_size)
	}
	score_el.innerHTML = "<b style='color:red'>"+points[0]+"</b> : <b style='color:blue'>"+points[1]+"</b>"
	
	it++
	if (it == 100) {it = 0}
}, wait)
function dist(x1, y1, x2, y2) {
	return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}
function draw_circle(x, y, col, rad=20) {
	c.beginPath();
	c.arc(x, y, rad, 0, 2 * Math.PI, false)
	c.fillStyle = col
	c.fill()
	c.lineWidth = 0
	c.strokeStyle = 'white'
	c.stroke()
}
function rotate(point, offset, angle) {
	x = point[0]
	y = point[1]
    angle = angle * (Math.PI / 180)
    return [(x-offset[0])*Math.cos(angle)-(y-offset[1])*Math.sin(angle)+offset[0], (y-offset[1])*Math.cos(angle)+(x-offset[0])*Math.sin(angle)+offset[1]]
}
function draw_line(loc1, loc2, col) {
	c.beginPath()
	c.moveTo(loc1[0], loc1[1])
	c.lineTo(loc2[0], loc2[1])
	c.strokeStyle = col
	c.lineWidth = 5
	c.stroke()
}

/*canvas.addEventListener("mousedown", onDown, false);
function onDown(event){
	const rect = canvas.getBoundingClientRect()
	let x = Math.round((event.clientX - rect.left)/(rect.right - rect.left)*canvas.width)
	let y = Math.round((event.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
	console.log(x, y)
}
let down = false
canvas.addEventListener("mouseup", onUp, false);
function onUp(event){
	down = false
}
canvas.addEventListener("mousemove", onMove, false);
function onMove(event){
	const rect = canvas.getBoundingClientRect()
	let x = Math.round((event.clientX - rect.left)/(rect.right - rect.left)*canvas.width)
	let y = Math.round((event.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
	
}*/