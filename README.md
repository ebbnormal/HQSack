# HQsack
Source code for http://bit.ly/hqsack, a website that auto-searches HQ Trivia questions in realtime during the game.

## How to use the site
To use the website, simply open the page as the game is starting. As questions are asked, the site will auto-populate 4 search views with the question and 3 answers (subject to change as search criteria is tweaked for better relevance). That's it!

When there isn't a game currently going, the site provides a countdown until the next show.

## How to run the server
The site is built as a simple Express app using Node 8. Just clone, run `npm install`, and `npm start`.

For the HQ socket authentication, you will need to get an access token for an HQ account (sniff the network traffic of the app). It is recommended to not use your actual account, since I believe the account used by HQsack will lose any game on the first question (since the server is passive and doesn't answer the question).

Once you have a token, you can set it as the `HQ_TOKEN` environment variable. Alternatively, the project uses [node-config](https://github.com/lorenwest/node-config), so you can also add it in a `/config/local.json` file as described by their documentation.

## How it works
There are two primary logical components: a WebSocket class on the server, and the client side javascript of the site.

The socket class creates a WebSocket client to the HQ server when a game starts. I then starts a WebSocket server and relays messages received on the client from HQ through to any clients connected to the HQsack socket server. It's basically just a proxy from the HQ socket server to the socket clients run on the HQsack site.

The client javascript polls a REST endpoint on the HQ server that gives information about the current show, once a minute. When a show starts, this endpoint returns the socket URL on the HQ server for that game. The client logic then passes this url to the server so the socket class can start up. If the client logic receives a successful response, it will initiate a socket connection to the HQsack server to receive the proxied messages. As question messages are received, the DOM is updated with the pre-populated search pages.

The primary reason for proxying the socket connection through the HQsack server is that client-side WebSocket implementations do not support headers, but the HQ socket server requires Bearer authentication. This also has the benefit of sharing a single connection to HQ for all users of the site, instead of opening a separate connection for each pageload.

## Contributing
The most glaring aspect to be improved is the search query logic. Searching the question text and answer text can help for some questions, but more intelligent parsing would make the site more useful. This logic is all done client-side in the `updateQuestion` function in `hqsack.js`.

## FAQ
Q: Is this against HQ rules/terms?  
A: Almost definitely

Q: Why is it named HQsack?  
A: ![hi](https://jenniferkarmstrong.files.wordpress.com/2013/08/john-cusack.jpg)

Q: Yeah I know who John Cusack is, but... why  
A: ![my](https://ia.media-imdb.com/images/M/MV5BMTk4MTAwMjYzNV5BMl5BanBnXkFtZTcwNjIxNTU1OA@@._V1._CR286,2,351,422_UY317_CR25,0,214,317_AL_.jpg)

Q: Uhh  
A: ![name's](http://images.tmz.com/2015/05/18/john-cusack-200x250.jpg)

Q: Nevermind  
A: ![John](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmFoTHEEGqs2nsdLSruDvoUIwUVm8K5gcP6HTT9LefxArQIwLM)
