
const schedule = {
  "title": "CS Courses for 2025-2026",
  "courses": {
    "F101" : {
      "term": "Fall",
      "number": "101",
      "meets" : "MWF 11:00-11:50",
      "title" : "Computer Science: Concepts, Philosophy, and Connections"
    }
    
  }
};


const App = () => {

  return (
    <>
      <h1>{schedule.title}</h1>
      
      <p></p>
      <h2>{schedule.courses.F101.term} {schedule.courses.F101.title} {schedule.courses.F101.meets} {schedule.courses.F101.number}</h2>

    </>
  );
};


export default App;