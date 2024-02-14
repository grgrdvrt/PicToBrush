import {createSignal, onMount, Switch, Match} from "solid-js";
import Vector2 from "../../utils/Vector2";

import { useAppContext } from "../../AppContext";
import { isMobile } from "../../utils";

import { BrushImage } from "./BrushImage";
import { BrushPicker } from "./BrushPicker";
import { DocumentActions } from "./DocumentActions";
import { Parameters } from "./Parameters";

import styles from "./tools.module.scss";
import { ReducePicto } from "../../assets/pictos";
import { BrushPreview } from "./BrushPreview";


export function ToolsPanel(){

    const {store, togglePanel, openPanel} = useAppContext();
    let panelEmt:HTMLDivElement;
    let toggleBtn:HTMLButtonElement;

    const [direction, setDirection] = createSignal("right");

    const beginPos = new Vector2(0, 0);
    const [dragInfos, setDragInfos] = createSignal<null|Vector2>(null);

    //compute position from state
    function getPositionStyle(){
        const dragPos = dragInfos();
        if(dragPos && !isMobile()){
            return {
                left:dragPos.x + "px",
                top:dragPos.y + "px",
            };
        }

        const w = window.innerWidth;
        const h = window.innerHeight;
        const rect = panelEmt.getBoundingClientRect();

        const y = store.panelState.isOpened
            ? 0.5 * (h - rect.height)
            : h - 80;
        const x =  direction() === "right"
            ? w - rect.width - 20
            : 20;

        const style = {
            "transition":"all 0.2s ease-in-out",
            top:y + "px",
            left:x + "px",
        };
        if(isMobile()){
            if(store.panelState.isOpened){
                style.top = "0px"
            }
            style.left = "0px";

        }

        return style;
    }

    function triggerLayout(){
        //NOTE Maybe there is a better way?
        togglePanel();
        togglePanel();
    }
    window.addEventListener("resize", () => {
        triggerLayout();
    })

    function startDrag(e:PointerEvent){
        if(e.target === toggleBtn){
            return;
        }
        const rect = panelEmt.getBoundingClientRect();
        beginPos.set(e.clientX - rect.x, e.clientY - rect.y);
        setDragInfos(new Vector2(
            e.clientX - beginPos.x,
            e.clientY - beginPos.y
        ));
        window.addEventListener("pointermove", drag);
        window.addEventListener("pointerup", stopDrag);
    }

    function drag(e:PointerEvent){
        setDragInfos(new Vector2(
            e.clientX - beginPos.x,
            e.clientY - beginPos.y
        ));
    }

    function stopDrag(e:PointerEvent){
        const rect = panelEmt.getBoundingClientRect();
        setDirection(dragInfos()!.x < 0.5 * (window.innerWidth - rect.width)
            ? "left"
            : "right"
        )
        setDragInfos(null);
        openPanel();

        window.removeEventListener("pointermove", drag);
        window.removeEventListener("pointerup", stopDrag);
    }

    onMount(() => {
        const resizeObserver = new ResizeObserver(() => {
            triggerLayout();
        });

        resizeObserver.observe(panelEmt);

    });

    return(
        <div ref={panelEmt} class={styles.toolsPanel} style={{
            ...getPositionStyle(),
            "pointer-events":(store.isDrawing && store.panelState.isOpened) ? "none" : "auto",
            opacity:(store.isDrawing && store.panelState.isOpened) ? "0" : "100%",
        }}
        >
            <div>
                <div
                    class={styles.panelActions}
                    onpointerdown={startDrag}
                >
                    <h1>PicToBrush</h1>
                    <button
                        aria-label="toggle panel"
                        ref={toggleBtn}
                        class={styles.toggleBtn}
                        style={{
                            transform:store.panelState.isOpened ? "scaleY(-1)" : "scaleY(1)",
                        }}
                        onClick={() => {
                            togglePanel();
                        } }
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
                <DocumentActions/>
            </div>
        </div>
    )
}
