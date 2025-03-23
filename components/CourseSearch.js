"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRow = exports.CourseSearch = void 0;
const React = require("react");
const CourseSearch_module_css_1 = require("./CourseSearch.module.css");
const CourseData_1 = require("../control/CourseData");
const CourseSearch = ({ allCourses, display, loadedCourses, setLoadedCourses }) => {
    const [filterText, setFilterText] = React.useState("");
    const addNewCourse = (selectedCourse) => {
        if (!allCourses) {
            return;
        }
        let courses = [];
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
                        || newCourse.quarter === currentCourse.quarter) {
                        error = true;
                        console.error("Cant add course over already exisiting courses");
                        return;
                    }
                }
            });
        });
        courses = (0, CourseData_1.addManualData)(courses);
        if (!error) {
            setLoadedCourses([...loadedCourses, ...courses]);
            setFilterText("");
        }
    };
    const getResults = () => {
        if (!allCourses || !display || filterText === "" || filterText.length < 3) {
            return;
        }
        const returnCourses = [];
        for (let index = 0; index < allCourses.length; index++) {
            const course = allCourses[index];
            if ((course.nameEN).toLowerCase().includes(filterText.toLowerCase())) {
                if (!returnCourses.find((addedCourse) => addedCourse.code === course.code)) {
                    returnCourses.push(course);
                }
            }
            else if (filterText.includes("#")) {
                let split = filterText.split("#");
                if (split[1].trim() !== "" && (0, CourseData_1.deParseDay)(course.day).includes(split[0]) && course.period.includes(split[1])) {
                    if (!returnCourses.find((addedCourse) => addedCourse.code === course.code)) {
                        returnCourses.push(course);
                    }
                }
            }
        }
        const returnRows = [];
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
                returnRows.push(React.createElement(exports.CourseRow, { courses: courses, addFunction: addNewCourse }));
            }
            else {
                returnRows.push(React.createElement(exports.CourseRow, { course: course, addFunction: addNewCourse }));
            }
        }
        return returnRows;
    };
    return (React.createElement("div", { className: CourseSearch_module_css_1.default.courseSearchContainer },
        display !== false
            ? React.createElement(React.Fragment, null,
                React.createElement("div", { className: CourseSearch_module_css_1.default.courseSearchLabel }, "Search Course"),
                React.createElement("input", { className: CourseSearch_module_css_1.default.courseSearchBox, type: 'text', value: filterText, onChange: (e) => setFilterText(e.target.value) }))
            : React.createElement(React.Fragment, null),
        React.createElement("div", { className: CourseSearch_module_css_1.default.courseSearchResultContainer }, getResults())));
};
exports.CourseSearch = CourseSearch;
const CourseRow = ({ course, courses, addFunction }) => {
    const makeInfoBox = (checkedCourses) => {
        const elements = [];
        for (let index = 0; index < checkedCourses.length; index++) {
            const element = checkedCourses[index];
            elements.push(React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowInfo }, `${(0, CourseData_1.deParseDay)(element.day)} ${element.period}`));
        }
        return elements;
    };
    return (React.createElement("div", { className: CourseSearch_module_css_1.default.courseRow },
        course !== undefined && addFunction !== undefined
            ? React.createElement("div", { className: CourseSearch_module_css_1.default.courseAddButton, onClick: () => addFunction(course) }, "+")
            : courses !== undefined && addFunction !== undefined
                ? React.createElement("div", { className: CourseSearch_module_css_1.default.courseAddButton, onClick: () => addFunction(courses[0]) }, "+")
                : React.createElement(React.Fragment, null),
        course
            ? React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowMainContainer },
                React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowName }, `${course.nameEN}`),
                React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowQuarter }, `${(0, CourseData_1.deParseQuarter)(course.quarter)}`),
                React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowMinSem }, `Avaible from semester: ${course.semesterMin}`))
            : courses
                ? React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowMainContainer },
                    React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowName }, `${courses[0].nameEN}`),
                    React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowQuarter }, `${(0, CourseData_1.deParseQuarter)(courses[0].quarter)}`),
                    React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowMinSem }, `Avaible from semester: ${courses[0].semesterMin}`))
                : React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowName }, "Specify you search..."),
        course
            ? React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowInfo }, `${(0, CourseData_1.deParseDay)(course.day)} ${course.period}`)
            : courses
                ? React.createElement("div", { className: CourseSearch_module_css_1.default.courseRowInfoContainer }, makeInfoBox(courses))
                : React.createElement(React.Fragment, null)));
};
exports.CourseRow = CourseRow;
//# sourceMappingURL=CourseSearch.js.map