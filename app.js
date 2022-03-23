"use strict";

window.onload = main;

function main() {

	const canvas = document.querySelector('canvas');
	const context2D = canvas.getContext('2d');

	let xPosClick;
	let yPosClick;

	canvas.height = 1000;
	canvas.width = 500;

	let tilesPerLine = 10;
	let offset = 10;

	let img = new Image();
	img.src = "images/redcross.jpg";

	let grid = new Grid(tilesPerLine,canvas.width,offset,img);

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

	grid.generate(ships);

	grid.draw(context2D);

	canvas.addEventListener('click',function(event) { 
		
		xPosClick = event.pageX - canvas.offsetLeft;
		yPosClick = event.pageY - canvas.offsetTop; 

		let id = grid.find(xPosClick,yPosClick);

		console.log(id);

		grid.attack(id);

		grid.draw(context2D);

		if(grid.isGameOver()) window.alert("Well played game is over.");
	});
}

class Grid {

	constructor(tilesPerLine, canvasWidth, offset, image) {

		this.score = 0;
		this.tilesPerLine = tilesPerLine;
		this.tiles = new Array(tilesPerLine * tilesPerLine);

		let tileSize = (canvasWidth -  2 * offset) / tilesPerLine;

		let xPos = offset;
		let yPos = offset;

		for(let i = 0; i < tilesPerLine; i++) {

			for(let j = 0; j < tilesPerLine; j++) {

				this.tiles[i * tilesPerLine + j] = new Tile(xPos,yPos,tileSize,image);

				xPos += tileSize;
			}

			xPos = offset;
			yPos += tileSize;
		}
	}

	generate(ships) {

		for(const [boatID,indices] of Object.entries(ships)) {
    	
    		indices.forEach(index => this.tiles[index].isOccupied = true);
		} 
	}

	attack(id) {

		this.score += this.tiles[id].attack();
	}

	draw(context2D) {

		let nbTiles = this.tilesPerLine * this.tilesPerLine;

		for(let i = 0; i < nbTiles; i++) {

			this.tiles[i].draw(context2D);
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
	}

	attack() {

		let score = 0;

		if(!this.isPlayed) {

			if(this.isOccupied) {

				this.color = "black";

				score = 1;
			}

			this.isPlayed = true;
		}

		else {

			window.alert("Tile already attacked !");
		}

		return score;
	}

	draw(context2D) {

		context2D.fillStyle = this.color;
		context2D.fillRect(this.xPos,this.yPos,this.size,this.size);
		context2D.strokeRect(this.xPos,this.yPos,this.size,this.size);
		if(this.isPlayed) context2D.drawImage(this.image,this.xPos,this.yPos,this.size,this.size);
	}
}