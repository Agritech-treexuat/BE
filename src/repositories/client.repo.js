'use strict'

const { client } = require('../models/client.model')
const { Types } = require('mongoose')

const getClientById = async ({ clientId }) => {
  return await client.findOne({ _id: new Types.ObjectId(clientId) }).exec()
}

const getAllClients = async () => {
  return await client.find({ $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] }).exec()
}

const updateClient = async ({ clientId, data }) => {
  return await client.findOneAndUpdate({ _id: new Types.ObjectId(clientId) }, data, { new: true }).exec()
}

const deleteClient = async ({ clientId }) => {
  const bodyUpdate = {
    isDeleted: true,
    deletedAt: new Date()
  }
  return await client.findByIdAndUpdate(clientId, bodyUpdate, { new: true }).exec()
}

module.exports = {
  getClientById,
  getAllClients,
  updateClient,
  deleteClient
}
