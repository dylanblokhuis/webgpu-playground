import type { LoaderArgs } from "@remix-run/cloudflare";

export function loader({ context, request }: LoaderArgs) {
  return true;
}

export default function Project() {
  return (
    <div>Project</div>
  )
}