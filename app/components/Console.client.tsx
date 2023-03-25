import clsx from 'clsx';
import useStore from '~/state'

export default function Console() {
  const logs = useStore((state) => state.logs);
  return (
    <div className='w-full h-[58%] bg-slate-900  text-white font-mono flex flex-col overflow-hidden'>
      <div className='flex items-center border-b border-t border-slate-700 px-3 py-2 '>
        <span className='mr-2 text-sm '>Console</span>
        <span className={clsx('min-w-6 h-6 px-2  rounded-full flex items-center justify-center text-sm', logs.filter(l => l.type === "error").length > 0 ? "bg-red-500" : "bg-slate-700")}>{logs.length}</span>
      </div>
      <div className='flex flex-col overflow-y-auto  flex-grow'>
        {logs.map((log, i) => (
          <div className={clsx('border-b text-sm border-slate-800 py-2 px-3', log.type === "error" ? "border-red-700 bg-red-900  text-red-100" : "bg-slate-900")} key={i}>{log.message}</div>
        ))}
      </div>
    </div>
  )
}
