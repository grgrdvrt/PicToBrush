import Vector2 from "./Vector2";
import { lerp, Rect, TransformMatrix, } from "./maths";


export function clearCanvas(ctx:CanvasRenderingContext2D){
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
}

export function updateBrushCanvas(
    img:HTMLImageElement,
    brushCanvas:HTMLCanvasElement,
    brushSize:number,
    radius:number,
    position:[number, number]
){
    brushCanvas.width = brushSize;
    brushCanvas.height = brushSize;

    const brushCtx = brushCanvas.getContext("2d")!;
    brushCtx.save();
    brushCtx.beginPath();
    brushCtx.moveTo(brushSize, 0.5 * brushSize);
    brushCtx.arc(0.5 * brushSize, 0.5 * brushSize, 0.5 * brushSize, 0, 2 * Math.PI);
    brushCtx.fillStyle = "black";
    brushCtx.fill();
    brushCtx.globalCompositeOperation = "source-in";
    const s = radius;
    brushCtx.drawImage(
        img,
        position[0] - s,
        position[1] - s,
        2 * s, 2 * s,
        0, 0,
        brushSize, brushSize
    );
    brushCtx.restore();
}


function computeRotationTransform(count:number, resolution:Rect):TransformMatrix{
    const tx = 0.5 * resolution.width;
    const ty = 0.5 * resolution.height;
    const ang = 2 * Math.PI / count;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    return [
         ca,                      sa,
        -sa,                      ca,
        -ca * tx + sa * ty + tx, -sa * tx - ca * ty + ty
    ];
}
function computeReflectionTransform(resolution:Rect):TransformMatrix{
    return [-1, 0, 0, 1, resolution.width, 0];
}

export function drawSegment(
    ctx:CanvasRenderingContext2D,
    brushCanvas:HTMLCanvasElement,
    last:Vector2,
    p:Vector2,
    lastAngle:number,
    reflectionCount:number,
    steps:number,
    count:number,
    opacity:number,
    scale:number,
    angle:number,
    brushSize:number,
    size:number,
    canvasSize:Rect
){

    const rotationTransform = computeRotationTransform(count, canvasSize);
    const reflectionTransform = computeReflectionTransform(canvasSize);
    for(let i = 0; i < steps; i++){
        ctx.save();
        for(let k = 0; k < reflectionCount; k++){
            for(let j = 0; j < count; j++){

                ctx.transform(...rotationTransform);
                    // const t = steps === 1 ? 1 : i / (steps - 1);
                    const t = steps === 1 ? 1 : i / steps;
                    const px = lerp(last.x, p.x, t);
                    const py = lerp(last.y, p.y, t);
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.translate(px, py);
                    ctx.scale(scale, scale);
                    ctx.rotate(lerp(lastAngle, angle, t));
                    ctx.drawImage(brushCanvas, 0, 0, brushSize, brushSize, -0.5 * size, -0.5 * size, size, size);
                    ctx.restore();
            }
            ctx.transform(...reflectionTransform);
        }
        ctx.restore();
    }
}
