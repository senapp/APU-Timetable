"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopLoading = exports.StartLoading = void 0;
const React = require("react");
const ReactDOM = require("react-dom");
const index_module_css_1 = require("./index.module.css");
const App_1 = require("./App");
ReactDOM.render(React.createElement("div", null,
    React.createElement("div", { id: "loadingContainer", className: index_module_css_1.default.loadingOff },
        React.createElement("div", { id: "loadingText", className: index_module_css_1.default.loadingText }),
        React.createElement("div", { className: index_module_css_1.default.ldsRoller },
            React.createElement("div", null),
            React.createElement("div", null),
            React.createElement("div", null),
            React.createElement("div", null),
            React.createElement("div", null),
            React.createElement("div", null),
            React.createElement("div", null),
            React.createElement("div", null))),
    React.createElement(App_1.App, null)), document.getElementById('root'));
const StartLoading = (messege) => {
    const container = document.getElementById("loadingContainer");
    const text = document.getElementById("loadingText");
    if (container && text) {
        text.innerHTML = messege;
        container.className = index_module_css_1.default.loadingOn;
    }
};
exports.StartLoading = StartLoading;
const StopLoading = () => {
    const container = document.getElementById("loadingContainer");
    const text = document.getElementById("loadingText");
    if (container && text) {
        text.innerHTML = "";
        container.className = index_module_css_1.default.loadingOff;
    }
};
exports.StopLoading = StopLoading;
//# sourceMappingURL=index.js.map