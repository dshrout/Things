import * as uuid from 'uuid'

export interface Thing {
  id: uuid
  userId: string
  category: string
  name: string
  rating: number
  review: string
}
