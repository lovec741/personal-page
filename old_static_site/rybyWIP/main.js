history.scrollRestoration = "manual"
let ui_element = document.getElementById("ui_fish_coins")
let money_give_menu_element = document.getElementById("money_give_menu")

let p_amount = 4
var players = []
var playing = 0
var tile_size = 157
var tile_margin = 10
var tile_amount = 9
var topx = 100
var border = 10
var tiles = []
var ax = 0
var ay = 0
let now_playing = null
var tile_types = [[["diag4way"], 3], [["8way"], 3], [["4way"], 3], [["diag1way", 4], 4], [["1way", 4], 4], [["2way", 2], 3],
[["l", 3], 20], [["f", 5], 8], [["fl"], 1], [["vod"], 1], [["r", 10], 10], [["ryb", 2], 2], [["w", 4], 4], [["wi", 5], 5], [["s", 5], 5], [["v", 2], 2], [["fr", 3], 3]]

function load_imgs() {
	t_lst = []
	for (i = 0; i < tile_types.length; i++) {
		if (tile_types[i][0].length == 1) {
			t_lst.push(tile_types[i][0][0])
		}
		else {
			for (j = 0; j < tile_types[i][0][1]; j++) {
				t_lst.push(tile_types[i][0][0]+(j+1))
			}
		}
	}
	console.log(t_lst)
	let images = new Array()
	for (i = 0; i < t_lst.length; i++) {
		images[i] = new Image()
		images[i].src = t_lst[i]+".png"
	}
}
function flip_all() {
	for (let x = 0; x<9; x++) {
		for (let y = 0; y<9; y++) {
			flip(x+","+y)
		}
	}
}
for (var x=tile_margin+border+topx; x < (tile_margin+tile_size)*tile_amount+tile_margin; x += tile_margin+tile_size) {
	ay = 0
	tiles.push([])
	for (var y=tile_margin+border; y < (tile_margin+tile_size)*tile_amount+tile_margin; y += tile_margin+tile_size) {
		var div = document.createElement("div")
		div.style = "top: "+x+"; left: "+y+";"
		div.classList.add("main_tile")	
		div.id = ax+","+ay+"div"
		var img = new Image()
		img.src = "e"+Math.floor((Math.random() * 5) + 1)+".png"
		img.width = tile_size
		img.height = tile_size
		img.id = ax+","+ay
		img.classList.add("main_tile_img")		
		var p = document.createElement("p")
		p.classList.add("prices")
		p.id = ax+","+ay+"p"
		p.style.width = tile_size+"px"
		div.appendChild(img)
		div.appendChild(p)
		document.body.appendChild(div)
		tiles[ax].push([["hidden", ""], ["black", 5], ""])
		ay++
	}
	ax++
}
document.body.style.width = y+border+"px"
console.log(y+border)
document.body.style.height = x+border+"px"

var M = null

function start_click(debug=false){
	add_player_name_button.style.visibility = "hidden"
	remove_player_name_button.style.visibility = "hidden"
	start_button.style.visibility = "hidden"
	document.getElementById("choose").style.visibility = "hidden"
	document.body.style.overflow = "visible"
	if (debug) {
		M = new PlayerManager(["Petr", "Pavel", "Někdo", "Nevim"])
	}
	else 
		M = new PlayerManager(get_player_names_from_inputs())
	show_player_name()
	/*while (players.length < 4) { //document.querySelector("input").value
		var ch = colors[Math.floor(Math.random() * 6)]
		is_in = false
		for (var i=0; i<players.length; i++) {
			if (players[i][0] == ch){
				is_in = true
				break
			}
		}
		if (!is_in || players.length == 0) {
			players.push([ch, [null, null], "Pick your starting tile!", 0])
		}
	}
	document.getElementById("playing").innerHTML = players[0][0].toUpperCase()
	document.getElementById("playing").style.color = players[0][0]
	show_flippable(0)*/
}
function show_player_name() {
	document.getElementById("playing").innerHTML = M.pls[M.playing].name.toUpperCase()
	document.getElementById("playing").style.color = M.pls[M.playing].color
}
start_click(debug=true)

