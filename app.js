"use strict";

window.onload = main;
var divPlayerMoves = document.getElementById("playerMoves");
var divAiMoves = document.getElementById("aiMoves");
var divPlayerMoves2 = document.getElementById("playerMoves2");
var divAiMoves2 = document.getElementById("aiMoves2");
var divNbMovesPlayer = document.getElementById("nbMovesPlayer");
var divNbMovesAI = document.getElementById("nbMovesAI");
var divScorePlayer = document.getElementById("scorePlayer");
var divScoreAI = document.getElementById("scoreAI");

var canvasGridPlayer = document.getElementById("gridPlayer")
var canvasGridAI = document.getElementById("gridAI")
var canvasGridGame = document.getElementById("gridGame")

const labels = ['A','B','C','D','E','F','G','H','I','J'];

var listeHitAI = new Array()
var listeHitPlayer = new Array()

var scorePlayer = 0;
var scoreAI = 0;

var gridPlayer;
var gridAI;

var nbMovesPlayer = 0;
var nbMovesAI = 0;

var isPlayerGrid = true;

var context2DP;
var context2DAI;
var context2DG;

var demoMode = true;

var AItype;

var randomGridID = Math.floor(Math.random() * grids.length);
console.log(randomGridID);
var ships = grids[randomGridID];


function setAI(type) {
	AItype = type;
	document.getElementById("containerChoseAI").style.display = "none"	
	document.getElementById("container2").style.display = "flex"
}

function getNameOfTile(id) {
	let j = id%10
	let i = Math.floor(id/10);
	let letter = labels[j]
	let number = i+1
	return letter+number
}

function getNameBoat(id) {
	for(const [boatID,indices] of Object.entries(ships)) {
    	let isInBoat = indices.includes(id)
    	if(isInBoat) {
    		return boatID
    	}
	} return null
}

function isSunk(id, list) {
	for(const [boatID,indices] of Object.entries(ships)) {
    	let isInBoat = indices.includes(id)
    	if(isInBoat) {
    		if(indices.every(index => list.includes(index))) 
    			return true
    	}
	} return false
}

function getBoatIndices(id) {

	for(const [boatID,indices] of Object.entries(ships)) {
    	let isInBoat = indices.includes(id)
    	if(isInBoat) return indices
	} 

	return null
}

function changeGrid() {
	isPlayerGrid = !isPlayerGrid
	isPlayerGrid ? gridPlayer.draw(context2DG) : gridAI.draw(context2DG)
}

function changeMode() {
	demoMode = !demoMode
	if(demoMode) {
		document.getElementById("container").style.display = "none"
		document.getElementById("container2").style.display = "flex"
		gridPlayer.draw(context2DP);
		gridAI.draw(context2DAI);
	} else {
		document.getElementById("container2").style.display = "none"
		document.getElementById("container").style.display = "flex"
		gridPlayer.draw(context2DG)
	}
}

function hillClimbing(lastChoice,grid) {

	let choice;
	let bestTiles;

	switch(AItype) {

		case "random" :

			choice = Math.floor(Math.random() * 100);

			break;

		case "naive" :

			bestTiles = grid.getBestTiles();

			choice = bestTiles[Math.floor(Math.random() * bestTiles.length)];

			break;

		case "smart" :

			if(grid.tiles[lastChoice].isOccupied && grid.tiles[lastChoice].isPlayed && !grid.tiles[lastChoice].isSunk) {
				
				if(lastChoice-10 >= 0) {
				
					if(grid.tiles[lastChoice-10].isOccupied && grid.tiles[lastChoice-10].isPlayed) {

						if(lastChoice+10 < 100 && !grid.tiles[lastChoice+10].isPlayed) grid.tiles[lastChoice+10].utility += 1;
					}
				}
				
				if(lastChoice+10 < 100) {
					
					if(grid.tiles[lastChoice+10].isOccupied && grid.tiles[lastChoice+10].isPlayed) {

						if(lastChoice-10 >= 0 && !grid.tiles[lastChoice-10].isPlayed) grid.tiles[lastChoice-10].utility += 1;
					}
				}
				
				if(lastChoice%10 != 0) {
					
					if(grid.tiles[lastChoice-1].isOccupied && grid.tiles[lastChoice-1].isPlayed) {

						if((lastChoice+1)%10 != 0 && !grid.tiles[lastChoice+1].isPlayed) grid.tiles[lastChoice+1].utility += 1;
					}
				}
				
				if(lastChoice%10 != 9) {
				
					if(grid.tiles[lastChoice+1].isOccupied && grid.tiles[lastChoice+1].isPlayed)  {

						if(lastChoice-1 < 100 && !grid.tiles[lastChoice-1].isPlayed) grid.tiles[lastChoice-1].utility += 1;
					}
				}
			}

			bestTiles = grid.getBestTiles();

			choice = bestTiles[Math.floor(Math.random() * bestTiles.length)];

			break;	
	}

	return choice;
}

