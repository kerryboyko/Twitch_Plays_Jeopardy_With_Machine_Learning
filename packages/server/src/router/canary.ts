import {Application, Response} from 'express'

export const canary = (app: Application) => {
  app.get('/', (_req, res: Response) => {
    res.send(`Hello World!`)
  })
  return app;
}

export default canary;