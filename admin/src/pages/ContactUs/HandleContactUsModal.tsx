import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import TextArea from "../../components/form/input/TextArea";
import { replyContact } from "./_requests";
import { useAuth } from "../../hooks/useAuth";

interface HandleContactUsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedContact?: any;
  onSubmit: () => void;
}

const contactValidationSchema = Yup.object({
  replySubject: Yup.string().required("Reply Subject is required"),
  reply: Yup.string().required("Reply message is required"),
});

export default function HandleContactUsModal({
  isOpen,
  closeModal,
  selectedContact,
  onSubmit,
}: HandleContactUsModalProps) {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      replySubject: "",
      reply: "",
    },
    validationSchema: contactValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedContact) return;
      setLoading(true);
      toast.dismiss();

      try {
        await replyContact(selectedContact.id, {
          replySubject: values.replySubject,
          reply: values.reply,
          repliedBy: userInfo?.id,
        });

        toast.success("Reply sent successfully");
        onSubmit();
        resetForm();
        closeModal();
      } catch (err: any) {
        console.log(
          "err",
          err?.response?.data?.message
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Prefill form if editing
  useEffect(() => {
    if (selectedContact) {
      formik.setValues({
        replySubject: selectedContact.replySubject || "",
        reply: selectedContact.reply || "",
      });
    } else {
      formik.resetForm();
    }
  }, [selectedContact]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="w-full max-w-[600px] p-6 lg:p-10 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col w-full">
        <div className="mb-6">
          <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
            {selectedContact ? "Reply to Contact" : "New Contact Reply"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Reply to the user’s contact request.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Readonly fields */}
          <InputField
            label="Full Name"
            value={selectedContact?.fullName || ""}
            disabled
          />
          <InputField
            label="Email"
            value={selectedContact?.email || ""}
            disabled
          />
          <InputField
            label="Subject"
            value={selectedContact?.subject || ""}
            disabled
          />
          <TextAreaField
            label="Message"
            value={selectedContact?.message || ""}
            disabled
          />

          {/* Reply Subject */}
          <div>
            <Label>
              Reply Subject <span className="text-error-500">*</span>
            </Label>
            <Input
              name="replySubject"
              value={formik.values.replySubject}
              onChange={formik.handleChange}
              placeholder="Enter reply subject"
            />
            {formik.touched.replySubject && formik.errors.replySubject && (
              <p className="text-error-500 text-sm">
                {formik.errors.replySubject}
              </p>
            )}
          </div>

          {/* Reply Message */}
          <div>
            <Label>
              Reply Message <span className="text-error-500">*</span>
            </Label>
            <TextArea
              value={formik.values.reply}
              onChange={(val) => formik.setFieldValue("reply", val)}
              placeholder="Enter your reply message"
            />
            {formik.touched.reply && formik.errors.reply && (
              <p className="text-error-500 text-sm">{formik.errors.reply}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reply"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}

// Helper components for cleaner code
function InputField({ label, value, disabled = false }: any) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        value={value}
        disabled={disabled}
        className={disabled ? "bg-gray-100 dark:bg-gray-700" : ""}
      />
    </div>
  );
}

function TextAreaField({ label, value, disabled = false }: any) {
  return (
    <div>
      <Label>{label}</Label>
      <TextArea
        value={value}
        disabled={disabled}
        className={disabled ? "bg-gray-100 dark:bg-gray-700" : ""}
      />
    </div>
  );
}
