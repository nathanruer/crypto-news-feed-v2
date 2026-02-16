import { getUnreadEvents } from '../../../services/alert.service'

export default defineEventHandler(async () => {
  const events = await getUnreadEvents()
  return { data: events }
})
