class memoryGame {
	constructor(pairs, color) {
		this.pairs = pairs;
		this.color = color;
		this.back = "img/memory/" + this.color + "/back.png";
		this.docElement = document.getElementById("gameField");

		this.defaultCard = document.createElement("div");

		this.defaultCard.setAttribute("class", "memory-card");

		this.createGameField();
	}

	createGameField() {
		this.docElement.innerHTML = ""; //content reset

		let cards = {}

		for (let i = 1; i <= this.pairs; i++) {
			cards[i] = "img/memory/" + this.color + "/" + i + ".png";
			cards[i + this.pairs] = "img/memory/" + this.color + "/" + i + ".png";
		}

		let list = Object.keys(cards);
		let seitenAbstand = document.createElement("div");
		seitenAbstand.setAttribute("class", "spalte-memorySeitenAbstand");

		this.docElement.appendChild(seitenAbstand.cloneNode(true))

		for (let j = 0; j < this.pairs * 2; j++) {
			let k = list[Math.floor(Math.random() * list.length)];
			let card = document.createElement("img");
			setAttributes(card, { "src": this.back, "class": "memory spalte-100", "data-back": this.back, "data-img": cards[k] })

			for (let h = 0; h < list.length; h++) {
				if (list[h] == k) {
					list.splice(h, 1);
					break;
				}
			}

			let memCard = this.defaultCard.cloneNode(true);
			memCard.appendChild(card);

			if (j && j % 8 == 0) {
				this.docElement.appendChild(seitenAbstand.cloneNode(true));
				this.docElement.appendChild(seitenAbstand.cloneNode(true));
			}

			this.docElement.appendChild(memCard);
		}

	}
}

/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/

class gameMechanics {
	constructor() {
		this.gameIsRunning = false;
		this.cards = document.querySelectorAll(".memory-card");
		this.displayTimer = document.getElementById("timer");
		this.displayVersuche = document.getElementById("versuche");
		this.inputs = document.getElementsByTagName("input");

		this.choosenCards = [null, null];
		this.startedTimer = false;
		this.timer = 0;
		this.displayTimer.innerHTML = this.timer;

		this.Versuche = 0;
		this.displayVersuche.innerHTML = this.Versuche;

		this.lockBoard = false;
		this.shownCard = false;

		this.defI1, this.i1, this.defI2, this.i2, this.defI3, this.i3;
		this.reverse1 = false, this.reverse2 = false, this.reverse3 = false;
		this.Intervals = [null, null, null];
		this.availableMatches = this.cards.length / 2;
		this.myTimer = null;

		this.playerTurn = 1;
		this.winner = [];

		let temp = document.getElementsByClassName("memory-card")[0];
		this.gameCardWidth = temp.offsetWidth - 1;
		console.log(temp, this.gameCardWidth)
	}

