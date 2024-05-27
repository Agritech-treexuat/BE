'use strict'
const ClientService = require('../services/client.service')
const { SuccessResponse } = require('../core/success.response')

class ClientController {
  async getClientById(req, res, next) {
    new SuccessResponse({
      message: 'Get client by id success!',
      metadata: await ClientService.getClientById({
        clientId: req.params.clientId
      })
    }).send(res)
  }

  async getAllClients(req, res, next) {
    new SuccessResponse({
      message: 'Get all clients success!',
      metadata: await ClientService.getAllClients()
    }).send(res)
  }

  async updateClient(req, res, next) {
    new SuccessResponse({
      message: 'Update client success!',
      metadata: await ClientService.updateClient({
        clientId: req.user.userId,
        data: req.body
      })
    }).send(res)
  }

  async updateClientByAdmin(req, res, next) {
    new SuccessResponse({
      message: 'Update client by admin success!',
      metadata: await ClientService.updateClient({
        clientId: req.params.clientId,
        data: req.body
      })
    }).send(res)
  }

  async deleteClient(req, res, next) {
    new SuccessResponse({
      message: 'Delete client success!',
      metadata: await ClientService.deleteClient({
        clientId: req.params.clientId
      })
    }).send(res)
  }
}

module.exports = new ClientController()
