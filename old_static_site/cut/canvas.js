const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
const canvas1 = document.createElement("canvas")
const c1 = canvas1.getContext("2d")
const canvas2 = document.createElement("canvas")
const c2 = canvas2.getContext("2d")

var img = document.createElement("img")

const clear = document.getElementById("button1")
const plus = document.getElementById("button+")
const minus = document.getElementById("button-")
const button = document.getElementById("button2")
const rad1 = document.getElementById("rad1")
const rad2 = document.getElementById("rad2")
const rad3 = document.getElementById("rad3")
const rad4 = document.getElementById("rad4")
var error = document.getElementById("error")

var first = true
var p = []
var p_s = []
var main_side = 1
var shrink = 1
var zoom = 1

function drawLines() {
	if (p_s.length == 4){
		c.beginPath()
		if (main_side == 0) {
			c.strokeStyle = "rgba(255, 255, 0, 255)"
		}
		else{
			c.strokeStyle = "rgba(255, 0, 0, 255)"
		}
		c.moveTo(p_s[0][0]*zoom, p_s[0][1]*zoom)
		c.lineTo(p_s[1][0]*zoom, p_s[1][1]*zoom)
		c.stroke()
		c.beginPath()
		if (main_side == 2) {
			c.strokeStyle = "rgba(255, 255, 0, 255)"
		}
		else{
			c.strokeStyle = "rgba(255, 0, 0, 255)"
		}
		c.moveTo(p_s[0][0]*zoom, p_s[0][1]*zoom)
		c.lineTo(p_s[2][0]*zoom, p_s[2][1]*zoom)
		c.stroke()
		c.beginPath()
		if (main_side == 3) {
			c.strokeStyle = "rgba(255, 255, 0, 255)"
		}
		else{
			c.strokeStyle = "rgba(255, 0, 0, 255)"
		}
		c.moveTo(p_s[3][0]*zoom, p_s[3][1]*zoom)
		c.lineTo(p_s[1][0]*zoom, p_s[1][1]*zoom)
		c.stroke()
		c.beginPath()
		if (main_side == 1) {
			c.strokeStyle = "rgba(255, 255, 0, 255)"
		}
		else{
			c.strokeStyle = "rgba(255, 0, 0, 255)"
		}
		c.moveTo(p_s[3][0]*zoom, p_s[3][1]*zoom)
		c.lineTo(p_s[2][0]*zoom, p_s[2][1]*zoom)
		c.stroke()
		for (var i = 0; i < 4; i++){
			c.beginPath()
			c.lineWidth = "2";
			c.strokeStyle = "red";
			c.rect(p_s[i][0]*zoom-1,p_s[i][1]*zoom-1,3,3)
			c.stroke()
		}
	}	
}
function distance(x1, y1, x2, y2) {
	return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}
