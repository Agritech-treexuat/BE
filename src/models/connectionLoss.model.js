'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'ConnectionLoss'
const COLLECTION_NAME = 'ConnectionLosses'

const connectionLossSchema = new Schema(
  {
    camera_id: { type: Schema.Types.ObjectId, ref: 'Camera' },
    start_time: Date,
    end_time: Date
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

module.exports = {
  connectionLoss: model(DOCUMENT_NAME, connectionLossSchema)
}
