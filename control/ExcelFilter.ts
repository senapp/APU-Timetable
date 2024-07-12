import readXlsxFile, { Row } from 'read-excel-file'
import { Course } from './CourseData';

type CourseExcelResult = {
    courses: Course[];
    rows: Row[];
}

export const AppendCourseDataFromExcel = (courses: Course[], path: ArrayBuffer): Promise<CourseExcelResult> => {
    let returnResult: CourseExcelResult = {
        courses: [],
        rows: []
    };

    return new Promise((resolve, reject) => {
        GetRowsOfExcel(path).then((rows) => {
            rows.forEach(row => {
                returnResult.rows.push(row);
            });
            for (let index = 0; index < courses.length; index++) {
                const course = courses[index];
                for (let index = 0; index < rows.length; index++) {
                    const row = rows[index];
                    if (row[6] == course.code) {
                        returnResult.courses.push({
                            ...course,
                            location: row[5].toString(),
                            college: row[13].toString(),
                        });
                        break;
                    }
                }
            }
          });

          resolve(returnResult);
    });
}


export const GetRowsOfExcel = (path: ArrayBuffer): Promise<Row[]> => {
    return new Promise((resolve, reject) => {
        readXlsxFile(path).then((rows) => {
            resolve(rows);
        })
    });
}