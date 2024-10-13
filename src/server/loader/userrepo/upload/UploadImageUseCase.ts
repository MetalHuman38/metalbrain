// ** Upload Images Use Case ** //
import { IUploadImage } from "./interface";
import { IUploadImagesRepository } from "./IUploadImageRepository";

export class UploadImageUseCase {
  constructor(private uploadImagesRepository: IUploadImagesRepository) {}

  async uploadImages(images: IUploadImage): Promise<any> {
    try {
      return await this.uploadImagesRepository.uploadImages(images);
    } catch (error) {
      console.error("Error uploading images", error);
      throw error;
    }
  }
}