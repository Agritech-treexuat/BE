'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Farm'
const COLLECTION_NAME = 'Farms'

const farmSchema = new Schema(
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
    password: {
      type: String,
      require: true
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
    cameraId: {
      type: String
    },
    district: {
      type: String
    },
    address: {
      type: String
    },
    plant: {
      type: Array,
      default: []
    },
    roles: {
      type: Array,
      default: []
    }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

// createindex for search
farmSchema.index({ name: 'text', description: 'text' })

// Document middleware: run before .save() and .create()
farmSchema.pre('save', function (next) {
  this.name_slug = slugify(this.name, { lower: true })
  next()
})

module.exports = model(DOCUMENT_NAME, farmSchema)
