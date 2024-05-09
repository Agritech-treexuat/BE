'use strict'
const { Types } = require('mongoose')
const { findFarmByEmail, getFarm, updateFarm, getAllFarms } = require('../repositories/farm.repo')
const { BadRequestError, MethodFailureError } = require('../core/error.response')
const { removeUndefinedObject, isValidObjectId } = require('../utils')
const { findUserByEmail, getUser } = require('./user.service')
const { getOutput, getAllProjectOutputByFarmId } = require('./project.service')

class FarmService {
  static async findByEmail({ email }) {
    if (!email) {
      throw new BadRequestError('Email is required')
    }
    return await findFarmByEmail({ email })
  }

  static async getFarm({ farmId }) {
    if (!farmId) {
      throw new BadRequestError('Farm ID is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Farm ID is invalid')
    }
    return await getFarm({ farmId })
  }

  static async updateInfoFarm({ farmId, farm }) {
    if (!farmId) {
      throw new BadRequestError('Farm ID is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Farm ID is invalid')
    }
    if (!farm) {
      throw new BadRequestError('Farm is required')
    }

    const { name, description, status, district, address, images, lat, lng, phone, email } = farm

    return await updateFarm({
      farmId,
      farmInfo: removeUndefinedObject({
        name,
        description,
        status,
        district,
        address,
        images,
        lat,
        lng,
        phone,
        email
      })
    })
  }

  static async getAllFarms() {
    const farms = await getAllFarms()
    if (!farms || farms.length === 0) {
      return []
    }
    // map farms and get email from user has the same _id with farm and return new array
    const farmWithUser = await Promise.all(
      farms.map(async (farm) => {
        const user = await getUser({ userId: farm._id.toString() })
        return {
          _id: farm._id,
          name: farm.name,
          description: farm.description,
          status: farm.status,
          district: farm.district,
          address: farm.address,
          createdAt: farm.createdAt,
          email: user.email,
          roles: user.roles[0],
          walletAddress: farm.walletAddress
        }
      })
    )

    const allFarms = farmWithUser.filter((farm) => farm.roles === 'FARM')

    return allFarms
  }

  static async updateStatusFarm({ farmId, status }) {
    if (!farmId) {
      throw new BadRequestError('Farm ID is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Farm ID is invalid')
    }
    if (!status) {
      throw new BadRequestError('Status is required')
    }
    if (status !== 'active' && status !== 'inactive') {
      throw new BadRequestError('Status is invalid')
    }

    console.log('farmId', farmId)
    console.log('status', status)
    const updatedFarm = await updateFarm({ farmId, farmInfo: { status } })

    if (!updatedFarm) {
      throw new MethodFailureError('Update farm status failed')
    }

    return updatedFarm
  }

  static async updateWalletAddress({ farmId, walletAddress }) {
    if (!farmId) {
      throw new BadRequestError('Farm ID is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Farm ID is invalid')
    }
    if (!walletAddress && walletAddress !== '') {
      throw new BadRequestError('Wallet address is required')
    }

    const updatedFarm = await updateFarm({ farmId, farmInfo: { walletAddress } })

    if (!updatedFarm) {
      throw new MethodFailureError('Update farm wallet address failed')
    }

    return updatedFarm
  }

  static async getDistributorsByFarmId({ farmId }) {
    try {
      const projects = await getAllProjectOutputByFarmId({ farmId })

      // Collect distributors from projects
      const distributors = new Map() // Using a Map to ensure uniqueness
      projects.forEach((project) => {
        project.output.forEach((out) => {
          out.distributerWithAmount.forEach((distributer) => {
            const distributerId = distributer.distributer._id.toString()
            const distributerName = distributer.distributer.name // Assuming the distributer schema has a name field
            const amount = distributer.amount
            if (!distributors.has(distributerId)) {
              distributors.set(distributerId, { _id: distributerId, name: distributerName, totalAmount: amount })
            } else {
              distributors.get(distributerId).totalAmount += amount
            }
          })
        })
      })

      // Convert Map to Array
      const result = Array.from(distributors.values())

      return result
    } catch (error) {
      throw new Error('Error getting distributors by farmId: ' + error.message)
    }
  }
}

module.exports = FarmService
