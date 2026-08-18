import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { createFaqCategory, updateFaqCategory } from "./_requests";

const validationSchema = Yup.object({
  name: Yup.string().required("Category name is required"),
});

export default function HandleFaqCategoryForm({
  isOpen,
  closeModal,
  selectedCategory,
  onSubmit,
}: any) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", description: "" },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        if (selectedCategory) {
          await updateFaqCategory(selectedCategory.id, values);
          toast.success("Category updated");
        } else {
          await createFaqCategory(values);
          toast.success("Category created");
        }
        onSubmit();
        handleClose();
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    closeModal();
  };

  useEffect(() => {
    if (selectedCategory) {
      formik.setValues({
        name: selectedCategory.name,
        description: selectedCategory.description || "",
      });
    }
  }, [selectedCategory]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="w-full max-w-[500px] p-6"
    >
      <h2 className="text-title-md font-semibold text-gray-800 dark:text-white/90 mb-6">
        {selectedCategory ? "Edit Category" : "Add Category"}
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <div>
          <Label>
            Category Name <span className="text-error-500">*</span>
          </Label>
          <Input
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            placeholder="Enter category name"
          />
          {formik.touched.name && formik.errors.name && (
            <div className="text-error-500 text-sm">
              {String(formik.errors.name)}
            </div>
          )}
        </div>
        <div>
          <Label>Description</Label>
          <TextArea
            value={formik.values.description}
            onChange={(val) => formik.setFieldValue("description", val)}
            placeholder="Enter category description"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : selectedCategory ? "Update" : "Add"}
        </Button>
      </form>
    </Modal>
  );
}
