const canvas = document.createElement("canvas")
const c = canvas.getContext("2d")

const groupname = document.getElementById("groupname")
var outimg = document.createElement("img")
const opengroupmenu = document.getElementById("groupbutton")
const textcont = document.getElementById("text")
const send = document.getElementById("send")
const text = document.getElementById("input")
const input = document.getElementById("file")
const groupmenu = document.getElementById("groups")
const grocont = document.getElementById("grouplinks")
const openmembersmenu = document.getElementById("membersbutton")
const membersmenu = document.getElementById("members")
const memcont = document.getElementById("memberlinks")
const chat_text = document.getElementById("text")
const problem = document.getElementById("problem")
const problemtext = document.getElementById("problemtext")
chat_text.scrollTop = chat_text.scrollHeight;
//console.log(document.cookie.split(";")[0].slice(5))

var name = ""
var hash = ""
var group = ""
for (var i = 0; i < document.cookie.split("; ").length; i++) {
	if (document.cookie.split("; ")[i].split("=")[0].includes("name")) {
		name = document.cookie.split("; ")[i].split("=")[1]
	}
	else if (document.cookie.split("; ")[i].split("=")[0].includes("access-key")) {
		hash = document.cookie.split("; ")[i].split("=")[1]
	}
	else if (document.cookie.split("; ")[i].split("=")[0].includes("group")) {
		group = document.cookie.split("; ")[i].split("=")[1]
	}
}

const sendHttpRequest = (method, url, data) => {
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.responseType = 'json';
	
    if (data) {
		xhr.setRequestHeader('Content-Type', 'application/json');
    }

    xhr.onload = () => {
		if (xhr.status >= 400) {
			reject(xhr.response);
		} else {
			resolve(xhr.response);
		}
    };

    xhr.onerror = () => {
		reject('Something went wrong!');
    };

    xhr.send(JSON.stringify(data));
  });
  return promise;
};

const week_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
process_time = (time) => {
	d_time = new Date(time)
	if (new Date().toLocaleDateString() == d_time.toLocaleDateString()){
		return d_time.getHours()+":"+d_time.getMinutes()
	}
	else if (new Date().getFullYear() == d_time.getFullYear() && new Date().getMonth() == d_time.getMonth() && new Date().getDate()-d_time.getDate() < 7){
		if (d_time.getDay() == 0) {
			return week_days[6]+" "+d_time.getHours()+":"+d_time.getMinutes()
		}
		return week_days[d_time.getDay()-1]+" "+d_time.getHours()+":"+d_time.getMinutes()
	}
	else if (new Date().getFullYear() == d_time.getFullYear()) {
		return d_time.getDate()+"."+(d_time.getMonth()+1)+". "+d_time.getHours()+":"+d_time.getMinutes()
	}
	else {
		return d_time.getDate()+"."+(d_time.getMonth()+1)+"."+d_time.getFullYear()+" "+d_time.getHours()+":"+d_time.getMinutes()
	}
}
process_messages = (messages) => {
	var mess = messages.split("\n")
	var ret_text = ""
	var last_n = ""
	var last_t = ""
	for (var i = 0; i < mess.length; i++) {
		var splt = mess[i].split(" ")
		var tm = process_time(splt[0])
		if (last_n != splt[1]) {
			last_n = splt[1]
			if (last_t != tm) {
				last_t = tm
				ret_text += '<p class="name">' + last_n.split("_").join(" ") + " " + tm + "</p>"
			}
			else {
				ret_text += '<p class="name">' + last_n.split("_").join(" ") + "</p>"
			}
		}
		
		if (splt[1] == name) {
			ret_text += '<div class="right"><p class="message2">'+splt[2].split("Ë‡Ë‡").join("<br>")+"</p></div>"
		}
		else {
			ret_text += '<p class="message1">'+splt[2].split("Ë‡Ë‡").join("<br>")+"</p>"
		}
	}
	console.log(ret_text)
	return ret_text
}
process_members = (members_info) => {
	var mems = members_info.split("\n")
	var ret_text = ""
	members_list = []
	document.getElementById("mem1").style.diplay = "block"
	document.getElementById("mem2").style.diplay = "none"
	var is_admin = false 
	for (var i = 0; i < mems.length; i++) {
		if (splt[3] == "A" && splt[0] == name) {
			document.getElementById("mem1").style.diplay = "none"
			document.getElementById("mem2").style.diplay = "block"
			is_admin = true
			break
		}
	}
	var add = ""
	if (is_admin) {
		add = 'style="visibility:hidden"'
	}
	for (var i = 0; i < mems.length; i++) {
		var splt = mems.split(" ")
		if (splt[3] == "A" && splt[0] == name) {
			ret_text += '<p class="member">'+name+'(YOU)</p><p class="admin">Admin</p><input class="kick" id="'+i+'" type="submit" value="Leave"  style="visibility:hidden"><br>'
		}
		else if (splt[0] == name) {
			ret_text += '<p class="member">'+name+'(YOU)</p><p class="admin"></p><input class="kick" id="'+i+'" type="submit" value="Leave" style="visibility:hidden"><br>'
		}
		else if (splt[3] == "A") {
			ret_text += '<p class="member">'+splt[0]+'</p><p class="admin">Admin</p><input class="kick" id="'+i+'" type="submit" value="Kick" '+add+'><br>'
		}
		else {
			ret_text += '<p class="member">'+splt[0]+'</p><p class="admin"></p><input class="kick" id="'+i+'" type="submit" value="Kick" '+add+'><br>'
		}
		members_list.push(splt[0])
		
	}
}
// request current data of group
var members_list = []

