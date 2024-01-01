const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://garilasssss:${password}@cluster0.may4kvw.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Phone = mongoose.model('Phone', phoneSchema)

if (process.argv.length === 5) {
  const phone = new Phone({
    name: process.argv[3],
    number: process.argv[4],
  })

  phone.save().then((result) => {
    console.log(`Added ${result.name} ${result.number}`)
    mongoose.connection.close()
  })
}

if (process.argv.length === 3) {
  console.log('phonebook:')
  Phone.find({}).then((result) => {
    result.forEach((phone) => {
      console.log(`${phone.name} ${phone.number}`)
    })
    mongoose.connection.close()
  })
}
