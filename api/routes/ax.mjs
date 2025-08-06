import express from "express"
import { compile, generateAST, refreshMenu } from "../../services/compile.mjs";
import { readMetadata } from "../../services/read-input-metadata.mjs";
const { Router, Request, Response } = express;
const route = Router();

export default (app) => {

  const route = Router();
  app.use("/ax", route)

  route.get('/', function (req, res, next) {
    res.json({message: "Hello World!"})
  });

  route.post('/read-metadata', function (req, res, next) {
    readMetadata(req.body.id||nul)
      .then(() => {
        res.json({success: true})
      })
      .catch(err => {
        console.log(err)
        res.json({success: false, error: err})
      })
  });

  route.post('/gen-ast', function (req, res, next) {
    generateAST(req.body.id||nul)
      .then(() => {
        res.json({success: true})
      })
      .catch(err => {
        console.log(err)
        res.json({success: false, error: err})
      })
  });

  route.post('/compile', function (req, res, next) {
    compile(req.body.id||nul)
      .then(() => {
        res.json({success: true})
      })
      .catch(err => {
        console.log(err)
        res.json({success: false, error: err})
      })
  });

  route.post('/refresh-menu', function (req, res, next) {
    refreshMenu(req.body.id||nul)
      .then(() => {
        res.json({success: true})
      })
      .catch(err => {
        console.log(err)
        res.json({success: false, error: err})
      })
  });
};