function get_all_group_data() {
	var failed = 0
	const send_r = () => {
		sendHttpRequest('POST', 'http://lovec741.pythonanywhere.com/entire', {
			"name": name,
			"hash": hash,
			"group": group
		})
		.then(responseData => {
			console.log(responseData)
			if (responseData["done"] != false) {
				//window.location = "/chat1";
				//document.cookie = "group=" + group + ";path=/";
				textcont.innerHTML = process_messages(responseData["mess"])
				
			}
			else {
				problem.style.visibility = "visible"
				problemtext.innerHTML = "Incorrect name or password."
			}
		})
		.catch(err => {
			failed += 1
			if (failed != 10) {
				send_r()
			}
			else {
				problem.style.visibility = "visible"
				problemtext.innerHTML = "Unable to connect to server!"
			}
			console.log(err);
		});
	}
	send_r()
}

if (document.cookie == "") {
	window.location = "/chat1/loginregister.html"
}
else if (group == "") {
	//get_user_group_data()
	document.getElementById("black").style.visibility = "visible"
	groupmenu.style.visibility = "visible"
	//window.location = "/chat1/welcome.html"
}
else {
	groupname.innerHTML = group 
	get_all_group_data()
}



opengroupmenu.onclick = () => {
	if (groupmenu.style.visibility != "visible") {
		if (membersmenu.style.visibility == "visible") {
			membersmenu.style.visibility = "hidden"
			openmembersmenu.setAttribute("value", "Members")
		}
		groupmenu.style.visibility = "visible"
		opengroupmenu.setAttribute("value", "Close")
	}
	else {
		groupmenu.style.visibility = "hidden"
		opengroupmenu.setAttribute("value", "Groups")
	}
}
openmembersmenu.onclick = () => {
	if (membersmenu.style.visibility != "visible") {
		if (groupmenu.style.visibility == "visible") {
			groupmenu.style.visibility = "hidden"
			opengroupmenu.setAttribute("value", "Groups")
		}
		membersmenu.style.visibility = "visible"
		openmembersmenu.setAttribute("value", "Close")
	}
	else {
		membersmenu.style.visibility = "hidden"
		openmembersmenu.setAttribute("value", "Members")
	}
}

input.addEventListener("change", function (e) {
	console.log(input.files)
	const reader = new FileReader()
	reader.onload = function () {
		const img = new Image()
		img.src = reader.result
		img.onload = function () {
			limit_w = 1000
			limit_h = 1000
			wid = img2.width
			hei = img2.height
			if (limit_w < img2.width || limit_h < img2.height) {
				if (wid > hei) {
					shrink = wid / (limit_w)
					hei = hei / (wid / limit_w)
					wid = limit_w
					
				}
				else{
					shrink = hei / (limit_h)
					wid = wid / (hei / limit_h)
					hei = limit_h
				}
			}
			else if (limit_w > img2.width || limit_h > img2.height) {
				if (wid > hei) {
					shrink = wid / limit_w
					hei = hei / (wid / limit_w)
					wid = limit_w
					
				}
				else{
					shrink = hei / limit_h
					wid = wid / (hei / limit_h)
					hei = limit_h
				}
			}
			canvas.width = wid
			canvas.height = hei
			c.drawImage(img2, 0, 0, wid, hei)
			dataurl = canvas.toDataURL()
			outimg.src = dataurl
		}
		
	}
	reader.readAsDataURL(input.files[0])
}, false)