const canvas = document.getElementById("canvas")
const c = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let cols = ["red", "rgb(100,255,100)", "rgb(100,0,255)"]

function rand(start, end) {
	return Math.floor(Math.random() * (end-start+1))+start;
}
class Circle {
	constructor(createX, createY, radius, speed=[0,0], color="#ff0000", mass=-1) {
		this.x = createX
		this.y = createY
		this.color = color
		this.rad = radius
		this.speed = speed
		if (mass == -1) {
			this.mass = Math.round(Math.PI * radius ** 2)/100
		}
		else {
			this.mass = mass
		}
		this.collided = []
		this.speeds = []
		this.draw()
	}
	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.rad, 0, 2 * Math.PI, false)
		c.fillStyle = this.color
		c.fill()
		//c.lineWidth = 1
		//c.strokeStyle = '#ffffff'
		c.stroke()
	}
	move() {
		this.x += this.speed[0]
		this.y += this.speed[1]
		this.draw()
	}
}

class Enviroment {
	constructor(sizeX, sizeY, speed=0, elements=[]) {
		this.sizeX = sizeX
		this.sizeY = sizeY
		this.elements = elements
		this.inter = null
		this.speed = speed
	}
	create_circles(n, locX=0, locY=0, radius=0, div=1) {
		let rad = radius
		let x = locX
		let y = locY
		for (let i = 0; i < n; i++) {
			let fails = 10
			while (fails--) {
				if (radius == 0) {
					rad = rand(10,30)
				}
				if (locX == 0) {
					x = rand(rad+1, this.sizeX-rad-1)
					y = rand(rad+1, this.sizeY-rad-1)
				}
				if (this.is_empty(x, y, rad, div)) {
					this.elements.push(new Circle(
					x,
					y,
					rad, 
					[rand(-300,300)/100, rand(-300, 300)/100],
					cols[rand(0, cols.length-1)]))
					break
				}
			}
		}
	}
	start() {
		this.inter = setInterval(this.next.bind(this), this.speed)
	}
	stop() {
		clearInterval(this.inter)
	}
	change_speed(speed) {
		this.stop()
		this.speed = speed
		this.start()
	}
	check_wall_collisions() {
		for (let i = 0; i < this.elements.length; i++) {
			let el = this.elements[i]
			if (el.x < el.rad || el.x+el.rad > this.sizeX) {
				el.speed[0] = -el.speed[0]
				el.move()
			}
			if (el.y < el.rad || el.y+el.rad > this.sizeY) {
				el.speed[1] = -el.speed[1]
				el.move()
			}
		}
		/*for (let i = 0; i < this.elements.length; i++) {
			if (this.elements[i].collided.length > 0) {
				this.elements[i].move()
			}
		}*/
	}
	is_empty(x, y, radius, div=1) {
		let is = true
		for (let j = 0; j < this.elements.length; j++) {
			if (j != cir_ind) {
				let el2 = this.elements[j]
				let distance = Math.sqrt((x - el2.x) ** 2 + (y - el2.y) ** 2)
				if (distance/div < radius + el2.rad - 3)
				{
					is = false
				}
			}
		}
		return is
	}
	check_circle_collision() {
		let fails = 1
		let no_col = true
		while (fails--) {
			c.clearRect(0, 0, canvas.width, canvas.height);
			no_col = true
			for (let i = 0; i < this.elements.length; i++) {
				let el1 = this.elements[i]
				if (i == cir_ind && !cursor || i != cir_ind) {
				for (let j = 0; j < this.elements.length; j++) {
					if (j == cir_ind && !cursor || j != cir_ind) {
					if (i != j && el1.collided.indexOf(j) == -1) {
						let el2 = this.elements[j]
						if (el1.x + el1.rad + el2.rad > el2.x && el1.x < el2.x + el1.rad + el2.rad && el1.y + el1.rad + el2.rad > el2.y && el1.y < el2.y + el1.rad + el2.rad)
						{
							let distance = Math.sqrt((el1.x - el2.x) ** 2 + (el1.y - el2.y) ** 2)
							if (distance < el1.rad + el2.rad)
							{
								//console.log(el1.speed, el2.speed)
								//console.log(i, j)
								let speed1 = [(el1.speed[0] * (el1.mass - el2.mass) + (2 * el2.mass * el2.speed[0])) / (el1.mass + el2.mass),
								(el1.speed[1] * (el1.mass - el2.mass) + (2 * el2.mass * el2.speed[1])) / (el1.mass + el2.mass)]
								let speed2 = [(el2.speed[0] * (el2.mass - el1.mass) + (2 * el1.mass * el1.speed[0])) / (el1.mass + el2.mass),
								(el2.speed[1] * (el2.mass - el1.mass) + (2 * el1.mass * el1.speed[1])) / (el1.mass + el2.mass)]
								el1.speed = speed1
								el2.speed = speed2
								el1.collided.push(j)
								//el1.move()
								//el2.move()
								el2.collided.push(i)
								no_col = false
								break
							}
						}
						
					}
					}
				}
				}
			}
			// move out if in something
			for (let i = 0; i < this.elements.length; i++) {
				
				if (this.elements[i].collided.length > 0) {
					this.elements[i].move()
					this.elements[i].collided = []
				}
			}
			this.check_wall_collisions()
			if (no_col) {
				break
			}
		}
		//console.log(fails)
	}
	move_all() {
		for (let i = 0; i < this.elements.length; i++) {
			if (i == cir_ind)
				this.elements[i].speed = [0,0]
			this.elements[i].move()
		}
	}
	next() {
		
		//this.check_wall_collisions()
		if (cir_ind != -1 && !cursor)
			this.elements[cir_ind].speed = [rand(-100,100)/100, rand(-100,100)/100]
		else if (cir_ind != -1)
			this.elements[cir_ind].speed = [0,0]
		this.check_circle_collision()
		this.move_all()
	}
}
let cir_ind = -1
let env = new Enviroment(canvas.width, canvas.height, speed=10)
env.create_circles(15, 0,0,0,5)
env.start()

