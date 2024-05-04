const { Types } = require('mongoose')
const {
  getAllDistributers,
  getDistributerById,
  addDistributer,
  updateDistributer,
  deleteDistributer
} = require('../repositories/distributer.repo')
const { MethodFailureError, BadRequestError, NotFoundError } = require('../core/error.response')
const { isValidObjectId } = require('../utils')

class DistributerService {
  static async getAllDistributers({ limit, sort, page } = {}) {
    const filter = { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] }
    const distributers = await getAllDistributers({ limit, sort, page, filter })
    return distributers
  }

  static async getDistributerById({ distributerId }) {
    if (!distributerId) throw new BadRequestError('Distributer id is required')
    if (!isValidObjectId(distributerId)) {
      throw new BadRequestError('Invalid distributer id')
    }

    const foundDistributer = await getDistributerById({ distributerId })
    if (!foundDistributer) {
      throw new NotFoundError('Distributer not found')
    }

    return foundDistributer
  }

  static async addDistributer({ distributerData }) {
    if (!distributerData) throw new BadRequestError('Distributer data is required')
    const newDistributer = await addDistributer({ distributerData })
    return newDistributer
  }

  static async updateDistributer({ distributerId, distributerData }) {
    if (!distributerId) throw new BadRequestError('Distributer id is required')
    if (!isValidObjectId(distributerId)) {
      throw new BadRequestError('Invalid distributer id')
    }

    const updatedDistributer = await updateDistributer({ distributerId, distributerData })
    if (!updatedDistributer) {
      throw new MethodFailureError('Failed to update distributer')
    }

    return updatedDistributer
  }

  static async deleteDistributer({ distributerId }) {
    if (!distributerId) throw new BadRequestError('Distributer id is required')
    if (!isValidObjectId(distributerId)) {
      throw new BadRequestError('Invalid distributer id')
    }

    const deletedDistributer = await deleteDistributer({ distributerId })
    if (!deletedDistributer) {
      throw new MethodFailureError('Failed to delete distributer')
    }

    return deletedDistributer
  }
}

module.exports = DistributerService
