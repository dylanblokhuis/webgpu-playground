import { LoaderArgs } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react';
import { getProjects } from '~/services/project.server'

export async function loader({ request }: LoaderArgs) {
  const projects = await getProjects({});

  return { projects };
}

export default function Index() {
  const { projects } = useLoaderData<typeof loader>();

  return (
    <div className='container text-white mt-24'>
      <section className='max-w-5xl mx-auto mb-24'>
        <h1 className='text-4xl font-bold block mb-4'>
          Quickly iterate GPU experiences <br /> with WebGPU playground
        </h1>

        <Link to="/project/draft">
          Create
        </Link>
      </section>

      <section className="grid grid-cols-4 gap-4">
        {projects.map(project => (
          <a key={project.id} href={`/project/${project.id}`} className="bg-slate-700 text-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium ">
                {project.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-300">
                {project.user_name}
              </p>
            </div>
          </a>
        ))}
      </section>
    </div>
  )
}
