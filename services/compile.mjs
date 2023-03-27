import {genAST, initASTParser, status} from "./compiler/ast-gen.mjs"
import {compileElement, initJSCompiler} from "./compiler/js-gen.mjs"
import Entity from "entitystorage"

export async function compileAll(){
  await Promise.all([
    initASTParser(),
    initJSCompiler()
  ])
    
  // Generate AST:
  Entity.search("xpp.tag:xpp element.prop:name=^AhkPet").forEach(e => genAST(e))
  let s = status()
  console.log(`Generated AST for ${s.success} of ${s.total} functions. The remaining ${s.failed} failed.`)

  // Compile to Javascript:
  Entity.search("prop:name=^AhkPet (tag:form|tag:table|tag:class)").forEach(e => compileElement(e))
}