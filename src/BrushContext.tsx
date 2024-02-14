import {
    JSXElement,
    createContext,
    useContext,
    createEffect,
    createMemo
} from "solid-js";

import { BrushSettings, useAppContext } from "./AppContext";

import { updateBrushCanvas } from "./utils/drawing";



const BrushContext = createContext<BrushContextType>({} as BrushContextType);

interface BrushContextType {
    currentBrush:() => BrushSettings,
    constrainedSamplerRadius:() => number,
    radius:() => number,
    position:() => [number, number],
    brushSize:() => number,
    size:() => number,
    brushCanvas:HTMLCanvasElement,
}

export function BrushProvider(props:{children:JSXElement[]|JSXElement}) {

    const {store} = useAppContext();

    const brushCanvas = document.createElement("canvas");

    const img = new Image();
    img.crossOrigin = "anonymous";

    const currentBrush = createMemo(() => {
        return store.brushes.find(brush => brush.id === store.currentBrushId)!;
    });

    const constrainedSamplerRadius = () => {
        const b = currentBrush()
        const desiredRadius = b.samplerRadius * img.naturalWidth;
        const leftSpace = b.samplerPosition[0] * img.naturalWidth;
        const topSpace = b.samplerPosition[1] * img.naturalHeight;
        const rightSpace = img.naturalWidth - b.samplerPosition[0] * img.naturalWidth - 1;
        const bottomSpace = img.naturalHeight - b.samplerPosition[1] * img.naturalHeight - 1;
        return Math.min(
            desiredRadius,
            leftSpace,
            topSpace,
            rightSpace,
            bottomSpace,
        ) / img.naturalWidth;
    };

    const radius = () => {
        return constrainedSamplerRadius() * img.naturalWidth;
    };
    const position = () => {
        const pos = currentBrush().samplerPosition
        return [
            pos[0] * img.naturalWidth,
            pos[1] * img.naturalHeight,
        ] as [number, number];
    };

    const brushSize = () => {
        return store.lineSettings.size;
    }
    const size = () => {
        return brushSize();
    }

    img.onload = () => {
        updateBrushCanvas(
            img,
            brushCanvas,
            brushSize(),
            radius(),
            position()
        );
    }

    createEffect(() => {
        updateBrushCanvas(
            img,
            brushCanvas,
            brushSize(),
            radius(),
            position()
    )});
    createEffect(() => img.src = currentBrush().url);

    return (
        <BrushContext.Provider value={{
            currentBrush,
            constrainedSamplerRadius,
            radius,
            position,
            brushSize,
            size,
            brushCanvas
        }}>
            {props.children}
        </BrushContext.Provider>
    );
}

export const useBrushContext = () => useContext(BrushContext);
