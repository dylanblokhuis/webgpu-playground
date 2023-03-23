import clsx from 'clsx';
import useStore from '~/state'

export default function Console() {
  const errors = useStore((state) => state.errors);
  return (
    <div className='w-full bg-slate-800 h-full text-white  font-mono'>
      <div className='flex items-center border-b border-t border-slate-700 px-3 py-2'>
        <span className='mr-2'>Console</span>
        <span className={clsx('w-6 h-6  rounded-full flex items-center justify-center', errors.length > 0 ? "bg-red-500" : "bg-slate-900")}>{errors.length}</span>
      </div>
      <div className='flex flex-col'>
        {errors.map((error, i) => (
          <span className='border-b border-slate-700 bg-red-900  text-red-100 py-2 px-3' key={i}>{error}</span>
        ))}
      </div>
    </div>
  )
}