function pointSort(lst) {
	var lst2 = [[-1,-1], [-1,-1]]
	var ret_lst = []
	for (var i = 0; i < 2; i++) {
		for (var j = 0; j < 4; j++) {
			if (lst2[0][i] == -1) {
				if (i == 1 && lst2[0][0] == j) {
				}
				else{
					lst2[0][i] = j
				}
			}
			else if (lst[lst2[0][i]][0] == lst[j][0] && lst2[0][0] != j) {
				if (lst[lst2[0][i]][1] < lst[j][1]) {
					lst2[0][i] = j
				}
			}
			else if (lst[lst2[0][i]][0] < lst[j][0] && lst2[0][0] != j) {
				lst2[0][i] = j
			}
		}
	}

	for (var i = 0; i < 2; i++) {
		for (var j = 0; j < 4; j++) {
			if (lst2[1][i] == -1) {
				if (i == 1 && lst2[1][0] == j) {
				}
				else{
					lst2[1][i] = j
				}
			}
			else if (lst[lst2[1][i]][0] >= lst[j][0] && lst2[1][0] != j) {
				lst2[1][i] = j
			}
		}
	}

	if (lst[lst2[0][0]][1] < lst[lst2[0][1]][1]) {
		if (lst[lst2[1][0]][1] < lst[lst2[1][1]][1]) {
			ret_lst = [lst[lst2[1][0]], lst[lst2[0][0]], lst[lst2[1][1]], lst[lst2[0][1]]]
		}
		else{
			ret_lst = [lst[lst2[1][1]], lst[lst2[0][0]], lst[lst2[1][0]], lst[lst2[0][1]]]
		}
	}
	else{
		if (lst[lst2[1][0]][1] < lst[lst2[1][1]][1]) {
			ret_lst = [lst[lst2[1][0]], lst[lst2[0][1]], lst[lst2[1][1]], lst[lst2[0][0]]]
		}
		else{
			ret_lst = [lst[lst2[1][1]], lst[lst2[0][1]], lst[lst2[1][0]], lst[lst2[0][0]]]
		}
	}
	//console.log(ret_lst)
	return ret_lst
}
//pointSort([[64, 43],[145, 18],[106, 76],[146, 114]])
function pointCrop(xy_lst, ratio=0) {
	//document.body.appendChild(canvas1)
	const canvas3 = document.createElement("canvas")
	const c3 = canvas3.getContext("2d")
	const fullres = document.getElementById("inp2").checked
	var imageData = 0
	if (fullres) {
		imageData = c2.getImageData(0, 0, canvas2.width, canvas2.height)
	}
	else {
		imageData = c1.getImageData(0, 0, canvas1.width, canvas1.height)
	}
	const data = imageData.data
	ratio = document.getElementById("inp1").value
	if (ratio == "a" || ratio == "A"){
		ratio = 2.1/2.97
	}
	else{
		ratio = eval(ratio)
	}
	
	var save = false
	//console.log(data)
	if (fullres) {
		var x1 = xy_lst[0][0]*shrink
		var y1 = xy_lst[0][1]*shrink
		var x2 = xy_lst[1][0]*shrink
		var y2 = xy_lst[1][1]*shrink
		var x3 = xy_lst[2][0]*shrink
		var y3 = xy_lst[2][1]*shrink
		var x4 = xy_lst[3][0]*shrink
		var y4 = xy_lst[3][1]*shrink
	}
	else{
		var x1 = xy_lst[0][0]
		var y1 = xy_lst[0][1]
		var x2 = xy_lst[1][0]
		var y2 = xy_lst[1][1]
		var x3 = xy_lst[2][0]
		var y3 = xy_lst[2][1]
		var x4 = xy_lst[3][0]
		var y4 = xy_lst[3][1]
	}
	
	var sx = 0
	var sy = 0
	
    if (ratio <= 0 || !(main_side in [0,1,2,3])){
		sx = Math.round((distance(x1, y1, x2, y2)+distance(x3, y3, x4, y4))/2)*3
        sy = Math.round((distance(x1, y1, x3, y3)+distance(x2, y2, x4, y4))/2)*3
	}
    else{
		var sides = [distance(x1, y1, x2, y2), distance(x3, y3, x4, y4), distance(x1, y1, x3, y3), distance(x2, y2, x4, y4)]
        if (main_side in [0,1]){
            sx = Math.round(sides[main_side])
            sy = Math.round(sides[main_side]/ratio)
		}
        else{
            sx = Math.round(sides[main_side]/ratio)
            sy = Math.round(sides[main_side])
		}
	}
    
	canvas3.width = sx
	canvas3.height = sy
	
    var topx = [-((x1-x2)/sx), -((y1-y2)/sy)*(sy/sx)]
    var bottomx = [-((x3-x4)/sx), -((y3-y4)/sy)*(sy/sx)]
    var lefty = [-((x1-x3)/sx)*(sx/sy), -((y1-y3)/sy)]
    var righty = [-((x2-x4)/sx)*(sx/sy), -((y2-y4)/sy)]
    
    x1 += 1
    y1 += 1
	
	var id = c.createImageData(1,1)
	var d  = id.data
	var place = 0
	if (fullres) {
		for (var x = 0; x < sx; x++) {
			for (var y = 0; y < sy; y++) {
				rx = x1+x*((1-y/(sy*2))*topx[0])+y*((1-x/(sx*2))*lefty[0])
				ry = y1+x*((1-y/(sy*2))*topx[1])+y*((1-x/(sx*2))*lefty[1])
				rx += x*((y/(sy*2))*bottomx[0])+y*((x/(sx*2))*righty[0])
				ry += x*((y/(sy*2))*bottomx[1])+y*((x/(sx*2))*righty[1])
				place = Math.round(ry) * (canvas2.width * 4) + Math.round(rx) * 4
				//console.log(rx, ry, place)
				//console.log(data[place], data[place+1], data[place+2])
				/*d[0] = data[place]
				d[1] = data[place+1]
				d[2] = data[place+2]
				d[3] = 255
				c3.putImageData(id, x, y)*/
				/*c2.beginPath()
				//c3.strokeStyle = "rgba("+data[place]+", "+data[place+1]+", "+data[place+2]+", 255)"
				if (x%16 < sx%16+2 && x%16 > sx%16-2 || y%16 < sy%16+2 && y%16 > sy%16-2) {
					c2.strokeStyle = "rgba(255, 255, 255, 255)"
				}
				else{
					c2.strokeStyle = "rgba("+x%255+", 0, "+y%255+", 255)"
				}
				c2.rect(rx,ry,1,1)
				c2.stroke()*/
				//console.log(x, y, place)
				c3.beginPath()
				c3.strokeStyle = "rgba("+data[place]+", "+data[place+1]+", "+data[place+2]+", 255)"
				c3.rect(x,y,1,1)
				c3.stroke()
			}
		}
	}
	else {
		for (var x = 0; x < sx; x++) {
			for (var y = 0; y < sy; y++) {
				rx = x1+x*((1-y/(sy*2))*topx[0])+y*((1-x/(sx*2))*lefty[0])
				ry = y1+x*((1-y/(sy*2))*topx[1])+y*((1-x/(sx*2))*lefty[1])
				rx += x*((y/(sy*2))*bottomx[0])+y*((x/(sx*2))*righty[0])
				ry += x*((y/(sy*2))*bottomx[1])+y*((x/(sx*2))*righty[1])
				place = Math.round(ry) * (canvas1.width * 4) + Math.round(rx) * 4
				c3.beginPath()
				c3.strokeStyle = "rgba("+data[place]+", "+data[place+1]+", "+data[place+2]+", 255)"
				c3.rect(x,y,1,1)
				c3.stroke()
			}
		}
	}
	if (!first) {
		can = document.getElementById("c")
		can.remove()
	}
	else{
		first = false
	}
	canvas3.setAttribute("id", "c")
	document.body.appendChild(canvas3)
	if (save) {
		canvas3.toBlob(function (blob) {
		/*var link = document.getElementById("downlink")
		link.setAttribute("download", blob)
		link.click()*/
		saveAs(blob, "image.png")
	})
	}
	error.innerHTML = "Done!"
	console.log("done")
}

