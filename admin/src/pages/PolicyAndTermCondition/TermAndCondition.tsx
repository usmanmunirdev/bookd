import { useEffect, useState } from "react";
import { getTerms, createTerm, updateTerm } from "./_requests";
import { toast } from "react-toastify";
import Button from "../../components/ui/button/Button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function TermsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // replaced message with content
  const [termId, setTermId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTerm();
  }, []);

  const fetchTerm = async () => {
    try {
      const response: any = await getTerms();
      if (response?.data?.length > 0) {
        const term = response.data[0];
        setTitle(term.title);
        setContent(term.message); // populate rich editor
        setTermId(term.id);
      } else {
        setTitle("");
        setContent("");
        setTermId(null);
      }
    } catch (error: any) {
      toast.error("Failed to load Terms & Conditions");
    } 
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      if (termId) {
        await updateTerm(termId, { title, message: content });
        toast.success("Terms & Conditions updated successfully");
      } else {
        await createTerm({ title, message: content });
        toast.success("Terms & Conditions created successfully");
      }
      fetchTerm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90">
        Terms & Conditions
      </h1>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 ">
        {/* Title Input */}
        <div className="mb-[20px]">
          <label className="font-medium text-lg text-gray-800 dark:text-white/90">
            Title
          </label>
          <input
            type="text"
            placeholder="Enter Terms & Conditions Title"
            className="border p-2 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:text-gray-400 mt-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Rich Text Editor */}
        <div className="mb-[20px]">
          <label className="font-medium text-lg text-gray-800 dark:text-white/90">
            Content
          </label>
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
            {loading ? "Saving..." : termId ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
