let pool:Vector2[] = [];

export default class Vector2{
    static create(x = 0, y = 0):Vector2{
        if(pool.length > 0){
            return pool.pop()!.set(x, y);
        }
        else return new Vector2(x, y);
    }

    static dist2(v1:Vector2, v2:Vector2):number{
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        return dx * dx + dy * dy;
    }

    static dist(v1:Vector2, v2:Vector2):number{
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        return Math.hypot(dx, dy);
    }

    static angle(v1:Vector2, v2:Vector2):number{
        let ang1 = Math.atan2(v1.y, v1.x);
        let ang2 = Math.atan2(v2.y, v2.x);
        return ang1 + ang2;
    }

    static lerp(v1:Vector2, v2:Vector2, t:number):Vector2{
        return v1.clone().lerp(v2, t);
    }

    x:number = 0;
    y:number = 0;

    constructor(x:number = 0, y:number = 0){
        this.set(x, y);
    }

    add(v:Vector2):Vector2{
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v:Vector2):Vector2{
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiplyScalar(s:number):Vector2{
        this.x *= s;
        this.y *= s;
        return this;
    }

    scale(sx:number, sy:number):Vector2{
        this.x *= sx;
        this.y *= sy;
        return this;
    }

    multiply(v:Vector2):Vector2{
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    divide(v:Vector2):Vector2{
        this.x /= v.x;
        this.y /= v.y;
        return this;
    }

    lerp(v:Vector2, t:number):Vector2{
        this.x = this.x + t * (v.x - this.x);
        this.y = this.y + t * (v.y - this.y);
        return this;
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    clone():Vector2{
        return Vector2.create(this.x, this.y);
    }

    copy(v:Vector2):Vector2{
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    set(x = 0, y = 0):Vector2{
        this.x = x;
        this.y = y;
        return this;
    }

    normalize():Vector2{
        return this.setLength(1);
    }

    setLength(l:number):Vector2{
        let r = l / this.getLength();
        this.x *= r;
        this.y *= r;
        return this;
    }

    getLength():number{
        return Math.hypot(this.x, this.y);
    }

    getLengthSquared():number{
        return this.x * this.x + this.y * this.y;
    }

    dot(v:Vector2):number{
        return this.x * v.x + this.y * v.y;

    }

    cross(v:Vector2):number{
        return this.x * v.y - this.y * v.x;
    }

    rotate(a:number):Vector2{
        let ca = Math.cos(a);
        let sa = Math.sin(a);
        let x = this.x;
        let y = this.y;
        this.x = ca * x - sa * y;
        this.y = ca * y + sa * x;
        return this;
    }

    dispose(){
        pool.push(this);
    }
}
