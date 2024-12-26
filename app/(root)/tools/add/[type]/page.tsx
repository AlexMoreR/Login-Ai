    import React from 'react'

    import { notFound } from 'next/navigation'; // Importar notFound para manejar 404
    import { transformationTypes } from '@/constants';
    import Header from '@/components/shared/header';
    import { currentUser } from "@/lib/auth";
    import { db } from "@/lib/db";


    type TransformationTypeKeys = keyof typeof transformationTypes;

    interface SearchParamProps {
      params: {
        type: TransformationTypeKeys; // Usa el tipo literal aquí
      };
    }


    const herramientas = async ({ params: { type } }: SearchParamProps) => {

      const tools = transformationTypes[type];

      const session = await currentUser();

        const user = await db.user.findUnique({
        where: {email: session?.email ?? ""}
        });

        if (!user) {
        return <div>Not authenticated</div>;
        }

      return (
        <>
          <Header 
            title={tools.title}
            subtitle={tools.subTitle}
          />
        </>
      )
    }

    export default herramientas
