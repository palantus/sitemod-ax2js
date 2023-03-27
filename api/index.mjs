import ax from './routes/ax.mjs';
import axQL from "./graphql/ax.mjs";
import meta from './routes/meta.js';

export default (app, graphQLFields) => {

  ax(app)
	meta(app);
  
  axQL.registerQueries(graphQLFields)

  return app
}