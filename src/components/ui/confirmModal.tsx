'use client';


import React from 'react';
import { Modal, Button } from 'flowbite-react';


interface ConfirmModalProps {
show: boolean;
onClose: () => void;
onConfirm: () => void;
title?: string;
children?: React.ReactNode;
}


export default function ConfirmModal({ show, onClose, onConfirm, title = 'Confirm', children }: ConfirmModalProps) {
return (
<Modal show={show} onClose={onClose} size="md">
<div className="p-6">
<h3 className="text-lg font-semibold mb-4">{title}</h3>
<div className="mb-6">{children}</div>
<div className="flex justify-end gap-2">
<Button color="gray" onClick={onClose}>Cancel</Button>
<Button color="failure" onClick={onConfirm}>Confirm</Button>
</div>
</div>
</Modal>
);
}