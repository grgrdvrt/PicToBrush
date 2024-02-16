import {createEffect, onMount, on} from "solid-js";
import { useAppContext } from "../../AppContext";
import { drawSegment } from "../../utils/drawing";
import { useBrushContext } from "../../BrushContext";
import Vector2 from "../../utils/Vector2";

const pathData = [96,120,98,118,100,116,106,109,112,105,138,85,178,61,192,54,214,47,221,46,227,47,226,50,218,58,193,81,172,102,163,113,157,121,151,142,151,147,153,153,155,155,161,151,172,138,190,116,213,96,236,83,253,78,260,79,256,86,250,92,242,99,224,115,209,131,203,136,197,147,198,150,203,151,213,143,222,136,248,118,279,105,300,102,306,108,304,115,305,121,315,124]

const pts:Vector2[] = [];
for(let i = 0; i < pathData.length / 2; i++){
    pts[i] = new Vector2(pathData[2 * i], pathData[2 * i + 1]);
}

import styles from "./tools.module.scss";
import { clamp } from "../../utils/maths";

export function BrushPreview(){

    const {store } = useAppContext();

    const {
        brushSize,
        size,
        brushCanvas,
    } = useBrushContext();

    let canvas:HTMLCanvasElement;


    let lastUpdated = 0;
    let updateTimeout:NodeJS.Timeout|null = null;
    const throttleDuration = 100;
    function updatePreview() {
        let lastAngle = 0;
        const count = store.lineSettings.rotations;
        const reflectionCount = store.lineSettings.mirror ? 2 : 1;
        const opacity = (store.lineSettings.opacity ** 2) * 0.995 + 0.005;
        const scale = 1;

        //ensure all signals/store access happen before the throttle
        //somehow if they happen after, they are not properly tracked
        const _size = clamp(1, 100, size() * 0.3);
        const _brushSize = brushSize();
        const _twist = store.lineSettings.twist;

        //throttle
        const time = Date.now();
        if(time - lastUpdated < throttleDuration){
            if(updateTimeout === null){
                updateTimeout = setTimeout(() => updatePreview(), throttleDuration - (time - lastUpdated) + 1)
            }
            return;
        }
        updateTimeout = null;
        lastUpdated = time;

        const canvasSize = {
            width:canvas.width,
            height:canvas.height - 32,
        }
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);


        for(let i = 1; i < pts.length; i++){
            const last = pts[i - 1];
            const p = pts[i];

            const dx = p.x - last.x;
            const dy = p.y - last.y;
            const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
            const angle = lastAngle + _twist * Math.hypot(dx, dy) / 100;

            drawSegment(
                ctx,
                brushCanvas,
                last,
                p,
                lastAngle,
                reflectionCount,
                steps,
                count,
                opacity,
                scale,
                angle,
                _brushSize,
                _size,
                0.5,
                0.5,
                canvasSize
            );
            lastAngle = angle;
        }
    }

    const resizeObserver = new ResizeObserver(() => {
        if(canvas.width !== canvas.clientWidth
           || canvas.height !== canvas.clientHeight
        ){
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        updatePreview();
    });

    onMount(() => {
        resizeObserver.observe(canvas);
        updatePreview();
    });

    createEffect(() => {
        updatePreview();
    });

    return (<div class={styles.brushPreview}>
        <canvas ref={canvas}/>
    </div>)
}