rad1.onclick = function() {
	main_side = 0
	img.src = canvas1.toDataURL("image/png")
	img.onload = function () {
		c.drawImage(img, 0, 0, canvas.width, canvas.height)
		drawLines()
	}
}
rad2.onclick = function() {
	main_side = 1
	img.src = canvas1.toDataURL("image/png")
	img.onload = function () {
		c.drawImage(img, 0, 0, canvas.width, canvas.height)
		drawLines()
	}
	
}
rad3.onclick = function() {
	main_side = 2
	img.src = canvas1.toDataURL("image/png")
	img.onload = function () {
		c.drawImage(img, 0, 0, canvas.width, canvas.height)
		drawLines()
	}
}
rad4.onclick = function() {
	main_side = 3
	img.src = canvas1.toDataURL("image/png")
	img.onload = function () {
		c.drawImage(img, 0, 0, canvas.width, canvas.height)
		drawLines()
	}
}
const input = document.querySelector("input[type='file']")
input.addEventListener("change", function (e) {
	p = []
	error.innerHTML = " "
	console.log(input.files)
	const reader = new FileReader()
	reader.onload = function () {
		const img2 = new Image()
		img2.src = reader.result
		img2.onload = function () {
			wid = img2.width
			hei = img2.height
			wid_p = 0.95
			hei_p = 0.8
			if (window.innerWidth*wid_p < img2.width || window.innerHeight*hei_p < img2.height) {
				if (wid > hei) {
					shrink = wid / (window.innerWidth*wid_p)
					hei = hei / (wid / (window.innerWidth*wid_p))
					wid = window.innerWidth*wid_p
					
				}
				else{
					shrink = hei / (window.innerHeight*hei_p)
					wid = wid / (hei / (window.innerHeight*hei_p))
					hei = window.innerHeight*hei_p
				}
			}
			else if (window.innerWidth*wid_p > img2.width || window.innerHeight*hei_p > img2.height) {
				if (wid > hei) {
					shrink = wid / (window.innerWidth*wid_p)
					hei = hei / (wid / (window.innerWidth*wid_p))
					wid = window.innerWidth*wid_p
					
				}
				else{
					shrink = hei / (window.innerHeight*hei_p)
					wid = wid / (hei / (window.innerHeight*hei_p))
					hei = window.innerHeight*hei_p
				}
			}
			canvas2.width = img2.width
			canvas2.height = img2.height
			c2.drawImage(img2, 0, 0)
			canvas.width = wid
			canvas.height = hei
			c.drawImage(img2, 0, 0, wid, hei)
			canvas1.width = wid
			canvas1.height = hei
			c1.drawImage(img2, 0, 0, wid, hei)
		}
		
	}
	reader.readAsDataURL(input.files[0])
}, false)

