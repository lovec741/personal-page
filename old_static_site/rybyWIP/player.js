class Player {
	constructor(name, color) {
		this.color = color
		this.name = name
		this.x = 0 // location x
		this.y = 0 // location y
		this.has_navnada = false
		this.balance = []
		this.player_debt = [] // players you owe fish coins to (caused by Řybář usnul tile)
		this.fish_debt = 0 // amount of fish you have to return to Ryby tiles (caused by Čáp tile) 
		this.skip = 0
		
	}
}
let colors = ["red", "green", "yellow", "blue", "orange", "purple"]
class PlayerManager {
	constructor(name_lst) {
		this.pls = []
		for (let i = 0; i < name_lst.length; i++) {
			let ch = Math.floor(Math.random() * colors.length)
			this.pls.push(new Player(name_lst[i], colors[ch]))
			colors.splice(ch, 1)
		}
		console.log(this.pls)
		this.playing = 0
		this.turn = 0
	}
	died(pl_ind) {
		this.players.splice(pl_ind, 1)
		if (this.playing == this.pls.length) {
			this.turn++
			this.playing = 0
		}
	}
	next() {
		this.playing++
		if (this.playing >= this.pls.length-1) {
			this.turn++
			this.playing = 0
		}
			
		return this.playing
	}
	set_balance_by_rybar_usnul(set_balance) {
		console.log(set_balance)
		this.pls[this.playing].balance = set_balance[0]
		for (let i = 1; i < set_balance.length; i++) {
			for (let j = 0; j < set_balance[i].length; j++) {
				let t = i-1
				if (M.playing >= i)
					t++
				console.log(t)
				this.pls[t].balance.push(set_balance[i][j])
			}
		}
	}
	
}