const Http = new XMLHttpRequest();


function send(data, callback) {
	const url='http://lovec741.pythonanywhere.com/chemie_elektronova_konfigurace';
	Http.open("POST", url);
	Http.send(data);

	Http.onreadystatechange = (e) => {
	  callback(Http.responseText)
	}
}

let prvek_el = document.getElementById("prvek")
let vz_el = document.getElementById("vz")
let boxes_el = document.getElementById("boxes")
let sort_el = document.getElementById("sort")
let res_el = document.getElementById("res")
document.querySelector("form").addEventListener('submit', submit_data);
function bool(b) {
	if (b) {return "1"}
	else {return ""}
}
function submit_data(e) {
	e.preventDefault()
	send(`prvek=${prvek_el.value}&vz=${bool(vz_el.checked)}&boxes=${bool(boxes_el.checked)}&sort=${bool(sort_el.checked)}`, (res) => {res_el.innerHTML = res})
}