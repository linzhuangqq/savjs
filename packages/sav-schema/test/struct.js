import test from 'ava'
import {expect} from 'chai'
import {Schema} from '../src/Schema.js'

test('SchemaStruct', t => {
  let schema = new Schema()
  let User = schema.declare({
    props: {
      name: String,
      age: {
        type: Number
      }
    }
  })
  expect(User.create()).to.eql({name: '', age: 0})
  expect(User.fieldByName('name')).to.be.a('object')
  expect(User.fieldByName('age')).to.be.a('object')
  expect(User.fieldByName('nofound')).to.eql(undefined)
  expect(User.extract({name: 'a', age: 10, sex: 1})).to.eql({name: 'a', age: 10})
  t.pass()
})

test('SchemaStruct.Ref', t => {
  let schema = new Schema()
  schema.declare({
    name: 'Sex',
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  })
  let User = schema.declare({
    props: [
      {name: 'name', type: 'String'},
      {name: 'age', type: Number},
      {name: 'sex', type: 'Sex'}
    ]
  })
  expect(User.create()).to.eql({name: '', age: 0, sex: 1})
  expect(User.extract({name: 'a', age: 10, sex: 1})).to.eql({name: 'a', age: 10, sex: 1})
  t.pass()
})
