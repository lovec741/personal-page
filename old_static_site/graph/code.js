const canvas = document.getElementById("canvas")
canvas.width = window.innerWidth-30
canvas.height = window.innerHeight*0.8
let mid_wid = canvas.width/2
let mid_hei = canvas.height/2
let unit_size = 50 //px
const added_res = 2
const min_unit_size = 40 //px
const max_unit_size = 150 //px
let f_div = document.getElementById("funcs")
let z_in = document.getElementById("zoom_in")
let z_out = document.getElementById("zoom_out")
let add_func_b = document.getElementById("add_func")
let rem_func_b = document.getElementById("rem_func")
let increment = 1
let zoom = 0
let off_x = 0
let off_y = 0
let c = canvas.getContext("2d")
const cols = ["red", "#0078ff", "#01ff1f", "yellow", "#bd00ff"]
c.font = "20px Arial";
c.fillStyle = "gray";
 
function abs_value(txt) {
	let first = true
	while (txt.indexOf("|") > -1) {
		if (first) {
			txt = txt.replace("|", "abs(")
		} else {
			txt = txt.replace("|", ")")
		}
		first = !first
	}
	return txt
}
//inp = inp[:1+re.search("[0-9]([a-z]|[A-Z])", inp).start(0)]+"*"+inp[re.search("[0-9]([a-z]|[A-Z])", inp).start(0)+1:]
function parse_inp(el, col) {
	let val = el.getElementsByClassName("func_inp")[0].value
	val = abs_value(val)
	val = val.replace(/,/g, ".")
	while (/[0-9]([a-z]|[A-Z])/g.test(val)) {
		let slice1 = val.slice(0,1+val.search(/[0-9]([a-z]|[A-Z])/g))
		let slice2 = val.slice(1+val.search(/[0-9]([a-z]|[A-Z])/g))
		val = slice1+"*"+slice2
	}
	if (val != "") {
		graph_func(val, el.getElementsByClassName("er")[0], col)
	}
	else { 
		graph_func("x", el.getElementsByClassName("er")[0], col)
	}
}
document.getElementById("1").style.color = cols[0];
function change_zoom() {
	unit_size = 100/(2**zoom); 
	increment = 0
	if (unit_size > min_unit_size) {
		while (unit_size/5**increment > max_unit_size) {
			increment++
		}
		increment = 1/5**increment
	} else {
		while (unit_size*5**increment < min_unit_size) {
			//console.log(unit_size/2**increment)
			increment++
		}
		increment = 5**increment
	}
	console.log(unit_size) //increment*unit_size
	graph_all()
}
add_func_b.addEventListener("click", ()=>{
	if (f_div.childElementCount == 4) {
		add_func_b.style.visibility = "hidden"
	} else if (f_div.childElementCount == 1) {
		rem_func_b.style.visibility = "visible"
	}
	let func_el = document.createElement("div")
	func_el.innerHTML = `<span>y = </span>
	<input type="text" placeholder="x" class="func_inp" oninput="graph_all()"></input>
	<span class="er"></span><br>`
	func_el.id = f_div.childElementCount+1
	func_el.style.color = cols[f_div.childElementCount];
	f_div.appendChild(func_el)
	graph_all()
})
rem_func_b.addEventListener("click", ()=>{
	if (f_div.childElementCount == 5) {
		add_func_b.style.visibility = "visible"
	} else if (f_div.childElementCount == 2) {
		rem_func_b.style.visibility = "hidden"
	}
	f_div.removeChild(f_div.lastChild)
	graph_all()
})
z_in.addEventListener("click", ()=>{zoom -= 0.5; change_zoom()})
z_out.addEventListener("click", ()=>{zoom += 0.5; change_zoom()})
change_zoom()
function draw_line(loc1, loc2, col, wid) {
	c.beginPath()
	c.moveTo(loc1[0], loc1[1])
	c.lineTo(loc2[0], loc2[1])
	c.strokeStyle = col
	c.lineWidth = wid
	c.stroke()
}
 
