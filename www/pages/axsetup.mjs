const elementName = 'ax-setup-page'

const template = document.createElement('template');
template.innerHTML = `
  <style>
    #container{
      padding: 10px;
    }
  </style>  

  <div id="container">
    <h1>Sample setup page</h1>
  </div>
`;

class Element extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }
}

window.customElements.define(elementName, Element);
export {Element, elementName as name}