import {createSignal} from "solid-js";

const [isMobileSignal, setIsMobile] = createSignal<boolean>(false);


export function isMobile(){
    return isMobileSignal();
}

export function checkIsMobile(){
    return window.innerWidth <= 800;
}

const resizeObserver = new ResizeObserver(() => {
    setIsMobile(checkIsMobile());
});

resizeObserver.observe(document.body);
