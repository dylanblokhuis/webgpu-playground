import { NavLink, Outlet } from '@remix-run/react'
import clsx from 'clsx'
import { shallow } from 'zustand/shallow';
import useStore from '~/state';
import Fps from './Fps'

export default function PlaygroundTabs() {
  const { logs, project, paused, setPaused } = useStore((state) => ({ logs: state.logs, project: state.project, paused: state.paused, setPaused: state.setPaused }), shallow);
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


        <div className='flex items-center gap-x-2 text-sm'>
          <button onClick={() => setPaused(!paused)} className='flex items-center gap-x-1' type='button'>
            {paused ? (
              <>
                <span>Play</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
              </>
            ) : (
              <>
                <span>Pause</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            )}
          </button>

          |

          <Fps />
        </div>
      </div>
      <div className='flex flex-col overflow-y-auto  flex-grow'>
        <Outlet />
      </div>
    </div >
  )
}
