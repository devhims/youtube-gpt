import { useEffect } from 'react';
import { getSubtitles } from 'youtube-caption-extractor';

const Test = () => {
  async function fetchSubtitles(videoID, lang = 'en') {
    const proxyURL = 'https://api.allorigins.win/raw?url=';
    const targetURL = `https://youtube.com/watch?v=${videoID}`;

    try {
      const response = fetch(proxyURL + targetURL, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const data = response.data;

      const subtitles = await getSubtitles({ videoID, lang, data });
      console.log(subtitles);
      // Do something with the subtitles
    } catch (error) {
      console.error('Error fetching subtitles:', error.message);
    }
  }
  useEffect(() => {
    const videoID = 'PY96wYqFdD4';
    const lang = 'en'; // Optional, default is 'en' (English)

    fetchSubtitles(videoID, lang);
  }, []);

  return <h1>Hello</h1>;
};

export default Test;
