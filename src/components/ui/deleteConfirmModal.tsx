"use client";

import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Badge } from "flowbite-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  names: string[];
}

export function DeleteConfirmModal({ open, onClose, onConfirm, names = [] }: DeleteConfirmModalProps) {
  // ---- Dynamic message logic ----
  const getDeleteMessage = () => {
    if (names.length === 1) {
      return `Delete user ${names[0]}? This action cannot be undone.`;
    }

    if (names.length <= 3) {
      return `Delete users ${names.join(", ")}? This action cannot be undone.`;
    }

    // More than 3 → show first 3 + count
    const firstThree = names.slice(0, 3).join(", ");
    const remaining = names.length - 3;
    return (
      <span className="inline-flex flex-wrap items-center justify-center gap-1">
        Delete users <span className="font-semibold">{firstThree}</span> 
        and 
        <Badge color="failure" className="text-sm px-2">+{remaining}</Badge> 
        others? This action cannot be undone.
      </span>
    );
  };

  return (
    <Modal show={open} size="md" onClose={onClose} popup>
      <ModalHeader />

      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />

          {/* DYNAMIC TEXT HERE */}
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            {getDeleteMessage()}
          </h3>

          <div className="flex justify-center gap-4">
            <Button color="red" onClick={onConfirm}>
              Yes, Delete
            </Button>
            <Button color="alternative" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
