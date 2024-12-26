import React from 'react'

import { transformationTypes } from '@/constants';
import Header from '@/components/shared/header';
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type TransformationTypeKeys = keyof typeof transformationTypes;

interface SearchParamProps {
  params: {
    type: TransformationTypeKeys; // Usa el tipo literal aquí
  };
}

import { getTools } from "@/actions/tools-action";


const tools = async ({ params: { type } }: SearchParamProps) => {

    const me = transformationTypes[type];

    const session = await currentUser();

    const user = await db.user.findUnique({
    where: {email: session?.email ?? ""}
    });

    if (!user) {
        return <div>Not authenticated</div>;
    }

  const tools = await getTools(user.id);

  return (
    <>
      <Header 
        title={'Herramientas'}
        subtitle={'Crea tus herramientas de automatización'}
      />

      <div className='max-w-screen-lg mx-auto'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2'>
        {tools ? (
          tools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader>
                <CardTitle>
                  {tool.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{tool.description}</p>
                {/* <span className='text-slate-600'>
                  {new Date(tool.createdAt).toLocaleDateString()}
                </span> */}
              </CardContent>
              <CardFooter className='flex gap-x-2 justify-end'>
                <Button variant={"destructive"}>
                  Eliminar
                </Button>
                <Button>
                  Editar
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div>No tools found</div>
        )}

        <Card>
          <Link href="/tools/add/new">
          <div className='flex justify-center items-center h-full'>
            <CardContent>

            <CardTitle className='pb-4'>Crea tus herramientas</CardTitle>
            <div className='flex justify-center'><Button>
              +
            </Button></div>
            </CardContent>
            
          </div>
          </Link>
        </Card>
        </div>
      </div>
    </>
  )
}

export default tools