	showCard() {
		if (!settings.mechanic.gameIsRunning) return;
		if (!settings.mechanic.startedTimer) {
			settings.mechanic.startedTimer = true;
			settings.mechanic.timer = 0;
			settings.mechanic.myTimer = setInterval(function() {
				settings.mechanic.displayTimer.innerHTML = ++settings.mechanic.timer;
			}, 1000)
			settings.mechanic.Versuche = 0;
		}

		if (settings.mechanic.lockBoard) return;

		if (this === settings.mechanic.choosenCards[0]) return;

		if (!settings.mechanic.shownCard) {
			settings.mechanic.defI1 = settings.mechanic.i1 = 10;
			settings.mechanic.reverse1 = false;
			settings.mechanic.shownCard = true;
			settings.mechanic.choosenCards[0] = this;
			settings.mechanic.choosenCards[0].setAttribute("class", "memory-card memory-flip")
			setTimeout(function() {
				settings.mechanic.choosenCards[0].firstChild.setAttribute("src", settings.mechanic.choosenCards[0].firstChild.dataset.img);
				settings.mechanic.choosenCards[0].setAttribute("class", "memory-card memory-unflip");
			}, 400)
			//settings.mechanic.Intervals[0] = setInterval(function() { settings.mechanic.doit1() }, 20);

			return;
		}
		settings.mechanic.defI2 = settings.mechanic.i2 = 10;
		settings.mechanic.reverse2 = false;
		settings.mechanic.lockBoard = true;
		settings.mechanic.choosenCards[1] = this;
		settings.mechanic.choosenCards[1].setAttribute("class", "memory-card memory-flip")
		setTimeout(function() {
			settings.mechanic.choosenCards[1].firstChild.setAttribute("src", settings.mechanic.choosenCards[1].firstChild.dataset.img);
			settings.mechanic.choosenCards[1].setAttribute("class", "memory-card memory-unflip");
		}, 400)
		//settings.mechanic.Intervals[1] = setInterval(function() { settings.mechanic.doit2() }, 20);
		settings.mechanic.displayVersuche.innerHTML = ++settings.mechanic.Versuche;

		if (settings.mechanic.choosenCards[0].firstChild.dataset.img == settings.mechanic.choosenCards[1].firstChild.dataset.img) {
			setTimeout(function() {
				settings.mechanic.disableCards();
				settings.mechanic.samePlayer();
				settings.mechanic.checkEndGame();
			}, 700);

		} else {
			setTimeout(function() {
				settings.mechanic.choosenCards[0].setAttribute("class", "memory-card memory-flip")
				settings.mechanic.choosenCards[1].setAttribute("class", "memory-card memory-flip")
				setTimeout(function() {
					settings.mechanic.choosenCards[0].firstChild.setAttribute("src", settings.mechanic.choosenCards[0].firstChild.dataset.back);
					settings.mechanic.choosenCards[1].firstChild.setAttribute("src", settings.mechanic.choosenCards[1].firstChild.dataset.back);
					settings.mechanic.choosenCards[0].setAttribute("class", "memory-card memory-unflip");
					settings.mechanic.choosenCards[1].setAttribute("class", "memory-card memory-unflip");
					settings.mechanic.nextPlayer();
					settings.mechanic.resetBoard();
					settings.mechanic.checkEndGame();
				}, 400)
			}, 1500);
		}
	}

	disableCards() {
		console.log("match");
		--settings.mechanic.availableMatches;
		settings.mechanic.choosenCards[0].removeEventListener('click', settings.that.showCard);
		settings.mechanic.choosenCards[1].removeEventListener('click', settings.that.showCard);

		settings.mechanic.resetBoard();
	}

	resetBoard() {
		[settings.mechanic.shownCard, settings.mechanic.lockBoard] = [false, false];
		settings.mechanic.choosenCards = [null, null];
	}

	samePlayer() {
		if (!settings.mechanic.gameIsRunning) return;
		settings.mechanic.raiseVersuche();
		settings.mechanic.givePoints();
	}

	nextPlayer() {
		if (!settings.mechanic.gameIsRunning) return;
		settings.mechanic.raiseVersuche();
		settings.mechanic.deHighLightPlayer();

		settings.mechanic.playerTurn = settings.mechanic.playerTurn == settings.players ? 1 : settings.mechanic.playerTurn + 1;

		settings.mechanic.highLightPlayer();
	}

	checkEndGame() {
		if (!settings.mechanic.gameIsRunning) return;
		if (settings.mechanic.availableMatches) return;

		settings.mechanic.deHighLightPlayer();
		settings.mechanic.startedTimer = false;
		settings.resetGame();
		clearInterval(settings.mechanic.myTimer);

		settings.mechanic.getBestPlayer();
	}

