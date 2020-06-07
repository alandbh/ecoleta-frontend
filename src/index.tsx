import React from "react";
import ReactDOM from "react-dom"; // É isso que cria a árvore de elementos no browser. Para aplicaçoes React em outras plataformas como VR, Desktop, etc, usamos outra Lib
import App from "./App";

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
