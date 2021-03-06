import { PictureContext } from '../context/pictureContext'
import { Picture } from '../models/Picture'
import * as uuid from 'uuid'

const pictureContext = new PictureContext();

export class PictureRepo {

    // Create
    async createPicture(picture: Picture): Promise<Picture>{
        picture.id = uuid.v4();
        return await pictureContext.createPicture(picture);
    }

    // Retrieve
    async getPictureById(userId: string, pictureId: string): Promise<Picture>{
        return pictureContext.getPictureById(userId, pictureId);
    }
    async getPictures(userId: string): Promise<Picture[]>{
        return pictureContext.getPictures(userId);
    }

    // Update
    async updatePicture(picture: Picture): Promise<Picture>{
        return await pictureContext.updatePicture(picture);
    }

    // Delete
    async deletePicture(userId: string, pictureId: string){
        return await pictureContext.deletePicture(userId, pictureId);
    }
}