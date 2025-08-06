import Entity, { query } from "entitystorage"

export default class Element extends Entity{
    
  initNew(type, name){
    this.type = type;
    this.name = name;
    this.tag("element")
  }

  static async init(){
    await Entity.init("./data");
}

  static lookup(id){
    return Element.find("id:" + id)
}

  static lookupType(type, name){
    return Element.find(`tag:element prop:type=${type} prop:name=${name}`)
}

  static allByType(type){
    return query.tag('element').prop('type', type).all;
  }

  static all(){
    return query.tag('element').all;
  }

  toObj(){
    let obj = {id: this._id}
    Object.assign(obj, this.props);
    obj.children = this.rels
    let genPath = (e, curPathElements) => {
      if(e.tags.includes("element"))
        return curPathElements;
      let rels = e.relsrev;
      let rel = rels ? Object.keys(rels).find(k => k != "element") : null;
      let parent = rel ? rels[rel]?.[0] : null;
      if(parent){
        curPathElements.push({id: parent._id, name: parent.name, type: parent.type || null});
        return genPath(parent, curPathElements);
      }
      return curPathElements;
    }
    obj.elementSubPath = genPath(this, []);
    for(let rel in obj.children){
      if(rel == "element" || rel == "xpp" || rel == "js" || rel == "ast"){
        obj.parentElementId = obj.children[rel][0]._id
        delete obj.children[rel]
      } else {
        /*
        if(this.tags.includes("formcontrol") && rel == "tablefield")
          obj[rel] = obj.children[rel][0].toObj();
        else if(this.tags.includes("tablefield") && rel == "type")
          obj[rel] = obj.children[rel][0].toObj();
        else
        */
        obj.children[rel] = obj.children[rel].map(e => Element.from(e).toObj())
      }
    }

    if(!obj.type) obj.type = this.tags[0] || null;

    return obj;
  }
}
