const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    id: { type: String, unique: true }, 
    type: { type: String }, 
    linehaulId: { type: String }, 
    cluster: { type: String }, 
    carrier: { type: String }, 
    dateFirstMovement: { type: Date }, 
    status: { type: String }, 
    hasHelper: Boolean, 
    hasPlaces: { type: Number }, 
    hasBulky: Boolean, 
    substatus: { type: String }, 
    deliveryType: { type: String }, 
    facilityId: { type: String }, 
    facilityType: { type: String }, 
    initDate: { type: String }, 
    finalDate: { type: String },
    created: { type: Date, default: Date.now },
    updated: Date
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
    }
});

module.exports = mongoose.model('Shipping', schema);