"use strict";

window.onload = main;

function main() {

	const canvas = document.querySelector('canvas');
	const context2D = canvas.getContext('2d');

	let xPosClick;
	let yPosClick;

	canvas.height = 1000;
	canvas.width = 500;

	let tilesPerLine = 11;
	let offset = 10;

	let grid = new Grid(tilesPerLine,canvas.width,offset);

	grid.draw(context2D);

	canvas.addEventListener('click',function(event) { 
		
		xPosClick = event.pageX - canvas.offsetLeft;
		yPosClick = event.pageY - canvas.offsetTop; 

		let id = grid.find(xPosClick,yPosClick);

		console.log(id);

		grid.tiles[id].updateColor("black");

		grid.draw(context2D);
	});
}

class Grid {

	constructor(tilesPerLine, canvasWidth, offset) {

		this.tilesPerLine = tilesPerLine;
		this.tiles = new Array(tilesPerLine * tilesPerLine);

		let tileSize = (canvasWidth -  2 * offset) / tilesPerLine;

		let xPos = offset;
		let yPos = offset;

		for(let i = 0; i < tilesPerLine; i++) {

			for(let j = 0; j < tilesPerLine; j++) {

				this.tiles[i * tilesPerLine + j] = new Tile(xPos,yPos,tileSize);

				xPos += tileSize;
			}

			xPos = offset;
			yPos += tileSize;
		}
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
}

class Tile {

	constructor(xPos, yPos, size) {

		this.xPos = xPos;
		this.yPos = yPos;
		this.size = size;
		this.color = "white";
	}

	draw(context2D) {

		context2D.fillStyle = this.color;
		context2D.fillRect(this.xPos,this.yPos,this.size,this.size);
		context2D.strokeRect(this.xPos,this.yPos,this.size,this.size);
	}

	updateColor(color) {

		this.color = color;
	}
}