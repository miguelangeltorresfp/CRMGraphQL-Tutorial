const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) => {
  // console.log(usuario);
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
};

// Resolvers
const resolvers = {
  Query: {
    // (parent, args, context, info)
    obtenerUsuario: async (_, { token }) => {
      const usuarioId = await jwt.verify(token, process.env.SECRETA);
      return usuarioId;
    },
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      // revisar si el producto existe o no
      const producto = await Producto.findById(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      return producto;
    },
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({
          vendedor: ctx.usuario.id.toString(), // no sería necesario pasarlo a string
        });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, { id }, ctx) => {
      // Revisar si el cliente existe o no
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }
      // Quien lo creo puede verlo
      if (cliente.vendedor.toString() !== ctx.usuario.id.toString()) {
        throw new Error('No tienes las credenciales');
      }

      return cliente;
    },
  },
  Mutation: {
    // (parent, args, context, info)
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input || {};

      // Revisar si el usuario ya está registrado
      const existeUsuario = await Usuario.findOne({ email });
      if (existeUsuario) {
        throw new Error('El usuario ya está registrado');
      }
      // Hashear su password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      try {
        // Guardarlo en la base de datos
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {}
      console.error(error);
    },
    // (parent, args, context, info)
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;
      // Si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw new Error('El usuario no existe');
      }

      // Revisar si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );
      if (!passwordCorrecto) {
        throw new Error('El Password es Incorrecto');
      }
      // Crear el token
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, '24h'),
      };
    },
    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);

        // Almacenar en la bd
        const resultado = await producto.save();

        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      // revisar si el producto existe o no
      let producto = await Producto.findById(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // guardarlo en la base de datos ( new:true para que retorne el registro actualizado )
      producto = await Producto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return producto;
    },
    eliminarProducto: async (_, { id }) => {
      // revisar si el producto existe o no
      let producto = await Producto.findById(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Eliminar
      await Producto.findOneAndDelete({ _id: id });

      return 'Producto eliminado';
    },
    nuevoCliente: async (_, { input }, ctx) => {
      // console.log('ctx: ', ctx);

      const { email } = input;
      // Verificar si el cliente ya está registrado
      console.log(input);
      const cliente = await Cliente.findOne({ email });
      if (cliente) {
        throw new Error('Ese cliente ya está registrado');
      }

      const nuevoCliente = new Cliente(input);

      // Asignar el vendedor
      nuevoCliente.vendedor = ctx.usuario.id;

      // Guardarlo en la base de datos
      try {
        const resultado = await nuevoCliente.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente: async (_, { id, input }, ctx) => {
      // Verificar si existe o no
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error('Ese cliente no existe');
      }

      // Verificar si el vendedor es quien edita
      if (cliente.vendedor.toString() !== ctx.usuario.id.toString()) {
        throw new Error('No tienes las credenciales');
      }

      // Guardar el cliente
      cliente = await Cliente.findByIdAndUpdate(id, input, {
        new: true,
      });
      return cliente;
    },
    eliminarCliente: async (_, { id }, ctx) => {
      // Verificar si existe o no
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error('Ese cliente no existe');
      }

      // Verificar si el vendedor es quien edita
      if (cliente.vendedor.toString() !== ctx.usuario.id.toString()) {
        throw new Error('No tienes las credenciales');
      }

      // Eliminar Cliente
      await Cliente.findByIdAndDelete(id);
      return 'Ciente eliminado';
    },
  },
};

module.exports = resolvers;
