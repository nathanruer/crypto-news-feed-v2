import { readBody, createError } from 'h3'
import { insertRule } from '../../services/alert.service'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name || typeof body.name !== 'string') {
    throw createError({ statusCode: 400, message: 'name is required' })
  }
  if (!['ticker', 'source'].includes(body.type)) {
    throw createError({ statusCode: 400, message: 'type must be "ticker" or "source"' })
  }
  if (!body.value || typeof body.value !== 'string') {
    throw createError({ statusCode: 400, message: 'value is required' })
  }

  const rule = await insertRule({
    name: body.name.trim(),
    type: body.type,
    value: body.value.trim(),
  })

  return { data: rule }
})