function set_shadow(x, y, color, spread=5) {
	document.getElementById(x+","+y).style.boxShadow = "0px 0px "+spread+"px 0px "+color
	tiles[x][y][1][0] = color
	tiles[x][y][1][1] = spread
}

function remove_fish(x, y) {
	
}

function show_balance() {
	ui_element.innerHTML = ""
	offset = 1
	let i = 0
	for (i; i < M.pls[M.playing].balance.length; i++) {
		ui_element.innerHTML += '<img src="Fish Coin.png" width="47" height="47" style="margin-top: 3.5%; margin-left: '+(offset+3*i)+'%; position: absolute;"> <span style="margin-top: 3.5%; margin-left: '+(offset+3*i)+'%; position: absolute; width: 47px; text-align: center; color: rgb(179,190,3)">'+lst[i]+'</span>'
	}
	if (M.pls[M.playing].has_navnada) {
		ui_element.innerHTML += '<img src="worm.png" width="47" height="47" style="margin-top: 3.5%; margin-left: '+(offset+3*(i+0.5))+'%; position: absolute;">'
	}
}

function open_player_money_give_menu() {
	money_give_menu_element.innerHTML = '<button id="continue" onclick="close_player_money_give_menu(); M.set_balance_by_rybar_usnul(get_results())" style="visibility: hidden">Pokračovat</button>'
	money_give_menu_element.style.visibility = "visible"
	txt = ""
	for (let i = 0; i < M.pls[M.playing].balance.length; i++) {
		txt += '<span class="coin draggable" draggable="true">'+M.pls[M.playing].balance[i]+'</span>'
	}
	money_give_menu_element.innerHTML += '<div class="container" style="position: static"><span style="font-size: 2em"><b>Tvoje: </b></span>'+txt+'</div>'
	for (let i = 0; i < M.pls.length; i++) {
		if (i != M.playing)
			money_give_menu_element.innerHTML += '<div class="container" style="position: static"><span style="font-size: 2em">'+M.pls[i].name+': </span></div>'
	}
	set_draggables()
}

function close_player_money_give_menu() {
	money_give_menu_element.style.visibility = "hidden"
	document.querySelector("#continue").style.visibility = "hidden"
}

function gen_prices() {
	var posib = [5,10,20,50]
	//var nums = Math.floor((Math.random() * 5) + 2)
	var price = Math.floor((Math.random() * 4) + 5)*10
	while (true) {
		ch = Math.floor(Math.random() * 4)
		var con = [posib[ch], posib.slice(0,ch).concat(posib.slice(ch+1))[Math.floor(Math.random() * 3)]]
		if (con.reduce((a, b) => a + b, 0) > price) {
			continue
		}
		else {
			var sum = [con[0], con[1]]
			while (sum.reduce((a, b) => a + b, 0) < price) {
				sum.push(con[Math.floor(Math.random() * 2)])
			}
			if (sum.reduce((a, b) => a + b, 0) == price && sum.length < 7) {
				break
			}
		}
	}
	sum.sort(function(a, b){return b-a})
	return sum.join("°")
}

