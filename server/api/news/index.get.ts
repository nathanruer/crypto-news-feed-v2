import { getQuery, createError } from 'h3'
import { queryNewsItems } from '../../services/news.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = query.page !== undefined ? Number(query.page) : 1
  const pageSize = query.pageSize !== undefined ? Number(query.pageSize) : 50

  if (!Number.isInteger(page) || page < 1) {
    throw createError({ statusCode: 400, message: 'page must be >= 1' })
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw createError({
      statusCode: 400,
      message: 'pageSize must be between 1 and 100',
    })
  }

  const result = await queryNewsItems({ page, pageSize })

  return {
    data: result.items,
    meta: { total: result.total, page, pageSize },
  }
})
