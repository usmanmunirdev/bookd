// src/admin/termsPrivacy/TermsPage.tsx
import { useEffect, useState } from "react";
import { getPrivacy, createPrivacy, updatePrivacy } from "./_requests";
import { toast } from "react-toastify";
import Button from "../../components/ui/button/Button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function PrivacyPolicy() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [privacyId, setPrivacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrivacy();
  }, []);

  const fetchPrivacy = async () => {
    try {
      const response: any = await getPrivacy();
      if (response?.data?.length > 0) {
        const privacy = response.data[0];
        setTitle(privacy.title);
        setContent(privacy.message);
        setPrivacyId(privacy.id);
      } else {
        setTitle("");
        setContent("");
        setPrivacyId(null);
      }
    } catch (error: any) {
      toast.error("Failed to load Privacy Policy");
    } 
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      if (privacyId) {
        await updatePrivacy(privacyId, { title, message: content });
        toast.success("Privacy Policy updated successfully");
      } else {
        await createPrivacy({ title, message: content });
        toast.success("Privacy Policy created successfully");
      }
      fetchPrivacy();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90">Privacy Policy</h1>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">

      {/* Title Input */}
      <div className="mb-[20px]">
        <label className="font-medium text-lg text-gray-800 dark:text-white/90">Title</label>
        <input
          type="text"
          placeholder="Enter Privacy Policy Title"
          className="border p-2 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:text-gray-400 mt-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* ReactQuill Editor */}
      <div className="mb-[20px]">
        <label className="font-medium text-lg text-gray-800 dark:text-white/90">Content</label>
        <ReactQuill
          theme="snow"
          className="mt-4"
          value={content}
          onChange={setContent}
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              ["clean"],
            ],
          }}
          formats={[
            "header",
            "bold",
            "italic",
            "underline",
            "strike",
            "list",
            "bullet",
            "link",
            "image",
          ]}
         
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : privacyId ? "Update" : "Save"}
        </Button>
      </div>
      </div>
    </div>
  );
}
