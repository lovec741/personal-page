const canvas = document.getElementById("canvas")
const c = canvas.getContext("2d")
canvas.width = 500
canvas.height = 500

function rand(start, end) {
	return Math.floor(Math.random() * (end-start+1))+start;
}
class Circle {
	constructor(createX, createY, radius, speed=[0,0], color="#ff0000") {
		this.x = createX
		this.y = createY
		this.color = color
		this.rad = radius
		this.speed = speed
		this.mass = Math.round(Math.PI * radius ** 2)/100
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
	create_circles(n, locX=0, locY=0, radius=0) {
		let rad = radius
		let x = locX
		let y = locY
		for (let i = 0; i < n; i++) {
			let fails = 10
			while (fails--) {
				if (radius == 0) {
					rad = rand(20,50)
				}
				if (locX == 0) {
					x = rand(rad+1, this.sizeX-rad-1)
					y = rand(rad+1, this.sizeY-rad-1)
				}
				if (this.is_empty(x, y, rad)) {
					this.elements.push(new Circle(
					x,
					y,
					rad, [rand(-300,300)/100, rand(-300, 300)/100]))
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
	is_empty(x, y, radius) {
		let is = true
		for (let j = 0; j < this.elements.length; j++) {
			let el2 = this.elements[j]
			let distance = Math.sqrt((x - el2.x) ** 2 + (y - el2.y) ** 2)
			if (distance < radius + el2.rad - 3)
			{
				is = false
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
				for (let j = 0; j < this.elements.length; j++) {
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
			this.elements[i].move()
		}
	}
	next() {
		
		//this.check_wall_collisions()
		this.check_circle_collision()
		this.move_all()
	}
}
let env = new Enviroment(canvas.width, canvas.height, speed=10)
//env.create_circles(2)
env.start()
const speed_slider = document.getElementById("sp")
speed_slider.value = 100-env.speed
speed_slider.addEventListener("input", (e) => {
	env.change_speed(100-e.target.value)
}, false)
let down = false
let moved = false
let downx = 0
let downy = 0
canvas.addEventListener("mousedown", onDown, false);
function onDown(event){
	const rect = canvas.getBoundingClientRect()
	x = event.clientX - rect.left
	y = event.clientY - rect.top
	let rad = rand(20,50)
	if (env.is_empty(x, y, rad)) {
		if (Math.min(x,y) <= rad) {
			rad = Math.min(x,y)
		}
		else if (x >= env.sizeX-rad) {
			rad = env.sizeX-x
		}
		else if (y >= env.sizeY-rad) {
			rad = env.sizeY-y
		}
		env.elements.push(new Circle(x, y, Math.max(rad, 1), [0, 0]))
		down = true
		downx = x
		downy = y
	}
}
document.addEventListener("mouseup", onUp, false);
function onUp(event){
	down = false
	if (moved) {
		const rect = canvas.getBoundingClientRect()
		x = event.clientX - rect.left
		y = event.clientY - rect.top
		moved = false
		env.elements[env.elements.length-1].speed =[(x-downx)/100, (y-downy)/100]
	}
}
document.addEventListener("mousemove", onMove, false);
function onMove(event){
	if (down) {
		moved = true
		down = false
	}
}