	getBestPlayer() {
		let temp = document.getElementById("player" + 1 + "punkte")
		settings.mechanic.winner.push(document.getElementById("player" + 1 + "name"))

		for (let i = 2; i <= settings.players; i++) {
			let playerB = document.getElementById("player" + i + "punkte")

			if (parseInt(temp.innerHTML, 10) < parseInt(playerB.innerHTML, 10)) {
				settings.mechanic.winner = [document.getElementById("player" + i + "name")]
			} else if (parseInt(temp.innerHTML, 10) == parseInt(playerB.innerHTML, 10)) {
				settings.mechanic.winner.push(document.getElementById("player" + i + "name"))
			}
		}

		let result = document.getElementById("result");

		if (settings.mechanic.winner.length > 1) {
			let str = settings.mechanic.winner[0].innerHTML

			for (let i = 1; i < settings.mechanic.winner.length; i++) {
				if (i + 1 == settings.mechanic.winner.length) {
					str += " und "
				} else {
					str += ", "
				}

				str += settings.mechanic.winner[i].innerHTML
			}
			result.innerHTML = str + " haben gewonnen!"
		} else {
			result.innerHTML = settings.mechanic.winner[0].innerHTML + " hat gewonnen!";
		}
	}

	deHighLightPlayer() {
		let playerDiv = document.getElementById("player" + settings.mechanic.playerTurn);
		playerDiv.setAttribute("class", "spalte-spielerSize");
	}

	highLightPlayer() {
		let playerDiv = document.getElementById("player" + settings.mechanic.playerTurn);
		playerDiv.setAttribute("class", "spalte-spielerSize highlight");
	}

	givePoints() {
		let punkteDiv = document.getElementById("player" + settings.mechanic.playerTurn + "punkte");
		punkteDiv.innerHTML = parseInt(punkteDiv.innerHTML, 10) + 1;
	}

	raiseVersuche() {
		let versucheDiv = document.getElementById("player" + settings.mechanic.playerTurn + "versuche");
		versucheDiv.innerHTML = parseInt(versucheDiv.innerHTML, 10) + 1;
	}
}

/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/

class gameSettings {
	constructor() {
		this.players = 4;
		this.pairs = 8;
		this.color = "red";
		this.lock = false;
		this.mechanic = null;

		this.generatePlayerLayout();
		this.createField();
	}

	changePlayers(new_div) {
		if (this.lock) return;
		let old_div = document.getElementsByClassName("spalte-buttonSizeSpieler fontSize button player active")[0]
		old_div.setAttribute("class", "spalte-buttonSizeSpieler fontSize button player");

		new_div.setAttribute("class", "spalte-buttonSizeSpieler fontSize button player active")
		this.players = new_div.innerHTML;

		this.generatePlayerLayout();
		this.createField();
	}

	changeSet(new_div, new_color) {
		if (this.lock) return;
		let old_div = document.getElementsByClassName("spalte-buttonSize fontSize button set active")[0]
		old_div.setAttribute("class", "spalte-buttonSize fontSize button set");

		new_div.setAttribute("class", "spalte-buttonSize fontSize button set active")
		this.color = new_color;
		this.createField();
	}

	changeSize(new_div, new_pairs) {
		if (this.lock) return;
		let old_div = document.getElementsByClassName("spalte-buttonSizePair fontSize button size active")[0];
		old_div.setAttribute("class", "spalte-buttonSizePair fontSize button size");

		new_div.setAttribute("class", "spalte-buttonSizePair fontSize button size active")
		this.pairs = new_pairs;
		this.createField();
	}

