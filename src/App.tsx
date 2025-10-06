import Banner from "./components/Banner";
import CourseList from "./components/CourseList";
// import { useJsonQuery } from "./utilities/fetch";
import TermFilter, { type Term } from "./components/TermFilter";
import Modal from "./components/Modal";
import { useState } from "react";
import CourseForm from "./components/CourseForm";
import { useDataQuery } from "./utilities/firebase";

interface Course {
  term: string;
  meets: string;
  title: string;
  number: string;
}

interface CourseListProps {
  title: string;
  courses: Course[];
}

const App = () => {
  const [json, isLoading, error] = useDataQuery("/cs-courses");

  const [selectedTerm, setSelectedTerm] = useState<Term>("Fall");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const toggleCourse = (id: string) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const [planOpen, setPlanOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const openEdit = (id: string) => {
    setEditingCourseId(id);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditingCourseId(null);
    setEditOpen(false);
  };

  if (error) return <h1>Error loading course data: {`${error}`}</h1>;
  if (isLoading) return <h1>Loading course data...</h1>;
  if (!json) return <h1>No course data found</h1>;
  const schedule = json as CourseListProps;
  const allCourses: Course[] = Object.values(schedule.courses || {});
  const allCoursesMap: Record<string, Course> = Object.fromEntries(
    allCourses.map((c) => [`${c.term}-${c.number}`, c])
  );
  const filteredSchedule = allCourses.filter((c) => c.term === selectedTerm);
  const selectedCourseObjects = allCourses.filter((c) =>
    selectedCourses.includes(`${c.term}-${c.number}`)
  );

  const editingCourse = editingCourseId
    ? allCoursesMap[editingCourseId] ?? null
    : null;

  return (
    <>
      <Banner title={schedule.title} />
      <div className="flex items-center flex-wrap justify-center">
        <div className="">
          <TermFilter term={selectedTerm} setTerm={setSelectedTerm} />
        </div>

        <div className="">
          <button
            className="btn btn-primary m-1 p-2 bg-amber-200 hover:bg-amber-300 border-b-red-100 rounded-2xl"
            onClick={() => setPlanOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={planOpen}
          >
            Course Plan
          </button>
        </div>
      </div>

      <div className="text-center my-2">
        <small>{selectedCourses.length} selected</small>
      </div>

      <CourseList
        courses={filteredSchedule}
        selected={selectedCourses}
        toggleSelected={toggleCourse}
        allCoursesMap={allCoursesMap}
        onEdit={openEdit}
      />

      <Modal isOpen={planOpen} onClose={() => setPlanOpen(false)}>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Course Plan</h2>

          {selectedCourseObjects.length === 0 ? (
            <div>
              <p className="mb-2">No courses selected yet.</p>
              <p className="text-sm text-gray-600">
                To add courses to your plan, click any course card.
              </p>
            </div>
          ) : (
            <ul className="max-h-64 overflow-auto divide-y">
              {selectedCourseObjects.map((c) => {
                const id = `${c.term}-${c.number}`;
                return (
                  <li key={`plan-${id}`} className="py-2">
                    <div className="font-semibold">
                      {c.term} CS{c.number}: {c.title}
                    </div>
                    <div className="text-sm text-gray-600">{c.meets}</div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-2 ">
            <button
              className="btn btn-secondary"
              onClick={() => setPlanOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={editOpen} onClose={closeEdit}>
        <CourseForm course={editingCourse} onClose={closeEdit} />
      </Modal>
    </>
  );
};

export default App;
