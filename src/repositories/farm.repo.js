const { farm } = require('../models/farm.model')
const { Types } = require('mongoose')

const getFarm = async ({ farmId }) => {
  const foundFarm = await farm
    .findOne({
      _id: new Types.ObjectId(farmId)
    })
    .exec()

  return foundFarm
}

const findFarmByEmail = async ({ email }) => {
  return await farm
    .findOne({ email })
    .select({
      email: 1,
      password: 2,
      name: 1,
      status: 1,
      roles: 1
    })
    .lean()
    .exec()
}

const updateFarm = async ({ farmId, farmInfo }) => {
  return await farm.findByIdAndUpdate(farmId, farmInfo, { new: true }).lean().exec()
}

const getAllFarms = async () => {
  return await farm.find().lean().exec()
}

module.exports = {
  getFarm,
  findFarmByEmail,
  updateFarm,
  getAllFarms
}
