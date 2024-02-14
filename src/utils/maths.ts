
export type TransformMatrix = [
    number, number, number,
    number, number, number
];


export type Rect = {
    width:number;
    height:number;
}

export function lerp(a:number, b:number, t:number):number{
    return a + t * (b - a);
}

export function clamp(min:number, max:number, val:number):number{
    return Math.max(min, Math.min(max, val));
}

export function smoothStep(t:number):number{
    return 3 * t**2 - 2 * t**3;
}