	generatePlayerLayout() {
		let playerDiv = document.getElementById("playerList");
		playerDiv.innerHTML = "";

		let outerSpace = document.createElement("div");
		outerSpace.setAttribute("class", "spalte-spielerAnzahl" + this.players);

		let playerSpace = document.createElement("div");
		playerSpace.setAttribute("class", "spalte-spielerAbstand");

		playerDiv.appendChild(outerSpace)

		let playerX = document.createElement("div");
		playerX.setAttribute("class", "spalte-spielerSize");

		for (let i = 1; i <= this.players; i++) {
			playerX.setAttribute("id", "player" + i);
			playerX.innerHTML = "";

			let playerName = document.createElement("div");
			setAttributes(playerName, { "id": "player" + i + "name", "class": "spalte-100 playerTag underline", "contenteditable": "true" })
			playerName.innerHTML = "Player " + i;

			let playerStats = document.createElement("div");
			playerStats.setAttribute("class", "spalte-100");

			let playerVersuche = document.createElement("div");
			playerVersuche.setAttribute("class", "spalte-spielerVersuche playerStats");

			let titelVersuche = document.createElement("div");
			titelVersuche.setAttribute("class", "spalte-spielerVersucheTitle playerStats alignRight");
			titelVersuche.innerHTML = "&nbsp;Versuche:&nbsp;";

			let counterVersuche = document.createElement("div");
			setAttributes(counterVersuche, { "class": "spalte-spielerVersucheValue playerStats", "id": "player" + i + "versuche" })
			counterVersuche.innerHTML = "0";

			playerVersuche.appendChild(titelVersuche)
			playerVersuche.appendChild(counterVersuche)

			let playerPunkte = document.createElement("div");
			playerPunkte.setAttribute("class", "spalte-spielerPunkte playerStats");

			let titelPunkte = document.createElement("div");
			titelPunkte.setAttribute("class", "spalte-spielerPunkteTitle playerStats alignRight");
			titelPunkte.innerHTML = "Punkte:&nbsp;";

			let counterPunkte = document.createElement("div");
			setAttributes(counterPunkte, { "class": "spalte-spielerPunkteValue playerStats", "id": "player" + i + "punkte" })
			counterPunkte.innerHTML = "0";

			playerPunkte.appendChild(titelPunkte)
			playerPunkte.appendChild(counterPunkte)

			playerStats.appendChild(playerVersuche);
			playerStats.appendChild(playerPunkte);

			playerX.appendChild(playerName);
			playerX.appendChild(playerStats);
			playerDiv.appendChild(playerX.cloneNode(true));

			if (i != this.players) {
				playerDiv.appendChild(playerSpace.cloneNode(true));
			}
		}

		playerDiv.appendChild(outerSpace.cloneNode(true))
	}

	createField() {
		this.gameField = new memoryGame(this.pairs, this.color);
	}

	startGame(div) {
		this.createField();
		this.lock = true;

		let Button = document.getElementById("startButton")
		Button.setAttribute("class", "spalte-buttonStart button startBG")
		Button.innerHTML = "Spiel läuft!"

		for (let i = 1; i <= this.players; i++) {
			let playerDiv = document.getElementById("player" + i + "name");
			setAttributes(playerDiv, { "contenteditable": "false", "class": "spalte-100 playerTag" })
		}

		let allPlayerVersucheValues = document.getElementsByClassName("spalte-spielerVersucheValue")

		for (let i of allPlayerVersucheValues) {
			i.innerHTML = "0";
		}

		let allPlayerPunkteValues = document.getElementsByClassName("spalte-spielerPunkteValue")

		for (let i of allPlayerPunkteValues) {
			i.innerHTML = "0";
		}

		this.mechanic = new gameMechanics();
		this.mechanic.highLightPlayer();
		this.mechanic.gameIsRunning = true;
		this.that = this.mechanic;
		this.mechanic.cards.forEach(card => card.addEventListener("click", this.that.showCard));
	}

	resetGame() {
		if (!this.mechanic || !this.mechanic.gameIsRunning) return;
		this.mechanic.gameIsRunning = false;

		for (let i = 1; i <= this.players; i++) {
			let playerDiv = document.getElementById("player" + i + "name");
			setAttributes(playerDiv, { "contenteditable": "true", "class": "spalte-100 playerTag underline" })
		}

		for (let i in this.mechanic.Intervals) {
			clearInterval(i);
		}
		clearInterval(this.mechanic.myTimer);

		this.mechanic.deHighLightPlayer();

		let Button = document.getElementById("startButton")
		Button.setAttribute("class", "spalte-buttonStart button")
		Button.innerHTML = "Start"

		this.lock = false;
	}
}

/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
function setAttributes(el, attrs) {
	for (let key in attrs) {
		el.setAttribute(key, attrs[key]);
	}
}

function windowResized() {
	let body = document.getElementById("gameField")
	let spaceRim = document.querySelectorAll(".spalte-x")

	let width = (body.offsetWidth - settings.gameField.col * 80) / 2 - 1 + "px"
	console.log("window resize " + spaceRim)

	for (let i = 0; i < spaceRim.length; i++) {
		spaceRim[i].style.width = width
	}
}

let settings = new gameSettings();