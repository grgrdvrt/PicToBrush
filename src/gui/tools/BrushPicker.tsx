import { For } from "solid-js";
import { produce } from "solid-js/store";

import { BrushSettings, makeBrush, useAppContext } from "../../AppContext";

import styles from "./tools.module.scss";

export function ColorItem(props:{brush:BrushSettings}){
    const {store, setStore} = useAppContext();
    return(
        <div
            class={styles.colorItem}
            style={{"background-image":`url(${props.brush.thumbURL ?? props.brush.url})`}}
            classList={{[styles.selected]:store.currentBrushId === props.brush.id }}
            onClick={() => setStore(produce((store) => {
                store.currentBrushId = props.brush.id;
            } ))}
        ></div>
    );
}

export function BrushPicker(){
    const {store, setStore} = useAppContext();
    let input;
    function onImageSelected(file:File){
        if(!file)return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setStore(produce(store => {
                const brush = makeBrush(String(e.target.result))
                store.brushes.push(brush)
                store.currentBrushId = brush.id;
            }));
        }

        reader.readAsDataURL(file);

    }
    return(
        <div class={styles.brushPicker}>
            <input ref={input} style={{display:"none"}} type='file' id="imgInp" accept="image/*" onChange={e => onImageSelected(e.target.files?.[0]) } />
            <For each={store.brushes}>
                {(brush) => <ColorItem brush={brush} />}
            </For>
            <div class={styles.colorItemPlus} onClick={() => input.click() }>
                <div>+</div>
            </div>
        </div>
    );
}