function main() {

	canvasGridGame.height = 380;
	canvasGridGame.width = 400;

	canvasGridAI.height = 380;
	canvasGridAI.width = 400;

	canvasGridPlayer.height = 380;
	canvasGridPlayer.width = 400;

	context2DP = canvasGridPlayer.getContext('2d')
	context2DAI = canvasGridAI.getContext('2d');
	context2DG = canvasGridGame.getContext('2d');

	let tilesPerLine = 10;
	let offset = 30;
	let img = new Image();
	let imgHit = new Image();
	img.src = "images/redcross.jpg";
	imgHit.src = "images/hit.png";

	gridPlayer = new Grid(tilesPerLine,canvasGridPlayer.width,offset,img,imgHit,"Player");
	gridAI = new Grid(tilesPerLine,canvasGridAI.width,offset,img,imgHit,"AI");

	gridPlayer.generate(ships);
	gridAI.generate(ships);

	gridPlayer.draw(context2DP);
	gridAI.draw(context2DAI);

	let xPosClick;
	let yPosClick;

	let statusPlayer = "miss";
	let statusAI = "miss";

	let choice = 0;

	canvasGridPlayer.addEventListener('click',function(event) { 
		
		xPosClick = event.pageX - canvasGridPlayer.offsetLeft;
		yPosClick = event.pageY - canvasGridPlayer.offsetTop; 

		let id = gridPlayer.find(xPosClick,yPosClick);

		statusPlayer = gridPlayer.attack("player",id);

		gridPlayer.draw(context2DP)

		if(statusPlayer != "invalid") {

			if(statusPlayer == "miss") {
				do {
					choice = hillClimbing(choice,gridAI); 

					statusAI = gridAI.attack("ai",choice); 
	
					gridAI.draw(context2DAI);
				} while (statusAI == "hit" || statusAI == "invalid")
			}
		}
	});

	canvasGridGame.addEventListener('click',function(event) { 
		
		xPosClick = event.pageX - canvasGridGame.offsetLeft;
		yPosClick = event.pageY - canvasGridGame.offsetTop; 

		let id = gridPlayer.find(xPosClick,yPosClick);

		console.log(id);

		statusPlayer = gridPlayer.attack("player",id);

		gridPlayer.draw(context2DG)

		if(statusPlayer != "invalid") {

			if(statusPlayer == "miss") {
				do {
					choice = hillClimbing(choice,gridAI); 

					statusAI = gridAI.attack("ai",choice); 
				} while (statusAI == "hit" || statusAI == "invalid")
			}
		}
	});
}

class Grid {


		this.score = 0;
		this.tilesPerLine = tilesPerLine;
		this.tiles = new Array(tilesPerLine * tilesPerLine);
		this.tileSize = (canvasWidth -  2 * offset) / tilesPerLine;
		this.name = name

		let xPos = offset;
		let yPos = offset;

