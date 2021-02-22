const { model, Schema, now } = require('mongoose')

const newVilleSchema = new Schema({
    nom: {
        type: String,
        require: true
    },
    data: {
        latitude: {
            type: String,
            require: true
        },
        longitude: {
            type: String,
            require: true
        },
        createdAt:
        {
            type: Date,
            default: now
        }
    }
});

module.exports = model('Ville', newVilleSchema)