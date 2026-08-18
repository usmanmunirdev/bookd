import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { CloseIcon } from "../../icons";

interface HandleUserModalProps {
  onSubmit?: () => void;
  isOpen: boolean;
  closeModal: () => void;
}

export default function DeleteConfirmationModal({
  onSubmit,
  isOpen,
  closeModal,
}: HandleUserModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      showCloseButton={false}
      className="max-w-[500px] p-6 lg:p-10"
      
    >
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto">
        <div className="bg-transparent border-2 rounded-full p-[10px] w-[70px] m-auto mb-4 text-3xl h-[70px] flex justify-center items-center border-red-500">
            <CloseIcon className="text-3xl text-red-500"></CloseIcon>

        </div>
        <div className="mb-5 sm:mb-8 text-center">
          <h1 className="mb-2 text-gray-800 dark:text-white/90 text-3xl ">
           Are you sure
          </h1>
          <p className="text-lg font-normal text-gray-600 dark:text-gray-400">
  Do you really want to delete this record? This process cannot be undone.
</p>
        </div>
        <div className="flex justify-center items-center">
            <Button 
  className="hover:text-[#467ff7] hover:bg-transparent border-2 border-[#467ff7] bg-[#467ff7] text-white transition-all me-3" 
  size="sm" 
  onClick={() => closeModal()}
>
  Cancel
</Button>

            <Button className="hover:text-red-500 hover:bg-transparent border-2 transition-all bg-red-500" size="sm" onClick={onSubmit}>
            Delete
            </Button>
        </div>
      </div>
    </Modal>
  );
}
