import express from "express"
import Element from "../../models/element.mjs"
import service from "../../services/meta.mjs";

const route = express.Router();

export default (app) => {

  app.use("/meta", route)

  route.get('/', function (req, res, next) {
    res.json(Element.search("tag:element").map(e => { return { id: e._id, name: e.name, type: e.type } })
              .concat(Element.search("tag:tablefield").map(e => { return { id: e._id, name: e.name, type: "tablefield", tableId: e.related?.element?._id}})))
  });

  route.get('/labels', async function (req, res, next) {
    res.json(await service.getLabels())
  });

  route.get('/fieldEnumMapping', async function (req, res, next) {
    let result = Element.search(`tag:tablefield type.prop:type=enum`).reduce((obj, f) => {
      if(!obj[f.related.element.name]) obj[f.related.element.name] = {}
      obj[f.related.element.name][f.name] = f.related.type.rels.value.reduce((valueObj, v) => {
        valueObj[v.name] = v.value || 0
        return valueObj;
      }, {})
      return obj;
    }, {})
    res.json(result)
  });

  route.get('/elements/:type', (req, res) => {
    res.json(Element.allByType(req.params.type).map(t => ({id: t._id, name: t.name})));
  })
  
  route.get('/types', (req, res) => {
    res.json([...Element.all().reduce((set, cur) => {set.add(cur.type);return set}, new Set())]);
  })

  route.get('/form/:name/:control/:func.xpp', function (req, res, next) {
    let form = Element.lookupType("form", req.params.name)
    let element = Element.find(`(tag:formcontrol|tag:fds) element.id:${form} prop:name=${req.params.control}`)
    let func = req.params.func == "declaration" ? element?.related.declaration : element?.rels.function?.find(f => f.name == req.params.func)
    res.setHeader('content-type', 'text/plain');
    res.send(func?.related?.xpp?.source||null)
  });

  route.get('/form/:name/:control/:func-ast.json', function (req, res, next) {
    let form = Element.lookupType("form", req.params.name)
    let element = Element.find(`tag:formcontrol element.id:${form} prop:name=${req.params.control}`)
    let func = req.params.func == "declaration" ? element?.related.declaration : element?.rels.function?.find(f => f.name == req.params.func)
    res.json(func?.related?.ast?.source||null)
  });

  route.get('/:type/:name/:func.xpp', function (req, res, next) {
    let element = Element.lookupType(req.params.type, req.params.name)
    let func = req.params.func == "declaration" ? element?.related.declaration : element?.rels.function?.find(f => f.name == req.params.func)
    res.setHeader('content-type', 'text/plain');
    res.send(func?.related?.xpp?.source||null)
  });

  route.get('/:type/:name/:func-ast.json', function (req, res, next) {
    let element = Element.lookupType(req.params.type, req.params.name)
    let func = req.params.func == "declaration" ? element?.related.declaration : element?.rels.function?.find(f => f.name == req.params.func)
    res.json(func?.related?.ast?.source||null)
  });

  route.get('/:type/:name.mjs', function (req, res, next) {
    let element = Element.lookupType(req.params.type, req.params.name)
    res.setHeader('content-type', 'application/javascript');
    let source = element?.related?.js?.source
    if(!source){
      switch(element.type){
        case "class":
          source = `export default class ${element.name}{}`
          break;
        case "form":
          source = `import FormRun from '/e/class/FormRun.mjs'\nexport default class ${element.name} extends FormRun{}`
          break;
        case "table":
          source = `import Common from '/e/class/Common.mjs'\nexport default class ${element.name} extends Common{TableId = ${element._id}}`
          break;
      }
    }
      return res.send(source)
    res.send(element?.related?.js?.source || (element?`export default class ${element.name}{}`: null))
  });

  route.get('/:id/xpp', function (req, res, next) {
    let xpp = Element.lookup(req.params.id)?.related.xpp?.source;
    if(!xpp) return res.sendStatus(404);
    res.setHeader('content-type', 'text/plain');
    res.send(xpp)
  });
  
  route.get('/:id/js', function (req, res, next) {
    let xpp = Element.lookup(req.params.id)?.related.js?.source;
    if(!xpp) return res.sendStatus(404);
    res.setHeader('content-type', 'text/plain');
    res.send(xpp)
  });
  
  route.get('/:id/ast', function (req, res, next) {
    let ast = Element.lookup(req.params.id)?.related.ast?.source;
    if(!ast) return res.sendStatus(404);
    res.json(ast)
  });
  
  route.get('/:type/:name', function (req, res, next) {
    res.json(Element.lookupType(req.params.type, req.params.name)?.toObj())
  });

  route.get('/:id', function (req, res, next) {
    res.json(Element.lookup(req.params.id).toObj())
  });

};
