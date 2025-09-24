import Banner from "./components/Banner";
import CourseList from "./components/CourseList";
import { useJsonQuery } from './utilities/fetch';

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
  const [json, isLoading, error] = useJsonQuery('https://courses.cs.northwestern.edu/394/guides/data/cs-courses.php');

  if (error) return <h1>Error loading course data: {`${error}`}</h1>;
  if (isLoading) return <h1>Loading course data...</h1>;
  if (!json) return <h1>No course data found</h1>;
  const schedule = json as CourseListProps;
  return (
    <>
      <Banner title={schedule.title}/>
      <CourseList courses={Object.values(schedule.courses)}/>
      
    </>
  );
};


export default App;