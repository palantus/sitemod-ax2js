import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql'

export const SampleType = new GraphQLObjectType({
  name: 'AXType',
  description: 'This represents a AX',
  fields: () => ({
    message: { type: GraphQLNonNull(GraphQLString) },
  })
})

export default {
  registerQueries: (fields) => {
    fields.axsample = {
      type: SampleType,
      description: "Gets sample",
      resolve: (parent, args, context) => ({ message: "Hello World" })
    }
  }
  
}