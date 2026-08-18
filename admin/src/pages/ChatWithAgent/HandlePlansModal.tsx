// import { useState, useEffect } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { toast } from "react-toastify";
// import { Modal } from "../../components/ui/modal";
// import Label from "../../components/form/Label";
// import Input from "../../components/form/input/InputField";
// import Button from "../../components/ui/button/Button";
// import TextArea from "../../components/form/input/TextArea";
// import { createPlans, updatePlans } from "./_requests";

// // Validation Schema
// const validationSchema = Yup.object().shape({
//   title: Yup.string().required("Plan title is required"),
//   pricePerMonth: Yup.number()
//     .typeError("Price must be a number")
//     .required("Price per month is required")
//     .min(0, "Price cannot be negative"),
//   description: Yup.string().optional(),
//   features: Yup.array().of(Yup.string()).optional(),
// });

// const initialValues = {
//   title: "",
//   pricePerMonth: "",
//   description: "",
//   features: [],
// };

// interface HandlePlansModalProps {
//   selectedPlans?: any;
//   onSubmit: (data: any) => void;
//   isOpen: boolean;
//   closeModal: () => void;
// }

// export default function HandlePlansModal({
//   selectedPlans,
//   onSubmit,
//   isOpen,
//   closeModal,
// }: HandlePlansModalProps) {
//   const [loading, setLoading] = useState(false);
//   const [featureInput, setFeatureInput] = useState("");

//   const formik = useFormik({
//     initialValues: initialValues,
//     validationSchema,
//     onSubmit: async (values, { resetForm }) => {
//       setLoading(true);
//       toast.dismiss();

//       const payload = {
//         title: values.title,
//         pricePerMonth: Number(values.pricePerMonth),
//         description: values.description,
//         features: values.features,
//       };

//       try {
//         if (selectedPlans) {
//           await updatePlans(selectedPlans.id, payload);
//           toast.success("Plan updated successfully");
//         } else {
//           await createPlans(payload);
//           toast.success("Plan created successfully");
//         }

//         onSubmit(payload);
//         resetForm();
//         closeModal();
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     },
//   });

//   // Set modal values when editing
//   useEffect(() => {
//     if (selectedPlans) {
//       formik.setValues({
//         title: selectedPlans.title || "",
//         pricePerMonth: selectedPlans.pricePerMonth || "",
//         description: selectedPlans.description || "",
//         features: selectedPlans.features || [],
//       });
//     } else {
//       formik.resetForm();
//     }
//   }, [selectedPlans]);

//   // Handle feature add
//   const addFeature = () => {
//     if (featureInput.trim() !== "") {
//       formik.setFieldValue("features", [
//         ...(formik.values.features || []),
//         featureInput,
//       ]);
//       setFeatureInput("");
//     }
//   };

//   // Handle remove feature
//   const removeFeature = (idx: number) => {
//     const updated = [...formik.values.features];
//     updated.splice(idx, 1);
//     formik.setFieldValue("features", updated);
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={closeModal}
//       className="w-full max-w-[700px] p-6 lg:p-10 max-h-[90vh] overflow-y-auto"
//     >
//       <div className="flex flex-col w-full max-w-md mx-auto">
//         <div className="mb-6">
//           <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
//             {selectedPlans ? "Edit Plan" : "Add Plan"}
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             {selectedPlans
//               ? "Update plan details."
//               : "Fill in details to create a new plan."}
//           </p>
//         </div>

//         <form onSubmit={formik.handleSubmit}>
//           <div className="space-y-6">
//             {/* Title */}
//             <div>
//               <Label>
//                 Plan Title <span className="text-error-500">*</span>
//               </Label>
//               <Input
//                 name="title"
//                 placeholder="Premium Plan"
//                 value={formik.values.title}
//                 onChange={formik.handleChange}
//               />
//               {formik.touched.title && formik.errors.title && (
//                 <div className="text-error-500 text-sm">
//                   {formik.errors.title}
//                 </div>
//               )}
//             </div>

//             {/* Price */}
//             <div>
//               <Label>
//                 Price / Month <span className="text-error-500">*</span>
//               </Label>
//               <Input
//                 type="number"
//                 name="pricePerMonth"
//                 placeholder="29.99"
//                 value={formik.values.pricePerMonth}
//                 onChange={formik.handleChange}
//               />
//               {formik.touched.pricePerMonth && formik.errors.pricePerMonth && (
//                 <div className="text-error-500 text-sm">
//                   {formik.errors.pricePerMonth}
//                 </div>
//               )}
//             </div>

//             {/* Description */}
//             <div>
//               <Label>Description</Label>
//               <TextArea
//                 // name="description"
//                 placeholder="Describe the plan..."
//                 value={formik.values.description}
//                 onChange={(val) => formik.setFieldValue("description", val)}
//               />
//             </div>

//             {/* Features */}
//             <div>
//               <Label>Features</Label>

//               <div className="flex gap-2">
//                 <Input
//                   placeholder="Add feature (e.g., AI Assistant)"
//                   value={featureInput}
//                   onChange={(e) => setFeatureInput(e.target.value)}
//                 />
//                 <Button
//                   type="button"
//                   size="sm"
//                   onClick={addFeature}
//                   className="whitespace-nowrap"
//                 >
//                   Add
//                 </Button>
//               </div>

//               {/* Features List */}
//               <div className="mt-3 space-y-2">
//                 {formik.values.features?.map((feature, index) => (
//                   <div
//                     key={index}
//                     className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg"
//                   >
//                     <span>{feature}</span>
//                     <button
//                       type="button"
//                       className="text-error-500 text-sm"
//                       onClick={() => removeFeature(index)}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Submit */}
//             <div className="pt-4">
//               <Button
//                 className="w-full"
//                 type="submit"
//                 disabled={formik.isSubmitting || loading}
//               >
//                 {loading
//                   ? "Saving..."
//                   : selectedPlans
//                   ? "Update Plan"
//                   : "Add Plan"}
//               </Button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </Modal>
//   );
// }
