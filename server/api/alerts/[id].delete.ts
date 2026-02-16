import { createError } from 'h3'
import { deleteRule } from '../../services/alert.service'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id is required' })

  await deleteRule(id)
  return { data: null }
})
