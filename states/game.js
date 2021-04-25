import DungeonMap from '../dungeonMap.js';
import Mob from '../mob.js';

const tileSize = 32;
const gameSize = {
    x: 200 * tileSize / 16,
    y: 150 * tileSize / 16
}

const playerOffsets = {
    'straight': 0,
    'up': 16,
    'down': 32,
    'left': 48,
    'right': 64
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
            ctx.clearRect(0, 0, this.lightCircle.width, this.lightCircle.height);
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
            const scrollMX = Math.max(Math.abs(scrollDX) * dt * 4, 1/4);
            this.scroll.x += scrollMX > Math.abs(scrollDX) ? scrollDX : Math.sign(scrollDX) * scrollMX;
        }
        const scrollDY = gameSize.y/2 - (this.player.position.y+0.5) * tileSize - this.scroll.y
        if(scrollDY !== 0){
            const scrollMY = Math.max(Math.abs(scrollDY) * dt * 4, 1/4);
            this.scroll.y += scrollMY > Math.abs(scrollDY) ? scrollDY : Math.sign(scrollDY) * scrollMY;
        }
        if(scrollDX == 0 && scrollDY == 0 && this.player.position.x === this.map.goal.x && this.player.position.y == this.map.goal.y){
            this.nextMap();
        }
        if (this.mapTransition < 1) {
            this.mapTransition = Math.min(this.mapTransition + dt, 1);
        }
    },
    render: function (dt) {
        const ctx = this.app.layer.context;        
        
        //force discard previous image to clean up graphics memory, apparently this is something we have to do these days...
        this.app.layer.canvas.height += 1;
        this.app.layer.canvas.height -= 1;
        ctx.clearRect(0, 0, this.app.width, this.app.height);
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.app.width, this.app.height);

        ctx.imageSmoothingEnabled = false;

        ctx.save();
        ctx.transform(this.scale, 0, 0, this.scale, this.offset.x, this.offset.y);

        ctx.rect(0, 0, gameSize.x, gameSize.y)
        ctx.clip();

        const tx = Math.round(this.scroll.x*this.scale)/this.scale;
        const ty = Math.round(this.scroll.y*this.scale)/this.scale;
        
        if(this.mapTransition == 1){
            ctx.translate(tx, ty);
            this.map.render(ctx);    
        } else {
            ctx.save();        
            ctx.translate(gameSize.x/2, gameSize.y/2);
            ctx.scale(this.mapTransition, this.mapTransition);
            ctx.translate(-gameSize.x/2, -gameSize.y/2);
            ctx.translate(tx, ty);
            this.map.render(ctx);
            ctx.restore();
    
            if(this.prevMap){
                const ptx = Math.round(this.prevScroll.x*this.scale)/this.scale;
                const pty = Math.round(this.prevScroll.y*this.scale)/this.scale;

                ctx.save();
                ctx.translate(gameSize.x/2, gameSize.y/2);
                ctx.scale(1/(1-this.mapTransition), 1/(1-this.mapTransition));
                ctx.translate(-gameSize.x/2, -gameSize.y/2);                
                ctx.translate(ptx, pty);
                this.prevMap.render(ctx);
                ctx.restore();
            }
    
            ctx.translate(tx, ty);
        }
        
        const objectOffset = playerOffsets[this.player.looking];
        ctx.drawImage(this.app.images.objects, 32+objectOffset, 0, 16, 16, this.player.position.x * tileSize + 8, this.player.position.y * tileSize + 8, 16, 16);

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
                this.player.looking = 'left';
                if(!this.map.collides(this.player.target.x, this.player.target.y, "left")){
                    this.player.move(-1, 0);
                }
                break;
            case 'right':
            case 'd':
                this.player.looking = 'right';
                if(!this.map.collides(this.player.target.x, this.player.target.y, "right")){
                    this.player.move(1, 0);
                }
                break;
            case 'up':
            case 'w':
                this.player.looking = 'up';
                if(!this.map.collides(this.player.target.x, this.player.target.y, "top")){
                    this.player.move(0, -1);
                }
                break;
            case 'down':
            case 's':
                this.player.looking = 'down';
                if(!this.map.collides(this.player.target.x, this.player.target.y, "bottom")){
                    this.player.move(0, 1);
                }
                break;
        }
    },
    keyup: function (data) {
        switch (data.key) {
            case 'left':
            case 'a':
            case 'right':
            case 'd':
            case 'up':
            case 'w':
            case 'down':
            case 's':
                this.player.looking = 'straight';
                break;
        }
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
        if(this.prevMap){
            this.prevMap.discardImage();
        }
        this.mapSize++;
        this.prevMap = this.map;        
        this.mapTransition = 0;

        if(this.prevMap){
            this.prevMap.removeGoal();
            this.prevScroll = {
                x :gameSize.x/2 - (this.player.position.x+0.5) * tileSize,
                y :gameSize.y/2 - (this.player.position.y+0.5) * tileSize
            };
        }

        this.map = new DungeonMap(this.app.images["walls"+tileSize], this.app.images.objects, tileSize, this.mapSize);
        this.player.setPosition(this.map.start.x, this.map.start.y);
        this.scroll.x = gameSize.x/2 - (this.player.position.x+0.5) * tileSize;
        this.scroll.y = gameSize.y/2 - (this.player.position.y+0.5) * tileSize;
    }
});

export default GameState;