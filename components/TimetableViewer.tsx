import * as React from 'react';
import css from './TimetableViewer.module.css';
import { Course } from '../control/CourseData';

type Props = {
    courses: Course[],
    displayCourses: boolean
    quarterTwoActive: boolean;
    setLoadedCourses: (courses: Course[]) => void;
    forceUpdateParent: () => void;
}

export const TimetableViewer: React.FC<Props> = ({courses, forceUpdateParent, setLoadedCourses, displayCourses, quarterTwoActive}) => {
    const currentQuarter = quarterTwoActive === false ? "1" : "2";
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const makeTableBody = () => {
        const makeRow = (number: number, courses: Course[]) => {
            const quarterCourses = courses.filter((course) => course.quarter === "0" || course.quarter === currentQuarter)
            const text = number === 7 ? "Session" : "Period " + number;

            return (
            <tr key={number}>
                <td className={css.periodBox}>{text}</td>
                { displayCourses ? <>
                    <ClassBox onUpdateTA={onUpdateTA} course={quarterCourses.find((course) => course.day === "1")} />
                    <ClassBox onUpdateTA={onUpdateTA} course={quarterCourses.find((course) => course.day === "2")} />
                    <ClassBox onUpdateTA={onUpdateTA} course={quarterCourses.find((course) => course.day === "3")} />
                    <ClassBox onUpdateTA={onUpdateTA} course={quarterCourses.find((course) => course.day === "4")} />
                    <ClassBox onUpdateTA={onUpdateTA} course={quarterCourses.find((course) => course.day === "5")} />
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
                        { <ClassBox className={css.sessionClassBox} onUpdateTA={onUpdateTA} course={sessionCourse} /> }
                    </tr>
                </table> : <></>
            }
        </div>
    )
}

type PropsClassBox = {
    course?: Course;
    onUpdateTA: (course: Course, checked: boolean) => void;
    className?: string;
}

export const ClassBox: React.FC<PropsClassBox> = ({ course, onUpdateTA, className = "" }) => {
    if (course === undefined) {
        return (<td className={css.cellBox}></td>)
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
            <div className={css.courseCredits}>{course.isTA ? `⭐ Credits: TA` : `⭐ Credits: ${course.credits}`}</div>
            <div className={css.courseCode}>{`🔗 ${course.code}`}</div>
            <input type="checkbox" className={css.taButton} checked={course.isTA ?? false} onChange={(e) => onUpdateTA(course, e.target.checked)}/>
        </td>
    );
};