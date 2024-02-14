/* @refresh reload */
import { render } from 'solid-js/web';

import './index.scss';
import App from './App';
import {AppProvider} from "./AppContext";
import {BrushProvider} from "./BrushContext";

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
    );
}

render(() => <AppProvider><BrushProvider><App /></BrushProvider></AppProvider>, root);
