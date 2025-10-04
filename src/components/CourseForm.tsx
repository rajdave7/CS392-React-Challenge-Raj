
import { useEffect, useState } from "react";
import type { Course } from "./CourseList";
import { z } from "zod";

export interface CourseFormProps {
  course: Course | null;
  onClose: () => void;
}


export const courseSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters (e.g., 'AI')." })
    .trim(),
  term: z.enum(["Fall", "Winter", "Spring", "Summer"], {
    errorMap: () => ({
      message: "Term must be one of: Fall, Winter, Spring, Summer.",
    }),
  }),
  number: z.string().regex(/^\d+(?:-\d+)?$/, {
    message:
      "Course number must be digits with optional '-section', e.g., '213' or '213-2'.",
  }),
  meets: z
    .string()
    .refine((s) => s.trim().length === 0 || true, {
      message: "Invalid meets format.",
    }) // placeholder to keep union below narrow in editor
    .transform((s) => s.trim()),
});


const meetsPattern = /^([MTWRFSU]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/;

const meetsSchema = z.union([
  z.literal("").transform(() => ""),
  z
    .string()
    .regex(meetsPattern, {
      message:
        "Must contain days and start-end times, e.g., 'MWF 12:00-13:20'. Days: M T W R F S U.",
    })
    .refine((s) => {
      const m = s.match(meetsPattern);
      if (!m) return false;
      const [, days, startStr, endStr] = m;
      if (!/^[MTWRFSU]+$/.test(days)) return false;

      const toMinutes = (t: string) => {
        const [hStr, mStr] = t.split(":");
        const h = Number(hStr);
        const mm = Number(mStr);
        if (Number.isNaN(h) || Number.isNaN(mm)) return NaN;
        if (h < 0 || h > 23 || mm < 0 || mm > 59) return NaN;
        return h * 60 + mm;
      };

      const startMin = toMinutes(startStr);
      const endMin = toMinutes(endStr);
      if (Number.isNaN(startMin) || Number.isNaN(endMin)) return false;
      return endMin > startMin;
    }, "End time must be after start time."),
]);

export const fullCourseSchema = courseSchema.extend({
  meets: meetsSchema,
});

export type CourseData = z.infer<typeof fullCourseSchema>;

export type ValidationResult = {
  valid: boolean;
  values?: CourseData;
  errors?: Record<string, string>;
};

export function validateCourseData(data: {
  title: string;
  term: string;
  number: string;
  meets: string;
}): ValidationResult {
  const result = fullCourseSchema.safeParse({
    title: data.title,
    term: data.term,
    number: data.number,
    meets: data.meets,
  });

  if (result.success) {
    return { valid: true, values: result.data };
  }


  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path[0] as string | undefined;
    const message = issue.message || "Invalid value";
    if (path) {
      if (!errors[path]) errors[path] = message;
    } else {
      if (!errors._global) errors._global = message;
    }
  }

  return { valid: false, errors };
}

/* -------------------- CourseForm component (UI) -------------------- */

const CourseForm = ({ course, onClose }: CourseFormProps) => {
  const [title, setTitle] = useState("");
  const [meets, setMeets] = useState("");
  const [term, setTerm] = useState<
    "Fall" | "Winter" | "Spring" | "Summer" | string
  >("Fall");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTitle(course?.title ?? "");
    setMeets(course?.meets ?? "");
    setTerm(course?.term ?? "Fall");
    setNumber(course?.number ?? "");
    setErrors({});
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      title: title.trim(),
      term: term,
      number: number.trim(),
      meets: meets.trim(),
    };

    const result = validateCourseData(input);
    if (!result.valid) {
      setErrors(result.errors ?? {});
      return;
    }

    setErrors({});
    onClose();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Edit Course</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-2">
          <label className="block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            type="text"
            name="title"
            aria-label="Course title"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "err-title" : undefined}
          />
          {errors.title ? (
            <div id="err-title" className="text-sm text-red-600 mt-1">
              {errors.title}
            </div>
          ) : null}
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium">Term</label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full border rounded p-2"
            aria-label="Term"
            aria-invalid={!!errors.term}
            aria-describedby={errors.term ? "err-term" : undefined}
          >
            <option>Fall</option>
            <option>Winter</option>
            <option>Spring</option>
            <option>Summer</option>
          </select>
          {errors.term ? (
            <div id="err-term" className="text-sm text-red-600 mt-1">
              {errors.term}
            </div>
          ) : null}
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium">Course Number</label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full border rounded p-2"
            type="text"
            name="number"
            aria-label="Course number"
            placeholder="e.g. 213 or 213-2"
            aria-invalid={!!errors.number}
            aria-describedby={errors.number ? "err-number" : undefined}
          />
          {errors.number ? (
            <div id="err-number" className="text-sm text-red-600 mt-1">
              {errors.number}
            </div>
          ) : null}
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
            aria-invalid={!!errors.meets}
            aria-describedby={errors.meets ? "err-meets" : undefined}
          />
          {errors.meets ? (
            <div id="err-meets" className="text-sm text-red-600 mt-1">
              {errors.meets}
            </div>
          ) : (
            <div className="text-xs text-gray-500 mt-1">
              Leave empty if the meeting time is not known.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-secondary px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-4 py-2">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
