import { Switch, Match, createSignal } from "solid-js";
import { useAppContext } from "../../AppContext";

import { ClearPicto, RedoPicto, PalettePicto, TunePicto, DownloadPicto, UndoPicto, AboutPicto} from "../../assets/pictos";
import { Infos } from "./Infos";
import styles from "./tools.module.scss";

export function DocumentActions(){
    const {
        store,
        canUndo,
        canRedo,
        undo,
        redo,
        clear,
        toggleToolsMode,
        downloadCanvas,
    } = useAppContext();

    const [infosVisible, setInfosVisible] = createSignal(false);
    const toggleInfos = () => setInfosVisible(!infosVisible());
    const closeInfos = () => setInfosVisible(false);

    return(
        <div class={styles.documentAction}>
            <Switch>
                <Match when={store.panelState.mode === "colors" }>
                    <button aria-label="settings" onClick={toggleToolsMode}><TunePicto/></button>
                </Match>
                <Match when={store.panelState.mode === "settings" }>
                    <button aria-label="colors"onClick={toggleToolsMode}><PalettePicto/></button>
                </Match>
            </Switch>
            <div>
                <button aria-label="undo" onClick={undo} disabled={!canUndo()}><UndoPicto/></button>
                <button aria-label="redo" onClick={redo} disabled={!canRedo()}><RedoPicto/></button>
                <button aria-label="clear" onClick={clear}><ClearPicto/></button>
            </div>
            <div>
                <button aria-label="about" onClick={() => toggleInfos()}><AboutPicto/></button>
                <button aria-label="download" onClick={downloadCanvas}><DownloadPicto/></button>
            </div>
            <Infos visible={infosVisible} closeInfos={closeInfos}/>
        </div>
    );
}
