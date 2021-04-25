import DungeonMap from '../dungeonMap.js';
import Mob from '../mob.js';

const tileSize = 32;
const gameSize = {
    x: 200 * tileSize / 16,
    y: 150 * tileSize / 16
}

let fps = 60;

const GameState = () => ({
    scale: 0,
    offset: {
        x: 0,
        y: 0
    },
    scroll: {
        x: 0,
        y: 0
    },
    scrollTarget: {
        x: 0,
        y: 0
    },
    map: null,
    player: new Mob(),

    create: function () {
        this.lightCircle = document.createElement('canvas');
        this.resize();
        this.mapSize = 2;
        this.nextMap();        
    },
    resize: function () {
        const prevScale = this.scale;        
        this.scale = Math.floor(Math.min(this.app.width / gameSize.x, this.app.height / gameSize.y));
        this.offset.x = Math.round((this.app.width - this.scale * gameSize.x) / 2);
        this.offset.y = Math.round((this.app.height - this.scale * gameSize.y) / 2);
        if(prevScale != this.scale){
            this.lightCircle.width = gameSize.x*this.scale*1.5;
            this.lightCircle.height = gameSize.y*this.scale*1.5;
            const ctx = this.lightCircle.getContext('2d');
            const lightGradient = ctx.createRadialGradient(this.lightCircle.width/2, this.lightCircle.height/2, gameSize.y*this.scale/3, this.lightCircle.width/2, this.lightCircle.height/2, gameSize.y*this.scale/2);
            lightGradient.addColorStop(0, "rgba(0,0,0,0)");
            lightGradient.addColorStop(1, "rgba(0,0,0,1)");
            ctx.fillStyle = lightGradient;
            ctx.fillRect(0, 0, this.lightCircle.width, this.lightCircle.height);
        }
    },

    step: function (dt) {
        this.player.update(dt, this.scale);
        const scrollDX = gameSize.x/2 - (this.player.position.x+0.5) * tileSize - this.scroll.x
        if(scrollDX !== 0){
            this.scroll.x += (Math.abs(scrollDX) <= 1/this.scale) ? scrollDX : (scrollDX * dt * 4);
        }
        const scrollDY = gameSize.y/2 - (this.player.position.y+0.5) * tileSize - this.scroll.y
        if(scrollDY !== 0){
            this.scroll.y += (Math.abs(scrollDY) <= 1/this.scale) ? scrollDY : (scrollDY * dt * 4);
        }
        if(this.player.position.x === this.map.goal.x && this.player.position.y == this.map.goal.y){
            this.nextMap();
        }
    },
    render: function (dt) {
        const ctx = this.app.layer.context;
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = 'black';
        ctx.clearRect(0, 0, this.app.width, this.app.height);
        ctx.fillRect(0, 0, this.app.width, this.app.height);

        ctx.save();
        ctx.transform(this.scale, 0, 0, this.scale, this.offset.x, this.offset.y);

        ctx.rect(0, 0, gameSize.x, gameSize.y)
        ctx.clip();
        const tx = Math.round(this.scroll.x*this.scale)/this.scale;
        const ty = Math.round(this.scroll.y*this.scale)/this.scale;
        
        this.map.render(ctx, tx, ty);
        ctx.fillStyle = "red";
        ctx.fillRect((this.player.position.x + 0.25) * tileSize + tx, (this.player.position.y + 0.25) * tileSize + ty, tileSize / 2, tileSize / 2);                    

        ctx.restore();
        const cx = ((this.player.position.x+0.5) * tileSize + tx) * this.scale + this.offset.x;
        const cy = ((this.player.position.y+0.5) * tileSize + ty) * this.scale + this.offset.y;
        ctx.drawImage(this.lightCircle, cx-this.lightCircle.width/2, cy-this.lightCircle.height/2);

        //DEBUG INFO
        ctx.strokeStyle = 'white';
        ctx.strokeRect(this.offset.x, this.offset.y, gameSize.x * this.scale, gameSize.y * this.scale);

        fps = (fps * 29 + 1 / dt) / 30;
        ctx.font = "20px sans-serif";
        ctx.fillStyle = 'white';
        ctx.fillText(Math.round(fps), 10, 30);
    },

    keydown: function (data) {
        switch (data.key) {
            case 'left':
            case 'a':
                if(!this.map.collides(this.player.target.x, this.player.target.y, "left")){
                    this.player.move(-1, 0);
                }
                break;
            case 'right':
            case 'd':
                if(!this.map.collides(this.player.target.x, this.player.target.y, "right")){
                    this.player.move(1, 0);
                }
                break;
            case 'up':
            case 'w':
                if(!this.map.collides(this.player.target.x, this.player.target.y, "top")){
                    this.player.move(0, -1);
                }
                break;
            case 'down':
            case 's':
                if(!this.map.collides(this.player.target.x, this.player.target.y, "bottom")){
                    this.player.move(0, 1);
                }
                break;            
        }
    },
    keyup: function (data) {
    },

    mousedown: function (data) { },
    mouseup: function (data) { },
    mousemove: function (data) { },

    gamepaddown: function (data) { },
    gamepadhold: function (data) { },
    gamepadup: function (data) { },
    gamepadmove: function (data) { },
    
    //custom functions

    nextMap: function (){
        this.mapSize++;
        this.map = new DungeonMap(this.app.images["walls"+tileSize], tileSize, this.mapSize);
        this.player.setPosition(this.map.start.x, this.map.start.y);
        this.scroll.x = gameSize.x/2 - (this.player.position.x+0.5) * tileSize;
        this.scroll.y = gameSize.y/2 - (this.player.position.y+0.5) * tileSize;
    }
});

export default GameState;