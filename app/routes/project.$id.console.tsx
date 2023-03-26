import { SerializeFrom } from "@remix-run/cloudflare";
import { useRouteLoaderData } from "@remix-run/react";
import clsx from "clsx";
import Markdown from 'markdown-to-jsx';
import useStore from "~/state";
import { loader } from "./project.$id"

export default function Project() {
  const { logs } = useStore((state) => ({ logs: state.logs }));

  return (
    <div>
      {logs.map((log, i) => (
        <div className={clsx('border-b text-sm border-slate-800 py-2 px-3', log.type === "error" ? "border-red-700 bg-red-900  text-red-100" : "bg-slate-900")} key={i}>{log.message}</div>
      ))}
    </div>
  )
}
