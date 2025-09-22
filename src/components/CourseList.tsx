interface Course {
    term: string;
    meets: string;
    title: string;
    number: string;
}

interface CourseListProps {
  courses: Course[];
}

const CourseList = ({courses}:CourseListProps)=>{
    return courses.map(course=> <p>{course.term} {course.number} {course.title} {course.meets}</p>)
}


export default CourseList;