function available_locations(hide=false, put_fish=false, all=false, all_shown=false, choose_fish=false) {
	let x_loc = parseInt(M.pls[M.playing].x)
	let y_loc = parseInt(M.pls[M.playing].y)
	let possib = 0
	for (let x=0; x < tile_amount; x++) {
		for (let y=0; y < tile_amount; y++) {
			if (put_fish) {
				if (tiles[x][y][0][1].startsWith("f") && !tiles[x][y][0][1].startsWith("fr") && tiles[x][y][0][0] == "shown") {
					set_shadow(x, y, "red", 5)
				}
				else {
					set_shadow(x, y, "black", 5)
				}
			}
			else if (choose_fish) {
				if (tiles[x][y][0][1].startsWith("f") && !tiles[x][y][0][1].startsWith("fr") && tiles[x][y][0][0] == "shown" && tiles[x][y][2] != "") {
					set_shadow(x, y, "red", 5)
				}
				else {
					set_shadow(x, y, "black", 5)
				}
			}
			else if (hide || M.ocupied(x,y)){
				set_shadow(x, y, "black", 5)
			}
			else if (all) {
				set_shadow(x, y, "rgb(102, 255, 51)")
			}
			else if (all_shown) {
				if (tiles[x][y][0][0] == "shown")
					set_shadow(x, y, "rgb(102, 255, 51)")
				else
					set_shadow(x, y, "black", 5)
			}
			else if (x_loc == -1) { // show starting position
				if (x == 0 || y == 0 || x == tile_amount-1 || y == tile_amount-1) {
					if (tiles[x][y][1][0] == "black") {
						set_shadow(x, y, "rgb(102, 255, 51)")
						possib++
					}
				} else {
						set_shadow(x, y, "black", 5)
				}
			}
			else if (
					x+1 == x_loc && y == y_loc ||
					x == x_loc && y+1 == y_loc ||
					x-1 == x_loc && y == y_loc ||
					x == x_loc && y-1 == y_loc
					) {
				set_shadow(x, y, "rgb(102, 255, 51)")
				possib++
			}
			else 
				set_shadow(x, y, "black", 5)
		}
	}
	if (hide==false && put_fish==false && all==false && all_shown==false && choose_fish==false && possib == 0) {
		next_button_visible()
		M.pls[M.playing].info = "Není se kam pohnout! Řekněte jim ať uhnou."
		set_up_player(false)
	}
}

