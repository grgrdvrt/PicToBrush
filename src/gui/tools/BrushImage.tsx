import { onMount, createSignal, createMemo } from "solid-js";
import { produce } from "solid-js/store";
import { useAppContext, AppState } from "../../AppContext";
import { clamp } from "../../utils/maths";
import styles from "./tools.module.scss";


export function BrushImage(){
    const {store, setStore} = useAppContext();

    let container:HTMLDivElement;
    let img:HTMLImageElement;
    const [getImageSize, setImageSize] = createSignal({
        x:0,
        y:0,
        width:0,
        height:0,
        naturalWidth:0,
        naturalHeight:0
    });


    const resizeObserver = new ResizeObserver(() => {
        const containerRect = container.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        setImageSize({
            x:imgRect.x - containerRect.x,
            y:imgRect.y - containerRect.y,
            width:img.width,
            height:img.height,
            naturalWidth:img.naturalWidth,
            naturalHeight:img.naturalHeight,
        });
    });

    onMount(() => {
        resizeObserver.observe(img);
    });

    const currentBrush = () => {
        return currentBrushFromStore(store);
    }
    const currentBrushFromStore = (store:AppState) => {
        return store.brushes.find(brush => brush.id === store.currentBrushId)!;
    }
    const constrainedSamplerRadius = () => {
        const imgSize = getImageSize();
        const b = currentBrush()
        const desiredRadius = b.samplerRadius * imgSize.width;
        const leftSpace = b.samplerPosition[0] * imgSize.width;
        const topSpace = b.samplerPosition[1] * imgSize.height;
        const rightSpace = imgSize.width - b.samplerPosition[0] * imgSize.width - 1;
        const bottomSpace = imgSize.height - b.samplerPosition[1] * imgSize.height - 1;
        return Math.min(
            desiredRadius,
            leftSpace,
            topSpace,
            rightSpace,
            bottomSpace,
        ) / imgSize.width;
    }
    const radius = () => {
        return constrainedSamplerRadius() * getImageSize().width;
    }
    const position = () => {
        const pos = currentBrush().samplerPosition
        const imgSize = getImageSize();
        return [
            pos[0] * imgSize.width + imgSize.x,
            pos[1] * imgSize.height + imgSize.y,
        ];
    }
    const [dragging, setDragging] = createSignal(false);

    function updatePosition(pointerX:number, pointerY:number){
        setStore(produce(store => {
            const imgSize = getImageSize();
            currentBrushFromStore(store).samplerPosition = [
                clamp(0, 1, pointerX / imgSize.width),
                clamp(0, (imgSize.height - 50) / imgSize.height, pointerY / imgSize.height)
            ]
        }));
    }

    function updateRadius(pointerX:number, pointerY:number){
        setStore(produce(store => {
            const brush = currentBrushFromStore(store);
            const imgSize = getImageSize()
            const diff = [
                (pointerX) - brush.samplerPosition[0] * imgSize.width,
                (pointerY) - brush.samplerPosition[1] * imgSize.height,
            ]
            brush.samplerRadius = Math.max(10, Math.hypot(diff[0], diff[1])) / imgSize.width;
        }));
    }

    let updateFunc:((x:number, y:number) => void)|null = null;
    function startDrag(e:PointerEvent){
        setDragging(true);
        img.setPointerCapture(e.pointerId)
    }

    function stopDrag(){
        setDragging(false);
        updateFunc = null;
    }
    function onDrag(e:PointerEvent){
        if(dragging() && updateFunc){
            updateFunc(e.offsetX, e.offsetY);
        }
    }

    const imageDescription = createMemo(() => {
        return currentBrush().credits ? `Photo by ${currentBrush().credits!.author} on Unsplash (https://unsplash.com/photos/${currentBrush().credits!.photo_id})` : "";
        
    })
    return(
        <div ref={container} class={styles.brushImage}>
            <img
                ref={img}
                alt={imageDescription()}
                style={{cursor:dragging() ? "grab" : "auto"}}
                src={currentBrush().url}
                draggable={false}
                onPointerDown={e => e.preventDefault()}
                onPointerMove={(e:PointerEvent) => onDrag(e)}
                onPointerUp={() => stopDrag()}
            />
            <div
                class={styles.brushSampler}
                style={{
                    top:`${position()[1]}px`,
                    left:`${position()[0]}px`,
                    width:`${2 * radius()}px`,
                    height:`${2 * radius()}px`,
                }}
            >
                <div
                    class={styles.handle}
                    style={{left:"100%"}}
                    onPointerDown={e => {
                        e.preventDefault();
                        updateFunc = updateRadius;
                        startDrag(e);
                    }}
                    onPointerUp={() => stopDrag()}
                />
                <div class={styles.handle}
                     onPointerDown={e => {
                         e.preventDefault();
                         updateFunc = updatePosition;
                         startDrag(e)
                     }}
                     onPointerUp={() => stopDrag()}
                />
            </div>
        </div>
    );
}