		for(let i = 0; i < tilesPerLine; i++) {

			for(let j = 0; j < tilesPerLine; j++) {

				if(i == 0) this.tiles[i * tilesPerLine + j] = new Tile(xPos,yPos,this.tileSize,image,imageHit);
				
				else if(j == 0) this.tiles[i * tilesPerLine + j] = new Tile(xPos,yPos,this.tileSize,image,imageHit);

				else this.tiles[i * tilesPerLine + j] = new Tile(xPos,yPos,this.tileSize,image,imageHit);

				xPos += this.tileSize;
			}

			xPos = offset;
			yPos += this.tileSize;
		}
	}

	generate(ships) {

		for(const [boatID,indices] of Object.entries(ships)) {
    	
    		indices.forEach(index => this.tiles[index].isOccupied = true);
		} 
	}

	attack(tag,id) {

		let status = this.tiles[id].attack(tag,id);

		if(status == "hit") {
			
			if(id-10 >= 0) {
				this.tiles[id-10].utility += 1;
			}
			if(id+10 < 100) {
				this.tiles[id+10].utility += 1;
			}
			if(id%10 != 0) {
				this.tiles[id-1].utility += 1;
			}
			if(id%10 != 9) {
				this.tiles[id+1].utility += 1;
			}
		}


		if(this.tiles[id].isSunk) {

			let boatIndices = getBoatIndices(id);

			for(let i = 0; i < boatIndices.length; i++) {

				this.tiles[boatIndices[i]].isSunk = true;

				if(boatIndices[i]-10 >= 0) {
					this.tiles[boatIndices[i]-10].utility = -2;
				}
				if(boatIndices[i]+10 < 100) {
					this.tiles[boatIndices[i]+10].utility = -2;
				}
				if(boatIndices[i]%10 != 0) {
					this.tiles[boatIndices[i]-1].utility = -2;
				}
				if(boatIndices[i]%10 != 9) {
					this.tiles[boatIndices[i]+1].utility = -2;
				}
			}
		}

		return status
	}

	draw(context2D) {

		let nbTiles = this.tilesPerLine * this.tilesPerLine;

		for(let i = 0; i < nbTiles; i++) {

			this.tiles[i].draw(context2D);
		}

		let xPos = 30;
		let yPos = 20;
		let xPosNb = 10;
		let yPosNb = 55;

		for(let i = 0; i < 10; i++) {

			context2D.fillStyle = "grey";
			context2D.textAlign = "center";
			context2D.font = "18px sans-serif";
			context2D.fillText(labels[i],xPos+this.tileSize/2,yPos);
			xPos += this.tileSize;

			context2D.fillText(i+1,xPosNb,yPosNb);
			yPosNb += this.tileSize;
		}

		// Affichage duo
		document.getElementById("gridNamePlayer").innerHTML = "Player"
		divNbMovesPlayer.innerHTML = "Moves count : " + nbMovesPlayer;
		divScorePlayer.innerHTML = "Sunk boat(s) : " + scorePlayer;
		document.getElementById("gridNameAI").innerHTML = "AI"
		divNbMovesAI.innerHTML = "Moves count : " + nbMovesAI;
		divScoreAI.innerHTML = "Sunk boat(s) : " + scoreAI;

		// Affichage solo
		if(this.name == "Player") {

			document.getElementById("gridName").innerHTML = "Player";
			document.getElementById("gridName").style.color = "#06B6D7";
			document.getElementById("nbMoves").innerHTML = "Moves count : " + nbMovesPlayer;
			document.getElementById("score").innerHTML = "Sunk boat(s) : " + scorePlayer;
		}

		else {

			document.getElementById("gridName").innerHTML = "AI";
			document.getElementById("gridName").style.color = "#EE3A22";
			document.getElementById("nbMoves").innerHTML = "Moves count : " + nbMovesAI;
			document.getElementById("score").innerHTML = "Sunk boat(s) : " + scoreAI;
		}
	}

	find(xPosClick, yPosClick) {

		let id = 0;

		while(true) {

			if(xPosClick > this.tiles[id].xPos && xPosClick < this.tiles[id].xPos + this.tiles[id].size) {

				if(yPosClick > this.tiles[id].yPos && yPosClick < this.tiles[id].yPos + this.tiles[id].size) {

					break;
				}
			}

			id++;
		}

		return id;
	}

	getBestTiles() {
		
		let nbTiles = this.tilesPerLine * this.tilesPerLine
		let maxUtility = -1;
		let bestTiles = [];
		
		for(let i = 0; i < nbTiles; i++) {
			
			if(this.tiles[i].utility >= maxUtility && !listeHitAI.includes(i)) {
			
				maxUtility = this.tiles[i].utility;
			}
		}

		for(let i = 0; i < nbTiles; i++) {

			if(this.tiles[i].utility == maxUtility && !listeHitAI.includes(i)) bestTiles.push(i);
		}

		return bestTiles;
	}

	isGameOver() {

		return this.score == 30;
	}
}

