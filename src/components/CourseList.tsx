interface Course {
    term: string;
    meets: string;
    title: string;
    number: string;
}

interface CourseListProps {
  courses: Course[];
}

const CourseList = ({courses}:CourseListProps)=>
     (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 p-4 m-4">
        {courses.map((course) => (
          <div
            key={`${course.term}-${course.number}`}
            className="border-2 border-gray-200 bg-white h-48 rounded-lg p-4 flex flex-col"
          >
            <div className="mb-2 text-xl font-semibold">
              {course.term} CS{course.number}
            </div>
        
            
            <div className="text-l font-medium mb-2 h-16">{course.title}</div>
            <div className="border-t border-gray-200 mb-2"></div>
            <div className="text-l text-gray-600">{course.meets}</div>
          </div>
        ))}
      </div>
    )



export default CourseList;