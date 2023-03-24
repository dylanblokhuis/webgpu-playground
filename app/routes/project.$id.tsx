import type { LoaderArgs } from "@remix-run/cloudflare";

export function loader({ context, request }: LoaderArgs) {

  console.log(context.DB);
  
  return true;
}

export default function Project() {
  return (
    <div>Project</div>
  )
}
