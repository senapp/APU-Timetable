import readXlsxFile from 'read-excel-file'
import { Course } from './CourseData';

export const ReadExcelFile = (courses: Course[], path: ArrayBuffer): Course[] => {
    let returnCourses: Course[] = [];
    readXlsxFile(path).then((rows) => {
        for (let index = 0; index < courses.length; index++) {
            const course = courses[index];
            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];
                if (row[6] == course.code) {
                    returnCourses.push({
                        ...course,
                        location: row[5].toString(),
                        college: row[13].toString(),
                    });
                    break;
                }
            }
        }
      })
    return returnCourses;
}