function gen_game() {
	var empty = []
	for (var x=0; x < tile_amount; x++) {
		for (var y=0; y < tile_amount; y++) {
			empty.push([x, y])
		}
	}
	var l = empty.length
	while (l != 0) {
		var ch = Math.floor(Math.random() * l)
		var im = get_img()
		//document.getElementById(empty[ch][0]+","+empty[ch][1]).src = im
		tiles[empty[ch][0]][empty[ch][1]][0][1] = im
		if (im == "fl.png") {
			tiles[empty[ch][0]][empty[ch][1]][2] = Math.floor((Math.random() * 3) + 6)*10
		} else if (["f1.png", "f2.png", "f3.png", "f4.png", "f5.png"].indexOf(im) >= 0) {
			tiles[empty[ch][0]][empty[ch][1]][2] = gen_prices()
		} else if (im.indexOf("wi") >= 0) {
			tiles[empty[ch][0]][empty[ch][1]][2] = Math.floor(Math.random() * 4)
		}
		//document.getElementById(empty[ch][0]+","+empty[ch][1]+"p").innerHTML = tiles[empty[ch][0]][empty[ch][1]][2]
		empty = empty.slice(0,ch).concat(empty.slice(ch+1))
		l--
	}
}
gen_game()
function show_flippable(player) {
	var loc = players[player][1]
	for (var x=0; x < tile_amount; x++) {
		for (var y=0; y < tile_amount; y++) {
			if (players[player][1][0] == null) {
				if (x == 0 || y == 0 || x == tile_amount-1 || y == tile_amount-1) {
					if (tiles[x][y][1][0] == "black") {
						set_shadow(x, y, "rgb(102, 255, 51)")
					}
				} else if (tiles[x][y][1][0] == "rgb(102, 255, 51)") {
						set_shadow(x, y, "black", 5)
				}
			}
			else {
				if (tiles[x][y][1][0] == "rgb(102, 255, 51)") {
						set_shadow(x, y, "black", 5)
				} 
				if (tiles[locs[0]][locs[1]][0][1].indexOf("wi") >= 0) {
					////////////
					if (eq([x, y], [locs[0]+1, locs[1]]) 
					|| eq([x, y], [locs[0]-1, locs[1]]) 
					|| eq([x, y], [locs[0], locs[1]+1]) 
					|| eq([x, y], [locs[0], locs[1]-1])) {
						if (tiles[x][y][1][0] == "black") {
							set_shadow(x, y, "rgb(102, 255, 51)")
						}
					}
					
				}
				else if (tiles[locs[0]][locs[1]][0][1].indexOf("diag1way") >= 0) {
					////////////
					if (eq([x, y], [locs[0]+1, locs[1]]) 
					|| eq([x, y], [locs[0]-1, locs[1]]) 
					|| eq([x, y], [locs[0], locs[1]+1]) 
					|| eq([x, y], [locs[0], locs[1]-1])) {
						if (tiles[x][y][1][0] == "black") {
							set_shadow(x, y, "rgb(102, 255, 51)")
						}
					}
				}
				else if (tiles[locs[0]][locs[1]][0][1].indexOf("1way") >= 0) {
					////////////
					if (eq([x, y], [locs[0]+1, locs[1]]) 
					|| eq([x, y], [locs[0]-1, locs[1]]) 
					|| eq([x, y], [locs[0], locs[1]+1]) 
					|| eq([x, y], [locs[0], locs[1]-1])) {
						if (tiles[x][y][1][0] == "black") {
							set_shadow(x, y, "rgb(102, 255, 51)")
						}
					}
				}
				else if (tiles[locs[0]][locs[1]][0][1].indexOf("diag4way") >= 0) {
					if (eq([x, y], [locs[0]+1, locs[1]+1]) 
					|| eq([x, y], [locs[0]+1, locs[1]-1]) 
					|| eq([x, y], [locs[0]-1, locs[1]+1]) 
					|| eq([x, y], [locs[0]-1, locs[1]-1])) {
						if (tiles[x][y][1][0] == "black") {
							set_shadow(x, y, "rgb(102, 255, 51)")
						}
					}
				}
				else if (tiles[locs[0]][locs[1]][0][1].indexOf("4way") >= 0) {
					if (eq([x, y], [locs[0]+1, locs[1]]) 
					|| eq([x, y], [locs[0]-1, locs[1]]) 
					|| eq([x, y], [locs[0], locs[1]+1]) 
					|| eq([x, y], [locs[0], locs[1]-1])) {
						if (tiles[x][y][1][0] == "black") {
							set_shadow(x, y, "rgb(102, 255, 51)")
						}
					}
				}
				else if (tiles[locs[0]][locs[1]][0][1].indexOf("2way") >= 0) {
					////////////
					if (eq([x, y], [locs[0]+1, locs[1]]) 
					|| eq([x, y], [locs[0]-1, locs[1]]) 
					|| eq([x, y], [locs[0], locs[1]+1]) 
					|| eq([x, y], [locs[0], locs[1]-1])) {
						if (tiles[x][y][1][0] == "black") {
							set_shadow(x, y, "rgb(102, 255, 51)")
						}
					}
				}
				else if (tiles[locs[0]][locs[1]][0][1].indexOf("8way") >= 0) {
					if (eq([x, y], [locs[0]+1, locs[1]]) 
					|| eq([x, y], [locs[0]-1, locs[1]]) 
					|| eq([x, y], [locs[0], locs[1]+1]) 
					|| eq([x, y], [locs[0], locs[1]-1])
					|| eq([x, y], [locs[0]+1, locs[1]+1]) 
					|| eq([x, y], [locs[0]+1, locs[1]-1]) 
					|| eq([x, y], [locs[0]-1, locs[1]+1]) 
					|| eq([x, y], [locs[0]-1, locs[1]-1])) {
						if (tiles[x][y][1][0] == "black") {
							set_shadow(x, y, "rgb(102, 255, 51)")
						}
					}
				}
				else if (eq([x, y], [loc[0]+1, loc[1]]) 
				|| eq([x, y], [loc[0]-1, loc[1]]) 
				|| eq([x, y], [loc[0], loc[1]+1]) 
				|| eq([x, y], [loc[0], loc[1]-1])) {
					if (tiles[x][y][1][0] == "black") {
						set_shadow(x, y, "rgb(102, 255, 51)")
					}
				}
				
			}
		}
	}
}
function eq(ls1, ls2) {
	if (ls1[0] == ls2[0] && ls1[1] == ls2[1]) {
		return true
	}
	return false
}
function get_img() {
	failed = 0
	while (true) {
		var ch = Math.floor(Math.random() * (tile_types.length))
		if (tile_types[ch][1] > 0) {
			tile_types[ch][1]--
			if (tile_types[ch][0].length == 1) {
				return tile_types[ch][0][0]+".png"
			} else {
				return tile_types[ch][0][0]+ Math.floor((Math.random() * tile_types[ch][0][1]) + 1) +".png"
			}
		}
		failed++
	}
}

