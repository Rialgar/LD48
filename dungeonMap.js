class DungeonMap {
    tileSize = 16;
    images = {};

    width = 0;
    height = 0;    
    tiles = [];


    constructor(images, tileSize){
        this.tileSize = tileSize;

        this.width = 11;
        this.height = 11;

        this.tiles = [];
        for(let x = 0; x < this.width; x++){
            this.tiles[x] = [];
            for(let y = 0; y < this.height; y++){
                this.tiles[x][y] = {
                    item: null,
                    walls: {
                        left: x === 0,
                        right: x === this.width - 1,
                        top: y === 0,
                        bottom: y === this.height - 1
                    }
                };
            }
        }

        for(let x = 1; x < this.width; x++){
            for(let y = 1; y < this.height; y++){
                if(Math.random() > 0.5){
                    this.tiles[x][y].walls.top = true;
                    this.tiles[x][y-1].walls.bottom = true;
                }
                if(Math.random() > 0.5){
                    this.tiles[x][y].walls.left = true;
                    this.tiles[x-1][y].walls.right = true;
                }
            }
        }

        this.tileSet = images['walls' + this.tileSize];

        this.image = document.createElement('canvas');
        this.image.width = this.width * this.tileSize;
        this.image.height = this.height * this.tileSize;
        const ctx = this.image.getContext('2d');
        for(let x = 0; x < this.width; x++){
            for(let y = 0; y < this.height; y++){
                const tile = this.tiles[x][y];
                const tileX = this.tileSize * (
                    (tile.walls.top ? 1 : 0) +
                    (tile.walls.left ? 2 : 0) +
                    (tile.walls.bottom ? 4 : 0)
                );
                const tileY = this.tileSize * (tile.walls.right ? 1 : 0);
                
                ctx.drawImage(this.tileSet, tileX, tileY, this.tileSize, this.tileSize, x*this.tileSize, y*this.tileSize, this.tileSize, this.tileSize);
                /*ctx.fillStyle = "white";
                ctx.font = '8px sans-serif';
                ctx.fillText((tile.walls.right ? 1 : 0)+','+(tile.walls.bottom ? 1 : 0)+','+(tile.walls.left ? 1 : 0)+','+(tile.walls.up ? 1 : 0), 6, 10);
                ctx.fillText(tileX + "," + tileY, 6, 24);*/
            }
        }
    }

    render(ctx, tx, ty){
        ctx.drawImage(this.image, tx, ty);
    }

    collides(x, y, direction){
        return this.tiles[x][y].walls[direction];
    }
};

export default DungeonMap;