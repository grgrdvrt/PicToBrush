import {Show, createMemo} from "solid-js";
import { ClosePicto } from "../../assets/pictos";
import styles from "./tools.module.scss";

import { useBrushContext } from "../../BrushContext";


export function Infos({visible, closeInfos}:{visible:()=>boolean, closeInfos:()=>void}) {
    const {
        currentBrush
    } = useBrushContext();

    const credits = createMemo(() => {
        return currentBrush().credits!;
    })
    return (
        <div class={styles.infos} style={{display:visible()?'block':'none'}}>

            <svg class={styles.deco} width="45" height="64" viewBox="0 0 45 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.1637 17.5C20.1637 32 17.6637 50 13.1637 63.5C36.6637 43 44.1637 25 44.1637 0C-19.503 7 0.782656 -8.14661 13.1637 17.5Z" fill="#FFB72A"/>
            </svg>
            <button class={styles.closeBtn} onClick={() => closeInfos()}><ClosePicto/></button>
            <h2>Concept & Development</h2>
            <p><a href="https://www.grgrdvrt.com/" target="_blank">Grgrdvrt</a></p>
            <h2>Graphic Design</h2>
            <p><a href="https://vrlx.fr/" target="_blank">Victor Laloux</a></p>

            <Show when={true && credits()}>
                    <div class={styles.photoCredits}>
                        <div class={styles.thumb} style={{"background-image":`url(${currentBrush().thumbURL ?? currentBrush().url})`}}/>
            <p>
            Photo by <a href={`https://unsplash.com/@${credits().handle}?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText`}>
            {credits().author}
                            </a><br/>on <a href={`https://unsplash.com/photos/${credits().photo_id}?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText`}>Unsplash</a>
                        </p>
                </div>
            </Show>
        </div>
    );
}
