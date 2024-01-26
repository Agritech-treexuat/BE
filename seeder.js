// seeder.js
const mongoose = require('mongoose')
const { faker } = require('@faker-js/faker')
const { seed } = require('./src/models/seed.model') // Update with your path to the seed model
const { plant } = require('./src/models/plant.model') // Update with your path to the plant model
const { plantFarming } = require('./src/models/plantFarming.model') // Update with your path to the plantFarming model
require('./src/dbs/init.mongodb')

async function deleteAllDocuments() {
  await seed.deleteMany({})
  await plant.deleteMany({})
  await plantFarming.deleteMany({})
  console.log('All documents deleted')
}

async function seedData() {
  for (let i = 0; i < 10; i++) {
    // This will create 100 fake seeds and 10 plants
    let plantItem = new plant({
      plant_name: faker.commerce.productName(),
      plant_thumb: faker.image.url(),
      plant_description: faker.lorem.sentence(),
      plant_type: ['herb', 'leafy', 'root', 'fruit'].at(faker.number.int() % 4),
      timeCultivates: [{ start: (faker.number.int() % 12) + 1, end: (faker.number.int() % 12) + 1 }],
      bestTimeCultivate: { start: (faker.number.int() % 12) + 1, end: (faker.number.int() % 12) + 1 },
      farmingTime: (faker.number.int() % 200) + 1,
      harvestTime: (faker.number.int() % 100) + 1,
      farm: new mongoose.Types.ObjectId('6597b90a0730b4164d7f9c7a')

      // Add more fields as needed
    })
    try {
      await plantItem.save()
    } catch (error) {
      console.error(`Error while saving plantItem: ${error}`)
    }

    if (plantItem)
      for (let j = 0; j < 5; j++) {
        let seedItem = new seed({
          plant: plantItem._id,
          seed_name: faker.commerce.productName(),
          seed_description: faker.lorem.sentence(),
          seed_thumb: faker.image.url(),
          isSeedDefault: j == 0 ? true : false
          // Add more fields as needed
        })
        try {
          await seedItem.save()
        } catch (error) {
          console.error(`Error while saving plantItem: ${error}`)
        }

        let plantFarmingItem = new plantFarming({
          seed: seedItem._id,
          plant: plantItem._id,

          cultivationActivities: [{ name: faker.lorem.sentence(), description: faker.lorem.sentence() }],
          plantingActivity: { density: faker.lorem.sentence(), description: faker.lorem.sentence() },
          fertilizationActivities: [
            {
              fertilizationTime: faker.lorem.sentence(),
              type: ['baseFertilizer', 'topFertilizer'].at(faker.number.int() % 2),
              description: faker.lorem.sentence()
            }
          ],
          pestAndDiseaseControlActivities: [
            {
              name: faker.lorem.sentence(),
              type: ['pest', 'disease'].at(faker.number.int() % 2),
              symptoms: faker.lorem.sentence(),
              description: faker.lorem.sentence(),
              solution: [faker.lorem.sentence()],
              note: faker.lorem.sentence()
            }
          ],

          timeCultivates: [{ start: (faker.number.int() % 12) + 1, end: (faker.number.int() % 12) + 1 }],
          bestTimeCultivate: { start: (faker.number.int() % 12) + 1, end: (faker.number.int() % 12) + 1 },
          farmingTime: (faker.number.int() % 200) + 1,
          harvestTime: (faker.number.int() % 100) + 1,
          isPlantFarmingDefault: true
          // Add more fields as needed
        })
        try {
          await plantFarmingItem.save()
        } catch (error) {
          console.error(`Error while saving plantItem: ${error}`)
        }
      }
  }
  console.log('seeds and plants seeded')
  process.exit()
}

deleteAllDocuments()
seedData()
