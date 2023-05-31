# YouTubeGPT

This project is a dynamic web application that generates summaries of YouTube videos and allows you to chat with the video content. This is done by leveraging the power of OpenAI's GPT model for natural language understanding and generation, as well as the speed and flexibility of Supabase for vector database management.

![YouTubeGPT Demo](/public/youtubegptdemo.gif)

## Table of Contents

- [YouTubeGPT](#youtubegpt)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Deployment](#deployment)
  - [Built With](#built-with)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)
  - [Acknowledgements](#acknowledgements)

## Features

- Automatic video summary generation.
- Interactive chat with the video content.
- Responsive and modern user interface.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- An [OpenAI](https://openai.com/) account for API key
- A [Supabase](https://supabase.io/) account for database management

### Installation

1. Clone the repository

```sh
git clone https://github.com/devhims/youtube-gpt
```

2. Install NPM packages

```sh
npm install
```

3.  Create a `.env.local` file in the root directory with your OpenAI, Supabase, and YouTube API credentials:

```sh
YOUTUBE_API_KEY=your_youtube_api_key_from_google_cloud_console
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server

```sh
npm run dev
```

## Usage

To generate a summary for a video, paste the YouTube video URL and select the desired summary length. Once the summary is generated, you can engage in an interactive chat with the video content.

## Deployment

The application is deployed on [Vercel](https://vercel.com). If you want to deploy it on your own, follow the [Vercel Deployment Documentation](https://vercel.com/docs).

## Built With

- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI API](https://openai.com/)
- [Supabase](https://supabase.io/)

## Contributing

Any contributions are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Himanshu Gupta - thinktank.himanshu@gmail.com

Project Link: [https://github.com/devhims/youtube-gpt](https://github.com/devhims/youtube-gpt)

## Acknowledgements

- [OpenAI](https://openai.com/)
- [Supabase](https://supabase.io/)
- [Vercel](https://vercel.com)
