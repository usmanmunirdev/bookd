import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import TextArea from "../../components/form/input/TextArea";
import { createPlans, updatePlans } from "./_requests";

const FEATURES = [
  { key: "aiPoweredSearch", label: "AI Powered Search" },
  { key: "flightBooking", label: "Flight Booking" },
  { key: "hotelBooking", label: "Hotel Booking" },
  { key: "restaurantBooking", label: "Restaurant Booking" },
  { key: "calendarReminder", label: "Calendar Reminders" },
  { key: "emailReminder", label: "Email Reminders" },
  { key: "smsReminder", label: "SMS Reminders" },
  { key: "bookingHistory", label: "Booking History" },
  { key: "smartRecommendations", label: "Smart Recommendations" },
  { key: "prioritySupport", label: "Priority Support" },
  { key: "earlyFeatureAccess", label: "Early Feature Access" },
  { key: "conciergeAccess", label: "Concierge Access" },
];

const validationSchema = Yup.object({
  title: Yup.string().required("Plan title is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0),
  aiQueryLimit: Yup.number()
    .typeError("AI Query Limit must be a number")
    .min(0, "Cannot be negative")
    .nullable(),
});

const initialValues = {
  title: "",
  price: "",
  aiQueryLimit: "",
  description: "",
  aiPoweredSearch: false,
  flightBooking: false,
  hotelBooking: false,
  restaurantBooking: false,
  calendarReminder: false,
  emailReminder: false,
  smsReminder: false,
  bookingHistory: false,
  smartRecommendations: false,
  prioritySupport: false,
  earlyFeatureAccess: false,
  conciergeAccess: false,
};

interface HandlePlansModalProps {
  selectedPlans?: any;
  onSubmit: (data: any) => void;
  isOpen: boolean;
  closeModal: () => void;
}

export default function HandlePlansModal({
  selectedPlans,
  onSubmit,
  isOpen,
  closeModal,
}: HandlePlansModalProps) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      toast.dismiss();

      const payload = {
        title: values.title,
        price: Number(values.price),
        aiQueryLimit:
          values.aiQueryLimit === "" ? null : Number(values.aiQueryLimit),
        description: values.description,
        ...FEATURES.reduce((acc, f) => {
          acc[f.key] = values[f.key];
          return acc;
        }, {} as any),
      };

      try {
        if (selectedPlans) {
          await updatePlans(selectedPlans.id, payload);
          toast.success("Plan updated successfully");
        } else {
          await createPlans(payload);
          toast.success("Plan created successfully");
        }

        onSubmit(payload);
        handleClose();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    closeModal();
  };

  /* ============================
     Populate on Edit
  ============================= */
  useEffect(() => {
    if (selectedPlans) {
      formik.setValues({
        title: selectedPlans.title || "",
        price: selectedPlans.price || "",
        aiQueryLimit: selectedPlans.aiQueryLimit ?? "",
        description: selectedPlans.description || "",
        ...FEATURES.reduce((acc, f) => {
          acc[f.key] = Boolean(selectedPlans[f.key]);
          return acc;
        }, {} as any),
      });
    } else {
      formik.resetForm();
    }
  }, [selectedPlans]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="w-full max-w-[720px] p-6 lg:p-10 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col w-full">
        <div className="mb-6">
          <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
            {selectedPlans ? "Edit Plan" : "Add Plan"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure pricing, AI usage, and features.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label>
              Plan Title <span className="text-error-500">*</span>
            </Label>
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              placeholder="Plan Title"
            />
            {formik.touched.title && formik.errors.title && (
              <div className="text-error-500 text-sm">
                {String(formik.errors.title)}
              </div>
            )}
          </div>
          {/* Price */}
          <div>
            <Label>
              Price / Month <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              name="price"
              value={formik.values.price}
              onChange={formik.handleChange}
              placeholder="Price / Month"
            />
            {formik.touched.price && formik.errors.price && (
              <div className="text-error-500 text-sm">
                {String(formik.errors.price)}
              </div>
            )}
          </div>
          {/* Description */}
          <div>
            <Label>Description</Label>
            <TextArea
              placeholder="Describe the plan..."
              value={formik.values.description}
              onChange={(val) => formik.setFieldValue("description", val)}
            />
          </div>
          {/* AI Query Limit */}
          <div>
            <Label>AI Query Limit</Label>
            <Input
              type="number"
              name="aiQueryLimit"
              placeholder="e.g. 200 (leave empty for unlimited)"
              value={formik.values.aiQueryLimit}
              onChange={formik.handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited AI queries
            </p>
          </div>

          {/* Features */}
          <div>
            <Label>Plan Features</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {FEATURES.map((feature) => (
                <label
                  key={feature.key}
                  className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 dark:text-white/90 px-4 py-3 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name={feature.key}
                    checked={formik.values[feature.key]}
                    onChange={formik.handleChange}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Saving..."
              : selectedPlans
              ? "Update Plan"
              : "Create Plan"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
