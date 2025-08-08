// File service for handling local file storage on frontend
export const fileService = {
  // Save file to local storage and return the filename
  saveFile: async (file: File): Promise<string> => {
    try {
      // Create FormData for the file
      const formData = new FormData();
      formData.append('file', file);

      // Save file using Next.js API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save file');
      }

      const result = await response.json();
      return result.filename;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file to server');
    }
  },
};
