import * as React from 'react';
import * as ReactDOM from 'react-dom';
import css from './index.module.css';

import { App } from './App';

ReactDOM.render(
<div>
    <div id="loadingContainer" className={css.loadingOff}>
        <div id="loadingText" className={css.loadingText}></div>
        <div className={css.ldsRoller}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
    <App />
</div>, document.getElementById('root'));

export const StartLoading = (messege: string) => {
    const container = document.getElementById("loadingContainer");
    const text = document.getElementById("loadingText");
    if (container && text) {
        text.innerHTML = messege;
        container.className = css.loadingOn;
    }
};

export const StopLoading = () => {
    const container = document.getElementById("loadingContainer");
    const text = document.getElementById("loadingText");
    if (container && text) {
        text.innerHTML = "";
        container.className = css.loadingOff;
    }
};