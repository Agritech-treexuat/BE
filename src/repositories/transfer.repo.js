'use strict'

const { transfer } = require('../models/transfer.model')
const { Types } = require('mongoose')

const getTransferById = async ({ transferId }) => {
  return await transfer
    .findOne({ _id: new Types.ObjectId(transferId) })
    .populate('farm')
    .exec()
}

const getAllTransfers = async () => {
  return await transfer
    .find({ $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] })
    .populate('farm')
    .exec()
}

const addTransfer = async ({ data }) => {
  return await transfer.create(data)
}

const updateTransfer = async ({ transferId, data }) => {
  return await transfer.findOneAndUpdate({ _id: new Types.ObjectId(transferId) }, data, { new: true }).exec()
}

const deleteTransfer = async ({ transferId }) => {
  const bodyUpdate = {
    isDeleted: true,
    deletedAt: new Date()
  }
  return await transfer.findByIdAndUpdate(transferId, bodyUpdate, { new: true }).exec()
}

module.exports = {
  getTransferById,
  getAllTransfers,
  addTransfer,
  updateTransfer,
  deleteTransfer
}
