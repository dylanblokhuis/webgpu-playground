import React from 'react'
import useStore from '~/state'

export default function Fps() {
  const fps = useStore((state) => state.fps);
  return (
    <div className='text-sm'>{fps} fps</div>
  )
}
