import { getSubtitles } from 'youtube-caption-extractor';

export default async function handler(req, res) {
  const { videoId } = req.query;

  if (!videoId) {
    res.status(400).json({ error: 'videoId is required' });
    return;
  }

  try {
    const captions = await getSubtitles({ videoID: videoId });
    res.status(200).json(captions);
  } catch (error) {
    console.error('Failed to fetch captions:', error);
    res.status(500).json({ error: 'Failed to fetch captions' });
  }
}
