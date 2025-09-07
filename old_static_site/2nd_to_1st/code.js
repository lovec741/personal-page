let limitace_el = document.getElementById("limitace")
let limitace_button = document.getElementById("limitace_button")

function flip_limitations_visibility() {
	if (limitace_el.style.display == "none") {
		limitace_el.style.display = "block"
		limitace_button.innerHTML = "SkrĂ˝t"
	} else {
		limitace_el.style.display = "none"
		limitace_button.innerHTML = "UkĂˇzat"
	}
}

let log_el = document.getElementById("log")
let log_button = document.getElementById("log_button")

function flip_log_visibility() {
	if (log_el.style.display == "none") {
		log_el.style.display = "block"
		log_button.innerHTML = "SkrĂ˝t"
	} else {
		log_el.style.display = "none"
		log_button.innerHTML = "UkĂˇzat"
	}
}



function send(url, data, callback) {
	const Http = new XMLHttpRequest();
	Http.open("POST", url);
	Http.responseType = 'json';
	
	Http.send(data);

	Http.onreadystatechange = (e) => {
	  callback(Http.response)
	}
}

function serialize(obj) {
	var str = [];
	for(var p in obj)
	   str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	return str.join("&");
}

let input_el = document.getElementById("input")
let mn_el = document.getElementById("mn")
let log_table = document.getElementById("log_table")
let result_el = document.getElementById("result")
document.getElementById("convert_form").addEventListener('submit', submit_data);

function submit_data(e) {
	e.preventDefault()
	let mn = null
	if (mn_el.checked) {
		mn = 1
	} else {
		mn = 0
	}
	data = serialize({'text': input_el.value, 'mn': mn})
	send('http://lovec741.pythonanywhere.com/2ndto1st',data, (res) => {
		if (res != null) {
			result_el.value = res["text"]
			var log_table_text = 
			`<tr>
				<th></th>
				<th>FOUND</th>
				<th>NEW</th>
				<th>FROM</th>
				<th>TO</th>
			</tr>`

			res["log"].forEach(log_row => {
				log_table.innerHTML += "<tr>"
				log_row.forEach(log_element => {
					log_table_text += "<td>"+log_element+"</td>"
				})
				log_table_text += "</tr>"
			});
			log_table.innerHTML = log_table_text
		}
	})
}

let report_verb_el = document.getElementById("report_verb")
let report_verb_incorrect_el = document.getElementById("report_verb_incorrect")
let report_verb_correct_el = document.getElementById("report_verb_correct")
let report_note_el = document.getElementById("report_note")
let report_status_el = document.getElementById("report_status")
document.getElementById("report_form").addEventListener('submit', submit_report);

function submit_report(e) {
	e.preventDefault()
	data = serialize({
		"report_verb": report_verb_el.value, 
		"report_verb_incorrect": report_verb_incorrect_el.value,
		"report_verb_correct": report_verb_correct_el.value,
		"report_note": report_note_el.value
	})
	send('http://lovec741.pythonanywhere.com/2ndto1st_report', data, (res) => {
		if (res != null) {
			report_status_el.innerText = "ĂšspÄ›ĹˇnÄ› nahlĂˇĹˇeno!"
			report_verb_el.value = ""
			report_verb_incorrect_el.value = ""
			report_verb_correct_el.value = ""
			report_note_el.value = ""
			setTimeout(()=>{
				report_status_el.innerText = ""
			}, 5000)
		}
	})
}