function draw_unit_lines() {
	let vis_unit_size = unit_size;
	let times_ten = false;
	let scale = 1;
	while (vis_unit_size < 100 || vis_unit_size > 200) {
 
		if (vis_unit_size < 100) {
			let mult = 5
			if (times_ten) mult = 2;
			vis_unit_size *= mult
			scale *= mult
		}
		if (vis_unit_size > 200) {
			let mult = 2
			if (times_ten) mult = 5;
			vis_unit_size /= mult
			scale /= mult
		}
		times_ten = !times_ten
		console.log(scale, vis_unit_size)
	}
	console.log(" ")
	let iter = 0
	let increment = scale;
	//console.log(increment, unit_size)
	let color = "rgba(255,255,255,50)"
	c.fillStyle = color
	while (iter*vis_unit_size + mid_hei < canvas.height) {
		let t1 = iter*vis_unit_size
		let t2 = parseFloat((iter*scale).toFixed(15))
		draw_line([0, mid_hei+t1], [canvas.width, mid_hei+t1], color, 1)
		c.fillText(" "+(-t2).toExponential(1), mid_wid, mid_hei+(iter)*vis_unit_size-3);
		/*for (let i = increment/5; i < increment; i += increment/5) {
			draw_line([0, (mid_hei-i*vis_unit_size)+t1], [canvas.width, (mid_hei-i*vis_unit_size)+t1], "gray", 1)
		}*/
		draw_line([0, mid_hei-t1], [canvas.width, mid_hei-t1], color, 1)
		c.fillText(" "+t2.toExponential(1), mid_wid, mid_hei-(iter)*vis_unit_size-3);
		/*for (let i = increment/5; i < increment; i += increment/5) {
			draw_line([0, (mid_hei-i*vis_unit_size)-t1], [canvas.width, (mid_hei-i*vis_unit_size)-t1], "gray", 1)
		}*/
		iter += 1
	}
	iter = 0
	while (iter*vis_unit_size + mid_wid < canvas.width) {
		let t1 = iter*vis_unit_size
		let t2 = parseFloat((iter*scale).toFixed(15))
		draw_line([mid_wid+t1, 0], [mid_wid+t1, canvas.height], color, 1)
		if (t2 != 0) c.fillText(" "+(t2.toExponential(1)), mid_wid+(iter)*vis_unit_size-3, mid_hei-5);
		draw_line([mid_wid-t1, 0], [mid_wid-t1, canvas.height], color, 1)
		if (t2 != 0) c.fillText(" "+((-t2).toExponential(1)), mid_wid-(iter)*vis_unit_size-3, mid_hei-5);
		/*draw_line([0, mid_hei-t1], [canvas.width, mid_hei-t1], "gray", 3)
		c.fillText(" "+t2, mid_wid, mid_hei-(iter)*vis_unit_size-3);*/
		iter += 1
	}
	/*for (let i = increment/5; i < increment; i += increment/5) {
		draw_line([0, (mid_hei+i*unit_size+unit_offset)], [canvas.width, (mid_hei+i*unit_size+unit_offset)], "gray", 1)
	}*/
	draw_line([mid_wid, 0], [mid_wid, canvas.height], "white", 3)
	draw_line([0, mid_hei], [canvas.width, mid_hei], "white", 3)
	let t = parseFloat((iter*scale).toFixed(9))
	//c.fillText(" "+(-t), mid_wid, mid_hei+(iter)*unit_size-3);
	unit_offset = 0
	//console.log(t)
	/*while (unit_offset*unit_size + mid_wid < canvas.width) {
		let t1 = unit_offset*unit_size
		draw_line([mid_wid+unit_offset*unit_size, 0], [mid_wid+unit_offset*unit_size, canvas.height], "gray", 1)
		draw_line([0, mid_wid+unit_offset*unit_size], [canvas.width, mid_wid+unit_offset*unit_size], "gray", 1)
		c.fillText(" "+(t1/unit_size+1), mid_wid+(unit_offset+increment)*unit_size, mid_hei-3);
		c.fillText(" "+(t1/unit_size+1), mid_wid+(unit_offset+increment)*unit_size, mid_hei-3);
		draw_line([mid_wid-unit_offset*unit_size, 0], [mid_wid-unit_offset*unit_size, canvas.height], "gray", 1)
		draw_line([0, mid_wid-unit_offset*unit_size], [canvas.width, mid_wid-unit_offset*unit_size], "gray", 1)
 
		unit_offset += increment
	}*/
 
	//draw_line([0, mid_hei], [canvas.width, mid_hei], "white", 3)
 
}
 
function graph_all() {
	c.clearRect(0, 0, canvas.width, canvas.height);
 
	let child_list = [...f_div.getElementsByTagName("div")]
	for (let i = 0; i < child_list.length; i++) {
		parse_inp(child_list[i], cols[i])
	}
	draw_unit_lines()
}
 
function graph_func(func_text, error_el, col) {
	func_text = func_text.replace(/tan/g, "Math.tan")
	func_text = func_text.replace(/sin/g, "Math.sin")
	func_text = func_text.replace(/cos/g, "Math.cos")
	func_text = func_text.replace(/abs/g, "Math.abs")
	func_text = func_text.replace(/sqrt/g, "Math.sqrt")
	func_text = func_text.replace(/PI/g, "Math.PI")
	func_text = func_text.replace(/max/g, "Math.max")
	func_text = func_text.replace(/min/g, "Math.min")
	func_text = func_text.replace(/log10/g, "Math.log10")
	func_text = func_text.replace(/(?<!\.)log/g, "Math.log")
 
	try {	
		let x = 0
		eval(func_text)
	} catch (ex) {
		error_el.innerHTML = " Failed to parse"
		console.log("Caught exception: " + ex, func_text);
		return
	}
	error_el.innerHTML = ""
 
	let x = null
	let y = null
	let old_x = null
	let old_y = null
	for (let i = 0; i < canvas.width*added_res; i++) {
		x = (i/added_res-mid_wid)/unit_size
		y = eval(func_text)
		if (i != 0) {
			draw_line([old_x*unit_size+mid_wid, -old_y*unit_size+mid_hei], [x*unit_size+mid_wid, -y*unit_size+mid_hei], col, 2)
		}
		old_x = x
		old_y = y
	}
 
}
graph_all()
canvas.onwheel = function(e) {
	e.preventDefault()
	if (e.deltaY > 0) {
		zoom += 0.5
	}
	else if (e.deltaY < 0) {
		if (zoom > -49) 
			zoom -= 0.5
	}
	change_zoom()
	graph_all()
	//console.log(lastoffx, lastoffy)
 
}
