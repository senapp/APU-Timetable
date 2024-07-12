import * as React from 'react';
import css from './CourseSearch.module.css';
import { Row } from 'read-excel-file';
import { Course, ExcelRowToCourse } from '../control/CourseData';

type Props = {
    excelRows?: Row[];
    display: boolean;
    loadedCourses: Course[]
    setLoadedCourses: (courses: Course[]) => void;
}

export const CourseSearch: React.FC<Props> = ({ excelRows, display, loadedCourses, setLoadedCourses }) => {
    const [filterText, setFilterText] = React.useState("");

    const addRowToCourses = (selectedRow: Row) => {
        if (!excelRows) {
            return;
        }

        const relevantRows: Row[] = [];
        for (let index = 0; index < excelRows.length; index++) {
            const row = excelRows[index];
            if (row[6] === selectedRow[6]) {
                relevantRows.push(row);
            }
        }

        const courses: Course[] = [];
        for (let index = 0; index < relevantRows.length; index++) {
            const row = relevantRows[index];
            const res = ExcelRowToCourse(row);
            if (res) {
                if (relevantRows.length > 1) {
                    res.credits = relevantRows.length.toString();
                } else {
                    res.credits = "2";
                }

                if (index > 0) {
                    res.isExtraClass = true;
                }

                courses.push(res);
            }
        }

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
        if (!error) {
            setLoadedCourses([...loadedCourses, ...courses])
            setFilterText("");
        }
    }

    const getResults = () => {
        if (!excelRows || !display || filterText === "" || filterText.length < 3) {
            return;
        }

        const returnRowsExcel: Row[] = [];
        let excededSearch = false;
        let unqiueHits = 0;
        for (let index = 0; index < excelRows.length; index++) {
            const row = excelRows[index];
            if (unqiueHits >= 10) {
                excededSearch = true;
            }
            if (row[8] !== null && (row[8].toString() + row[8].toString()).toLowerCase().includes(filterText.toLowerCase())) {
                if (!returnRowsExcel.find((addedRow) => addedRow[6] === row[6])) {
                    unqiueHits++;
                }
                returnRowsExcel.push(row)
            }
        }
        const returnRows: React.JSX.Element[] = [];
        returnRowsExcel.sort((a, b) => {
            if (a[8].toString() < b[8].toString()) {
                return -1;
              }
              if (a[8].toString() > b[8].toString()) {
                return 1;
              }
              return 0;
            });
        for (let index = 0; index < returnRowsExcel.length; index++) {
            const row = returnRowsExcel[index];
            if (index + 1 < returnRowsExcel.length) {
                if (row[6].toString() === returnRowsExcel[index + 1][6].toString()) {
                    if (index + 2 < returnRowsExcel.length) {
                        if (row[6].toString() === returnRowsExcel[index + 2][6].toString()) {
                            if (index + 3 < returnRowsExcel.length) {
                                if (row[6].toString() === returnRowsExcel[index + 3][6].toString()) {
                                    returnRows.push(<CourseRow rows={[row, returnRowsExcel[index + 1], returnRowsExcel[index + 2], returnRowsExcel[index + 3]]} addFunction={addRowToCourses} />);
                                    index += 3;
                                    continue;
                                }
                            }
                            returnRows.push(<CourseRow rows={[row, returnRowsExcel[index + 1], returnRowsExcel[index + 2]]} addFunction={addRowToCourses} />);
                            index += 2;
                            continue;
                        }
                    }
                    returnRows.push(<CourseRow rows={[row, returnRowsExcel[index + 1]]} addFunction={addRowToCourses} />);
                    index += 1;
                    continue;
                }
            }
            returnRows.push(<CourseRow row={row} addFunction={addRowToCourses} />);
        }
        // if (excededSearch) {
        //     returnRows.push(<CourseRow addFunction={addRowToCourses} />);
        // }
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
    row?: Row;
    rows?: Row[];
    addFunction?: (row: Row) => void;
}

export const CourseRow: React.FC<PropsCourseRow> = ({ row, rows, addFunction }) => {
    const makeInfoBox = (checkedRows: Row[]) => {
        const elements: React.JSX.Element[] = [];
        for (let index = 0; index < checkedRows.length; index++) {
            const element = checkedRows[index];
            elements.push(<div className={css.courseRowInfo}>{`${element[1]} ${element[2]}`}</div>);
        }
        return elements;
    }
    
    return (
        <div className={css.courseRow}>
            {
                row !== undefined && addFunction !== undefined
                ? <div className={css.courseAddButton} onClick={() => addFunction(row)}>+</div>
                : rows !== undefined && addFunction !== undefined
                    ? <div className={css.courseAddButton} onClick={() => addFunction(rows[0])}>+</div>
                    : <></>
            }
            {
                row
                ? <div className={css.courseRowMainContainer}>
                    <div className={css.courseRowName}>{`${row[8].toString()}`}</div>
                    <div className={css.courseRowQuarter}>{`${row[0].toString()}`}</div>
                </div>
                : rows
                    ? <div className={css.courseRowMainContainer}>
                        <div className={css.courseRowName}>{`${rows[0][8].toString()}`}</div>
                        <div className={css.courseRowQuarter}>{`${rows[0][0].toString()}`}</div>
                    </div>
                    : <div className={css.courseRowName}>{"Specify you search..."}</div>
            }
            {
                row
                ? <div className={css.courseRowInfo}>{`${row[1]} ${row[2]}`}</div>
                : rows
                    ? <div className={css.courseRowInfoContainer}>
                        {makeInfoBox(rows)}
                    </div>
                    : <></>
            }
        </div>
    );
};