'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Image'
const COLLECTION_NAME = 'Images'

const imageSchema = new Schema(
  {
    camera_id: { type: Schema.Types.ObjectId, ref: 'Camera' },
    capture_time: Date,
    image_url: String,
    tx_hash: String,
    image_hash: String,
    timeDescription: String
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

module.exports = {
  image: model(DOCUMENT_NAME, imageSchema)
}
