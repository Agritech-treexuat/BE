'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'GardenServiceRequest'
const COLLECTION_NAME = 'GardenServiceRequests'

const gardenServiceRequesSchema = new Schema(
  {
    time: Date,
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm' },
    gardenServiceTemplate: { type: Schema.Types.ObjectId, ref: 'GardenServiceTemplate' },
    herbList: [{ type: Schema.Types.ObjectId, ref: 'Plant' }],
    leafyList: [{ type: Schema.Types.ObjectId, ref: 'Plant' }],
    rootList: [{ type: Schema.Types.ObjectId, ref: 'Plant' }],
    fruitList: [{ type: Schema.Types.ObjectId, ref: 'Plant' }],
    note: String,
    status: {
      type: String,
      enum: ['accepted', 'rejected', 'waiting'],
      defailt: 'waiting'
    }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

module.exports = {
  gardenServiceRequest: model(DOCUMENT_NAME, gardenServiceRequesSchema)
}
