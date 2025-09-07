// DETECT END BETTER (MESH), FIX POINT RED, collision based on start middle end
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d")
canvas.width = 1920
canvas.height = 1080
c.lineWidth = 4;
const player = document.getElementById("p");
const scoreboard = document.getElementById("s");
const new_game = document.getElementById("ng");
const body = document.querySelector("body");
var tolerance = 5
var fixed_points = []
var score = [0, 0]
var col = "rgb(0,0,255)"
function dist(x1, y1, x2, y2) {
	return Math.sqrt((x2-x1)**2 + (y2-y1)**2)
}
function line_intersect(p1, p2){
    if (p1[0] == p1[2] && p2[0] == p2[2]){
        if (p1[0] == p2[0]){
            if (p1[1] < Math.max(p2[1], p2[3]) && p1[1] > Math.min(p2[1], p2[3]) || p1[3] < Math.max(p2[1], p2[3]) && p1[3] > Math.min(p2[1], p2[3])){
                return "intersect"
			}
        return false
		}
	}
    if (p1[0] == p1[2]){
        var a1 = (p1[1]-p1[3])/(p1[0]+0.0000001-p1[2])
		var b1 = p1[1]-(((p1[0]+0.0000001)*a1))
	}
	else {
		var a1 = (p1[1]-p1[3])/(p1[0]-p1[2])
		var b1 = p1[1]-((p1[0]*a1))
	}
    
    if (p2[0] == p2[2]){
        var a2 = (p2[1]-p2[3])/(p2[0]+0.0000001-p2[2])
		var b2 = p2[1]-(((p2[0]+0.0000001)*a2))
	}
	else {
		var a2 = (p2[1]-p2[3])/(p2[0]-p2[2])
		var b2 = p2[1]-((p2[0]*a2))
	}
    
    //console.log(a1, b1, a2, b2)
    try{
        var x = (b2-b1)/(a1-a2)
	}
    catch(e){
		console.log("zero")
        return false
	}
    var y = a1*x+b1
    //console.log(x, y)
    if (p1[0] == p1[2] || p2[0] == p2[2]){
        if (x <= Math.max(p1[0], p1[2])+0.00001 && x >= Math.min(p1[0], p1[2])-0.00001 && y <= Math.max(p1[1], p1[3]) && y >= Math.min(p1[1], p1[3]) && x <= Math.max(p2[0], p2[2])+0.00001 && x >= Math.min(p2[0], p2[2])-0.00001 && y <= Math.max(p2[1], p2[3]) && y >= Math.min(p2[1], p2[3])){
            return [Math.round(x), Math.round(y)]
		}
	}
    else if (x <= Math.max(p1[0], p1[2])+tolerance && x >= Math.min(p1[0], p1[2])-tolerance && y <= Math.max(p1[1], p1[3])+tolerance && y >= Math.min(p1[1], p1[3])-tolerance && x <= Math.max(p2[0], p2[2])+tolerance && x >= Math.min(p2[0], p2[2])-tolerance && y <= Math.max(p2[1], p2[3])+tolerance && y >= Math.min(p2[1], p2[3])-tolerance){
        return [Math.round(x), Math.round(y)]
	}
    return false
}
//console.log(line_intersect([10,100,470,150], [50,100,50,150]))

var lines = []
var points_4 = [[300, 200, 0], [canvas.width-300, 200, 0], [300, canvas.height-200, 0], [canvas.width-300, canvas.height-200, 0]]
var points_3 = [[canvas.width/4, canvas.height/4*3, 0], [canvas.width/4*3, canvas.height/4*3, 0], [canvas.width/2, canvas.height/4, 0]]
var points_2 = [[canvas.width/4, canvas.height/2, 0], [canvas.width/4*3, canvas.height/2, 0]]
var points = null;

