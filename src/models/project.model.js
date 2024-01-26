'use strict'

const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Project'
const COLLECTION_NAME = 'Projects'

const historyProcess = new Schema({
  tx: String,
  time: Date,
  type: {
    type: String,
    enum: ['cultivation', 'planting', 'fertilize', 'pesticide', 'other']
  },
  cultivationActivity: {
    name: String,
    description: String
  },
  plantingActivity: {
    density: String,
    description: String
  },
  fertilizationActivity: {
    fertilizationTime: String,
    type: {
      type: String,
      enum: ['baseFertilizer', 'topFertilizer']
    },
    description: String
  },
  pestAndDiseaseControlActivity: {
    name: String,
    type: {
      type: String,
      enum: ['pest', 'disease']
    },
    symptoms: String,
    description: String,
    solution: [String],
    note: String
  },
  other: {
    description: String
  },
  modifiedAt: Date
})

const process = new Schema({
  tx: String,
  time: Date,
  type: {
    type: String,
    enum: ['cultivation', 'planting', 'fertilize', 'pesticide', 'other']
  },
  isEdited: Boolean,
  cultivationActivity: {
    name: String,
    description: String
  },
  plantingActivity: {
    density: String,
    description: String
  },
  fertilizationActivity: {
    fertilizationTime: String,
    type: {
      type: String,
      enum: ['baseFertilizer', 'topFertilizer']
    },
    description: String
  },
  pestAndDiseaseControlActivity: {
    name: String,
    type: {
      type: String,
      enum: ['pest', 'disease']
    },
    symptoms: String,
    description: String,
    solution: [String],
    note: String
  },
  other: {
    description: String
  },
  historyProcess: [historyProcess]
})

const historyExpect = new Schema({
  tx: String,
  time: Date,
  amount: Number,
  note: String,
  modifiedAt: Date
})

const expect = new Schema({
  tx: String,
  time: Date,
  amount: Number,
  note: String,
  isEdited: Boolean,
  historyExpect: [historyExpect]
})

const distributerWithAmount = new Schema({
  distributer: { type: Schema.Types.ObjectId, ref: 'Distributer' },
  amount: Number
})

const historyOutput = new Schema({
  tx: String,
  time: Date,
  amount: Number,
  amountPerOne: Number,
  images: [String],
  distributerWithAmount: [distributerWithAmount],
  exportQR: Boolean,
  modifiedAt: Date
})

const output = new Schema({
  tx: String,
  time: Date,
  amount: Number,
  amountPerOne: Number,
  images: [String],
  distributerWithAmount: [distributerWithAmount],
  exportQR: Boolean,
  isEdited: Boolean,
  historyOutput: [historyOutput]
})

const projectSchema = new Schema(
  {
    farm: { type: Schema.Types.ObjectId, ref: 'Farm' },
    plant: { type: Schema.Types.ObjectId, ref: 'Plant' },
    seed: { type: Schema.Types.ObjectId, ref: 'Seed' },
    startDate: Date,
    square: Number,
    plantFarming: { type: Schema.Types.ObjectId, ref: 'PlantFarming' },
    process: [process],
    expect: [expect],
    output: [output],
    cameraId: [String],
    status: {
      type: String,
      enum: ['waiting', 'inProgress', 'harvesting', 'almostFinished', 'finished'],
      default: 'waiting'
    }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

module.exports = {
  project: model(DOCUMENT_NAME, projectSchema)
}
