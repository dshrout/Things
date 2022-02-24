import * as uuid from 'uuid'

export interface Picture {
  id: uuid
  userId: string
  url: string
  thingId: uuid
}
