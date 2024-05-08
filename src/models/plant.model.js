'use strict'

const { Schema, model } = require('mongoose')
const slugify = require('slugify')

const DOCUMENT_NAME = 'Plant'
const COLLECTION_NAME = 'Plants'

const plantSchema = new Schema(
  {
    farm: { type: Schema.Types.ObjectId, ref: 'Farm' },
    plant_name: { type: String, require: true },
    plant_thumb: { type: String, require: true },
    plant_description: { type: String, require: true },
    plant_slug: String,
    plant_type: {
      type: String,
      require: true,
      enum: ['herb', 'leafy', 'root', 'fruit']
    },
    isActive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

// createindex for search
plantSchema.index({ plant_name: 'text', plant_description: 'text' })

// Document middleware: run before .save() and .create()
plantSchema.pre('save', function (next) {
  this.plant_slug = slugify(this.plant_name, { lower: true })
  next()
})

module.exports = {
  plant: model(DOCUMENT_NAME, plantSchema)
}
