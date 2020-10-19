import React from 'react'

const Thumb = ({ videoId }) => {
  return (
    <div>
      <img src={`https://i.ytimg.com/vi/${videoId}/default.jpg`} alt='tell' />
    </div>
  )
}

export default Thumb
