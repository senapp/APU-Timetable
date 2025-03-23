"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addManualData = exports.deParseQuarter = exports.deParseDay = exports.parseDayExcel = exports.ExcelRowToCourse = exports.TryGetCourseCode = exports.Langauge = void 0;
var Langauge;
(function (Langauge) {
    Langauge[Langauge["English"] = 0] = "English";
    Langauge[Langauge["Japanese"] = 1] = "Japanese";
})(Langauge = exports.Langauge || (exports.Langauge = {}));
const TryGetCourseCode = (courseString) => {
    try {
        return courseString.trim().split("   ")[3].trim();
    }
    catch (e) {
        console.log(e);
        return null;
    }
};
exports.TryGetCourseCode = TryGetCourseCode;
const cellToString = (cell) => {
    if (cell === undefined || cell === null) {
        return "";
    }
    return cell.toString();
};
const ExcelRowToCourse = (row) => {
    return {
        quarter: parseQuarterExcel(cellToString(row[0])),
        day: (0, exports.parseDayExcel)(cellToString(row[1])),
        period: cellToString(row[2]),
        location: cellToString(row[5]),
        code: cellToString(row[6]),
        nameJP: cellToString(row[7]),
        nameEN: cellToString(row[8]),
        instructorJP: cellToString(row[9]),
        instructorEN: cellToString(row[10]),
        language: cellToString(row[11]),
        semesterMin: cellToString(row[12]),
        field: cellToString(row[13]),
    };
};
exports.ExcelRowToCourse = ExcelRowToCourse;
const parseQuarterExcel = (text) => {
    if (text === "Semester") {
        return "0";
    }
    else {
        return text.substring(0, 1);
    }
};
const parseDayExcel = (text) => {
    switch (text) {
        case "月/Mon.":
            return "1";
        case "火/Tue.":
            return "2";
        case "水/Wed.":
            return "3";
        case "木/Thu.":
            return "4";
        case "金/Fri.":
            return "5";
        default:
            return "0";
    }
};
exports.parseDayExcel = parseDayExcel;
const deParseDay = (text) => {
    switch (text) {
        case "1":
            return "月/Mon.";
        case "2":
            return "火/Tue.";
        case "3":
            return "水/Wed.";
        case "4":
            return "木/Thu.";
        case "5":
            return "金/Fri.";
        default:
            return "Unkown";
    }
};
exports.deParseDay = deParseDay;
const deParseQuarter = (text) => {
    if (text === "0") {
        return "Semester";
    }
    else {
        return text + "Q";
    }
};
exports.deParseQuarter = deParseQuarter;
const addManualData = (courses) => {
    let newList = [];
    courses.forEach(course => {
        course.credits = "2";
        let filter = newList.filter(newCourse => newCourse.code === course.code);
        if (filter.length === 1) {
            course.isExtraClass = true;
            course.credits = "2";
            for (let index = 0; index < filter.length; index++) {
                filter[index].credits = "2";
            }
        }
        else if (filter.length === 2) {
            course.isExtraClass = true;
        }
        else if (filter.length === 3) {
            course.isExtraClass = true;
            course.credits = "4";
            for (let index = 0; index < filter.length; index++) {
                filter[index].credits = "4";
            }
        }
        newList.push(course);
    });
    return newList;
};
exports.addManualData = addManualData;
//# sourceMappingURL=CourseData.js.map