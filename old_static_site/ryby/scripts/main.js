history.scrollRestoration = "manual"
let ui_element = document.getElementById("ui_fish_coins")
let money_give_menu_element = document.getElementById("money_give_menu")
let turn_counter_element = document.getElementById("turn-counter")
let fish_counter_element = document.getElementById("fish-counter")
let info_element = document.getElementById("info")
let click_block_element = document.getElementById("click_block")
let pop_up_element = document.getElementById("popup")
let pop_up_button1 = document.getElementById("popup_button1")
let pop_up_button2 = document.getElementById("popup_button2")
let pop_up_text_element = document.getElementById("popup_text")
let next_button = document.getElementById("next")
let end_button = document.getElementById("end")
let p_amount = 4
var tile_amount = 9
var tile_margin = Math.round(window.innerWidth / 192)
var tile_size = Math.round(window.innerWidth / tile_amount - tile_margin - 3*tile_margin/tile_amount)
var topx = Math.round(window.innerHeight * 0.15)
var border = 10
var tiles = []
let fish_not_picked_up = 1
let now_playing = null
let character_img = "profile1"
let folder = "imgs/"
var tile_types = [[["diag4way"], 3], [["8way"], 3], [["4way"], 3], [["diag1way", 4], 4], [["1way", 4], 4], [["2way", 2], 3],
[["l", 3], 20], [["f", 5], 8], [["fl"], 1], [["vod"], 1], [["r", 10], 10], [["ryb", 2], 2], [["w", 4], 4], [["wi", 5], 5], [["s", 5], 5], [["v", 2], 2], [["fr", 3], 3]]																															        
function load_imgs() { // probably not needed
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
	let images = new Array()
	for (i = 0; i < t_lst.length; i++) {
		images[i] = new Image()
		images[i].src = folder+t_lst[i]+".png"
	}
}
function resize_tiles() {
	tile_margin = Math.round(window.innerWidth / 192)
	tile_size = Math.round(window.innerWidth / tile_amount - tile_margin - 3*tile_margin/tile_amount)
	topx = Math.round(window.innerHeight * 0.15)
	let y = tile_margin+border
	let x = tile_margin+border+topx
	for (let ay=0; ay < tile_amount; ay++) {
		y = tile_margin+border
		for (let ax=0; ax < tile_amount; ax++) {
			var div = document.getElementById(ax+","+ay+"div")
			div.style.top = x
			div.style.left = y
			div.style.width = tile_size
			div.style.height = tile_size
			var img = document.getElementById(ax+","+ay)
			img.width = tile_size
			img.height = tile_size	
			var p = document.getElementById(ax+","+ay+"p")
			p.style.width = tile_size+"px"
			y += tile_margin+tile_size
		}
		x += tile_margin+tile_size
	}
}

function flip_all() {
	for (let x = 0; x<9; x++) {
		for (let y = 0; y<9; y++) {
			flip(x,y)
		}
	}
}

