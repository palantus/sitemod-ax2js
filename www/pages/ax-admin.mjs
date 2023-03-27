import api from "/system/api.mjs";
import { alertDialog } from "/components/dialog.mjs"

const elementName = 'ax-page'

const template = document.createElement('template');
template.innerHTML = `
  <link rel='stylesheet' href='/css/global.css'>
  <style>
  </style>  
  
  <div id="container">
    <button class="styled" id="read">Read metadata</button>
    <button class="styled" id="compile">Compile all</button>
  </div>
`;

class Element extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.shadowRoot.getElementById("read").addEventListener("click", async () => {
      let output = await api.post("ax/read-metadata")
      alertDialog(`<pre>${JSON.stringify(output, null, 2)}</pre>`, {title: "Output"})
    })

    this.shadowRoot.getElementById("compile").addEventListener("click", async () => {
      let output = await api.post("ax/compile")
      alertDialog(`<pre>${JSON.stringify(output, null, 2)}</pre>`, {title: "Output"})
    })
  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }

}

window.customElements.define(elementName, Element);
export {Element, elementName as name}