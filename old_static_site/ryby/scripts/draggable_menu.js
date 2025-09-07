// code from HERE: https://github.com/WebDevSimplified/Drag-And-Drop/blob/master/script.js
// slightly edited
let draggables = document.querySelectorAll('.draggable')
let containers = document.querySelectorAll('.container')
function set_draggables() {
	let button = document.querySelector("#continue")
	draggables = document.querySelectorAll('.draggable')
	containers = document.querySelectorAll('.container')
	if (is_finished()) {
		button.style.visibility = "visible"
	}
	else {
		button.style.visibility = "hidden"
	}
	draggables.forEach(draggable => {
	  draggable.addEventListener('dragstart', () => {
		draggable.classList.add('dragging')
	  })

	  draggable.addEventListener('dragend', () => {
		draggable.classList.remove('dragging')
	  })
	})

	containers.forEach(container => {
	  container.addEventListener('dragover', e => {
		e.preventDefault()
		if (is_finished()) {
			button.style.visibility = "visible"
		}
		else {
			button.style.visibility = "hidden"
		}
		const afterElement = getDragAfterElement(container, e.clientX)
		const draggable = document.querySelector('.dragging')
		if (afterElement == null) {
		  container.appendChild(draggable)
		} else {
		  container.insertBefore(draggable, afterElement)
		}
	  })
	})
}
function is_finished() {
	let all_2 = true
	let all_2_or_less = true
	for (let i = 1; i < containers.length; i++) {
		if (containers[i].childNodes.length != 2) 
			all_2 = false
		if (containers[i].childNodes.length > 2) 
			all_2_or_less = false
	}
	if (all_2 || all_2_or_less && containers[0].childNodes.length == 1) {
		return true
	}
	else {
		return false
	}
}
function get_results() {
	let lsts = []
	for (let i = 0; i < containers.length; i++) {
		lsts.push([])
		for (let j = 1; j < containers[i].childNodes.length; j++) {
			lsts[i].push(containers[i].childNodes[j].textContent)
		}
	}
	return lsts
}
function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = x - box.left - box.width / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}