plus.onclick = function(){
	console.log("+")
	img.src = canvas1.toDataURL("image/png")
	img.onload = function () {
		zoom *= 1.5
		canvas.width *= 1.5
		canvas.height *= 1.5
		c.drawImage(img, 0, 0, canvas.width, canvas.height)
		drawLines()
	}
}
minus.onclick = function(){
	console.log("-")
	img.src = canvas1.toDataURL("image/png")
	img.onload = function () {
		zoom /= 1.5 
		canvas.width /= 1.5
		canvas.height /= 1.5
		c.drawImage(img, 0, 0, canvas.width, canvas.height)
		drawLines()
	}
}
clear.onclick = function(){
	img.src = canvas1.toDataURL("image/png")
	img.onload = function () {
		c.drawImage(img, 0, 0, canvas.width, canvas.height)
	}
	p = []
}

button.onclick = function(){
	if (p.length != 4){
		error.innerHTML = "Not enought points"
	}
	else{
		error.innerHTML = " "
		pointCrop(p_s, ratio=0)
	}
}
canvas.addEventListener("click", onDown, false);
function onDown(event){
	error.innerHTML = " "
	const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
	if (p.length != 4){
		p.push([Math.round(x/zoom), Math.round(y/zoom)])
		c.beginPath()
		c.lineWidth = "2";
		c.strokeStyle = "red";
		c.rect(x-1,y-1,3,3)
		c.stroke()
		if (p.length == 4){
			p_s = pointSort(p)
			drawLines()
			
		}
	}
	else{
		img.src = canvas1.toDataURL("image/png")
		img.onload = function () {
			c.drawImage(img, 0, 0, canvas.width, canvas.height)
			var smallest_d = 0
			for (var i = 1; i < 4; i++) {
				if (distance(p[i][0], p[i][1], Math.round(x/zoom), Math.round(y/zoom)) < distance(p[smallest_d][0], p[smallest_d][1], Math.round(x/zoom), Math.round(y/zoom))) {
					smallest_d = i
				}
			}
			p[smallest_d] = [Math.round(x/zoom), Math.round(y/zoom)]
			p_s = pointSort(p)
			drawLines()
		}
		
	}
	//console.log(p)
	
	
	
}