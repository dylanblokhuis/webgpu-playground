import { Link, NavLink, Outlet } from '@remix-run/react'
import clsx from 'clsx'
import useStore from '~/state';
import Fps from './Fps'

export default function PlaygroundTabs() {
  const { logs, project } = useStore((state) => ({ logs: state.logs, project: state.project }));
  return (
    <div className='w-full h-[58%] bg-slate-900  text-white font-mono flex flex-col overflow-hidden'>
      <div className='flex justify-between items-center border-b border-t border-slate-700 px-3 py-2 '>

        <div className='flex gap-x-4 items-center text-sm'>
          <NavLink end to={project ? `/project/${project.id}` : `/project/draft `} className={({ isActive }) => clsx("flex items-center", isActive && "font-bold  underline")}>
            Description
          </NavLink>

          |

          <NavLink to={project ? `/project/${project.id}/console` : `/project/draft/console`} className={({ isActive }) => clsx("flex items-center", isActive && "font-bold  underline")}>
            Console
          </NavLink>
          <span className={clsx('min-w-6 h-6 px-2 -ml-2 no-underline rounded-full flex items-center justify-center text-sm', logs.filter(l => l.type === "error").length > 0 ? "bg-red-500" : "bg-slate-700")}>{logs.length}</span>

          |

          <NavLink end to={`/project/${project?.id}/settings`} className={({ isActive }) => clsx("flex items-center", isActive && "font-bold  underline")}>
            Settings
          </NavLink>
        </div>



        <Fps />
      </div>
      <div className='flex flex-col overflow-y-auto  flex-grow'>
        <Outlet />
      </div>
    </div >
  )
}
