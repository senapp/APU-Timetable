import * as React from 'react';
import css from './TimetableViewer.module.css';
import { Course } from '../control/CourseData';

type Props = {
    courses: Course[],
    displayCourses: boolean
    quarterTwoActive: boolean;
}

export const TimetableViewer: React.FC<Props> = ({courses, displayCourses, quarterTwoActive}) => {
    const currentQuarter = quarterTwoActive === false ? "1" : "2";
    const makeTableBody = () => {
        const makeRow = (number: number, courses: Course[]) => {
            const quarterCourses = courses.filter((course) => course.semester === "0" || course.semester === currentQuarter)
            const text = number === 7 ? "Session" : "Period " + number;

            return (
            <tr key={number}>
                <td className={css.periodBox}>{text}</td>
                { displayCourses ? <>
                    <ClassBox course={quarterCourses.find((course) => course.day === "1")} />
                    <ClassBox course={quarterCourses.find((course) => course.day === "2")} />
                    <ClassBox course={quarterCourses.find((course) => course.day === "3")} />
                    <ClassBox course={quarterCourses.find((course) => course.day === "4")} />
                    <ClassBox course={quarterCourses.find((course) => course.day === "5")} />
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
        </div>
    )
}

type PropsClassBox = {
    course?: Course,
}

export const ClassBox: React.FC<PropsClassBox> = ({course}) => {
    if (course === undefined) {
        return (<td className={css.cellBox}></td>)
    }

    const collegeClass = course.college === "専門/Major"
        ? css.collegeMajor
        : course.college === "他学部/Other College"
        ? css.collegeOther
        : course.college === "言語/Language"
        ? css.collegeLangauge
        : course.college === "教養/Liberal Arts"
        ? css.collegeLiberalArts
        : "";

    return (
        <td className={`${css.cellBox} ${collegeClass}`}>
            {
                course.name.length > 30
                ? <div className={css.courseName}>
                    {`📖`}
                    <p className={css.marquee}>
                        <span>{course.name}</span>
                    </p>
                </div>
                : <div className={css.courseName}>
                    {`📖 ${course.name}`}
                </div>
            }
            <div className={css.courseRoom}>{`📍 ${course.location}`}</div>
            {
                course.instructor.length > 30
                ? <div className={css.courseInstructor}>
                    {`🧑‍🏫`}
                    <p className={css.marquee}>
                        <span>{course.instructor}</span>
                    </p>
                </div>
                : <div className={css.courseInstructor}>
                    {`🧑‍🏫 ${course.instructor}`}
                </div>
            }
            <div className={css.courseCredits}>{`⭐ Credits: ${course.credits}`}</div>
            <div className={css.courseCode}>{`🔗 ${course.code}`}</div>
        </td>
    );
};