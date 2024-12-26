'use server';

import { db } from '@/lib/db';


//Crear tools
export async function createTool(userId: string, name: string, description: string) {
  const tool = await db.tools.create({
    data: {
      name,
      description,
      userId,
    },
  });
  return tool;
}

//listar Tools
export async function getTools(userId: string) {
  const tools = await db.tools.findMany({
    where: { userId },
  });
  return tools;
}


//Actualizar tools
export async function updateTool(id: string, name: string, description: string) {
  const tool = await db.tools.update({
    where: { id },
    data: { name, description },
  });
  return tool;
}

//eliminar tools

export async function deleteTool(id: string) {
  await db.tools.delete({
    where: { id },
  });
}