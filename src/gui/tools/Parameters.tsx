
import styles from "./tools.module.scss";


import { LineSettings, useAppContext } from "../../AppContext";

export function Parameters(){
    const {store, setStore } = useAppContext();

    function setParameter(name:keyof(LineSettings), value:number | boolean){

        setStore("lineSettings", name, value);
    }
    return(
        <div class={styles.parameters} style={{display:"flex", "flex-direction":"column"}}>
            <label>
                Size
                <input
                    type="range"
                    min="1"
                    max="400"
                    step="1"
                    value={store.lineSettings.size}
                    onInput={(e:InputEvent) =>{
                        setParameter("size", Number((e as any).target.value));
                    }} />
            </label>
            <label>
                Opacity
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={store.lineSettings.opacity}
                    onInput={(e:InputEvent) =>{
                        setParameter("opacity", Number((e as any).target.value));
                    }} />
            </label>
            <label>
                Twist
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={store.lineSettings.twist}
                    onInput={(e:InputEvent) => {
                        setParameter("twist", Number((e as any).target.value));
                    }}/>
            </label>
            <label>
                Mirror
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="1"
                    value={store.lineSettings.mirror ? 1 : 0}
                    onInput={(e:InputEvent) => {
                        setParameter("mirror", Number((e as any).target.value) === 1 );
                    }}/>
            </label>
            <label>
                Rotations
                <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={store.lineSettings.rotations}
                    onInput={(e:InputEvent) => {
                        setParameter("rotations", Number((e as any).target.value));
                    }}/>
            </label>
        </div>
    );
}
