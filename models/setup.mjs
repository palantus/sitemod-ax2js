import Entity, { query } from "entitystorage"

export default class Setup extends Entity{
  
  initNew(){
    this.tag("ax2jssetup")
  }

  static lookup(){
    return query.type(Setup).tag("ax2jssetup").first || new Setup()
  }

  toObj(){
    return {}
  }
}