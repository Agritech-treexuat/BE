'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'QR'
const COLLECTION_NAME = 'QRs'

const qrSchema = new Schema(
  {
    privateId: String,
    isScanned: Boolean,
    time: Date,
    timeScanned: Date,
    txExport: String,
    txScan: String,
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    output: { type: Schema.Types.ObjectId, ref: 'Project.output' },
    distributer: { type: Schema.Types.ObjectId, ref: 'Distributer' },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    purchaseInfo: String
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

module.exports = {
  qr: model(DOCUMENT_NAME, qrSchema)
}
