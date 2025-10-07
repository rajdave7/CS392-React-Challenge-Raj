import { useEffect, useState } from "react";
import type { Course } from "./CourseList";
import { z } from "zod";
import { getDatabase, ref, set } from "firebase/database";

export interface CourseFormProps {
  course: Course | null;
  onClose: () => void;
}

const DAY_TOKEN_RE = /(Tu|Th|Sa|Su|M|W|F)/g;

const MEETS_FULL_RE =
  /^((?:(?:Tu|Th|Sa|Su|M|W|F))+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/;

function tokenizeDays(dayStr: string): string[] | null {
    // Extract tokens using DAY_TOKEN_RE and ensure they concatenate back to the same string.
  DAY_TOKEN_RE.lastIndex = 0;
  const toks: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = DAY_TOKEN_RE.exec(dayStr)) !== null) {
    toks.push(m[0]);
  }
  if (toks.length === 0) return null;
  if (toks.join("") !== dayStr) return null; 
  if (new Set(toks).size !== toks.length) return null;
  return toks;
}

function minutesFromHM(hm: string): number | null {
  const parts = hm.split(":");
  if (parts.length !== 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

const TERM = z.enum(["Fall", "Winter", "Spring", "Summer"] as const);

const baseCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Title must be at least 2 characters (e.g., 'AI')." }),
  term: TERM,
  number: z
    .string()
    .trim()
    .regex(/^\d+(?:-\d+)?$/, {
      message:
        "Course number must be digits with optional '-section', e.g., '213' or '213-2'.",
    }),
});

const meetsSchema = z.union([
  z.literal("").transform(() => ""),
  z
    .string()
    .trim()
    .refine(
      (s) => {
        const m = s.match(MEETS_FULL_RE);
        if (!m) return false;
        const [, daysStr, startStr, endStr] = m;
        const toks = tokenizeDays(daysStr);
        if (!toks) return false;
        const startMin = minutesFromHM(startStr);
        const endMin = minutesFromHM(endStr);
        if (startMin === null || endMin === null) return false;
        return endMin > startMin;
      },
      {
        message:
          "Must contain days and start-end times, e.g., 'MWF 12:00-13:20'. Days allowed: M Tu W Th F Sa Su.",
      }
    ),
]);

export const fullCourseSchema = baseCourseSchema.extend({
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


const CourseForm = ({ course, onClose }: CourseFormProps) => {
  const [title, setTitle] = useState("");
  const [meets, setMeets] = useState("");
  const [term, setTerm] = useState<
    "Fall" | "Winter" | "Spring" | "Summer" | string
  >("Fall");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(course?.title ?? "");
    setMeets(course?.meets ?? "");
    setTerm(course?.term ?? "Fall");
    setNumber(course?.number ?? "");
    setErrors({});
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Check for no changes (compare to original course)
    const original = course ?? { title: "", term: "", number: "", meets: "" };
    const changed =
      original.title !== result.values!.title ||
      original.term !== result.values!.term ||
      original.number !== result.values!.number ||
      original.meets !== result.values!.meets;

    if (!changed) {
      setErrors({ _global: "No changes to save." });
      return;
    }

    // build id and data to save
    const id = `${result.values!.term}-${result.values!.number}`;
    const dataToSave = {
      term: result.values!.term,
      meets: result.values!.meets,
      title: result.values!.title,
      number: result.values!.number,
    };

    setErrors({});
    setIsSubmitting(true);
    try {
      // write to /cs-courses/courses/<id>
      const db = getDatabase();
      await set(ref(db, `cs-courses/courses/${id}`), dataToSave);

      // success: close the form
      onClose();
    } catch (err) {
      setErrors({ _global: `Save failed: ${String(err)}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {course ? "Edit Course" : "New Course"}
      </h2>

      {errors._global ? (
        <div className="mb-3 text-sm text-red-600">{errors._global}</div>
      ) : null}

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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            placeholder="e.g. MWF 9:00-9:50 or TuTh 14:00-15:20"
            aria-label="Meeting times"
            aria-invalid={!!errors.meets}
            aria-describedby={errors.meets ? "err-meets" : undefined}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary px-4 py-2"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
