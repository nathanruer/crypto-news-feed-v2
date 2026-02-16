import { markEventsAsRead } from '../../../services/alert.service'

export default defineEventHandler(async () => {
  await markEventsAsRead()
  return { data: null }
})
