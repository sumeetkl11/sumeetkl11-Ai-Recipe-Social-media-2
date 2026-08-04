import { buildApiUrl } from '../services/api';

/**
 * Upload image file to Cloudinary via backend API endpoint
 * @param {File} file - Image file from file input or drop event
 * @returns {Promise<string>} Uploaded Cloudinary image URL
 */
export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(buildApiUrl('/upload'), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed');
  }

  return data.url;
}
