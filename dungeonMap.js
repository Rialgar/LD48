const drawTile = (tile, tileSize, tileSet, objectImage, ctx) => {
    const tileX = tileSize * (
        (tile.walls.top ? 1 : 0) +
        (tile.walls.left ? 2 : 0) +
        (tile.walls.bottom ? 4 : 0)
    );
    const tileY = tileSize * (tile.walls.right ? 1 : 0);

    ctx.drawImage(tileSet, tileX, tileY, tileSize, tileSize, tile.x*tileSize, tile.y*tileSize, tileSize, tileSize);
    if(tile.item === 'goal'){
        ctx.drawImage(objectImage, 0, 0, 16, 16, tile.x*tileSize+8, tile.y*tileSize+8, 16, 16);
    } else if (tile.item === 'battery'){
        ctx.drawImage(objectImage, 0, 32, 16, 16, tile.x*tileSize+8, tile.y*tileSize+8, 16, 16);
    }

    /*ctx.fillStyle = "white";
    ctx.font = '10px sans-serif';
    ctx.fillText(tile.distance, x*this.tileSize+6, y*this.tileSize+16);
    ctx.fillText((tile.walls.right ? 1 : 0)+','+(tile.walls.bottom ? 1 : 0)+','+(tile.walls.left ? 1 : 0)+','+(tile.walls.up ? 1 : 0), 6, 10);
    ctx.fillText(tileX + "," + tileY, 6, 24);*/
}
class DungeonMap {
    tileSize = 16;
    images = {};

    width = 0;
    height = 0;
    tiles = [];

    constructor(tileSet, objectImage, tileSize, size){
        this.tileSize = tileSize;

        this.width = size;
        this.height = size;

        this.tiles = [];
        for(let x = 0; x < this.width; x++){
            this.tiles[x] = [];
            for(let y = 0; y < this.height; y++){
                this.tiles[x][y] = {
                    x: x,
                    y: y,
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

        const rooms = [];
        const joinRooms = (roomA, roomB) => {
            if(roomA != roomB){
                roomA.forEach(tile => {
                    tile.room = roomB;
                    tile.room.push(tile);
                });
                rooms.splice(rooms.indexOf(roomA), 1);
            }
        }
        for(let x = 0; x < this.width; x++){
            for(let y = 0; y < this.height; y++){
                const tile = this.tiles[x][y];
                if(!tile.walls.top){
                    tile.room = this.tiles[x][y-1].room;
                    tile.room.push(tile);
                }
                if(!tile.walls.left){
                    if(tile.room){
                        joinRooms(tile.room, this.tiles[x-1][y].room);
                    } else {
                        tile.room = this.tiles[x-1][y].room;
                        tile.room.push(tile);
                    }
                }
                if(!tile.room){
                    tile.room = [tile];
                    rooms.push(tile.room);
                }
            }
        }
        rooms.sort((a, b) => a.length - b.length);
        while (rooms.length > 1) {
            const options = [];
            rooms[0].forEach(tile => {
                if (tile.x > 0 && tile.walls.left && this.tiles[tile.x - 1][tile.y].room != tile.room) {
                    options.push({ tile, other: this.tiles[tile.x - 1][tile.y], dir: 'left', rev: 'right' });
                }
                if (tile.x < this.width - 1 && tile.walls.right && this.tiles[tile.x + 1][tile.y].room != tile.room) {
                    options.push({ tile, other: this.tiles[tile.x + 1][tile.y], dir: 'right', rev: 'left' });
                }
                if (tile.y > 0 && tile.walls.top && this.tiles[tile.x][tile.y - 1].room != tile.room) {
                    options.push({ tile, other: this.tiles[tile.x][tile.y - 1], dir: 'top', rev: 'bottom' });
                }
                if (tile.y < this.height - 1 && tile.walls.bottom && this.tiles[tile.x][tile.y + 1].room != tile.room) {
                    options.push({ tile, other: this.tiles[tile.x][tile.y + 1], dir: 'bottom', rev: 'top' });
                }
            })
            const choice = options[Math.floor(Math.random() * options.length)];
            choice.tile.walls[choice.dir] = false;
            choice.other.walls[choice.rev] = false;
            joinRooms(choice.tile.room, choice.other.room);
        }

        this.start = this.tiles[Math.floor(Math.random() * this.width)][Math.floor(Math.random() * this.height)];
        this.start.distance = 0;
        let farthest = this.start;
        const toCheck = [farthest];
        while(toCheck.length > 0){
            const tile = toCheck.shift();
            const processTile = (other) => {
                other.distance = tile.distance + 1;
                toCheck.push(other);
                if(other.distance > farthest.distance){
                    farthest = other;
                }
            }
            if (!tile.walls.left && this.tiles[tile.x - 1][tile.y].distance === undefined) {
                processTile(this.tiles[tile.x - 1][tile.y]);
            }
            if (!tile.walls.right && this.tiles[tile.x + 1][tile.y].distance === undefined) {
                processTile(this.tiles[tile.x + 1][tile.y]);
            }
            if (!tile.walls.top && this.tiles[tile.x][tile.y - 1].distance === undefined) {
                processTile(this.tiles[tile.x][tile.y - 1]);
            }
            if (!tile.walls.bottom && this.tiles[tile.x][tile.y + 1].distance === undefined) {
                processTile(this.tiles[tile.x][tile.y + 1]);
            }
        }
        this.goal = farthest;
        this.goal.item = 'goal';

        let batteries = size/3;
        while(batteries > 0){
            const tile = this.tiles[Math.floor(Math.random() * this.width)][Math.floor(Math.random() * this.height)];
            if(tile === this.start || tile === this.goal){
                continue;
            }
            tile.item = 'battery';
            batteries--;
        }

        this.image = document.createElement('canvas');
        this.image.width = (this.width+10) * this.tileSize;
        this.image.height = (this.height+10) * this.tileSize;
        const ctx = this.image.getContext('2d');
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.image.width, this.image.height);
        ctx.translate(5*this.tileSize, 5*this.tileSize);
        for(let x = 0; x < this.width; x++){
            for(let y = 0; y < this.height; y++){
               drawTile(this.tiles[x][y], this.tileSize, tileSet, objectImage, ctx);
            }
        }

        this.objectImage = objectImage;
        this.tileSet = tileSet;
    }

    render(ctx){
        ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, -5*this.tileSize, -5*this.tileSize, this.image.width, this.image.height);
    }

    collides(x, y, direction){
        return this.tiles[x][y].walls[direction];
    }

    removeGoal(){
        const ctx = this.image.getContext('2d');
        const x = (this.goal.x+0.25)*this.tileSize;
        const y = (this.goal.y+0.25)*this.tileSize;
        ctx.clearRect(x, y, 16, 16)
        ctx.drawImage(this.objectImage, 16, 0, 16, 16, x, y, 16, 16);
    }

    removeItem(x, y){
        this.tiles[x][y].item = null;
        drawTile(this.tiles[x][y], this.tileSize, this.tileSet, this.objectImage, this.image.getContext('2d')); 
    }

    discardImage(){
        this.image.width = 0;
        this.image.height = 0;
    }
};

export default DungeonMap;