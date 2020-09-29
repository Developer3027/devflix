# Break down of the YouTube URL

Total URL
https://www.googleapis.com/youtube/v3/channels?part=snippet%2C contentDetails%2C statistics&forUsername=TechGuyWeb&key=AIzaSyDDpCvJ5fhNFcGy-exLOOfC2DULQWtnJFc

### This is an overview of the specific url that gets information for a channel. Changing the "forUsername" variable directs the URL to the specific channel. Review the JSON below to see the information returned.

<hr><br><br>

The above url is to give you information about the specific channel.

This is the base URL;
https://www.googleapis.com/youtube/v3/

Channel is variable directing to youtube channel.
channels?

The "part" is passed to get various category info. Do not know what snippet is, others are self evident. Three calls are made to "part";
part=snippet%2c contentDetails%2c statistics

Pass the channel name, this is Traversy Media;
&forUsername=TechGuyWeb

The API KEY;
key=AIzaSyDDpCvJ5fhNFcGy-exLOOfC2DULQWtnJFc

This URL gave me this JSON return;
{
"kind": "youtube#channelListResponse",
"etag": "q6GJtQ09175z9op0gw9KoqqkyM8",
"pageInfo": {
"totalResults": 1,
"resultsPerPage": 5
},
"items": [
{
"kind": "youtube#channel",
"etag": "6vAI5JFjaz7-TCcJ5TBF69XWRq4",
"id": "UC29ju8bIPH5as8OGnQzwJyA",
"snippet": {
"title": "Traversy Media",
"description": "Traversy Media features the best online web development and programming tutorials for all of the latest web technologies including Node.js, Angular 2, React.js, PHP, Rails, HTML, CSS and much more",
"customUrl": "traversymedia",
"publishedAt": "2009-10-30T21:33:14Z",
"thumbnails": {
"default": {
"url": "https://yt3.ggpht.com/a/AATXAJw6qBlNzbAweKz7UlC44hYLoEtdoXGmzN8IJno3mg=s88-c-k-c0xffffffff-no-rj-mo",
"width": 88,
"height": 88
},
"medium": {
"url": "https://yt3.ggpht.com/a/AATXAJw6qBlNzbAweKz7UlC44hYLoEtdoXGmzN8IJno3mg=s240-c-k-c0xffffffff-no-rj-mo",
"width": 240,
"height": 240
},
"high": {
"url": "https://yt3.ggpht.com/a/AATXAJw6qBlNzbAweKz7UlC44hYLoEtdoXGmzN8IJno3mg=s800-c-k-c0xffffffff-no-rj-mo",
"width": 800,
"height": 800
}
},
"localized": {
"title": "Traversy Media",
"description": "Traversy Media features the best online web development and programming tutorials for all of the latest web technologies including Node.js, Angular 2, React.js, PHP, Rails, HTML, CSS and much more"
},
"country": "US"
},
"contentDetails": {
"relatedPlaylists": {
"likes": "",
"favorites": "",
"uploads": "UU29ju8bIPH5as8OGnQzwJyA",
"watchHistory": "HL",
"watchLater": "WL"
}
},
"statistics": {
"viewCount": "112545785",
"commentCount": "0",
"subscriberCount": "1270000",
"hiddenSubscriberCount": false,
"videoCount": "827"
}
}
]
}

# next

https://www.googleapis.com/youtube/v3/list?channelId=UU29ju8bIPH5as8OGnQzwJyA&part=snippet&&key=AIzaSyDDpCvJ5fhNFcGy-exLOOfC2DULQWtnJFc&maxResult=5

### traversy media html playlist embed

<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PLillGF-RfqbZTASqIqdvm1R5mLrQq79CU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; e"ncrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
/"
