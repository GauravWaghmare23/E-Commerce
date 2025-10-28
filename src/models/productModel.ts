import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl:{
        type:String
    },
    category: {
        type: String,
        required: true
    },
    productby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    inventory: {
        type: Number,
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
},{timestamps: true})

const productModel = mongoose.models.Product || mongoose.model('Product', productSchema)
export default productModel