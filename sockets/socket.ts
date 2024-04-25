import socketIO, { Socket } from 'socket.io';
import { pool } from '../database/config';

// CREART UNA SALA DE TRABAJO
export const crearSala = async (cliente: Socket, io: socketIO.Server) => {
    cliente.on('crear-sala-trabajo', (data: any) => {
        console.log(data);
        if (!data.host_sala && !data.nombre_sala) {
            io.to(cliente.id).emit('error-msg-servidor', 'No se ha podido crear la sala');
        }
        // CREAR SALA EN AL BD
        try {
            const consulta = pool.query('INSERT INTO sala (nombre_sala, host_sala) VALUES ($1, $2)', [data.nombre_sala, data.host_sala]);
            console.log('Sala creada en la BD');
        } catch (error) {
            io.to(cliente.id).emit('error-msg-servidor', 'No se ha podido crear la sala por BD');
        }
        console.log(
            `Sala creada por: ${data.host_sala} con nombre: ${data.nombre_sala}`
        );
    });
}

// DATA DE SALA ESPECIFICA
export const dataSala = async (cliente: Socket, io: socketIO.Server) => {
    cliente.on('data-sala-trabajo', async (data: any) => {
        //console.log(data);
        if (!data.cliente && !data.nombre_sala && !data.informacion) {
            io.to(cliente.id).emit('error-msg-servidor', 'No sea recibido la información necesaria');
        }
        // GUARDAR INFORMACION DE LA SALA EN LA BD
        try {
            console.log(data);
            const consulta = await pool.query('UPDATE sala SET informacion = $1 WHERE nombre_sala = $2', [data.informacion, data.nombre_sala]);
            //console.log('Informacion guardada en la BD');
        } catch (error) {
            io.to(cliente.id).emit('error-msg-servidor', 'No sea guardo cambios de la sala en la BD');
        }
        // ENVIAR INFORMACION A LA SALA
        cliente.broadcast.to(data.nombre_sala).emit('data-sala-trabajo', data.informacion);
        console.log(
            `Informacion enviada sala: ${data.nombre_sala} cliente: ${data.cliente}`
        );
    });
}

// ENTRAR A UNA SALA
export const entrarSala = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('entrar-sala-trabajo', (data: any) => {
        console.log(data);
        if (!data.nombreSala) {
            console.log("FALTAN DATOS PARA ENTRAR A LA SALA");
            io.to(cliente.id).emit('error-msg-servidor', 'No se ha podido crear la sala');
        }
        // CREAR SALA EN AL BD
        cliente.join(data.nombreSala);
        console.log("Cliente conectado a la sala: ", data.nombreSala);
    });
}

export const desconectar = (cliente: Socket) => {
    cliente.on('disconnect', () => {
        console.log("Cliente desconectado");
    });
}

// Escuchar mensajes
export const mensaje = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('mensaje', (payload: { de: string, cuerpo: string }) => {
        console.log('Mensaje recibido', payload);
        io.emit('mensaje-nuevo', payload);
    });
}

// Escuchar Mensaje Prueba Cliente 
export const mensajePrueba = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('mensaje-cliente', (data) => {
        console.log(data);
        io.emit('mensaje-servidor', {
            de: 'Servidor',
            cuerpo: 'Mensaje recibido'
        })
    })
}