function fish_revealed(free=false, with_fish=false) { // free means if you want it to check if there is a player standing on it or not
	for (let x=0; x < tile_amount; x++) {
		for (let y=0; y < tile_amount; y++) {
			if (tiles[x][y][0][1].startsWith("f") && 
				!tiles[x][y][0][1].startsWith("fr") && 
				tiles[x][y][0][0] == "shown") {
				if (with_fish && free) {
					if (tiles[x][y][2] != "" && !M.ocupied(x, y)) {
						return true
					}
				}
				else if (with_fish) {
					if (tiles[x][y][2] != "") {
						return true
					}
				}
				else if (free) {
					if (!M.ocupied(x, y)) {
						return true
					}
				}	
				else {
					return true
				}
			}
		}
	}
	return false
}
function death() {
	M.pls[M.playing].info = "Bohužel jste se svojí loďkou narazil do jiného hráče a umřel jste!"
	M.died(M.playing)
	move_player(0,0,true) // removes player from board
	end_button_visible()
}
function dist(x1, y1, x2, y2) {
	return Math.sqrt((x1-x2)**2+(y1-y2)**2)
}
function nearest_fish(with_fish=false) {
	let res = [null,null,9999]
	let x_loc = parseInt(M.pls[M.playing].x)
	let y_loc = parseInt(M.pls[M.playing].y)
	for (let x=0; x < tile_amount; x++) {
		for (let y=0; y < tile_amount; y++) {
			if (tiles[x][y][0][1].startsWith("f") && 
				!tiles[x][y][0][1].startsWith("fr") && 
				tiles[x][y][0][0] == "shown" && 
				!M.ocupied(x, y)) {
				let temp = dist(x_loc, y_loc, x, y)
				if (res[2] > temp) {
					if (with_fish) {
						if (tiles[x][y][2] != "") {
							res = [x, y, temp]
						}
					}
					else {
						res = [x, y, temp]
					}
				}
			}
		}
	}
	if (res[0] == null) {
		return null
	}
	return [res[0], res[1]]
}
function use_worm() {
	if (M.pls[M.playing].skip == 0) {
	if (fish_revealed(true, true)) {
		let loc = nearest_fish(true)
		move_player(loc[0], loc[1])
		standing_what_do()
		M.pls[M.playing].has_worm = false
		set_up_player(false)
		available_locations(true)
		next_button_visible()
	} else if (fish_revealed(true)) {
		let loc = nearest_fish()
		move_player(loc[0], loc[1])
		standing_what_do()
		M.pls[M.playing].has_worm = false
		set_up_player(false)
		available_locations(true)
		next_button_visible()
	}
	else {
		pop_up(
			"Není tu žádná kartička ryby, která není odkrytá nebo obsazená!",
			"",
			"Ok",
			null,
			() => {
			}
		)
	}
	}
}
function direction_available_locations(tile) {
	let x_loc = parseInt(M.pls[M.playing].x)
	let y_loc = parseInt(M.pls[M.playing].y)
	let rot = null
	let check_list = []
	if (tile.startsWith("1way")) {
		rot = tile[4]
		if (rot == 1) {
			check_list.push([0,-1])
		} else if (rot == 2) {
			check_list.push([1,0])
		} else if (rot == 3) {
			check_list.push([0,1])
		} else if (rot == 4) {
			check_list.push([-1,0])
		}
	} else if (tile.startsWith("2way")) {
		rot = tile[4]
		if (rot == 1) {
			check_list.push([0,1])
			check_list.push([0,-1])
		} else if (rot == 2) {
			check_list.push([1,0])
			check_list.push([-1,0])
		}
	} else if (tile.startsWith("4way")) {
		check_list.push([0,1])
		check_list.push([0,-1])
		check_list.push([1,0])
		check_list.push([-1,0])
	} else if (tile.startsWith("8way")) {
		check_list.push([0,1])
		check_list.push([0,-1])
		check_list.push([1,0])
		check_list.push([-1,0])
		check_list.push([1,1])
		check_list.push([1,-1])
		check_list.push([-1,1])
		check_list.push([-1,-1])
	} else if (tile.startsWith("diag1way")) {
		rot = tile[8]
		if (rot == 1) {
			check_list.push([1,-1])
		} else if (rot == 2) {
			check_list.push([1,1])
		} else if (rot == 3) {
			check_list.push([-1,1])
		} else if (rot == 4) {
			check_list.push([-1,-1])
		}
	} else if (tile.startsWith("diag4way")) {
		check_list.push([1,-1])
		check_list.push([1,1])
		check_list.push([-1,1])
		check_list.push([-1,-1])
	}
	let found = 0
	let only_dirs = true
	for (let x=0; x < tile_amount; x++) {
		for (let y=0; y < tile_amount; y++) {
			set_shadow(x, y, "black", 5)
			for (let i=0; i < check_list.length; i++) {
				if (x-check_list[i][0] == x_loc && y-check_list[i][1] == y_loc &&
					!M.ocupied(x, y)) {
					set_shadow(x, y, "rgb(102, 255, 51)")
					found++
					let name = tiles[x][y][0][1]
					if (!(
						name.startsWith("1way") || // direction
						name.startsWith("2way") || 
						name.startsWith("4way") || 
						name.startsWith("8way") || 
						name.startsWith("diag")
						)) {
						console.log(name)
						only_dirs = false
					}
					break
				}
			}
		}
	}
	if (found == 0) {
		if (x_loc+1 < tile_amount && !M.ocupied(x_loc+1, y_loc))
			set_shadow(x_loc+1, y_loc, "rgb(102, 255, 51)")
		if (y_loc+1 < tile_amount && !M.ocupied(x_loc, y_loc+1))
			set_shadow(x_loc, y_loc+1, "rgb(102, 255, 51)")
		if (x_loc-1 >= 0 && !M.ocupied(x_loc-1, y_loc))
			set_shadow(x_loc-1, y_loc, "rgb(102, 255, 51)")
		if (y_loc-1 >= 0 && !M.ocupied(x_loc, y_loc-1))
			set_shadow(x_loc, y_loc-1, "rgb(102, 255, 51)")
	}
	return only_dirs
}
let directions_in_a_row = 0
function standing_what_do() { // after player is standing on something what should the game do
	// returns true if the player should be allowed to move again in this turn and false if not
	let x = M.pls[M.playing].x
	let y = M.pls[M.playing].y
	let name = tiles[x][y][0][1]
	if (!(
		name.startsWith("1way") || // direction
		name.startsWith("2way") || 
		name.startsWith("4way") || 
		name.startsWith("8way") || 
		name.startsWith("diag")
		)) {
		directions_in_a_row = 0
	}
	if (name.startsWith("l") || tiles[x][y][3]) { // water
		M.pls[M.playing].info = `Stojíte na kartičce voda, jak zajímavé!`
		return false
	}
	else if (name.startsWith("fr")) { // broken fishing rod
		M.pls[M.playing].info = `Zlomila se vám udice! Musíte čekat 3 kola.`
		M.pls[M.playing].skip = 3
		return false
	}
	else if (name.startsWith("f")) { // fish
		remove_fish(x+","+y)
		return false
	} 
	else if (name.startsWith("s")) { // stork
		if (fish_revealed() && M.pls[M.playing].balance.length > 0) { 
			M.pls[M.playing].info = `Čáp vám ukradl rybu! Vyberte kartičku ryb na kterou je chcete položit.`
			available_locations(false, true)
			return true
		}
		else if (M.pls[M.playing].balance.length == 0) {
			M.pls[M.playing].info = `Čáp vám chtěl ukrást rybu, ale žádnou nemáte!`
		}
		else {
			M.pls[M.playing].info = `Čáp vám ukradl rybu! Ale nenašel žádnou volnou kartičku ryby a tak vám jí vrátil.`
		}
		return false
	}
	else if (name.startsWith("ryb")) { // fisherman fell asleep
		M.pls[M.playing].info = `Šlápli jste na kartičku rybář usnul.`
		M.pls[M.playing].skip = 3
		setTimeout(()=>{set_to_water(x, y); open_player_money_give_menu()}, 300)
		return true
	}
	else if (name.startsWith("r")) { // reeds
		M.pls[M.playing].info = `Vjeli jste do rákosí! Musíte čekat jedno kolo.`
		M.pls[M.playing].skip = 1
		return false
	}
	else if (name.startsWith("wi")) { // wind
		// *fixed*!
		let rot = tiles[x][y][2]
		let res = [parseInt(x),parseInt(y)]
		if (rot == 0) {
			res[1] += 3
		}
		else if (rot == 1) {
			res[0] += 3
		}
		else if (rot == 2) {
			res[1] -= 3
		}
		else if (rot == 3) {
			res[0] -= 3
		}
		let pushed_out = 0
		if (res[0] < 0) {
			pushed_out = Math.abs(res[0])
			res[0] = 0
		} else if (res[1] < 0) {
			pushed_out = Math.abs(res[1])
			res[1] = 0
		} else if (res[0] >= tile_amount) {
			pushed_out = Math.abs(tile_amount - (res[0]+1))
			res[0] = tile_amount-1
		} else if (res[1] >= tile_amount) {
			pushed_out = Math.abs(tile_amount - (res[1]+1))
			res[1] = tile_amount-1
		}
		if (M.ocupied(res[0], res[1]) && res[0] != x && res[1] != y) {
			death()
			return false
		}
		else if (pushed_out > 0) {
			if (pushed_out == 1) {
				M.pls[M.playing].info = `Kartička vítr vás vytlačila 1 kartičku ven z hracího pole! Budete stát 1 kolo.`
			}
			else {
				M.pls[M.playing].info = `Kartička vítr vás vytlačila ${pushed_out} kartičky ven z hracího pole! Budete stát ${pushed_out} kola.`
			}
			M.pls[M.playing].back_from_outside = true
			M.pls[M.playing].skip = pushed_out
			set_up_player(false)
			setTimeout(()=>{
				flip(res[0], res[1], true)
			}, 500)
		}
		else {
			M.pls[M.playing].info = `Kartička vítr vás posunula o tři políčka!`
			setTimeout(()=>{
				flip(res[0], res[1], true)
				if (!standing_what_do()) {
					next_button_visible()
				}
				set_up_player(false)
			}, 500)
			return true
		}
		return false
	}
	else if (name.startsWith("w")) { // great bait / worm
		if (M.pls[M.playing].has_worm) {
			M.pls[M.playing].info = `Našli jste dobrou návnadu, ale už jednu máte u sebe takže jí nemůžete sebrat.`
		}
		else {
			M.pls[M.playing].info = `Našli jste dobrou návnadu.`
			setTimeout(()=>{
				if (fish_revealed(true)) {
					pop_up(
						"Šlápli jste na kartičku dobrá návnada, tato kartička vám dává možnost přesunout se na nejbližší políčko s odkrytou kartičkou ryby! Chcete ji použít teď nebo až požději? (Budete ji moct aktivovat kliknutím na ikonku s žížalou)",
						"Teď",
						"Později",
						() => {
							use_worm()
						},
						() => {
							M.pls[M.playing].has_worm = true
							set_up_player(false)
						}
					)
				}
				else {
					pop_up(
						"Šlápli jste na kartičku dobrá návnada, tato kartička vám dává možnost přesunout se na nejbližší políčko s odkrytou kartičkou ryby! Ale není tu žádná kartička ryby, která není odkrytá nebo obsazená, takže ji budete moct aktivovat kliknutím na ikonku s žížalou.",
						"",
						"Ok",
						null,
						() => {
							M.pls[M.playing].has_worm = true
							set_up_player(false)
						}
					)
				}
			}, 300)
			setTimeout(()=>{set_to_water(x, y)}, 1000)
		}
		return false
	}
	
	else if (name.startsWith("vod")) { // mythological creature called "vodník"
		M.pls[M.playing].info = `Šlápli jste na kartičku vodníka! Můžete se přemístit na jakékoliv políčko.`
		available_locations(false, false, true)
		setTimeout(()=>{set_to_water(x, y)}, 1000)
		return true
	}
	else if (name.startsWith("v")) { // fairy
		if (fish_revealed(false, true)) {
			M.pls[M.playing].info = `Šlápli jste na kartičku vodní víly! Vyberte si kartičku ryb ze které si chcete vzít rybu.`
			available_locations(false, false, false, false, true)
		}
		else {
			setTimeout(()=>{set_to_water(x, y)}, 1000)
			M.pls[M.playing].info = `Šlápli jste na kartičku vodní víly! Můžete přemístit na jakékoliv volné, otočené políčko.`
			available_locations(false, false, false, true)
		}
		return true
	}
	else if (
			name.startsWith("1way") || // direction
			name.startsWith("2way") || 
			name.startsWith("4way") || 
			name.startsWith("8way") || 
			name.startsWith("diag")
			) {
		if (direction_available_locations(name)) {
			directions_in_a_row++
		}
		else {
			directions_in_a_row = 0
		}
		if (directions_in_a_row > 5)
			direction_available_locations("8way")
		M.pls[M.playing].info = "Vyberte si kam chcete jít!"
		return true
	}
	else {
		throw "What? No did this actually happen? You fucked up Simon!" 
	}
}