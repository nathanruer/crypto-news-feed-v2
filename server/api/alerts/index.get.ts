import { getRules } from '../../services/alert.service'

export default defineEventHandler(async () => {
  const rules = await getRules()
  return { data: rules }
})
