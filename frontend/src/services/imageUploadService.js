export const imageUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data.url; // Return the URL of uploaded image
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};