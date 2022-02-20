import { PictureContext } from '../context/pictureContext'
import { Picture } from '../models/Picture'
import * as uuid from 'uuid'

const pictureContext = new PictureContext();

// Create
export async function createPicture(picture: Picture): Promise<Picture>{
    picture.id = uuid.v4();
    return await pictureContext.createPicture(picture);
}

// Retrieve
export async function getPicture(pictureId: string): Promise<Picture>{
    return pictureContext.getPicture(pictureId);
}
export async function getPicturesByThingId(thingId: string): Promise<Picture[]>{
    return pictureContext.getPicturesByThingId(thingId);
}

// Update
export async function updatePicture(picture: Picture): Promise<Picture>{
    return await pictureContext.updatePicture(picture);
}

// Delete
export async function deletePicture(pictureId: string){
    return await pictureContext.deletePicture(pictureId);
}
export async function deletePicturesByThingId(thingId: string){
    return await pictureContext.deletePicturesByThingId(thingId);
}
