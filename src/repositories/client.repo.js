'use strict'

const { client } = require('../models/client.model')
const { Types } = require('mongoose')

const getClientById = async ({ clientId }) => {
  return await client
    .findOne({ _id: new Types.ObjectId(clientId) })
    .populate('history.qr')
    .populate({
      path: 'history.qr',
      populate: {
        path: 'project',
        model: 'Project'
      },
      populate: {
        path: 'project',
        populate: {
          path: 'plant',
          model: 'Plant'
        }
      }
    })
    .exec()
}

const getAllClients = async () => {
  return await client
    .find({ $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] })
    .populate('history.qr')
    .exec()
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
