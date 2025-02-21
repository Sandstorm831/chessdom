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
    <br />
    <a href="https://chessdom.vercel.app">View Demo</a>
    &middot;
    <a href="https://github.com/sandstorm831/chessdom/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/sandstorm831/chessdom/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->

## Table of Contents

  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#prerequisites">Prerequisites</a></li>
    <li><a href="#built-with">Built with</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Product Name Screen Shot][product-screenshot]](public/chessdom_knight.png)

Chessdom is an web-based chess application, whose name comes from combining `Chess` and `Wisdom`. Implemented two modes of gameplay in it, computer based gameplay where stockfish acts as your opponent and another is live gameplay where you can play chess with other fellow humans. Also build a game-archive with the name of `hall of games`, where each game which came to an valid end (resignation, check-mate or draw) in the live gameplay is stored.

### Built With

[![Next][Next.js]][Next-url]
[![React][React.js]][React-url]
[![Socket.IO][Socket.io]][Socket-url]
[![Prisma][prisma]][prisma-url]
[![TailWindCSS][tailwindcss]][tailwindcss-url]
[![NodeJS][nodejs]][nodejs-url]
[![TypeScript][typescript]][typescript-url]

## Prerequisites

To run the project in your local machine, you have to have the following packages

- Node.js : [Volta recommended](https://volta.sh/)

## Installation

Once you finish installation Node.js, follow the commands to setup the project locally on your machine

1. clone the project
   ```sh
   git clone https://github.com/Sandstorm831/chessdom.git
   ```
2. enter the project
   ```sh
   cd chessdom
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Create .env file at the root of the folder.
   ```sh
   touch .env
   ```
5. set up NextAuth Secret by running this command
   ```sh
   npx auth secret
   ```
6. Set the value of following OAuth variables in `.env.local` file created by the previous command

   ```
   AUTH_TRUST_HOST=true
   AUTH_GITHUB_ID=
   AUTH_GITHUB_SECRET=

   AUTH_GOOGLE_ID=
   AUTH_GOOGLE_SECRET=
   ```

   You can get the value of these variables from OAuth console of GitHub and Google, [read more](https://next-auth.js.org/)
   </br>

7. Setup the `DATABASE_URL` in `.env` file

   ```sh
   DATABASE_URL=
   ```

   You can get a hosted SQL database from Aiven
   <br/>

8. Run the development server:
   `sh
    npm run dev
    `
   This completes the set-up for this project, all the functionalities present in the application will now be live in your `dev server` except for live game-play for which you have to setup the [chess-socket server](https://github.com/sandstorm831/chessSocket)

<!-- LICENSE -->

## License

Distributed under the GPL-3.0 license. See [License](./LICENSE) for more information.

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
[prisma-url]: https://www.prisma.io/
[tailwindcss]: https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white
[tailwindcss-url]: https://tailwindcss.com/
[nodejs]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[nodejs-url]: https://nodejs.org/en
[typescript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
