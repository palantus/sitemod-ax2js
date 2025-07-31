import {genAST, initASTParser, status} from "./compiler/ast-gen.mjs"
import {compileElement, initJSCompiler} from "./compiler/js-gen.mjs"
import Entity from "entitystorage"
import MenuItem from "../../../models/menuitem.mjs"
import Element from "../models/element.mjs"
import Mod from "../../../models/mod.mjs"
import { generateMenu } from "../../../services/menu.mjs";

export async function compileAll(){
  // Enable the one below in the future for performance:
  /*
  await Promise.all([
    initASTParser(),
    initJSCompiler()
  ])
  */
 
  await initASTParser()
  await initJSCompiler()
    
  // Generate AST:
  //Entity.search("xpp.tag:xpp element.prop:name=^AhkPet").forEach(e => genAST(e))
  Entity.search("xpp.tag:xpp").forEach(e => genAST(e))
  let s = status()
  console.log(`Generated AST for ${s.success} of ${s.total} functions. The remaining ${s.failed} failed.`)

  // Compile to Javascript:
  //Entity.search("prop:name=^AhkPet (tag:form|tag:table|tag:class)").forEach(e => compileElement(e))
  Entity.search("(tag:form|tag:table|tag:class)").forEach(e => compileElement(e))
  
  // Refresh menu:
  let miOwner = Mod.lookup("ax2js")
  MenuItem.allFromOwner(miOwner).filter(mi => mi.tags.includes("axmenuitem")).forEach(mi => mi.delete())
  let mainMenu = Element.lookupType('menu', 'MainMenu');

  let addMenuItems = (menu, curPath) => {
    for(let item of menu?.rels.item||[]){
      if(item.type == "submenu"){
        addMenuItems(item, `${curPath}/${item.label.replaceAll("/", '-')}`)
      } else if(item.type == "item"){
        let mi = new MenuItem(item.label, curPath,  `/ax/mi/${item.menuItemName}`, miOwner, "system")
        mi.tag("axmenuitem")
      }
    }
  }

  for(let mainMenuItem of (mainMenu.rels.item||[])){
    let menu = mainMenuItem.related.menu;
    addMenuItems(menu, `/${menu?.label||mainMenuItem.name}`)
  }
  generateMenu();
}
