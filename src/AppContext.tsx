import { JSXElement, createContext, useContext } from "solid-js";
import { SetStoreFunction, createStore, produce } from "solid-js/store";
import imageData from "./assets/imageData.json?raw";
import { checkIsMobile } from "./utils";


type Credits = {
    handle:string;
    author:string;
    photo_id:string;
}

export type LineSettings = {
    size:number;
    opacity:number;
    twist:number;
    rotations:number;
    mirror:boolean;
};

export type BrushSettings = {
    id:string;
    url:string;
    credits?:Credits;
    samplerPosition:[number, number];
    thumbURL?:string;
    //This is the user-defined radius. Actual radius is constrained by image size
    samplerRadius:number;
}

export type PanelState ={
    isOpened:boolean;
    mode:"colors"|"settings";
}

export type AppState = {
    panelState:PanelState;
    brushes:BrushSettings[];
    currentBrushId:string|null,
    isDrawing:boolean,
    //These settings are duplicated for each new line:
    lineSettings:LineSettings;
    drawingVersion:number;
    //This is used to navigate the undo stack.
    lastUndoAction:null|"undo"|"redo"|"save";
    availableRedos:number;
    undoIndex:number;
}

export const maxUndoCount = 10;

export function makeBrush(url:string, credits?:Credits, thumbURL?:string){
    return {
        id:crypto.randomUUID(),
        url:url,
        credits:credits,
        thumbURL:thumbURL,
        samplerPosition:[0.5, 0.5] as [number, number],
        samplerRadius: 0.15
    }
}


const AppContext = createContext<AppContextType>({} as AppContextType);

interface AppContextType {
    store: AppState; // Replace any with the actual type of your store
    setStore: SetStoreFunction<AppState>; // Adjust the parameter type accordingly
    maxUndoCount: number;
    canUndo: () => boolean;
    canRedo: () => boolean;
    undo: () => void;
    redo: () => void;
    clear: () => void;
    downloadCanvas: () => void;
    toggleToolsMode: () => void;
    setToolsMode: (mode:"colors"|"settings") => void;
    openPanel: () => void;
    closePanel: () => void;
    togglePanel: () => void;
}

export function AppProvider(props:{children:JSXElement[]|JSXElement}) {

    const defaultImages = JSON.parse(imageData).files;

    for(let i = 0; i < defaultImages.length; i++){
        const randId = Math.floor(Math.random() * defaultImages.length);
        const tmp = defaultImages[randId];
        defaultImages[randId] = defaultImages[i];
        defaultImages[i] = tmp;
    }
    defaultImages.length = 20;

    const defaultBrushes = defaultImages.map((img:Credits&{"file":string}) => makeBrush("/defaultImages/" + img.file, img, "/defaultImages/thumbs/" + img.file))


    const [store, setStore] = createStore<AppState>({
        panelState:{
            isOpened:!checkIsMobile(),
            mode:"colors",
        },
        brushes:defaultBrushes,
        currentBrushId:defaultBrushes[0].id,
        isDrawing:false,
        lineSettings:{
            size:125,
            opacity:0.3,
            twist:0.5,
            rotations:1,
            mirror:false,
        },
        drawingVersion:0,
        lastUndoAction:null,
        availableRedos:0,
        undoIndex:0,
    });

    window.store = store;


    function canUndo(){
        return store.undoIndex > 1;
    }
    function canRedo(){
        return store.undoIndex < store.availableRedos;
    }

    function undo(){
        if(!canUndo()) return;
        setStore(produce(store => {
            store.lastUndoAction = "undo";
            store.undoIndex--;
        }));
    }

    function redo(){
        if(!canRedo()) return;
        setStore(produce(store => {
            store.lastUndoAction = "redo";
            store.undoIndex++;
        }));
    }


    function clear(){
        setStore(produce(store => store.drawingVersion++))
    }


    const link = document.createElement('a');
    link.download = 'pictobrush.png';

    function downloadCanvas(){
        link.href = (document.querySelector(".mainCanvas") as HTMLCanvasElement).toDataURL('image/png');

        // Append to body temporarily to simulate click, then remove.
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    function setToolsMode(mode:"colors"|"settings"){
        setStore("panelState", "mode", mode);
    }

    function toggleToolsMode(){
        setToolsMode(store.panelState.mode == "colors" ? "settings" : "colors");
        openPanel();
    }

    function openPanel(){
        setStore("panelState", "isOpened", true);
    }

    function closePanel(){
        setStore("panelState", "isOpened", false);
    }

    function togglePanel(){
        setStore("panelState", "isOpened", !store.panelState.isOpened);
    }

    function loadRandomImage(){
        fetch("https://source.unsplash.com/random/1920x1080/?wallpaper,landscape").then( data => {
            setStore(produce(store => {
                store.brushes.unshift(makeBrush(data.url))
            }));
        });
    }
    loadRandomImage();

    return (
        <AppContext.Provider value={{
            store,
            setStore,
            maxUndoCount,
            canUndo,
            canRedo,
            undo,
            redo,
            clear,
            downloadCanvas,
            setToolsMode,
            toggleToolsMode,
            openPanel,
            closePanel,
            togglePanel
        }}>
            {props.children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);
