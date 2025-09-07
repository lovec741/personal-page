let start_button = document.getElementById("start")

function player_name_onchange() {
	lst = document.getElementsByClassName("player_name_input")
	lst_names = []
	all_names = true
	all_unique = true
	for (let i = 0; i < lst.length; i++) {
		if (lst[i].value == "") 
			all_names = false
		else if (lst_names.indexOf(lst[i].value) != -1) {
			all_unique = false
		}
		else {
			lst_names.push(lst[i].value)
		}
		
	}
	if (!all_names || !all_unique) {
		start_button.style.visibility = "hidden"
	}
	else {
		start_button.style.visibility = "visible"
	}
}

function get_player_names_from_inputs() {
	lst = document.getElementsByClassName("player_name_input")
	lst_names = []
	for (let i = 0; i < lst.length; i++) {
		lst_names.push(lst[i].value)
	}
	return lst_names
}
let add_player_name_button = document.getElementById("add_player_name")
let remove_player_name_button = document.getElementById("remove_player_name")
let player_name_input_container = document.getElementById("player_name_input_container")
function add_player_name() {
	if (p_amount == 4) {
		remove_player_name_button.style.visibility = "visible"
	}
	let inp = document.createElement("input");
	inp.classList.add("player_name_input")
	inp.type = "text"
	inp.maxlength = 10
	inp.oninput = "player_name_onchange()"
	player_name_input_container.appendChild(inp)
	p_amount++
	if (p_amount == 6) {
		add_player_name_button.style.visibility = "hidden"
	}
	
}
function remove_player_name() {
	if (p_amount == 6) {
		add_player_name_button.style.visibility = "visible"
	}
	player_name_input_container.lastChild.remove()
	p_amount--
	if (p_amount == 4) {
		remove_player_name_button.style.visibility = "hidden"
	}
}