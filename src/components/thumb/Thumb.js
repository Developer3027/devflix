import React from 'react'

const Thumb = ({ videoIds }) => {
  return (
    <div>
      <img src={`https://i.ytimg.com/vi/${videoIds}/default.jpg`} alt='tell' />
    </div>
  )
}

export default Thumb
