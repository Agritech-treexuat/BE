'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'GardenServiceTemplate'
const COLLECTION_NAME = 'GardenServiceTemplates'

const gardenServiceTemplateSchema = new Schema(
  {
    farm: { type: Schema.Types.ObjectId, ref: 'Farm' },
    square: Number,
    expectDeliveryPerWeek: Number,
    expectedOutput: Number,
    expectDeliveryAmount: Number,
    price: Number,
    herbMax: Number,
    leafyMax: Number,
    rootMax: Number,
    fruitMax: Number
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

module.exports = {
  gardenServiceTemplate: model(DOCUMENT_NAME, gardenServiceTemplateSchema)
}
