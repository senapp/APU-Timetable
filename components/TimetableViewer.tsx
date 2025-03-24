import * as React from 'react';
import css from './TimetableViewer.module.css';
import { Course, deParseDay } from '../control/CourseData';

type Props = {
    courses: Course[],
    displayCourses: boolean
    quarterTwoActive: boolean;
    setLoadedCourses: (courses: Course[]) => void;
    showCourses: (searchInput: string) => void;
    forceUpdateParent: () => void;
}

export const TimetableViewer: React.FC<Props> = ({courses, forceUpdateParent, showCourses, setLoadedCourses, displayCourses, quarterTwoActive}) => {
    const currentQuarter = quarterTwoActive === false ? "1" : "2";
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    const showCoursesButton = (day: string, period: string) => {
        let text = deParseDay(day) + "#" + period;
        showCourses(text);
    }

    const makeTableBody = () => {
        const makeRow = (number: number, courses: Course[]) => {
            const quarterCourses = courses.filter((course) => course.quarter === "0" || course.quarter === currentQuarter)
            const text = number === 7 ? "Session" : "Period " + number;

            return (
            <tr key={number}>
                <td className={css.periodBox}>{text}</td>
                { displayCourses ? <>
                    <ClassBox onUpdateTA={onUpdateTA} onRemoveCourse={onRemoveCourse} showCoursesButton={showCoursesButton} day='1' period={number.toString()} course={quarterCourses.find((course) => course.day === "1")} />
                    <ClassBox onUpdateTA={onUpdateTA} onRemoveCourse={onRemoveCourse} showCoursesButton={showCoursesButton} day='2' period={number.toString()} course={quarterCourses.find((course) => course.day === "2")} />
                    <ClassBox onUpdateTA={onUpdateTA} onRemoveCourse={onRemoveCourse} showCoursesButton={showCoursesButton} day='3' period={number.toString()} course={quarterCourses.find((course) => course.day === "3")} />
                    <ClassBox onUpdateTA={onUpdateTA} onRemoveCourse={onRemoveCourse} showCoursesButton={showCoursesButton} day='4' period={number.toString()} course={quarterCourses.find((course) => course.day === "4")} />
                    <ClassBox onUpdateTA={onUpdateTA} onRemoveCourse={onRemoveCourse} showCoursesButton={showCoursesButton} day='5' period={number.toString()} course={quarterCourses.find((course) => course.day === "5")} />
                </>:
                <>
                    <td className={css.cellBox}></td>
                    <td className={css.cellBox}></td>
                    <td className={css.cellBox}></td>
                    <td className={css.cellBox}></td>
                    <td className={css.cellBox}></td>
                </>}
            </tr>);
        }

        const makeRows = () => {
            const outputRows: React.JSX.Element[] = [];
            for (let index = 1; index <= 6; index++) {
                const periodCourses = index === 7 ? courses.filter((course) => course.period == "Session") : courses.filter((course) => course.period == index.toString());
                outputRows.push(makeRow(index, periodCourses));
            }
            return outputRows;
        }

        return (<tbody>
            {makeRows()}
        </tbody>)
    }

    const onUpdateTA = (course: Course, checked: boolean) => {
        for (let index = 0; index < courses.length; index++) {
            if (course.code === courses[index].code) {
                courses[index].isTA = checked;
            }
        }

        setLoadedCourses(courses);
        forceUpdate();
        forceUpdateParent();
    }

    const onRemoveCourse = (course: Course) => {
        let newCourses: Course[] = courses;
        for (let index = 0; index < newCourses.length; index++) {
            if (course.code === newCourses[index].code) {
                newCourses.splice(index, 1);
                index--;
            }
        }
        
        setLoadedCourses(newCourses);
        forceUpdate();
        forceUpdateParent();
    }

    const sessionCourse = courses.find((course) => course.day == "0");

    return (
        <div id={css.calendarContainer}>
            <table id={css.calendarTable}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                    </tr>
                </thead>
                {makeTableBody()}
            </table>
            { sessionCourse !== undefined ?
                <table className={css.sessionClass}>
                    <tr>
                        <td className={css.sessionBox}>{"Session"}</td>
                        { <ClassBox className={css.sessionClassBox} onUpdateTA={onUpdateTA} onRemoveCourse={onRemoveCourse} showCoursesButton={showCoursesButton} day='-1' period='7' course={sessionCourse} /> }
                    </tr>
                </table> : <></>
            }
        </div>
    )
}

type PropsClassBox = {
    course?: Course;
    day: string;
    period: string;
    showCoursesButton: (day: string, period: string) => void;
    onUpdateTA: (course: Course, checked: boolean) => void;
    onRemoveCourse: (course: Course) => void;
    className?: string;
}

export const ClassBox: React.FC<PropsClassBox> = ({ course, day, period, showCoursesButton, onUpdateTA, onRemoveCourse, className = "" }) => {
    if (course === undefined) {
        return (<td className={css.cellBox}>
            <div className={css.courseAddButton} onClick={() => showCoursesButton(day, period)}>+</div>
        </td>)
    }

    let collegeClass = course.field === "専門/Major"
        ? css.collegeMajor
        : course.field === "他学部/Other College"
        ? css.collegeOther
        : course.field === "言語/Language"
        ? css.collegeLangauge
        : course.field === "教養/Liberal Arts"
        ? css.collegeLiberalArts
        : "";

    if (course.isTA) {
        collegeClass = css.collegeTa;
    }

    return (
        <td className={`${css.cellBox} ${collegeClass} ${className}`}>
            <div className={css.topHalf}>
                {
                    course.nameEN.length > 30
                    ? <div className={css.courseName}>
                        {`📖`}
                        <p className={css.marquee}>
                            <span>{course.nameEN}</span>
                        </p>
                    </div>
                    : <div className={css.courseName}>
                        {`📖 ${course.nameEN}`}
                    </div>
                }
                <div className={css.courseRoom}>{`📍 ${course.location}`}</div>
                {
                    course.instructorEN.length > 30
                    ? <div className={css.courseInstructor}>
                        {`🧑‍🏫`}
                        <p className={css.marquee}>
                            <span>{course.instructorEN}</span>
                        </p>
                    </div>
                    : <div className={css.courseInstructor}>
                        {`🧑‍🏫 ${course.instructorEN}`}
                    </div>
                }
            </div>
            <div className={css.bottomHalf}>
                <div className={css.right}>
                    <div className={css.courseCredits}>{course.isTA ? `⭐ Credits: TA` : `⭐ Credits: ${course.credits}`}</div>
                    <div className={css.courseCode}>{`🔗 ${course.code}`}</div>
                </div>
                <div className={css.left}>
                    <input type="checkbox" className={css.taButton} checked={course.isTA ?? false} onChange={(e) => onUpdateTA(course, e.target.checked)}/>
                </div>
            </div>
            <div className={css.courseRemoveButton} onClick={() => onRemoveCourse(course)}>x</div>
        </td>
    );
};