const speed_slider = document.getElementById("sp")
speed_slider.value = 100-env.speed
speed_slider.addEventListener("input", (e) => {
	env.change_speed(100-e.target.value)
}, false)
let down = false
let moved = false
let x = -1
let y = -1
let out = false
let cursor = false
canvas.addEventListener("mousedown", onDown, false);
function onDown(event){
	const rect = canvas.getBoundingClientRect()
	x = event.clientX - rect.left
	y = event.clientY - rect.top
	let rad = 10
	if (env.is_empty(x, y, rad)) {
		if (cir_ind != -1)
			env.elements.splice(cir_ind, 1)
		cursor = false
		env.elements.push(new Circle(x, y, Math.max(rad, 1), [0, 0], "white", 99999999999))
		down = true
		cir_ind = env.elements.length-1
	}
}
canvas.addEventListener("mouseover", onOver, false);
function onOver(event){
	cursor = true
	const rect = canvas.getBoundingClientRect()
	x = event.clientX - rect.left
	y = event.clientY - rect.top
	let rad = 10
	env.elements.push(new Circle(x, y, Math.max(rad, 1), [0, 0], "gray", 0))
	down = true
	cir_ind = env.elements.length-1
	out = false
}
canvas.addEventListener("mouseleave", onLeave, false);
function onLeave(event){
	env.elements.splice(cir_ind, 1)
	cir_ind = -1
	down = false
	out = true
}
document.addEventListener("mouseup", onUp, false);
function onUp(event){
	if (down) {
		down = false
		env.elements.splice(cir_ind, 1)
		cir_ind = -1
	}
	if (!out)
		onOver(event)
}
document.addEventListener("mousemove", onMove, false);
function onMove(event){
	if (down) {
		if (env.is_empty(x, y, 10) && !cursor) {
			env.elements.splice(cir_ind, 1)
			env.elements.push(new Circle(x, y, Math.max(10, 1), [0, 0], "white", 99999999999))
		}
		else {
			env.elements.splice(cir_ind, 1)
			env.elements.push(new Circle(x, y, Math.max(10, 1), [0, 0], "gray", 0))
		}
		const rect = canvas.getBoundingClientRect()
		x = event.clientX - rect.left
		y = event.clientY - rect.top
		env.elements[cir_ind].x = x
		env.elements[cir_ind].y = y
	}
}