const elementName = 'ax-aot-page'

import {goto, state, stylesheets} from "../system/core.mjs"
import "../components/field-edit.mjs"
import "../components/breadcrumbs.mjs"
import { alertDialog } from "../components/dialog.mjs"
import api from "../system/api.mjs";


const template = document.createElement('template');
template.innerHTML = `

  <style>
    #container{
      padding: 10px;
    }
    #description-header{text-decoration: underline;}
    #breadcrumbs{
      margin-bottom: 10px;
      display: block;
    }
    #view-select-container{
      margin-bottom: 10px;
    }
    #elements{
      margin-top: 10px;
    }
    
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
        <breadcrumbs-component id="breadcrumbs"></breadcrumbs-component>
        <div id="view-select-container">
          <label for="view-select">View: </label>
          <select id="view-select">
            <option value="empty"></option>
            <option value="meta" selected>Metadata</option>
            <option value="children" selected>Children</option>
            <option value="ast" selected>AST</option>
            <option value="xpp" selected>X++ code</option>
            <option value="js" selected>Javascript code</option>
          </select>
        </div>
        <div id="view">
          <div id="empty-view" class="view"></div>
          <div id="meta-view" class="view hidden"></div>
          <div id="children-view" class="view hidden">
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
          <div id="ast-view" class="view hidden">
            <div id="ast-controls">
              <button id="ast-gen">Regenerate AST</button>
            </div>
            <pre id="ast-content"></pre>
          </div>
          <div id="xpp-view" class="view hidden">
            <pre id="xpp-content"></pre>
          </div>
          <div id="js-view" class="view hidden">
            <div id="js-controls">
              <button id="js-gen">Compile</button>
            </div>
            <pre id="js-content"></pre>
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
    this.elementSelectionChanged = this.elementSelectionChanged.bind(this);
    this.childClick = this.childClick.bind(this);
    this.refreshView = this.refreshView.bind(this);
    this.breadcrumbsClicked = this.breadcrumbsClicked.bind(this);
    this.refreshViewAST = this.refreshViewAST.bind(this);
    this.refreshViewXpp = this.refreshViewXpp.bind(this);
    this.refreshViewJS = this.refreshViewJS.bind(this);

    this.shadowRoot.getElementById("type-select").addEventListener("change", this.typeSelectChanged);
    this.shadowRoot.getElementById("elements").addEventListener("click", this.elementSelectionChanged);
    this.shadowRoot.getElementById("view-select").addEventListener("click", this.refreshView);
    this.shadowRoot.getElementById("children").addEventListener("click", this.childClick);
    this.shadowRoot.getElementById("breadcrumbs").addEventListener("item-clicked", this.breadcrumbsClicked);
    this.shadowRoot.getElementById("ast-gen").addEventListener("click", async () => {
      api.post(`ax/gen-ast`, {id: this.meta.id}).then(this.refreshViewAST);
    });
    this.shadowRoot.getElementById("js-gen").addEventListener("click", async () => {
      api.post(`ax/compile`, {id: this.meta.id}).then(this.refreshViewJS);
    });
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

  elementSelectionChanged(e){
    let id = e.target.dataset.id;
    this.elementChanged(id);
  }

  async elementChanged(id){
    this.shadowRoot.getElementById("view").dataset.id = id;

    this.meta = await api.get(`meta/${id}`);
    this.refreshView();
    this.refreshBreadcrumbs();
  }

  refreshView(){
    let view = this.shadowRoot.getElementById("view-select").value;

    this.shadowRoot.getElementById("view").querySelectorAll(".view").forEach(e => {
      e.classList.toggle("hidden", e.id != `${view}-view`);
    });

    switch(view){
      case "meta":
        return this.refreshViewMeta();
      case "children":
        return this.refreshViewChildren();
      case "ast":
        return this.refreshViewAST();
      case "xpp":
        return this.refreshViewXpp();
      case "js":
        return this.refreshViewJS();
    }
  }

  refreshBreadcrumbs(){
    let bc = this.shadowRoot.getElementById("breadcrumbs");
    let path = [...this.meta.elementSubPath];
    path.unshift(this.meta);
    let type = this.shadowRoot.getElementById("type-select").value;
    path.push(type);
    bc.setPath(path);
  }

  refreshViewMeta(){
    if(!this.meta) return this.shadowRoot.getElementById("meta-view").innerHTML = '';
    this.shadowRoot.getElementById("meta-view").innerHTML = `
      <pre>${JSON.stringify(this.meta, 0, 2)}</pre>
    `
  }
  
  refreshViewChildren(){
    if(!this.meta) return this.shadowRoot.getElementById("children").innerHTML = '';
    let children = this.meta.children || {};
    this.shadowRoot.getElementById("children").innerHTML = Object.keys(children)
                                                                 .reduce((all, cur) => [...children[cur], ...all], [])
                                                                 .map(c => `
      <tr><td>${c.type||"N/A"}</td><td>${c.name||c.type}</td><td><button data-id="${c.id}">Show</button></td></tr>
    `).join('')||"";
  }
  
  async refreshViewXpp(){
    this.shadowRoot.getElementById("xpp-content").innerHTML = '';
    if(!this.meta) return; 
    let res = await api.fetch(`meta/${this.meta.id}/xpp`, {}, true);
    if(!res) return;
    let xpp = await res.text();
    this.shadowRoot.getElementById("xpp-content").innerHTML = `
      <pre>${xpp}</pre>
    `.trim();
  }

  async refreshViewJS(){
    this.shadowRoot.getElementById("js-content").innerHTML = '';
    if(!this.meta) return;
    this.shadowRoot.getElementById("js-gen").classList.toggle("hidden", this.meta.elementSubPath.length != 0);
    let res = await api.fetch(`meta/${this.meta.id}/js`, {}, true);
    if(!res) return;
    let js = await res.text();
    this.shadowRoot.getElementById("js-content").innerHTML = `
      <pre>${js}</pre>
    `.trim();
  }
  
  async refreshViewAST(){
    this.shadowRoot.getElementById("ast-content").innerHTML = '';
    if(!this.meta) return;
    let ast = await api.get(`meta/${this.meta.id}/ast`);
    if(!ast) return;
    this.shadowRoot.getElementById("ast-content").innerHTML = `
      <pre>${JSON.stringify(ast, null, 2)}</pre>
    `.trim();
  }
  childClick(e){
    let id = e.target.dataset.id;
    if(!id) return;
    this.elementChanged(id);
  }

  breadcrumbsClicked(e){
    if(isNaN(e.detail.id)) return;
    this.elementChanged(e.detail.id);
  }

  connectedCallback() {
    this.refreshData();
  }

  disconnectedCallback() {
  }
}

window.customElements.define(elementName, Element);
export {Element, elementName as name}
