import axios from 'axios'
const KEY = 'AIzaSyDDpCvJ5fhNFcGy-exLOOfC2DULQWtnJFc'

export default axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/',
  params: {
    part: 'snippet',
    maxResults: 5,
    key: KEY
  }
})
