'use strict'

const { Schema, model } = require('mongoose')
const { default: slugify } = require('slugify')

const DOCUMENT_NAME = 'Distributer'
const COLLECTION_NAME = 'Distributers'

const distributerSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150
    },
    email: {
      type: String,
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    description: {
      type: String
    },
    name_slug: {
      type: String
    },
    images: {
      type: String
    },
    address: {
      type: String
    }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

// createindex for search
distributerSchema.index({ name: 'text', description: 'text' })

// Document middleware: run before .save() and .create()
distributerSchema.pre('save', function (next) {
  this.name_slug = slugify(this.name, { lower: true })
  next()
})

module.exports = {
  distributer: model(DOCUMENT_NAME, distributerSchema)
}
