import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import TextArea from "../../components/form/input/TextArea";
import { createFaq, updateFaq } from "./_requests";

interface HandleFaqModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedFaq?: any;
  categories: { id: number; name: string }[];
  onSubmit: () => void;
}

const faqValidationSchema = Yup.object({
  question: Yup.string().required("Question is required"),
  answer: Yup.string().required("Answer is required"),
  categoryId: Yup.string().required("Category is required"),
});

export default function HandleFaqModal({
  isOpen,
  closeModal,
  selectedFaq,
  categories,
  onSubmit,
}: HandleFaqModalProps) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      question: "",
      answer: "",
      categoryId: "",
    },
    validationSchema: faqValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      toast.dismiss();

      try {
        const payload = {
          question: values.question,
          answer: values.answer,
          categoryId: values.categoryId,
        };

        if (selectedFaq) {
          await updateFaq(selectedFaq.id, payload);
          toast.success("FAQ updated successfully");
        } else {
          await createFaq(payload);
          toast.success("FAQ created successfully");
        }

        onSubmit();
        handleClose();
      } catch (err) {
        toast.error("Something went wrong");
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
    if (selectedFaq) {
      formik.setValues({
        question: selectedFaq.question || "",
        answer: selectedFaq.answer || "",
        categoryId: selectedFaq.category?.id || "",
      });
    } else {
      formik.resetForm();
    }
  }, [selectedFaq]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="w-full max-w-[600px] p-6 lg:p-10 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col w-full">
        <div className="mb-6">
          <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
            {selectedFaq ? "Edit FAQ" : "Add FAQ"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your FAQ question, answer and category.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Question */}
          <div>
            <Label>
              Question <span className="text-error-500">*</span>
            </Label>
            <Input
              name="question"
              value={formik.values.question}
              onChange={formik.handleChange}
              placeholder="Enter the question"
            />
            {formik.touched.question && formik.errors.question && (
              <div className="text-error-500 text-sm">
                {String(formik.errors.question)}
              </div>
            )}
          </div>
 {/* Category */}
          <div>
            <Label>
              Category <span className="text-error-500">*</span>
            </Label>
            <select
              name="categoryId"
              value={formik.values.categoryId}
              onChange={formik.handleChange}
              className="border p-2 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400 "
             
            >
              <option value="" >Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {formik.touched.categoryId && formik.errors.categoryId && (
              <div className="text-error-500 text-sm">
                {String(formik.errors.categoryId)}
              </div>
            )}
          </div>

          {/* Answer */}
          <div>
            <Label>
              Answer <span className="text-error-500">*</span>
            </Label>
            <TextArea
              value={formik.values.answer}
              onChange={(val) => formik.setFieldValue("answer", val)}
              placeholder="Enter the answer"
            />
            {formik.touched.answer && formik.errors.answer && (
              <div className="text-error-500 text-sm">
                {String(formik.errors.answer)}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : selectedFaq ? "Update FAQ" : "Add FAQ"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
