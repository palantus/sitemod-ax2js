import ClassFactory from "./ClassFactory.mjs"
import {getElementByType} from "./Metadata.mjs"
import Args from "./Args.mjs"

class MenuFunction{
  constructor(menuItemName, menuItemType){
    this.menuItemName = menuItemName
    this.menuItemType = menuItemType
  }

  static runClient(menuItemName, menuItemType, unknownArg, args){
    return new MenuFunction(menuItemName, menuItemType).run(args)
  }

  copyCallerQuery(){
    console.log("stub")
  }

  async run(args = new Args()){
    let mi = await getElementByType("menuitemdisplay", this.menuItemName)
    
    args.name(mi.object)
    
    let formRun = await ClassFactory.formRunClass(args);
    formRun.run();
    formRun.wait();
  }
}

export default MenuFunction