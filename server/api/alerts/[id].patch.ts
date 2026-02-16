import { readBody, createError } from 'h3'
import { updateRule } from '../../services/alert.service'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id is required' })

  const body = await readBody(event)
  const updates: Record<string, unknown> = {}

  if (body.name !== undefined) updates.name = String(body.name).trim()
  if (body.type !== undefined) {
    if (!['ticker', 'source'].includes(body.type)) {
      throw createError({ statusCode: 400, message: 'type must be "ticker" or "source"' })
    }
    updates.type = body.type
  }
  if (body.value !== undefined) updates.value = String(body.value).trim()
  if (body.enabled !== undefined) updates.enabled = Boolean(body.enabled)

  const rule = await updateRule(id, updates)
  if (!rule) throw createError({ statusCode: 404, message: 'Rule not found' })

  return { data: rule }
})
