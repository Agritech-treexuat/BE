const { Types } = require('mongoose')
const {
  getAllTransfers,
  getTransferById,
  addTransfer,
  updateTransfer,
  deleteTransfer
} = require('../repositories/transfer.repo')
const { BadRequestError, MethodFailureError } = require('../core/error.response')
const { isValidObjectId } = require('../utils')

class TransferService {
  static async getAllTransfers() {
    const transfers = await getAllTransfers()
    return transfers
  }

  static async getTransferById({ transferId }) {
    if (!transferId) throw new BadRequestError('Transfer id is required')
    if (!isValidObjectId(transferId)) {
      throw new BadRequestError('Invalid transfer id')
    }

    const foundTransfer = await getTransferById({ transferId })
    if (!foundTransfer) {
      throw new NotFoundError('Transfer not found')
    }

    return foundTransfer
  }

  static async addTransfer({ data }) {
    if (!data) throw new BadRequestError('Transfer data is required')
    const { farm, tx, amount, time } = data
    if (!farm) throw new BadRequestError('Farm is required')
    if (!tx) throw new BadRequestError('Transaction is required')
    if (!amount) throw new BadRequestError('Amount is required')
    if (!time) throw new BadRequestError('Time is required')
    if (!isValidObjectId(farm)) {
      throw new BadRequestError('Invalid farm id')
    }
    if (typeof amount !== 'number') {
      throw new BadRequestError('Amount must be a number')
    }
    if (amount <= 0) {
      throw new BadRequestError('Amount must be greater than 0')
    }
    const newTransfer = await addTransfer({
      data: {
        farm: new Types.ObjectId(farm),
        tx,
        amount,
        time
      }
    })
    return newTransfer
  }

  static async updateTransfer({ transferId, data }) {
    if (!transferId) throw new BadRequestError('Transfer id is required')
    if (!isValidObjectId(transferId)) {
      throw new BadRequestError('Invalid transfer id')
    }

    const { farm, tx, amount, time } = data
    if (farm && !isValidObjectId(farm)) {
      throw new BadRequestError('Invalid farm id')
    }
    if (amount && typeof amount !== 'number') {
      throw new BadRequestError('Amount must be a number')
    }
    if (amount && amount <= 0) {
      throw new BadRequestError('Amount must be greater than 0')
    }

    const dataUpdate = {}
    if (farm) dataUpdate.farm = new Types.ObjectId(farm)
    if (tx) dataUpdate.tx = tx
    if (amount) dataUpdate.amount = amount
    if (time) dataUpdate.time = time

    const updatedTransfer = await updateTransfer({ transferId, data: dataUpdate })
    if (!updatedTransfer) {
      throw new MethodFailureError('Failed to update transfer')
    }

    return updatedTransfer
  }

  static async deleteTransfer({ transferId }) {
    if (!transferId) throw new BadRequestError('Transfer id is required')
    if (!isValidObjectId(transferId)) {
      throw new BadRequestError('Invalid transfer id')
    }

    const deletedTransfer = await deleteTransfer({ transferId })
    if (!deletedTransfer) {
      throw new MethodFailureError('Failed to delete transfer')
    }

    return deletedTransfer
  }
}

module.exports = TransferService
