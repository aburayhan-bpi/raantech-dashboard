export const uploadImageToImgBB = async (file: File): Promise<string> => {
  const apiKey = "14819cebf3a76eac1909552eb0e0ff1a";

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await response.json();
  return data.data.display_url;
};
