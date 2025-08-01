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
            <option value="empty"></option>
            <option value="meta" selected>Metadata</option>
            <option value="children" selected>Children</option>
          </select>
        </div>
        <div id="view">
          <div id="empty-view" class="view"></div>
          <div id="meta-view" class="view"></div>
          <div id="children-view" class="view">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="children"></tbody>
            </table>
          </div>
        </div>
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
    this.childClick = this.childClick.bind(this);
    this.refreshView = this.refreshView.bind(this);

    this.shadowRoot.getElementById("type-select").addEventListener("change", this.typeSelectChanged);
    this.shadowRoot.getElementById("elements").addEventListener("click", this.elementChanged);
    this.shadowRoot.getElementById("view-select").addEventListener("click", this.refreshView);
    this.shadowRoot.getElementById("children").addEventListener("click", this.childClick);
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
    if(!type) return this.shadowRoot.getElementById("elements").innerHTML = '';
    this.shadowRoot.getElementById("view").dataset.type = type;
    let elements = await api.get(`meta/elements/${type}`);
    this.shadowRoot.getElementById('elements').innerHTML = elements.map(e => `
      <div class="element" data-name="${e.name}" data-id="${e.id}">${e.name}</div>
    `).join('');
  }

  async elementChanged(e){
    let id = e.target.dataset.id;
    this.shadowRoot.getElementById("view").dataset.id = id;

    this.refreshView();
  }

  async refreshView(){
    let id = this.shadowRoot.getElementById("view").dataset.id;
    let view = this.shadowRoot.getElementById("view-select").value;

    this.shadowRoot.getElementById("view").querySelectorAll(".view").forEach(e => {
      e.classList.toggle("hidden", e.id != `${view}-view`);
    });

    switch(view){
      case "meta":
        return this.refreshViewMeta(id);
      case "children":
        return this.refreshViewChildren(id);
    }
  }

  async refreshViewMeta(id){
    if(!id) return this.shadowRoot.getElementById("meta-view").innerHTML = '';
    let meta = await api.get(`meta/${id}`);
    this.shadowRoot.getElementById("meta-view").innerHTML = `
      <pre>${JSON.stringify(meta, 0, 2)}</pre>
    `
  }
  
  async refreshViewChildren(id){
    if(!id) return this.shadowRoot.getElementById("children").innerHTML = '';
    let meta = await api.get(`meta/${id}`);
    let children = meta.children || {};
    this.shadowRoot.getElementById("children").innerHTML = Object.keys(children)
                                                                 .reduce((all, cur) => [...children[cur], ...all], [])
                                                                 .map(c => `
      <tr><td>${c.type||"N/A"}</td><td>${c.name||c.type}</td><td><button data-id="${c.id}">Show</button></td></tr>
    `).join('')||"";
  }

  async childClick(e){
    let id = e.target.dataset.id;
    if(!id) return;
    this.elementChanged(e);
  }

  connectedCallback() {
    this.refreshData();
  }

  disconnectedCallback() {
  }
}

window.customElements.define(elementName, Element);
export {Element, elementName as name}