function flip(loc) {
    var locs = loc.split(",")
	if (tiles[locs[0]][locs[1]][0][0] != "shown") {
		tiles[locs[0]][locs[1]][0][0] = "shown"
		var first = true
		document.getElementById(loc+"div").style.transform = "rotateY(90deg)"
		document.getElementById(loc+"div").addEventListener("transitionend", ()=>{
			if (first) {
				document.getElementById(loc).src = tiles[locs[0]][locs[1]][0][1]
				document.getElementById(loc).style.transform = "rotateY(180deg)"
				document.getElementById(loc+"p").style.transform = "rotateY(180deg)"
				if (tiles[locs[0]][locs[1]][0][1].indexOf("wi") >= 0) {
					document.getElementById(loc).style.transform="rotate("+tiles[locs[0]][locs[1]][2]*90+"deg)"
				} else {
					document.getElementById(loc+"p").innerHTML = tiles[locs[0]][locs[1]][2]
				}
				document.getElementById(loc+"div").style.transform = "rotateY(180deg)"
				first = false
			}
		});
		}
}
function move_player(loc, next=False) {
	locs = loc.split(",")
	set_shadow(locs[0], locs[1], players[playing][0], 30)
	if (players[playing][1][0] != null) {
		set_shadow(players[playing][1][0], players[playing][1][1], "black", 5)
	}
	/*var going = true
	while (going) {
	for (var x=0; x < tile_amount; x++) {
		for (var y=0; y < tile_amount; y++) {
			
			else {
				going = false
			}
			if (going) {
				locs = [x, y]
			}
		}
	}}*/
	players[playing][1] = [parseInt(locs[0]), parseInt(locs[1])]
	if (next) {
		while (true) {
			playing++
			if (playing == players.length) {
				playing = 0
			}
			if (players[playing][3] > 0) {
				players[playing][3]--
			} else {
				break
			}
		}
	}
	
	
	document.getElementById("playing").innerHTML = players[playing][0].toUpperCase()
	document.getElementById("playing").style.color = players[playing][0]
	show_flippable(playing)
}
document.addEventListener('mousedown', function(e) {
	if (e.srcElement.id.indexOf(",") >= 0 && e.srcElement.id.indexOf("p") < 0 && tiles[e.srcElement.id.split(",")[0]][e.srcElement.id.split(",")[1]][1][0] == "rgb(102, 255, 51)") {
		//PŘIDAT PRAVIDLA KDY SE MŮŽE HNOUT
		
		//move_player(e.srcElement.id)
	}
	flip(e.srcElement.id)
}, false);