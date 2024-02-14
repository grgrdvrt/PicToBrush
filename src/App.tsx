import {Show} from "solid-js";
import styles from './App.module.scss';
import { DrawingCanvas } from './gui/canvas/DrawingCanvas';
import { ToolsPanel } from './gui/tools/ToolsPanel';
import { MobileToolsPanel } from './gui/tools/MobileToolsPanel';

import { MobileDocumentActions } from "./gui/tools/MobileDocumentActions";
import { isMobile } from './utils';

function App() {
    return (
        <div class={styles.App}>
            <div class={styles.mainViewport}>
                <DrawingCanvas/>

                <Show when={!isMobile()} fallback={
                    <MobileToolsPanel/>
                }>
                    <ToolsPanel/>
                </Show>
            </div>
            <Show when={isMobile()}>
                <div class={styles.toolbar}>
                    <MobileDocumentActions/>
                </div>
            </Show>
        </div>
  );
}

export default App;
