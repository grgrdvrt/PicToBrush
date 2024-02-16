import { on, createEffect, onMount, createMemo } from "solid-js";
import { produce } from "solid-js/store";

import Vector2 from "../../utils/Vector2";

import styles from "./canvas.module.scss";
import { isMobile } from "../../utils";

import {drawSegment, clearCanvas, updateBrushCanvas} from "../../utils/drawing";
import { useAppContext } from "../../AppContext";
import { useBrushContext } from "../../BrushContext";

export function DrawingCanvas(){
    const {store, setStore, maxUndoCount} = useAppContext();
    const {
        brushSize,
        size,
        brushCanvas,
    } = useBrushContext();
    let canvas:HTMLCanvasElement;

    const undoStack:HTMLCanvasElement[] = [];
    function save(){
        // select the target canvas to save the current state
        let saveCanvas;
        if(store.undoIndex === maxUndoCount){
            //pointer is at the top of the stack and we are at capacity
            //recycle the oldest canvas
            saveCanvas = undoStack.shift();
            saveCanvas!.width = canvas.width;
            saveCanvas!.height = canvas.height;
            undoStack.push(saveCanvas!);
        }
        else if(store.undoIndex === undoStack.length){
            //pointer is at the top of the stack but there is room for more canvases
            //create a new canvas
            saveCanvas = document.createElement("canvas");
            saveCanvas.width = canvas.width;
            saveCanvas.height = canvas.height;
            undoStack.push(saveCanvas!);
        }
        else{
            //pointer is not at the top of the stack
            //use the next one.
            saveCanvas = undoStack[store.undoIndex];
        }
        setStore(produce(store => {
            store.undoIndex = Math.min(store.undoIndex + 1, maxUndoCount);
            store.availableRedos = store.undoIndex;
            store.lastUndoAction = "save";
        }));
        if(saveCanvas && saveCanvas.width > 0 && saveCanvas.height > 0){
            saveCanvas.getContext("2d")?.drawImage(canvas, 0, 0);
        }
    }


    let last = new Vector2();
    let p = new Vector2();
    let ink = 0;
    let lastAngle = 0;
    let pressure = 0.5;
    let lastPressure = 0.5;

    const resizeObserver = new ResizeObserver(() => {
        const ctx = canvas.getContext("2d")!;
        if(canvas.width !== canvas.clientWidth
           || canvas.height !== canvas.clientHeight
        ){
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        if(store.undoIndex > 0){
            const savedCanvas = undoStack[store.undoIndex - 1];
            clearCanvas(ctx);
            ctx.drawImage(
                savedCanvas,
                (canvas.width - savedCanvas.width) / 2,
                (canvas.height - savedCanvas.height) / 2
            );
        }
    });

    createEffect(on(() => store.drawingVersion, () => {
        const ctx = canvas.getContext("2d")!;
        if(store.drawingVersion > 0){
            clearCanvas(ctx);
        }
        save();
    }));


    createEffect(on(() => store.undoIndex, () => {
        const ctx = canvas.getContext("2d")!;
        if(store.lastUndoAction === "save"){
            return;
        }
        clearCanvas(ctx);
        ctx.drawImage(undoStack[store.undoIndex - 1], 0, 0);
    }));


    onMount(() => {
        const ctx = canvas.getContext("2d")!;

        clearCanvas(ctx);

        //listener here and not in jsx because of "passive"
        canvas.addEventListener("touchmove", (e:TouchEvent) => {
            e.preventDefault();
        }, {passive:false});

        resizeObserver.observe(canvas);



        function update(){
            requestAnimationFrame(update);
            if(!store.isDrawing)return;
            const deviceScale = isMobile() ? 0.65 : 1;
            const scale = deviceScale;

            const count = store.lineSettings.rotations;
            const dx = p.x - last.x;
            const dy = p.y - last.y;
            const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
            const angle = lastAngle + store.lineSettings.twist * Math.hypot(dx, dy) / 100;

            const canvasSize = {
                width:canvas.width,
                height:canvas.height,
            }
            const reflectionCount = store.lineSettings.mirror ? 2 : 1;
            const opacity = (store.lineSettings.opacity ** 2) * 0.995 + 0.005;
            console.log(pressure)
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
                brushSize(),
                size(),
                pressure,
                lastPressure,
                canvasSize

            );
            /* ink *= 0.98; */
            lastAngle = angle;
            lastPressure = pressure;
            last.copy(p);
        }
        update();
    })

    return (
        <canvas
            width="100%"
            height="100%"
            class={styles.canvas + " mainCanvas"}
            ref={canvas}
            onPointerDown={(e) => {
                e.preventDefault();
                if(e.button !== 0) return;
                lastPressure = pressure = e.pressure || 0.5;
                ink = store.lineSettings.opacity;

                setStore("isDrawing", true);
                lastAngle = 0;
                p.x = last.x = e.clientX;
                p.y = last.y = e.clientY;
            }}

            onPointerMove={(e) => {
                e.preventDefault();
                pressure = e.pressure || 0.5;
                p.set(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => {
                e.preventDefault();
                if(e.button !== 0) return;
                setStore("isDrawing", false)
                save();
            }}
        />
    );
}
