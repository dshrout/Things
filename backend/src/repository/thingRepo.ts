import { ThingContext } from '../context/thingContext'
import { Thing } from '../models/Thing'
import * as uuid from 'uuid'

const thingContext = new ThingContext();

// Create
export async function createThing(thing: Thing): Promise<Thing>{
    thing.id = uuid.v4();
    return await thingContext.createThing(thing);
}

// Retrieve
export async function getThings(userId: string): Promise<Thing[]>{
    return thingContext.getThings(userId)
}
export async function getThingById(userId: string, thingId: string): Promise<Thing>{
    return thingContext.getThingById(userId, thingId)
}

// Update
export async function updateThing(thing: Thing): Promise<Thing>{
    return await thingContext.updateThing(thing)
}

// Delete
export async function deleteThing(userId: string, thingId: string){
    return await thingContext.deleteThing(userId, thingId)
}
