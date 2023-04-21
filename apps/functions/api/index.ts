import { VercelRequest, VercelResponse } from '@vercel/node'
import { Router } from 'router'
import dotenv from 'dotenv'
import mysql from 'mysql2'
import z from 'zod'


const DotEnv = z.object({
  DATABASE_URL: z.string(),
  PLANETSCALE_USER: z.string().optional(),
  PLANETSCALE_PASSWORD: z.string().optional(),
})
type Environment = z.infer<typeof DotEnv>

function loadEnv(success: (env: Environment) => void) {
  dotenv.config()

  const res = DotEnv.safeParse(process.env)
  res.success && success(res.data)

  const errorCb = (error: (issues: any) => void) => {
    !res.success && error(res.error.issues)
  }

  return {
    error: errorCb
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const env = loadEnv((env) => {
    //const connection = mysql.createConnection(env.DATABASE_URL)
    //console.log('Connected to PlanetScale!')
    //connection.end()

    const router = new Router()
    router.get((_, res) => res.json({ message: 'get' }))
      .post((_, res) => res.json({ message: 'Nice POST bro' }))
      .delete((_, res) => res.json({ message: 'OwO sowwy' }))
      .put((_, res) => res.json({ message: 'Where?' }))
      .patch((_, res) => res.json({ message: 'I\'m a patch' }))

    router.parse(req, res)
  }).error((issues) => {
    res.status(500).json({ message: 'Internal Server Error', issues: issues })
  })
}
