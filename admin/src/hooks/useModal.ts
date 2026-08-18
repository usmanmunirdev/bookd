import { useState, useCallback } from "react";

export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, openModal, closeModal, toggleModal };
};

export const useDeleteModal = (initialState: boolean = false) => {
  const [isDeleteModalOpen, setIsOpenDelete] = useState(initialState);

  const openDeleteModal = useCallback(() => setIsOpenDelete(true), []);
  const closeDeleteModal = useCallback(() => setIsOpenDelete(false), []);
  const toggleModal = useCallback(() => setIsOpenDelete((prev) => !prev), []);

  return { isDeleteModalOpen, openDeleteModal, closeDeleteModal, toggleModal };
};

