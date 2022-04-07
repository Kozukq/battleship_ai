"use strict";

window.onload = main;
var divPlayerMoves = document.getElementById("playerMoves");
var divAiMoves = document.getElementById("aiMoves");

const labels = ['A','B','C','D','E','F','G','H','I','J'];

var listeHitAI = new Array()
var listeHitPlayer = new Array()

var scorePlayer = 0
var scoreAI = 0

var gridPlayer;
var gridAI;

let ships = {

	destroyer1 : [0,1],
	destroyer2 : [29,39],
	destroyer3 : [55,65],
	destroyer4 : [70,71],

	submarine1 : [3,13,23],
	submarine2 : [25,26,27],
	submarine3 : [59,69,79],

	battleship1 : [6,7,8,9],
	battleship2 : [20,30,40,50],

	aircraftcarrier1 : [95,96,97,98,99]
}

var movesAI = [];
for(let i = 0; i < 100; i++) movesAI.push(i);

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

function isCoule(id, list) {
	for(const [boatID,indices] of Object.entries(ships)) {
    	let isInBoat = indices.includes(id)
    	if(isInBoat) {
    		if(indices.every(index => list.includes(index))) 
    			return true
    	}
	} return false
}


function main() {

	const canvasList = document.getElementsByTagName('canvas')

	const canvas = canvasList[0];
	canvas.height = 500;
	canvas.width = 500;

	const context2D = canvas.getContext('2d');

	let tilesPerLine = 10;
	let offset = 30;
	let img = new Image();
	img.src = "images/redcross.jpg";

	gridPlayer = new Grid(tilesPerLine,canvas.width,offset,img);
	gridAI = new Grid(tilesPerLine,canvas.width,offset,img);

	gridPlayer.generate(ships);
	gridPlayer.draw(context2D);

	gridAI.generate(ships);

	let xPosClick;
	let yPosClick;

	let statusPlayer = "miss";
	let statusAI = "miss";

	canvas.addEventListener('click',function(event) { 
		
		xPosClick = event.pageX - canvas.offsetLeft;
		yPosClick = event.pageY - canvas.offsetTop; 

		let id = gridPlayer.find(xPosClick,yPosClick);

		statusPlayer = gridPlayer.attack("player",id);

		gridPlayer.draw(context2D);

		if(statusPlayer != "invalid") {

			if(statusPlayer == "miss") {
				do {
					// statusAI = gridAI.attack("ai",Math.floor(Math.random() * 100));
					statusAI = gridAI.attack("ai",Math.floor(Math.random() * movesAI.length));
				} while (statusAI == "hit" || statusAI == "invalid")
			}

		}
	
		console.log("status player : ", statusPlayer)
		console.log("status AI : ", statusAI)
	
	});
}

class Grid {

	constructor(tilesPerLine, canvasWidth, offset, image) {

		this.score = 0;
		this.tilesPerLine = tilesPerLine;
		this.tiles = new Array(tilesPerLine * tilesPerLine);
		this.tileSize = (canvasWidth -  2 * offset) / tilesPerLine;

		let xPos = offset;
		let yPos = offset;

		for(let i = 0; i < tilesPerLine; i++) {

			for(let j = 0; j < tilesPerLine; j++) {

				if(i == 0) this.tiles[i * tilesPerLine + j] = new Tile(xPos,yPos,this.tileSize,image);
				
				else if(j == 0) this.tiles[i * tilesPerLine + j] = new Tile(xPos,yPos,this.tileSize,image);

				else this.tiles[i * tilesPerLine + j] = new Tile(xPos,yPos,this.tileSize,image);

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
			
			// Première case
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
		let yPosNb = 60;

		for(let i = 0; i < 10; i++) {

			context2D.fillStyle = "grey";
			context2D.textAlign = "center";
			context2D.font = "18px sans-serif";
			context2D.fillText(labels[i],xPos+this.tileSize/2,yPos);
			xPos += this.tileSize;

			context2D.fillText(i+1,xPosNb,yPosNb);
			yPosNb += this.tileSize;
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

	isGameOver() {

		return this.score == 30;
	}
}

class Tile {

	constructor(xPos, yPos, size, image) {

		this.xPos = xPos;
		this.yPos = yPos;
		this.size = size;
		this.image = image;
		this.isOccupied = false;
		this.isPlayed = false;
		this.color = "white";
		this.utility = -1;
	}

	attack(tag,id) {

		let status = "invalid";

		let currentDiv;

		if(!this.isPlayed) {

			movesAI.filter(index => {return index != id});

			status = "miss";

			switch(tag) {

				case "player" : 
					currentDiv = divPlayerMoves;
					listeHitPlayer.push(id);
					console.log(listeHitPlayer)
					break;

				case "ai" : 
					currentDiv = divAiMoves;
					listeHitAI.push(id);
					console.log(listeHitAI)
					break;

			}

			let span = document.createElement("span");
			span.innerHTML += "Move played in <strong>" + getNameOfTile(id) + "</strong>";	

			if(this.isOccupied) {

				this.color = "black";

				status = "hit"
				
				if(tag == "player" && isCoule(id, listeHitPlayer)) { 
					span.innerHTML += "(Hit - Sunk) (" + getNameBoat(id) + ")"
					scorePlayer++;
					if (scorePlayer == 10) alert("Vous avez gagné")
				} else if(tag == "ai" && isCoule(id, listeHitAI)) {
					span.innerHTML += "(Hit - Sunk) (" + getNameBoat(id) + ")"
					scoreAI++;
					if (scoreAI == 10) alert("L'IA A GAGNE")
				} else span.innerHTML += " (Hit)";
			}

			else {

				span.innerHTML += " (Miss)";
			}

			this.isPlayed = true;

			currentDiv.appendChild(span);
			currentDiv.appendChild(document.createElement('br'));
		}

		return status;
	}

	draw(context2D) {

		context2D.fillStyle = this.color;
		context2D.fillRect(this.xPos,this.yPos,this.size,this.size);
		context2D.strokeRect(this.xPos,this.yPos,this.size,this.size);
		// context2D.font = '24px sans-serif';
		// context2D.fillStyle = "black";
		// context2D.fillText(this.label,this.xPos+5,this.yPos+15);
		if(this.isPlayed) context2D.drawImage(this.image,this.xPos+(this.size-this.size/1.5)/2,this.yPos+(this.size-this.size/1.5)/2,this.size/1.5,this.size/1.5);
	}
}