import { config } from '../config/env.config';

/**
 * Uploads a file to the backend `/api/upload` endpoint and returns its public URL.
 *
 * @param {File} file - The file object to upload (from an input type="file" or drag-and-drop)
 * @param {string} token - The user's authentication token (Bearer token)
 * @param {string} folder - (Optional) The folder in GCS where the image will be stored
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export const uploadFileToGCS = async (file, token, folder = "general") => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const baseUrl = config.apiBaseUrl;
    const uploadUrl = baseUrl.endsWith('/api') ? `${baseUrl}/upload` : `${baseUrl}/api/upload`;

    const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload file");
    }

    const data = await response.json();
    return data.url;
};