let y = tile_margin+border
let x = tile_margin+border+topx
for (let ay=0; ay < tile_amount; ay++) {
	y = tile_margin+border
	tiles.push([])
	for (let ax=0; ax < tile_amount; ax++) {
		var div = document.createElement("div")
		div.classList.add("main_tile")	
		div.id = ax+","+ay+"div"
		div.style.top = x
		div.style.left = y
		div.style.width = tile_size
		div.style.height = tile_size
		var img = new Image()
		img.src = folder+"e"+Math.floor((Math.random() * 5) + 1)+".png"
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
		document.getElementById("not").appendChild(div)
		tiles[ay].push([["hidden", ""], ["black", 5], "", false])
		y += tile_margin+tile_size
	}
	x += tile_margin+tile_size
}
document.getElementById("not").style.width = y+border+"px"
document.getElementById("not").style.height = x+border+"px"

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
	set_up_player()
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
function set_shadow(x, y, col, spread=5) {
	if (col == "black") {
		document.getElementById(x+","+y).style.boxShadow = "0px 0px "+spread+"px 0px "+col
	}
	else {
		document.getElementById(x+","+y).style.boxShadow = "0px 0px 0px "+spread/3+"px "+col
	}
	tiles[x][y][1][0] = col
	tiles[x][y][1][1] = spread
}
function remove_fish(loc) {
	txt = document.getElementById(loc+"p")
	let add = 0
	if (txt.innerHTML != "") {
		lst = txt.innerHTML.split("°")
		add = lst.shift()
		M.pls[M.playing].balance.push(add)
		M.pls[M.playing].balance.sort(function(a, b){return b-a})
		txt.innerHTML = lst.join("°")
		tiles[loc.split(",")[0]][loc.split(",")[1]][2] = lst.join("°")
		if (M.pls[M.playing].player_debt.length > 0) {
			open_player_money_give_menu(true)
		} 
		else {
			M.pls[M.playing].info = `Sebrali jste ${add} rybích peněz!`
		}
		if (lst.length == 0) {
			let temp = document.getElementById(loc).src.split("/")
			document.getElementById(loc).src = folder+"_"+temp[temp.length-1]
			tiles[loc.split(",")[0]][loc.split(",")[1]][3] = true
		}
		fish_not_picked_up--
		update_fish_counter()
	}
	return add
}
function show_balance() {
	ui_element.innerHTML = ""
	offset = 1
	let i = 0
	for (i; i < M.pls[M.playing].balance.length; i++) {
		ui_element.innerHTML += '<img src="'+folder+'Fish Coin.png" width="47" height="47" style="margin-top: 3.5%; margin-left: '+(offset+3*i)+'%; position: absolute;"> <span style="margin-top: 3.5%; margin-left: '+(offset+3*i)+'%; position: absolute; width: 47px; text-align: center; color: rgb(179,190,3)">'+M.pls[M.playing].balance[i]+'</span>'
	}
	if (M.pls[M.playing].has_worm) {
		ui_element.innerHTML += '<img id="worm" onclick="use_worm()" src="'+folder+'worm.png" width="47" height="47" style="margin-top: 3.5%; margin-left: '+(offset+3*(i+0.5))+'%; position: absolute;">'
	}
}
function next_button_visible() {
	next_button.style = "visibility: visible"
}
function end_button_visible() {
	end_button.style = "visibility: visible"
}
function set_up_player(loc=true) {
	turn_counter_element.innerHTML = `Kolo: ${M.round}`
	show_balance()
	show_player_name()
	if (loc) {
		if (M.pls[M.playing].back_from_outside) {
			if (tiles[M.pls[M.playing].x][M.pls[M.playing].y][0][1].startsWith("wi")) {
				available_locations()
			}
			else {
				available_locations()
				standing_what_do()
			}
			M.pls[M.playing].back_from_outside = false
		}
		else {
			available_locations()
		}
	}
	info_element.innerHTML = M.pls[M.playing].info
}
function focus_on_player() {
	let hei = parseInt(document.getElementById(M.pls[M.playing].x+","+M.pls[M.playing].y+"div").style.top) - topx - 2*tile_margin - (window.innerHeight / 2 - topx- 2*tile_margin)
	window.scroll({top: hei, behavior: 'smooth'})
}
function next_player(no_next=false) {
	if (!no_next) {
		M.next()
		end_button.style = 'visibility: hidden'
	}
	next_button.style = 'visibility: hidden'
	if (M.pls[M.playing].do_skip()) {
		next_button_visible()
		available_locations(true)
		set_up_player(false)
		for (let i = 0; i < M.pls.length; i++) {
			if (i == M.playing) {
				move_player(M.pls[i].x, M.pls[i].y, false, -1, true)
			} else {
				move_player(M.pls[i].x, M.pls[i].y, false, i)
			}
		}
	}
	else {
		set_up_player()
		for (let i = 0; i < M.pls.length; i++) {
			if (i == M.playing) {
				move_player(M.pls[i].x, M.pls[i].y)
			} else {
				move_player(M.pls[i].x, M.pls[i].y, false, i)
			}
		}
	}
	if (M.pls[M.playing].x != -1) {
		focus_on_player()
	}
	
}
window.onload = () => {
	//start_click(debug=true)
	//flip_all()
	//available_locations(false, false, true)
	load_imgs()
	click_block_off()
	update_fish_counter()
}
function open_player_money_give_menu(debt=false) {
	click_block_on()
	if (!debt) {
		money_give_menu_element.innerHTML = '<p id="menu_text" style="font-size: 2em">Usnuli jste a ryba vám vytrhla udici, dejte každému hráči jednu ze svých ryb za to, že vám ji pomohli najít a čekejte 3 kola</p>'
		money_give_menu_element.innerHTML += '<button id="continue" onclick="M.set_balance_by_rybar_usnul(get_results()); close_player_money_give_menu()" style="visibility: hidden">Pokračovat</button>'
	} else {
		money_give_menu_element.innerHTML = '<p id="menu_text" style="font-size: 2em">Dostali jste rybu, vyberte kterému hráči chcete splatit dluh.</p>'
		money_give_menu_element.innerHTML += '<button id="continue" onclick="M.set_balance_by_debt(get_results()); close_player_money_give_menu()" style="visibility: hidden">Pokračovat</button>'
	}
	money_give_menu_element.style.visibility = "visible"
	txt = ""
	for (let i = 0; i < M.pls[M.playing].balance.length; i++) {
		txt += '<span class="coin draggable" draggable="true">'+M.pls[M.playing].balance[i]+'</span>'
	}
	money_give_menu_element.innerHTML += '<div class="container" style="position: static"><span style="font-size: 2em"><b>Tvoje: </b></span>'+txt+'</div>'
	if (!debt)
		for (let i = 0; i < M.pls.length; i++) {
			if (i != M.playing)
				money_give_menu_element.innerHTML += '<div class="container" style="position: static"><span style="font-size: 2em">'+M.pls[i].name+': </span></div>'
		}
	else
		for (let i = 0; i < M.pls[M.playing].player_debt.length; i++) {
			money_give_menu_element.innerHTML += '<div class="container" style="position: static"><span style="font-size: 2em">'+M.pls[M.pls[M.playing].player_debt[i]].name+': </span></div>'
		}
	set_draggables()
}
function close_player_money_give_menu() {
	money_give_menu_element.style.visibility = "hidden"
	document.querySelector("#continue").style.visibility = "hidden"
	click_block_off()
	next_button_visible()
	set_up_player(false)
}
function click_block_on() {
	click_block_element.style.display = "block"
	document.body.style.overflow = "hidden"
}
function click_block_off() {
	click_block_element.style.display = "none"
	document.body.style.overflow = "visible"
}
function gen_prices() {
	var posib = [5,10,20]
	//var nums = Math.floor((Math.random() * 5) + 2)
	var price = Math.floor((Math.random() * 2) + 5)*10
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
	fish_not_picked_up += sum.length
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
		//document.getElementById(empty[ch][0]+","+empty[ch][1]).src = folder+im
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
function move_player(x, y, remove=false, other=-1, skip=false) {
	let border = tile_margin*4
	let ind = M.playing
	if (other != -1) {
		ind = other
	}
	let old_div = document.getElementById(M.pls[ind].x+","+M.pls[ind].y+"div")
	if (M.pls[ind].x != -1) { // if player already on board remove it
		old_div.removeChild(old_div.lastChild)
	}
	if (remove || x == -1) return
	let div = document.getElementById(x+","+y+"div")
	let img = document.createElement("img")
	img.src = folder+character_img+".png"
	let col = "white"
	if (other != -1) {
		col = "black"
	} 
	if (skip) {
		col = "darkred"
	}
	let n = tile_margin/8
	console.log(n)
	img.style = `width: 50%;
				height: 50%;
				position: absolute;
				opacity: 0.7;
				top: 25%;
				left: 25%;
				${M.pls[ind].filter}
				drop-shadow(${n}px 0 0 ${col})
				drop-shadow(-${n}px 0 0 ${col}) 
				drop-shadow(0 ${2*n}px 0 ${col}) 
				drop-shadow(0 -${3*n}px 0 ${col}) 
				drop-shadow(${2*n}px ${n}px 0 ${col}) 
				drop-shadow(-${2*n}px -${n}px 0 ${col}) 
				drop-shadow(${2*n}px -${n}px 0 ${col}) 
				drop-shadow(-${2*n}px ${n}px 0 ${col});
				`
	div.appendChild(img)
	M.pls[ind].x = x
	M.pls[ind].y = y
	if (other == -1) {
		focus_on_player()
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
function flip(x, y, move=false) {
    let loc_str = x+","+y
	if (tiles[x][y][0][0] != "shown") {
		tiles[x][y][0][0] = "shown"
		var first = true
		document.getElementById(loc_str+"div").style.transform = "rotateY(90deg)"
		document.getElementById(loc_str+"div").addEventListener("transitionend", ()=>{
			if (first) {
				document.getElementById(loc_str).src = folder+tiles[x][y][0][1]
				document.getElementById(loc_str).style.transform = "rotateY(180deg)"
				document.getElementById(loc_str+"p").style.transform = "rotateY(180deg)"
				if (tiles[x][y][0][1].startsWith("wi")) {
					document.getElementById(loc_str).style.transform="rotate("+tiles[x][y][2]*90+"deg)"
				} else {
					document.getElementById(loc_str+"p").innerHTML = tiles[x][y][2]
				}
				document.getElementById(loc_str+"div").style.transform = "rotateY(180deg)"
				first = false
			}
			if (move)
				move_player(x, y)
		});
	}
	else
		if (move)
			move_player(x, y)
}
function update_fish_counter() {
	fish_counter_element.innerHTML = "Zbývajících ryb: "+fish_not_picked_up
}
function put_fish_back(x, y, am) {
	let fish = document.getElementById(x+","+y+"p") 
	if (fish.innerHTML == "") {
		fish.innerHTML = am
		tiles[x][y][2] = am
		tiles[x][y][3] = false
		let temp = document.getElementById(x+","+y).src.split("/")
		document.getElementById(x+","+y).src = folder+temp[temp.length-1].slice(1)
	}
	else {
		let lst = fish.innerHTML.split("°")
		lst.push(am)
		lst.sort(function(a, b){return b-a})
		fish.innerHTML = lst.join("°")
		tiles[x][y][2] = lst.join("°")
	}
	fish_not_picked_up++
	update_fish_counter()
}
function set_to_water(x,y) {
	/*let ch = Math.floor((Math.random() * 3) + 1)
	tiles[x][y][0][1] = "l"+ch
	document.getElementById(x+","+y).src = folder+"l"+ch+".png"*/
	tiles[x][y][3] = true
	let temp = document.getElementById(x+","+y).src.split("/")
	document.getElementById(x+","+y).src = folder+"_"+temp[temp.length-1]
}
function pop_up(text, button1_text, button2_text, button1_func, button2_func) {
	click_block_on()
	pop_up_element.style.visibility = "visible"
	pop_up_text_element.innerHTML = text
	if (button1_text == "") {
		pop_up_button1.style.visibility = "hidden"
	}
	else {
		pop_up_button1.style.visibility = "visible"
		pop_up_button1.innerHTML = button1_text
		pop_up_button1.onclick = () => {
			button1_func()
			pop_up_element.style.visibility = "hidden"
			pop_up_button1.style.visibility = "hidden"
			pop_up_button2.style.visibility = "hidden"
			click_block_off()
		}
	}
	if (button2_text == "") {
		pop_up_button2.style.visibility = "hidden"
	}
	else {
		pop_up_button2.style.visibility = "visible"
		pop_up_button2.innerHTML = button2_text
		pop_up_button2.onclick = () => {
			button2_func()
			pop_up_element.style.visibility = "hidden"
			pop_up_button1.style.visibility = "hidden"
			pop_up_button2.style.visibility = "hidden"
			click_block_off()
		}
	}
	
}
document.addEventListener('mousedown', function(e) {
	if (click_block_element.style.display == "none") {
		if (e.srcElement.id.indexOf(",") >= 0 && e.srcElement.id.indexOf("p") < 0 && tiles[e.srcElement.id.split(",")[0]][e.srcElement.id.split(",")[1]][1][0] == "rgb(102, 255, 51)") {
			available_locations(true)
			let wait = 0
			let loc = e.srcElement.id.split(",")
			if (tiles[loc[0]][loc[1]][0][0] == "hidden") {
				flip(loc[0], loc[1], true)
				wait = 1000
			}
			else {
				move_player(loc[0], loc[1])
			}
			setTimeout(()=>{
				let do_move = standing_what_do()
				set_up_player(false)
				if (do_move) {
					//available_locations()
				}
				else {
					next_button_visible()
				}
			},wait)
		}
		// this is for selecting fish
		else if (e.srcElement.id.indexOf(",") >= 0 && e.srcElement.id.indexOf("p") < 0 && tiles[e.srcElement.id.split(",")[0]][e.srcElement.id.split(",")[1]][1][0] == "red") {
			let loc = e.srcElement.id.split(",")
			if (tiles[M.pls[M.playing].x][M.pls[M.playing].y][0][1].startsWith("s")) {
				put_fish_back(loc[0], loc[1], M.remove_smallest_fishcoin())
				available_locations(true)
				M.pls[M.playing].info = "Ryba položena!"
				set_up_player(false)
				next_button_visible()
			} else {
				remove_fish(e.srcElement.id)
				set_to_water(M.pls[M.playing].x, M.pls[M.playing].y)
				M.pls[M.playing].info = `Teď se ještě můžete přemístit na jakékoliv volné, otočené políčko.`
				set_up_player()
				available_locations(false, false, false, true)
			}
			
		}
	}
}, false);
document.addEventListener("keyup", function(event) {
  if (event.keyCode === 13 && next_button.style.visibility == "visible") {
    next_button.click()
  }
})