class Tile {

	constructor(xPos, yPos, size, image, imageHit) {

		this.xPos = xPos;
		this.yPos = yPos;
		this.size = size;
		this.image = image;
		this.imageHit = imageHit;
		this.isOccupied = false;
		this.isPlayed = false;
		this.isSunk = false;
		this.color = "white";
		this.utility = -1;
	}

	attack(tag,id) {

		let status = "invalid";

		let currentDiv;
		let currentDiv2;

		if(!this.isPlayed) {

			status = "miss";

			switch(tag) {

				case "player" : 
					currentDiv = divPlayerMoves;
					currentDiv2 = divPlayerMoves2;
					listeHitPlayer.push(id);
					nbMovesPlayer++;
					break;

				case "ai" : 
					currentDiv = divAiMoves;
					currentDiv2 = divAiMoves2;
					listeHitAI.push(id);
					nbMovesAI++;
					break;

			}

			let span = document.createElement("span");
			span.classList.add("move")
			span.innerHTML += "Move played in <strong>" + getNameOfTile(id) + "</strong>";

			let span2 = document.createElement("span");
			span2.classList.add("move")

			currentDiv === divPlayerMoves ? span2.innerHTML += "Move played in <strong>" + getNameOfTile(id) + "</strong>" : span2.innerHTML += "Move played in <strong>**</strong>"

			if(this.isOccupied) {

				this.color = "black";

				status = "hit"
				
				if(tag == "player" && isSunk(id, listeHitPlayer)) { 
					span.innerHTML += "(Hit - Sunk) (" + getNameBoat(id) + ")"
					span2.innerHTML += "(Hit - Sunk) (" + getNameBoat(id) + ")"
					this.isSunk = true;
					scorePlayer++;
					if (scorePlayer == 10) alert("Vous avez gagné")
				} else if(tag == "ai" && isSunk(id, listeHitAI)) {
					span.innerHTML += "(Hit - Sunk) (" + getNameBoat(id) + ")"
					span2.innerHTML += "(Hit - Sunk) (" + getNameBoat(id) + ")"
					this.isSunk = true;
					scoreAI++;
					if (scoreAI == 10) alert("L'IA A GAGNE");
				} else {
					span.innerHTML += " (Hit)";
					span2.innerHTML += " (Hit)";
				} 
			}

			else {

				span.innerHTML += " (Miss)";
				span2.innerHTML += " (Miss)";
			}

			this.isPlayed = true;

			currentDiv.appendChild(span);
			currentDiv2.appendChild(span2);
		}

		return status;
	}

	draw(context2D) {

		context2D.fillStyle = this.color;
		context2D.fillRect(this.xPos,this.yPos,this.size,this.size);
		context2D.strokeRect(this.xPos,this.yPos,this.size,this.size);
		if(this.isSunk) context2D.filter = 'grayscale(100%)';
		if(this.isPlayed && this.isOccupied) context2D.drawImage(this.imageHit,this.xPos+(this.size-this.size/1)/2,this.yPos+(this.size-this.size/1)/2,this.size/1,this.size/1);
        else if(this.isPlayed) context2D.drawImage(this.image,this.xPos+(this.size-this.size/1.5)/2,this.yPos+(this.size-this.size/1.5)/2,this.size/1.5,this.size/1.5);
        context2D.filter = 'none';
	}
}
