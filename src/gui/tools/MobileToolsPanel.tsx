import {Switch, Match} from "solid-js";
import { useAppContext } from "../../AppContext";

import { BrushImage } from "./BrushImage";
import { BrushPicker } from "./BrushPicker";
import { Parameters } from "./Parameters";

import styles from "./tools.module.scss";
import { ReducePicto } from "../../assets/pictos";
import { BrushPreview } from "./BrushPreview";


export function MobileToolsPanel(){
    const {store, closePanel} = useAppContext();
    let panelEmt:HTMLDivElement;

    return(
        <div ref={panelEmt}
             class={styles.mobileToolsPanel}
             classList={{
             [styles.opened]:store.panelState.isOpened,
             }}
        >
            <div>
                <div
                    class={styles.panelActions}
                >
                    <h1>PicToBrush</h1>
                    <button
                        aria-label="toggle panel"
                        class={styles.toggleBtn}
                        style={{transform:"scaleY(-1)"}}
                        onClick={() => {closePanel()} }
                    >
                        <ReducePicto/>
                    </button>
                </div>
                <Switch>
                    <Match when={store.panelState.mode === "colors" }>
                        <div>
                            <BrushImage/>
                            <div class={styles.toolsPanelTools}>
                                <BrushPicker/>
                            </div>
                        </div>
                    </Match>
                    <Match when={store.panelState.mode === "settings" }>
                        <div>
                            <BrushPreview/>
                            <div class={styles.toolsPanelTools}>
                                <Parameters/>
                            </div>
                        </div>
                    </Match>
                </Switch>
            </div>
        </div>
    )
}
