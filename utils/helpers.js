export const extractVideoId = (url) => {
  const regex = /(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regex);
  return match && match[2].length === 11 ? match[2] : null;
};
