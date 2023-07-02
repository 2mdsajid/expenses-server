// const { ViewModuleSharp } = require("@material-ui/icons");
const mongoose = require("mongoose")

// DeprecationWarning:
mongoose.set('strictQuery', true)

const pass = process.env.MONGOPASS
const collname = 'expenses'

// const DB = `mongodb+srv://2mdsajid:${pass}@cluster0.6ngpgkm.mongodb.net/bdays?retryWrites=true&w=majority`
const DB = `mongodb+srv://2mdsajid:${pass}@cluster0.l5ryifd.mongodb.net/${collname}?retryWrites=true&w=majority
`




mongoose.connect(DB).then(()=>{
    console.log(`connected successfully to ${collname} database`);
}).catch((err)=>{console.log('error while connecting to database')})

module.exports = mongoose.connection;
