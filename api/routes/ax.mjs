import express from "express"
import { compileAll } from "../../services/compile.mjs";
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
    readMetadata()
      .catch(err => {
        res.json({success: false, error: err})
      })
      .then(() => {
        res.json({success: true})
      })
  });

  route.post('/compile', function (req, res, next) {
    compileAll()
      .then(() => {
        res.json({success: true})
      })
      .catch(err => {
        console.log(err)
        res.json({success: false, error: err})
      })
  });
};