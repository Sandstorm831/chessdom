<!-- [![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url] -->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/sandstorm831/chessdom">
    <img src="public/chess.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Chessdom</h3>

  <p align="center">
    Chessdom is an open-source web-based chess application.
    <br />
    <a href="https://github.com/sandstorm831/chessdom#readme"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://chessdom.vercel.app">View Demo</a>
    &middot;
    <a href="https://github.com/sandstorm831/chessdom/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/sandstorm831/chessdom/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li><a href="#built-with">Built With</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#chesssocket">chess scoket instructions</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](public/chessdom_knight.png)

Chessdom is an web-based chess application, whose name comes from combining `Chess` and `Wisdom`. Implemented two modes of gameplay in it, computer based gameplay where stockfish acts as your opponent and another is live gameplay where you can play chess with other fellow humans. Also build a game-archive with the name of `hall of games`, where each game which came to an valid end (resignation, check-mate or draw) in the live gameplay is stored.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

[![Next][Next.js]][Next-url]
[![React][React.js]][React-url]
[![Socket.IO][Socket.io]][Socket-url]
[![Prisma][prisma]][prisma-url]
[![TailWindCSS][tailwindcss]][tailwindcss-url]
[![NodeJS][nodejs]][nodejs-url]
[![TypeScript][typescript]][typescript-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/github_username/repo_name.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ```
5. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/sandstorm831/chessdom.svg?style=for-the-badge
[contributors-url]: https://github.com/sandstorm831/chessdom/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/sandstorm831/chessdom.svg?style=for-the-badge
[forks-url]: https://github.com/sandstorm831/chessdom/network/members
[stars-shield]: https://img.shields.io/github/stars/sandstorm831/chessdom.svg?style=for-the-badge
[stars-url]: https://github.com/sandstorm831/chessdom/stargazers
[issues-shield]: https://img.shields.io/github/issues/sandstorm831/chessdom.svg?style=for-the-badge
[issues-url]: https://github.com/sandstorm831/chessdom/issues
[license-shield]: https://img.shields.io/github/license/sandstorm831/chessdom.svg?style=for-the-badge
[license-url]: https://github.com/sandstorm831/chessdom/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: public/chessdom_knight.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Socket.io]: https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101
[Socket-url]: https://socket.io/
[Socket-url]: https://socket.io/
[prisma]: https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white
[prisma-url]:https://www.prisma.io/
[tailwindcss]:https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white
[tailwindcss-url]:https://tailwindcss.com/
[nodejs]:https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[nodejs-url]:https://nodejs.org/en
[typescript]:https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]:https://www.typescriptlang.org/
---
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