get_border = (p) => {
	var ret_lst = []
	ret_lst = ret_lst.concat([p[0]-20, p[1]-20])
	ret_lst = ret_lst.concat([p[0]+20, p[1]-20])
	ret_lst = ret_lst.concat([p[0]+20, p[1]+20])
	ret_lst = ret_lst.concat([p[0]-20, p[1]+20])
	ret_lst = ret_lst.concat([p[0]-20, p[1]-20])
	return ret_lst
}
var border_lines = null
reset = ()=>{
	lines = []
	points = JSON.parse(JSON.stringify(points_3))
	border_lines = []
	points.forEach(el=>{
		console.log(el)
		border_lines.push(get_border(el))
	})
	draw_all_lines()
}
reset()
surrender = ()=>{
	if (player.innerHTML == "P1") {
		score[0]++
		player.innerHTML = "P2"
		body.style.background = "green"
		scoreboard.style.background = "green"
		col = "rgb(0,255,0)"
	}
	else {
		score[1]++
		player.innerHTML = "P1"
		body.style.background = "blue"
		scoreboard.style.background = "blue"
		col = "rgb(0,0,255)"
	}
	scoreboard.innerHTML = score[0]+":"+score[1]
	reset()
}
function draw_all_lines() {
	c.fillStyle = "rgb(255,255,255)";
	c.fillRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < lines.length; i++) {
		for (var i1 = 0; i1 < lines[i].length-2; i1+=2) {
			c.strokeStyle = col;
			c.beginPath();
			c.moveTo(lines[i][i1], lines[i][i1+1]);
			c.lineTo(lines[i][i1+2], lines[i][i1+3]);
			c.stroke();
		}
	}
	for (var i = 0; i < points.length; i++) {
		c.fillStyle = col;
		c.fillRect(points[i][0]-20, points[i][1]-20, 41, 41);
		c.fillStyle = "rgb(255,255,255)";
		c.fillRect(points[i][0]-10, points[i][1]-10, 21, 21);
	}
	c.fillStyle = "rgb(255,0,0)";
}
function point_is_near (x, y, add=0, is=false) {
	for (var i = 0; i < points.length; i++) {
		if (Math.abs(x-points[i][0]) <= 20 && Math.abs(y-points[i][1]) <= 20) {
			
			points[i][2] += add
			if (!is && points[i][2] <= 3) { 
				return points[i]
			}
			else if (is && points[i][2] < 3) {
				return points[i]
			}
			
		}
	}
	return false
}
document.addEventListener("keydown", (event)=>{
	if (event.key == "u" && drawing) {
		last_pop()
		draw_all_lines()
	}
	if (event.key == "s") {
		show_usable()
	}
})
document.addEventListener("keyup", (event)=>{
	if (event.key == "s") {
		setTimeout(()=>{draw_all_lines()}, 200)
	}
})
draw_all_lines()
c.fillStyle = "rgb(255,0,0)";
var is_down = false;
var drawing = false;
var just_finished = false;
var res = null
last = ()=> {
	return lines[lines.length-1]
}
last_add = (add) => {
	lines[lines.length-1] = lines[lines.length-1].concat(add)
}
last_pop = () => {
	if (lines[lines.length-1].length > 2) {
	lines[lines.length-1].pop()
	lines[lines.length-1].pop()
	}
	else {
		point_is_near(lines[lines.length-1][0], lines[lines.length-1][1], -1)
		drawing = false
		lines.pop()
	}
}
add_dot = (line)=>{
	/*var length_of_line = 0;
	for (var i = 0; i < line.length-2; i+=2) {
		console.log(line[i], line[i+1], line[i+2], line[i+3])
		length_of_line += dist(line[i], line[i+1], line[i+2], line[i+3])
	}
	var length_of_line2 = 0;
	for (var i = 0; i < line.length-2; i+=2) {
		var leng = dist(line[i], line[i+1], line[i+2], line[i+3])
		console.log("L", leng)
		length_of_line2 += leng
		if (length_of_line2 > length_of_line/2) {
			var x = Math.min(line[i], line[i+2]) + Math.abs(line[i]-line[i+2]) * (leng-(length_of_line2 - length_of_line/2)) / leng 
			var y = Math.min(line[i+1], line[i+3]) + Math.abs(line[i+1]-line[i+3]) * (leng-(length_of_line2 - length_of_line/2)) / leng
			points.push([Math.round(x), Math.round(y)])
			border_lines.push(get_border([Math.round(x), Math.round(y)]))
			break
		}
	}*/
	var x = null;
	var y = null;
	if (line.length/2 % 2 == 0) {
		console.log(Math.floor(line.length/2-1),Math.floor(line.length/2+1))
		x = (line[Math.floor(line.length/2-2)]+line[Math.floor(line.length/2)])/2
		y = (line[Math.floor(line.length/2-1)]+line[Math.floor(line.length/2+1)])/2
	}
	else {
		x = line[Math.ceil(line.length/2)-1]
		y = line[Math.ceil(line.length/2)]
	}
	console.log(x, y)
	points.push([Math.round(x), Math.round(y), 2])
	border_lines.push(get_border([Math.round(x), Math.round(y)]))
	draw_all_lines()
}
is_same = (line1, temp_point) => {
	if (line1[0] == temp_point[0] && line1[1] == temp_point[1] && line1[2] == temp_point[2] && line1[3] == temp_point[3]) {
		return true
	} else if (line1[0] == temp_point[2] && line1[1] == temp_point[3] && line1[2] == temp_point[0] && line1[3] == temp_point[1]) {
		return true
	}
	return false
}
is_crossing = (temp_point, callback=(res)=>{}, point=null) => {
	var crossing = false
	var loc_res = null
	var once = true
	var edge_case = false
	for (var i = 0; i < lines.length; i++) {
		for (var i1 = 0; i1 < lines[i].length-2; i1+=2) {
			if (is_same(lines[i].slice(i1, i1+4), temp_point)) {
				crossing = true
				callback([-30,-30])
			}
			loc_res = line_intersect(lines[i].slice(i1, i1+4), temp_point)
			if (loc_res) {
				//if (point != null && point_is_near(loc_res[0], loc_res[1]) == point) {}
				var near = point_is_near(loc_res[0], loc_res[1])
				if (near == point) {once = false}
				else if (!near || near && Math.abs(near[0] - temp_point[0]) > 20 && Math.abs(near[1] - temp_point[1]) > 20) { 
					if (!(loc_res[0] == temp_point[0] && loc_res[1] == temp_point[1]) && !(loc_res[0] == temp_point[2] && loc_res[1] == temp_point[3])) {
						console.log(near, [temp_point[0], temp_point[1]],Math.abs(near[0] - temp_point[0]))
						crossing = true
						callback(loc_res)
					}
				}
			}
		}
	}
	for (var i = 0; i < border_lines.length; i++) {
		for (var i1 = 0; i1 < border_lines[i].length-2; i1+=2) {
			loc_res = line_intersect(border_lines[i].slice(i1, i1+4), temp_point)
			if (loc_res) {
				var near1 = point_is_near(temp_point[0], temp_point[1])
				var near2 = point_is_near(temp_point[2], temp_point[3])
				if (Math.abs(loc_res[0] - near1[0]) <= 25 && Math.abs(loc_res[1] - near1[1]) <= 25 || Math.abs(loc_res[0] - near2[0]) <= 25 && Math.abs(loc_res[1] - near2[1]) <= 25) {
					//draw_all_lines()
					if (!crossing) {edge_case = true}
				}
				else {
					crossing = true
					callback(loc_res)
				}
				//console.log(Math.abs(loc_res[0] - temp_point[0]), Math.abs(loc_res[1] - temp_point[1]))
			}
		}
	}
	if (edge_case) {crossing = false}
	return crossing
}
is_end = ()=>{
	var usable = 0
	for (var i = 0; i < points.length; i++) {
		if (points[i][2]<3) {usable++}
	}
	if (usable < 2) {
		return true
	}
	else{
		return false
	}
}
show_usable = ()=>{
	for (var i = 0; i < points.length; i++) {
		if (points[i][2]>=3) {
			c.fillStyle = "rgb(255,0,0)";
			c.fillRect(points[i][0]-20, points[i][1]-20, 41, 41);
			c.fillStyle = "rgb(255,255,255)";
			c.fillRect(points[i][0]-10, points[i][1]-10, 21, 21);
		}
	}
}
reset_it = ()=>{
	new_game.style.visibility = "hidden"
	if (player.innerHTML == "P1") {
		score[0]++
		player.innerHTML = "P2"
		body.style.background = "green"
		scoreboard.style.background = "green"
		col = "rgb(0,255,0)"
	}
	else {
		score[1]++
		player.innerHTML = "P1"
		body.style.background = "blue"
		scoreboard.style.background = "blue"
		col = "rgb(0,0,255)"
	}
	scoreboard.innerHTML = score[0]+":"+score[1]
	reset()
}
check_write = (event)=>{
	const rect = canvas.getBoundingClientRect()
    const x = Math.round((event.clientX - rect.left) * (canvas.width/rect.width))
    const y = Math.round((event.clientY - rect.top) * (canvas.width/rect.width))
	if (lines == []) {drawing = false}
	if (drawing) {
		res = point_is_near(x,y,0,is=true)
		if (res) {
			if (!is_crossing([last()[last().length-2], last()[last().length-1], res[0], res[1]], loc_res=>{console.log(loc_res, [last()[last().length-2], last()[last().length-1], res[0], res[1]])}, point=res)){
				just_finished = true
				drawing = false
				last_add([res[0], res[1]])
				console.log(res)
				add_dot(last())
				point_is_near(x,y,1)
				if (is_end()) {
					new_game.style.visibility = "visible"
				} else {
					if (player.innerHTML == "P1") {
						player.innerHTML = "P2"
						body.style.background = "green"
						scoreboard.style.background = "green"
						col = "rgb(0,255,0)"
					}
					else {
						player.innerHTML = "P1"
						body.style.background = "blue"
						scoreboard.style.background = "blue"
						col = "rgb(0,0,255)"
					}
					draw_all_lines()
				}
			}
		}
	}
	if (!drawing && !just_finished) {
		res = point_is_near(x,y,0,is=true)
		if (res) {
			lines.push([res[0],res[1]])
			drawing = true
			point_is_near(x,y,1)
		}
	}
	else if (drawing && last().length == 2) {
		if (!is_crossing([last()[last().length-2], last()[last().length-1], x, y], loc_res=>{console.log(loc_res, [last()[last().length-2], last()[last().length-1], res[0], res[1]])})){
			c.beginPath();
			c.moveTo(last()[last().length-2], last()[last().length-1]);
			c.lineTo(x, y);
			c.stroke();
			last_add([x,y])
		}
	}
	else if (drawing){
		var temp_point = [last()[last().length-2], last()[last().length-1], x, y]
		var crossing = is_crossing(temp_point, res=>{console.log(res)})
		if (!crossing) {
			draw_all_lines()
			c.beginPath();
			c.moveTo(last()[last().length-2], last()[last().length-1]);
			c.lineTo(x, y);
			c.stroke();
			last_add([x, y])
		}
	}
	just_finished = false
}
check = (event)=>{
	draw_all_lines()
	const rect = canvas.getBoundingClientRect()
    const x = Math.round((event.clientX - rect.left) * (canvas.width/rect.width))
    const y = Math.round((event.clientY - rect.top) * (canvas.width/rect.width))
	res = point_is_near(x,y,0,is=true)
	if (res) {
		c.fillStyle = col;
		c.fillRect(res[0]-25, res[1]-25, 51, 51);
		c.fillStyle = "rgb(255,255,255)";
		c.fillRect(res[0]-13, res[1]-12, 27, 27);
		c.fillStyle = "rgb(255,0,0)";
	}
	if (lines.length != 0 && last().length >= 2 && drawing) {
	console.log("all")
	var temp_point = [last()[last().length-2], last()[last().length-1], x, y]
	//var already_drew = false;
	var crossing = is_crossing(temp_point, (res) => {
		c.strokeStyle = "rgb(255,0,0)";
		c.beginPath();
		c.moveTo(last()[last().length-2], last()[last().length-1]);
		c.lineTo(x, y);
		c.stroke();
		c.strokeStyle = col;
		c.fillRect(res[0]-5, res[1]-5, 10, 10);
	})
	if (!crossing) {
		c.strokeStyle = "rgb(255,180,0)";
		c.beginPath();
		c.moveTo(last()[last().length-2], last()[last().length-1]);
		c.lineTo(x, y);
		c.stroke();
		c.strokeStyle = col;
	}
	}
	/*else if (lines.length != 0 && drawing) {
		console.log("little")
		const rect = canvas.getBoundingClientRect()
		const x = Math.round((event.clientX - rect.left) * (canvas.width/rect.width))
		const y = Math.round((event.clientY - rect.top) * (canvas.width/rect.width))
		c.strokeStyle = "rgb(0,255,0)";
		c.beginPath();
		c.moveTo(lines[lines.length-1][0], lines[lines.length-1][1]);
		c.lineTo(x, y);
		c.stroke();
		c.strokeStyle = "rgb(0,0,0)";
	}*/
}
canvas.addEventListener("mousedown", check_write, false)
canvas.addEventListener("mousemove", check, false)