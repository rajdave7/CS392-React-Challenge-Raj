import { useEffect, useState } from "react";
import type { Course } from "./CourseList";

export interface CourseFormProps {
  course: Course | null;
  onClose: () => void;
}

const CourseForm = ({ course, onClose }: CourseFormProps) => {
  const [title, setTitle] = useState("");
  const [meets, setMeets] = useState("");

  useEffect(() => {
    setTitle(course?.title ?? "");
    setMeets(course?.meets ?? "");
  }, [course]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Edit Course</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // do nothing on submit per requirements
        }}
      >
        <div className="mb-2">
          <label className="block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            type="text"
            name="title"
            aria-label="Course title"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Meets</label>
          <input
            value={meets}
            onChange={(e) => setMeets(e.target.value)}
            className="w-full border rounded p-2"
            type="text"
            name="meets"
            placeholder="e.g. MWF 9:00-9:50"
            aria-label="Meeting times"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-secondary px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
