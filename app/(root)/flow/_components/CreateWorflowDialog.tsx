"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Layers2Icon } from 'lucide-react';
import CustomDialogHeader from '@/components/shared/CustomDialogHeader';


function CreateWorflowDialog({triggerText}:{triggerText?: String}){
    const [open, setOpen] =  useState(false);

  return (
  <Dialog open={open} onOpenChange={setOpen} >
    <DialogTrigger asChild>
        <Button>{triggerText ?? "CREAR FLUJO"}</Button>
    </DialogTrigger>
    <DialogContent className='px-0'>
        <CustomDialogHeader 
            icon={Layers2Icon}
            title="CREAR FLUJO"
            subTitle="Comienza a construir tu flujo"
        />

    </DialogContent>
  </Dialog>)
}

export default CreateWorflowDialog;
