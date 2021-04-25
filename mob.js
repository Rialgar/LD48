class Mob {
    position = {
        x: 0,
        y: 0
    };

    target = {
        x: 0,
        y: 0
    };

    speed = 10;

    _looking = 'straight';
    _moving = 'straight';
    moveTimer = 0;

    move(dx, dy){
        this.target.x += dx;
        this.target.y += dy;
    }

    setPosition(x, y){
        this.position.x = x;
        this.position.y = y;
        this.target = {...this.position};
    }

    update(dt){
        const dx = this.target.x - this.position.x
        if(dx !== 0){
            const mx = Math.sign(dx) * dt * this.speed;
            this.position.x += (Math.abs(dx) <= Math.abs(mx)) ? dx : mx;
        }
        const dy = this.target.y - this.position.y
        if(dy !== 0){
            const my = Math.sign(dy) * dt * this.speed;
            this.position.y += (Math.abs(dy) <= Math.abs(my)) ? dy : my;
        }
        if(dx === 0 && dy === 0){
            if(this.moveTimer > 0){
                this.moveTimer -= dt
            }
        } else {
            this.moveTimer = 0.1;
            if(Math.abs(dx) > Math.abs(dy)){
                this._moving = dx > 0 ? 'right' : 'left';
            } else {
                this._moving = dy > 0 ? 'down' : 'up';
            }
        }
    }

    set looking(direction) {
        this._looking = direction;
    }

    get looking(){
        if(this._looking !== 'straight' || this.moveTimer <= 0){
            return this._looking;
        }
        return this._moving;
    }
}

export default Mob;