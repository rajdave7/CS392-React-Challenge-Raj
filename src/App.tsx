import Banner from "./components/Banner";
import CourseList from "./components/CourseList";
import { useJsonQuery } from "./utilities/fetch";
import TermFilter, { type Term } from "./components/TermFilter";
import { useState } from "react";

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
  const [json, isLoading, error] = useJsonQuery(
    "https://courses.cs.northwestern.edu/394/guides/data/cs-courses.php"
  );

  const [selectedTerm, setSelectedTerm] = useState<Term>("Fall");
  if (error) return <h1>Error loading course data: {`${error}`}</h1>;
  if (isLoading) return <h1>Loading course data...</h1>;
  if (!json) return <h1>No course data found</h1>;
  const schedule = json as CourseListProps;
  const allCourses: Course[] = Object.values(schedule.courses || {});
  const filteredSchedule = allCourses.filter((c) => c.term === selectedTerm);
  return (
    <>
      <Banner title={schedule.title} />
      <TermFilter term={selectedTerm} setTerm={setSelectedTerm} />

      <CourseList courses={filteredSchedule} />
    </>
  );
};

export default App;
