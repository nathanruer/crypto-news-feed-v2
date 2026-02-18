import { createConsola } from 'consola'

export const logger = createConsola({ level: process.env.LOG_LEVEL ? Number(process.env.LOG_LEVEL) : undefined }).withTag('cryptofeed')
