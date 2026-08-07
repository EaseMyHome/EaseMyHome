import axios from 'axios';

/**
 * Helper to convert Base64 Data URL to a Blob
 */
const dataURLtoBlob = (dataurl) => {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.error('Error parsing base64 data URL to Blob:', err);
    return null;
  }
};

/**
 * Uploads a file (File object or Base64 string) by routing it through the local backend server,
 * which will upload to Cloudinary using secure API keys and fall back to local disk storage on failure.
 * 
 * @param {File|String} file - The file object or base64 string to upload
 * @param {String} [folderName] - Optional provider folder name to group images in Cloudinary
 * @returns {Promise<String>} - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (file, folderName = '') => {
  try {
    const formData = new FormData();
    let fileToSend = file;

    // If file is a Base64 string, convert it to a Blob for multipart upload
    if (typeof file === 'string' && file.startsWith('data:')) {
      const convertedBlob = dataURLtoBlob(file);
      if (convertedBlob) {
        fileToSend = new File([convertedBlob], `upload-${Date.now()}.jpg`, { type: convertedBlob.type });
      }
    }

    formData.append('file', fileToSend);
    if (folderName) {
      formData.append('folder', folderName);
      formData.append('providerName', folderName);
    }

    console.log(`Sending upload request to backend server for folder '${folderName || 'general'}'...`);
    const response = await axios.post('http://localhost:8085/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.url) {
      console.log('Upload successful! Returned URL:', response.data.url);
      return response.data.url;
    } else {
      throw new Error(response.data?.message || 'Failed to retrieve URL from upload server');
    }
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error(error.response?.data?.message || error.message || 'Upload failed');
  }
};
