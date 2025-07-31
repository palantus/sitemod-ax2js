const elementName = 'ax-aot-page'

import {goto, state, stylesheets} from "../system/core.mjs"
import "../components/field-edit.mjs"
import { alertDialog } from "../components/dialog.mjs"
import api from "../system/api.mjs";

const template = document.createElement('template');
template.innerHTML = `

  <style>
    #container{
      padding: 10px;
    }
    #description-header{text-decoration: underline;}
    
	  .grid-container {
      display: grid;
      grid-template-areas:
        'left right';
      grid-gap: 0px;
      grid-template-columns: 300px auto;
    }
    .left{
      grid-area: left;
      padding-right: 10px; 
      border-right: 1px solid black;
    }
    .grid-container > .right{
      grid-area: right; 
      border-left: 1px solid rgba(0, 0, 0, 0.1); 
      padding-left: 10px; 
    }
    .element{
      cursor: pointer;
    }
  </style>
    
  <div id="container">
    <h1>AOT</h1>
    <div class="grid-container">
      <div class="left">
        <label for="type-select">Type: </label>
        <select id="type-select"></select>
        <div id="elements"></div>
      </div>
      <div class="right">
        <div>
          <label for="view-select">View: </label>
          <select id="view-select">
            <option value=""></option>
            <option value="meta" selected>Metadata</option>
            <option value="children" selected>Children</option>
          </select>
        </div>
        <div id="view"></div>
      </div>
    </div>
  </div>
`;

class Element extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' })
        .adoptedStyleSheets = [stylesheets.global];
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.typeSelectChanged = this.typeSelectChanged.bind(this);
    this.elementChanged = this.elementChanged.bind(this);
    this.refreshView = this.refreshView.bind(this);

    this.shadowRoot.getElementById("type-select").addEventListener("change", this.typeSelectChanged);
    this.shadowRoot.getElementById("elements").addEventListener("click", this.elementChanged);
    this.shadowRoot.getElementById("view-select").addEventListener("click", this.refreshView);
  }

  async refreshData(){
    let types = await api.get('meta/types');
    types.unshift("");
    this.shadowRoot.getElementById('type-select').innerHTML = types.map(t => `
      <option value="${t}">${t}</option>
    `).join('');
  }

  async typeSelectChanged(){
    let type = this.shadowRoot.getElementById("type-select").value;
    this.shadowRoot.getElementById("view").dataset.type = type;
    let elements = await api.get(`meta/elements/${type}`);
    this.shadowRoot.getElementById('elements').innerHTML = elements.map(e => `
      <div class="element" data-name="${e}">${e}</div>
    `).join('');
  }

  async elementChanged(e){
    let name = e.target.dataset.name;
    this.shadowRoot.getElementById("view").dataset.name = name;

    this.refreshView();
  }

  async refreshView(){
    let type = this.shadowRoot.getElementById("view").dataset.type;
    let name = this.shadowRoot.getElementById("view").dataset.name;

    switch(this.shadowRoot.getElementById("view-select").value){
      case "meta":
        return this.refreshViewMeta(type, name);
      case "children":
        return this.refreshViewChildren(type, name);
      default:
        this.shadowRoot.getElementById("view").innerHTML = ``;
    }
  }

  async refreshViewMeta(type, name){
    let meta = await api.get(`meta/${type}/${name}`);
    this.shadowRoot.getElementById("view").innerHTML = `
      <pre>${JSON.stringify(meta, 0, 2)}</pre>
    `
  }
  
  async refreshViewChildren(type, name){
  }

  connectedCallback() {
    this.refreshData();
  }

  disconnectedCallback() {
  }
}

window.customElements.define(elementName, Element);
export {Element, elementName as name}
