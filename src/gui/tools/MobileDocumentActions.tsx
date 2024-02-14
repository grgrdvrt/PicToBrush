import { Show,createMemo, createSignal } from "solid-js";

import { useAppContext } from "../../AppContext";


import { ClearPicto, RedoPicto, TunePicto, DownloadPicto, UndoPicto, AboutPicto} from "../../assets/pictos";
import { Infos } from "./Infos";
import styles from "./tools.module.scss";

export function MobileDocumentActions(){
    const {
        store,
        canUndo,
        canRedo,
        undo,
        redo,
        clear,
        downloadCanvas,
        closePanel,
        openPanel,
        setToolsMode,
    } = useAppContext();

    const [infosVisible, setInfosVisible] = createSignal(false);
    const toggleInfos = () => setInfosVisible(!infosVisible());
    const closeInfos = () => setInfosVisible(false);

    const getCurrentBrush = createMemo(() => {
        return store.brushes.find(brush=> brush.id === store.currentBrushId)!;
    });

    return(
        <div class={styles.documentAction}>
            <div style={{display:"flex"}}>
                <button aria-label="colors" onClick={() => {
                    if(store.panelState.isOpened && store.panelState.mode === "colors" ){
                        closePanel();
                    }
                    else{
                        openPanel();
                        setToolsMode("colors");
                    }
                }}>
                    <div class={styles.thumb} style={{"background-image":`url(${getCurrentBrush().thumbURL ?? getCurrentBrush().url})`}}/>
</button>
                <button aria-label="settings" onClick={() => {
                    if(store.panelState.isOpened && store.panelState.mode === "settings" ){
                        closePanel();
                    }
                    else{
                        openPanel();
                        setToolsMode("settings");
                    }
                } }><TunePicto/></button>
            </div>
            <Show when={!store.panelState.isOpened} fallback={
                <div>
                    <button aria-label="about" onClick={() => toggleInfos()}><AboutPicto/></button>
                    <button aria-label="download" onClick={downloadCanvas}><DownloadPicto/></button>
                </div>
            }>
                <div>
                    <button aria-label="undo" onClick={undo} disabled={!canUndo()}><UndoPicto/></button>
                    <button aria-label="redo" onClick={redo} disabled={!canRedo()}><RedoPicto/></button>
                    <button aria-label="clear" onClick={clear}><ClearPicto/></button>
                </div>
            </Show>
            <Infos visible={infosVisible} closeInfos={closeInfos}/>
        </div>
    );
}
