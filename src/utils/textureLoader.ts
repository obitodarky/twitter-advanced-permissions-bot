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

/**
 * Creates a texture atlas from multiple images
 * Arranges images horizontally in a single texture
 * @param urls - Array of image URLs, one per segment
 * @returns Promise that resolves to a THREE.Texture with all images arranged horizontally
 */
export const createTextureAtlas = async (
  urls: string[]
): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    if (urls.length === 0) {
      reject(new Error("No image URLs provided"));
      return;
    }

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    const totalImages = urls.length;
    let segmentWidth = 0;
    let segmentHeight = 0;

    // Load all images
    urls.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Use first image dimensions as reference
        if (index === 0) {
          segmentWidth = img.width;
          segmentHeight = img.height;
        }
        loadedCount++;
        if (loadedCount === totalImages) {
          // All images loaded, create atlas
          createAtlasCanvas(images, segmentWidth, segmentHeight, resolve, reject);
        }
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
      images[index] = img;
    });
  });
};

/**
 * Creates a canvas with all images arranged horizontally
 */
const createAtlasCanvas = (
  images: HTMLImageElement[],
  segmentWidth: number,
  segmentHeight: number,
  resolve: (texture: THREE.Texture) => void,
  reject: (error: Error) => void
) => {
  try {
    const atlasWidth = segmentWidth * images.length;
    const atlasHeight = segmentHeight;

    const canvas = document.createElement("canvas");
    canvas.width = atlasWidth;
    canvas.height = atlasHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Draw each image side by side
    images.forEach((img, index) => {
      ctx.drawImage(
        img,
        index * segmentWidth,
        0,
        segmentWidth,
        segmentHeight
      );
    });

    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    resolve(texture);
  } catch (error) {
    reject(error as Error);
  }
};

