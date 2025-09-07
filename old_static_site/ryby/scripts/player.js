class Player {
	constructor(name, color, filter) {
		this.color = color
		this.filter = filter
		this.name = name
		this.info = "Vyberte si začáteční políčko!"
		this.x = -1 // location x
		this.y = -1 // location y
		this.has_worm = false
		this.balance = []
		this.player_debt = [] // players you owe fish coins to (caused by rybář usnul tile)
		this.fish_debt = 0 // amount of fish you have to return to Ryby tiles (caused by čáp tile) 
		this.skip = 0
		this.back_from_outside = false
	}
	do_skip() {
		if (this.skip > 0) {
			this.skip--
			this.info = `Musíte počkat ještě ${this.skip} kol.`
			if (this.skip == 0) {
				this.info = "Další kolo budete moct hrát!"
			}
			else if (this.skip == 1) {
				this.info = `Musíte počkat ještě ${this.skip} kolo.`
			}
			else if (this.skip < 5) {
				this.info = `Musíte počkat ještě ${this.skip} kola.`
			}
			return true
		}
		return false
	}
}
let colors = ["red", "green", "yellow", "blue", "#ff8d00", "#e003d9"]
let filters = [
	"filter: invert(17%) sepia(83%) saturate(7473%) hue-rotate(360deg) brightness(110%) contrast(119%)",
	"filter: invert(22%) sepia(88%) saturate(3621%) hue-rotate(100deg) brightness(94%) contrast(101%)",
	"filter: invert(86%) sepia(81%) saturate(1101%) hue-rotate(357deg) brightness(107%) contrast(105%)",
	"filter: invert(7%) sepia(100%) saturate(7436%) hue-rotate(247deg) brightness(103%) contrast(143%)",
	"filter: invert(47%) sepia(99%) saturate(691%) hue-rotate(359deg) brightness(103%) contrast(107%)",
	"filter: invert(15%) sepia(92%) saturate(3665%) hue-rotate(292deg) brightness(114%) contrast(119%)"
]
class PlayerManager {
	constructor(name_lst) {
		this.pls = []
		for (let i = 0; i < name_lst.length; i++) {
			let ch = Math.floor(Math.random() * colors.length)
			this.pls.push(new Player(name_lst[i], colors[ch], filters[ch]))
			colors.splice(ch, 1)
			filters.splice(ch, 1)
		}
		this.playing = 0
		this.round = 1
	}
	died(pl_ind) {
		console.log("DIED")
		this.pls.splice(pl_ind, 1)
		if (this.playing == this.pls.length) {
			this.round++
			this.playing = 0
		}
	}
	next() {
		this.playing++
		if (this.playing == this.pls.length) {
			this.round++
			this.playing = 0
			for (let i = 0; i < this.pls.length; i++)
				M.pls[i].info = "Vyberte si kam chcete jít!"
		}
			
		return this.playing
	}
	set_balance_by_rybar_usnul(set_balance) {
		console.log(set_balance)
		this.pls[this.playing].balance = set_balance[0]
		for (let i = 1; i < set_balance.length; i++) {
			let t = i-1 // not working
			if (M.playing <= i)
				t++
			if (set_balance[i].length == 0)
				this.pls[this.playing].player_debt.push(t)
			for (let j = 0; j < set_balance[i].length; j++) {
				this.pls[t].balance.push(set_balance[i][j])
			}
		}
	}
	set_balance_by_debt(set_balance) {
		console.log(set_balance)
		this.pls[this.playing].balance = set_balance[0]
		let end_debt = []
		for (let i = 0; i < this.pls[this.playing].player_debt.length; i++) {
			let ind = this.pls[this.playing].player_debt[i]
			if (set_balance[i+1].length == 0)
				end_debt.push(ind)
			for (let j = 0; j < set_balance[i+1].length; j++) {
				this.pls[ind].balance.push(set_balance[i+1][j])
			}
		}
		this.pls[this.playing].player_debt = end_debt
	}
	ocupied(x, y) {
		for (let i = 0; i < this.pls.length; i++) {
			if (i != this.playing && this.pls[i].x == x && this.pls[i].y == y) {
				return true
			}
		}
		return false
	}
	remove_smallest_fishcoin() {
		let bal = this.pls[this.playing].balance
		let val = bal[bal.length-1]
		this.pls[this.playing].balance.splice(bal.length-1, 1)
		return val
	}
}