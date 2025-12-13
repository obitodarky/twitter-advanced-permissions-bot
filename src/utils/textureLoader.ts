import * as THREE from "three";

/**
 * Loads a texture from an image URL
 * @param url - URL of the image to load
 * @returns Promise that resolves to a THREE.Texture
 */
export const loadTextureFromUrl = (url: string): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        resolve(texture);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Loads multiple textures from image URLs
 * @param urls - Array of image URLs to load
 * @returns Promise that resolves to an array of THREE.Texture objects
 */
export const loadTexturesFromUrls = async (
  urls: string[]
): Promise<THREE.Texture[]> => {
  try {
    const textures = await Promise.all(
      urls.map((url) => loadTextureFromUrl(url))
    );
    return textures;
  } catch (error) {
    console.error("Error loading textures:", error);
    throw error;
  }
};

