const mongoose = require('mongoose');

const ProductosSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  existencia: {
    type: Number,
    require: true,
    trim: true,
  },
  precio: {
    type: Number,
    required: true,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
});

// Creamos un índex de tipo texto usando el campo nombre para hacer búsquedas de productos
// https://www.it-swarm.dev/es/javascript/la-mejor-manera-de-realizar-una-busqueda-de-texto-completo-en-mongodb-y-mongoose/1050857379/
// https://docs.mongodb.com/manual/core/index-text/
ProductosSchema.index({ nombre: 'text' });

module.exports = mongoose.model('Producto', ProductosSchema);
