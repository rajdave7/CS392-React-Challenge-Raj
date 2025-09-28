interface Course {
  term: string;
  meets: string;
  title: string;
  number: string;
}

interface CourseListProps {
  courses: Course[];
  selected: string[]; 
  toggleSelected: (id: string) => void;
}

const CourseList = ({ courses, selected, toggleSelected }: CourseListProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 p-4 m-4">
      {courses.map((course) => {
        const id = `${course.term}-${course.number}`;
        const isSelected = selected.includes(id);

        const cardClasses = [
          "border-2",
          "rounded-lg",
          "p-4",
          "flex",
          "flex-col",
          "h-48",
          "cursor-pointer",
          isSelected
            ? "bg-blue-50 border-blue-400"
            : "bg-white border-gray-200",
        ].join(" ");

        return (
          <div
            key={id}
            className={cardClasses}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => toggleSelected(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSelected(id);
              }
            }}
          >
            <div className="mb-2 text-xl font-semibold">
              {course.term} CS{course.number}
            </div>

            <div className="text-l font-medium mb-2 h-16">{course.title}</div>
            <div className="border-t border-gray-200 mb-2"></div>
            <div className="text-l text-gray-600">{course.meets}</div>
          </div>
        );
      })}
    </div>
  );
};

export default CourseList;
