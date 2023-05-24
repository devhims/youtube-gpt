async function getVideoInfo(videoID, apiKey) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${apiKey}`
  );

  const data = await response.json();
  const video = data.items[0];
  const snippet = video.snippet;

  return {
    title: snippet.title,
    description: snippet.description,
    channelId: snippet.channelId,
    channelTitle: snippet.channelTitle,
    thumbnailUrl: snippet.thumbnails.default.url,
  };
}

export default async function handler(req, res) {
  const { videoID } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!videoID) {
    res.status(400).json({ error: 'Missing videoID query parameter' });
    return;
  }

  if (!apiKey) {
    res.status(500).json({ error: 'Missing YouTube API key' });
    return;
  }

  try {
    const videoInfo = await getVideoInfo(videoID, apiKey);
    res.status(200).json(videoInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video information' });
  }
}
