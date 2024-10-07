import * as React from 'react';
import css from './CourseSearch.module.css';
import { Row } from 'read-excel-file';
import { addManualData, Course, deParseDay, deParseQuarter, ExcelRowToCourse, parseDayExcel } from '../control/CourseData';

type Props = {
    allCourses?: Course[];
    display: boolean;
    loadedCourses: Course[]
    setLoadedCourses: (courses: Course[]) => void;
}

export const CourseSearch: React.FC<Props> = ({ allCourses, display, loadedCourses, setLoadedCourses }) => {
    const [filterText, setFilterText] = React.useState("");

    const addNewCourse = (selectedCourse: Course) => {
        if (!allCourses) {
            return;
        }

        let courses: Course[] = [];
        allCourses.forEach(course => {
            if (course.code === selectedCourse.code) {
                courses.push(course);
            }
        });

        let error = false;
        courses.forEach(newCourse => {
            loadedCourses.forEach(currentCourse => {
                if (newCourse.code === currentCourse.code) {
                    error = true;
                    console.error("Cant add course because it already is added");
                    return;
                }

                if (newCourse.period === currentCourse.period && newCourse.day === currentCourse.day) {
                    if (newCourse.quarter === "0"
                        || currentCourse.quarter === "0"
                        || newCourse.quarter === currentCourse.quarter
                    ) {
                        error = true;
                        console.error("Cant add course over already exisiting courses");
                        return;
                    }
                }
            });
        });

        courses = addManualData(courses);

        if (!error) {
            setLoadedCourses([...loadedCourses, ...courses])
            setFilterText("");
        }
    }

    const getResults = () => {
        if (!allCourses || !display || filterText === "" || filterText.length < 3) {
            return;
        }

        const returnCourses: Course[] = [];
        for (let index = 0; index < allCourses.length; index++) {
            const course = allCourses[index];
            if ((course.nameEN).toLowerCase().includes(filterText.toLowerCase())) {
                if (!returnCourses.find((addedCourse) => addedCourse.code === course.code)) {
                    returnCourses.push(course)
                }
            } else if (filterText.includes("#")) {
                let split = filterText.split("#");
                if (split[1].trim() !== "" && deParseDay(course.day).includes(split[0]) && course.period.includes(split[1]))
                {
                    if (!returnCourses.find((addedCourse) => addedCourse.code === course.code)) {
                        returnCourses.push(course)
                    }
                }
            }
        }

        const returnRows: React.JSX.Element[] = [];
        returnCourses.sort((a, b) => {
            if (a.nameEN < b.nameEN) {
                return -1;
              }
              if (a.nameEN > b.nameEN) {
                return 1;
              }
              return 0;
        });

        for (let index = 0; index < returnCourses.length; index++) {
            const course = returnCourses[index];
            let courses = allCourses.filter(c => c.code === course.code);
            if (courses.length > 1) {
                returnRows.push(<CourseRow courses={courses} addFunction={addNewCourse} />);
            } else {
                returnRows.push(<CourseRow course={course} addFunction={addNewCourse} />);
            }
        }

        return returnRows;
    };
    
    return (
        <div className={css.courseSearchContainer}>
            {
                display !== false
                ? <><div className={css.courseSearchLabel}>Search Course</div>
                <input className={css.courseSearchBox} type='text' value={filterText} onChange={(e) => setFilterText(e.target.value)}/></>
                : <></>
            }
            <div className={css.courseSearchResultContainer}>
                {getResults()}
            </div>
        </div>
    )
}

type PropsCourseRow = {
    course?: Course;
    courses?: Course[];
    addFunction?: (course: Course) => void;
}

export const CourseRow: React.FC<PropsCourseRow> = ({ course, courses, addFunction }) => {
    const makeInfoBox = (checkedCourses: Course[]) => {
        const elements: React.JSX.Element[] = [];
        for (let index = 0; index < checkedCourses.length; index++) {
            const element = checkedCourses[index];
            elements.push(<div className={css.courseRowInfo}>{`${deParseDay(element.day)} ${element.period}`}</div>);
        }
        return elements;
    }
    
    return (
        <div className={css.courseRow}>
            {
                course !== undefined && addFunction !== undefined
                ? <div className={css.courseAddButton} onClick={() => addFunction(course)}>+</div>
                : courses !== undefined && addFunction !== undefined
                    ? <div className={css.courseAddButton} onClick={() => addFunction(courses[0])}>+</div>
                    : <></>
            }
            {
                course
                ? <div className={css.courseRowMainContainer}>
                    <div className={css.courseRowName}>{`${course.nameEN}`}</div>
                    <div className={css.courseRowQuarter}>{`${deParseQuarter(course.quarter)}`}</div>
                    <div className={css.courseRowMinSem}>{`Avaible from semester: ${course.semesterMin}`}</div>
                </div>
                : courses
                    ? <div className={css.courseRowMainContainer}>
                        <div className={css.courseRowName}>{`${courses[0].nameEN}`}</div>
                        <div className={css.courseRowQuarter}>{`${deParseQuarter(courses[0].quarter)}`}</div>
                        <div className={css.courseRowMinSem}>{`Avaible from semester: ${courses[0].semesterMin}`}</div>
                        </div>
                    : <div className={css.courseRowName}>{"Specify you search..."}</div>
            }
            {
                course
                ? <div className={css.courseRowInfo}>{`${deParseDay(course.day)} ${course.period}`}</div>
                : courses
                    ? <div className={css.courseRowInfoContainer}>
                        {makeInfoBox(courses)}
                    </div>
                    : <></>
            }
        </div>
    );
};