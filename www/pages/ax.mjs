const elementName = 'ax-page'

import {goto, state, stylesheets} from "../system/core.mjs"
import "../components/field-edit.mjs"
import MenuFunction from "../e/class/MenuFunction.mjs";
import {load} from "../e/class/Metadata.mjs"
import {dataReady, tryUpgrade} from "../datamanagement/data.mjs"
import {setReader} from "../datamanagement/data.mjs"
import LD2Reader from "../libs/ld2reader.mjs"
import { alertDialog } from "../components/dialog.mjs"

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
      grid-template-columns: auto 200px;
    }
    .left{grid-area: left;padding-right: 10px;}
    .grid-container > .right{grid-area: right; border-left: 1px solid rgba(0, 0, 0, 0.1); padding-left: 10px;}
    .fields{
      margin-top: 15px;
    }
    

    label:not(.checkbox):after {
		  content: ":"; 
	  }

    .value{
        display: inline-block;
        min-height:15px;
        min-width: 30px;
    }

    .field{
        display: inline-block;
        position: relative;
    }

    .field.right{
        width: 100%;
    }

    .value.right{
        text-align: right;
        position: absolute;
        right: 0px;
    }

    </style>
    
    <div id="container">
      <div id="data-loader">
        <input type="file" id="fileinput" />

        <br><br>
        <input id="mi" type="text"></input>
        <button class="styled" id="ax">Goto AX</button>
      </div>
    
	  <slot/>
  </div>

`;

class Element extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' })
        .adoptedStyleSheets = [stylesheets.global];
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    this.readSingleFile = this.readSingleFile.bind(this);

    this.shadowRoot.getElementById('fileinput').addEventListener('change', this.readSingleFile, false);

    let ps = state().path.split("/");
    let miIdx = ps.indexOf("mi")
    let classIdx = ps.indexOf("class")
    let tabIdx = ps.indexOf("table")
    if(miIdx >= 0)
      this.loadMenuItem(ps[miIdx+1])
    else if(classIdx >= 0)
      this.loadClass(ps[classIdx+1])
    else if(tabIdx >= 0)
      this.loadTable(ps[tabIdx+1])

    this.shadowRoot.getElementById("ax").addEventListener("click", () => {
      let mi = this.shadowRoot.getElementById("mi").value;
      localStorage.setItem("ax_mi", mi);
      goto(`/ax/mi/${mi}`);
    })

    this.shadowRoot.getElementById("mi").value = localStorage.getItem("ax_mi") || ""
  }

  async loadMenuItem(itemName){
    await Promise.all([load(), dataReady]);
    this.shadowRoot.getElementById("data-loader").classList.toggle("hidden", true);
    await tryUpgrade();
    

    /*
    let miInfo = this.data.elements.find(i => i.type == "menuitemdisplay" && i.name == itemName)
    let miData = await api.get("meta/" + miInfo.id)
    console.log(miData)
    //this.shadowRoot.getElementById("caption").innerText = formData.metadata.Design.Caption || formName
    */

    new MenuFunction(itemName).run();
  }

  loadClass(className){
    alert("Class: " + className)
  }

  loadTable(tableName){
    alert("table: " + tableName)
  }

  async readSingleFile(evt) {
    var f = evt.target.files[0];

    if(f.name.substring(f.name.lastIndexOf('.')) != ".ld2"){
      alertDialog(`Unknown file extension ${ext}`)
      return;
    }

    this.reader = new LD2Reader();

    await new Promise(resolve => {
      let r = new FileReader();
      r.onload = async (e) => {
        await this.reader.read(e.target.result);
        setReader(this.reader)
        resolve();
      };
      r.readAsArrayBuffer(f);
    })


  }

  connectedCallback() {
    //this.shadowRoot.querySelector('#toggle-info').addEventListener('click', () => this.toggleInfo());

  }

  disconnectedCallback() {
    //this.shadowRoot.querySelector('#toggle-info').removeEventListener();
  }

}

window.customElements.define(elementName, Element);
export {Element, elementName as name}