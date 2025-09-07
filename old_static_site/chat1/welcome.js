const welcome = document.getElementById("welcome")
const welcome_text = document.getElementById("welcome_text")
const create_group_button = document.getElementById("create_group_button")
const join_group_button = document.getElementById("join_group_button")
const create_group = document.getElementById("create_group")
const createtext = document.getElementById("createtext")
const createproblem = document.getElementById("createproblem")
const createbutton = document.getElementById("createbutton")
const join_group = document.getElementById("join_group")
const jointext = document.getElementById("jointext")
const joinproblem = document.getElementById("joinproblem")
const joinbutton = document.getElementById("joinbutton")
const back1 = document.getElementById("back1")
const back2 = document.getElementById("back2")

const allowed_user = "abcdefghijklmnopqrstuvwxyzěščřžýáíéóůúťďň-_/*-+0123456789.,!? "

function valid_name(name) {
	for (var i = 0; i < name.length; i++) {
		if (allowed_user.indexOf(name[i].toLowerCase()) == -1) {
			return false
		}
	}
	return true
}
var name = ""
var hash = ""
//var group = ""
for (var i = 0; i < document.cookie.split("; ").length; i++) {
	if (document.cookie.split("; ")[i].split("=")[0].includes("name")) {
		name = document.cookie.split("; ")[i].split("=")[1]
	}
	else if (document.cookie.split("; ")[i].split("=")[0].includes("access-key")) {
		hash = document.cookie.split("; ")[i].split("=")[1]
	}
	/*else if (document.cookie.split("; ")[i].split("=")[0].includes("group")) {
		group = document.cookie.split("; ")[i].split("=")[1]
	}*/
}
welcome_text.innerHTML = "Welcome " + name + "!"

create_group_button.onclick = () => {
	create_group.style.visibility = "visible"
	welcome.style.visibility = "hidden"
}
join_group_button.onclick = () => {
	join_group.style.visibility = "visible"
	welcome.style.visibility = "hidden"
}
back1.onclick = () => {
	create_group.style.visibility = "hidden"
	join_group.style.visibility = "hidden"
	welcome.style.visibility = "visible"
}
back2.onclick = () => {
	create_group.style.visibility = "hidden"
	join_group.style.visibility = "hidden"
	welcome.style.visibility = "visible"
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

createbutton.onclick = () => {
	createproblem.style.width = "50%"
	createproblem.innerHTML = ""
	if (createtext.value.length < 3) {
		createproblem.innerHTML = "Invalid group name, too short, min. 3 characters."
		createproblem.style.width = "50.1%"
	}
	else if (createtext.value.length >= 15) {
		createproblem.innerHTML = "Invalid group name, too long, max. 15 characters."
		createproblem.style.width = "50.1%"
	}
	else if (!valid_name(createtext.value)) {
		createproblem.innerHTML = "Invalid group name, use of forbidden characters."
		createproblem.style.width = "50.1%"
	}
	else {
		var group = createtext.value
		var done = false
		var failed = 0;
		console.log(name, hash)
		const send = () => {
			console.log()
			sendHttpRequest('POST', 'http://lovec741.pythonanywhere.com/cgroup', {
				"name": name,
				"hash": hash,
				"gname": group
			})
				.then(responseData => {
					console.log(responseData)
					if (responseData["done"] != false) {
						window.location = "/chat1";
						document.cookie = "group=" + group + ";path=/";
					}
					else {
						createproblem.innerHTML = "Group name already in use."
						createproblem.style.width = "50.1%"
					}
				})
				.catch(err => {
					failed += 1
					if (failed != 10) {
						send()
					}
					else {
						createproblem.innerHTML = "Unable to reach server."
						createproblem.style.width = "50.1%"
					}
					console.log(err);
				});
		}
		send()
	}
};

joinbutton.onclick = () => {
	joinproblem.innerHTML = ""
	var group_code = jointext.value
	var done = false
	var failed = 0;
	const send = () => {
		joinproblem.style.width = "50%"
		sendHttpRequest('POST', 'http://lovec741.pythonanywhere.com/jgroup', {
			name: name,
			hash: hash,
			gcode: group_code
		})
			.then(responseData => {
				console.log(responseData)
				if (responseData["done"] != false) {
					window.location = "/chat1";
					document.cookie = "group=" + responseData["done"] + ";path=/";
				}
				else {
					joinproblem.innerHTML = "Invalid group code."
					joinproblem.style.width = "50.1%"
				}
			})
			.catch(err => {
				failed += 1
				if (failed != 10) {
					send()
				}
				else {
					joinproblem.innerHTML = "Unable to reach server."
					joinproblem.style.width = "50.1%"
				}
				console.log(err);
			});
	}
	send()
};