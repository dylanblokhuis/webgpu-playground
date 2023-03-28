import clsx from 'clsx';
import { shallow } from 'zustand/shallow';
import useStore from '~/state'

export default function Console() {
  const logs = useStore((state) => state.logs, shallow);
  return (
    <div className=''>
      {logs.map((log, i) => (
        <div className={clsx('border-b text-sm border-slate-800 py-2 px-3', log.type === "error" ? "border-red-700 bg-red-900  text-red-100" : "bg-slate-900")} key={i}>{log.message}</div>
      ))}
    </div>
  )
}
