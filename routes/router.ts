import axios from "axios";
import { Request, Response, Router } from "express";
import { login, registre } from "../controller/auth.controller";
import { pool } from "../database/config";
const router = Router();


// RUTAS LOGIN Y REGISTRO
router.post("/auth/login", login);
router.post("/auth/registre", registre);

// SALA DE TRABAJO
router.post("/salaCreate", async (req: Request, res: Response) => {
  const { usuario, sala } = req.body;
  if (!usuario || !sala) {
    return res.status(400).json({ ok: false, mensaje: 'Email y password son requeridos' });
  }
  try {
    const consultaCreacion = await pool.query('INSERT INTO sala (nombre_sala, host_sala,informacion) VALUES ($1, $2, $3)', [sala, usuario, "NO TIENE INFORMACION"]);
    if (consultaCreacion.rowCount! > 0) {
      console.log('La consulta se realizó correctamente');
      res.json({
        host: usuario,
        sala,
        ok: true,
      });
    } else {
      console.log('La consulta no afectó a ninguna fila');
      res.status(409).json({ ok: false, mensaje: 'Error en la creacion de una sala' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error en consulta BD' });
  }

});
router.post("/salaData", async (req: Request, res: Response) => {
  const { sala } = req.body;
  if (!sala) {
    return res.status(400).json({ ok: false, mensaje: 'Sala es requerida' });
  }
  try {
    const consulta = await pool.query('SELECT * FROM sala WHERE nombre_sala = $1', [sala]);
    if (consulta.rowCount! > 0) {

      console.log('La consulta se realizó correctamente');
      res.json({
        sala: consulta.rows[0].nombre_sala,
        data: consulta.rows[0].informacion,
        ok: true,
      });
    } else {
      console.log('La consulta no se realizo');
      res.status(409).json({ ok: false, mensaje: 'Error en la consulta de una sala' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error en consulta BD' });
  }
});


// GRAFICA DE SALA A CODIGO
router.post("/codigoIA", async (req: Request, res: Response) => {
  const { lenguaje, info } = req.body;
  if (!lenguaje || !info) {
    return res.status(400).json({ ok: false, mensaje: 'Faltan datos requeridos' });
  } try {
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `
        ESTO SON LOS ELEMENTO DE UN DIAGRAMA DE SECUENCIA:
        ${info}
        (Solo quiero codigo de programacion no quiero nada de explicaciones argumentos opiniones 
          de parte tuya solo quiero que me des el codigo como respuesta, quiero una base para que 
          el usuario pueda guiar que lo use como una base para empezar en el lenguaje de programacion ${lenguaje}.)
        `}
      ]
    }, {
      headers: {
        "x-api-key": process.env.KEY_CLAUDE,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      }
    });
    //console.log(response);
    if (response.data && response.data.content && response.data.content.length > 0) {
      let infoCodigo = response.data.content[0].text;
      res.json({
        infoCodigo,
        ok: true,
      });
    } else {
      res.status(500).json({ mensaje: 'La respuesta de la API no incluye la información esperada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en pedir la informacion a la IA' });
  }
});

router.post("/unirseSalaXcodigo", async (req: Request, res: Response) => {
  const { sala } = req.body;
  if (!sala) {
    return res.status(400).json({ ok: false, mensaje: 'Sala es requerida' });
  }
  try {
    const consultaExistencia = (await pool.query('SELECT * FROM sala WHERE nombre_sala = $1', [sala]));
    if (consultaExistencia.rowCount! > 0) {
      console.log('La consulta se realizó correctamente');
      res.json({
        sala,
        ok: true,
      });
    } else {
      console.log('La consulta no afectó a ninguna fila');
      res.status(409).json({ ok: false, mensaje: 'La sala no existe' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error en consulta BD' });
  }
})
export default router;
