'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Client'
const COLLECTION_NAME = 'Clients'

const scanHistory = new Schema({
  qr: { type: Schema.Types.ObjectId, ref: 'QR' },
  time: Date,
  purchaseInfo: String
})

const clientSchema = new Schema(
  {
    name: String,
    phone: String,
    address: String,
    map: Object,
    district: String,
    history: [scanHistory],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

module.exports = {
  client: model(DOCUMENT_NAME, clientSchema)
}
