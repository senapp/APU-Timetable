"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassBox = exports.TimetableViewer = void 0;
const React = require("react");
const TimetableViewer_module_css_1 = require("./TimetableViewer.module.css");
const TimetableViewer = ({ courses, forceUpdateParent, setLoadedCourses, displayCourses, quarterTwoActive }) => {
    const currentQuarter = quarterTwoActive === false ? "1" : "2";
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const makeTableBody = () => {
        const makeRow = (number, courses) => {
            const quarterCourses = courses.filter((course) => course.quarter === "0" || course.quarter === currentQuarter);
            const text = number === 7 ? "Session" : "Period " + number;
            return (React.createElement("tr", { key: number },
                React.createElement("td", { className: TimetableViewer_module_css_1.default.periodBox }, text),
                displayCourses ? React.createElement(React.Fragment, null,
                    React.createElement(exports.ClassBox, { onUpdateTA: onUpdateTA, course: quarterCourses.find((course) => course.day === "1") }),
                    React.createElement(exports.ClassBox, { onUpdateTA: onUpdateTA, course: quarterCourses.find((course) => course.day === "2") }),
                    React.createElement(exports.ClassBox, { onUpdateTA: onUpdateTA, course: quarterCourses.find((course) => course.day === "3") }),
                    React.createElement(exports.ClassBox, { onUpdateTA: onUpdateTA, course: quarterCourses.find((course) => course.day === "4") }),
                    React.createElement(exports.ClassBox, { onUpdateTA: onUpdateTA, course: quarterCourses.find((course) => course.day === "5") })) :
                    React.createElement(React.Fragment, null,
                        React.createElement("td", { className: TimetableViewer_module_css_1.default.cellBox }),
                        React.createElement("td", { className: TimetableViewer_module_css_1.default.cellBox }),
                        React.createElement("td", { className: TimetableViewer_module_css_1.default.cellBox }),
                        React.createElement("td", { className: TimetableViewer_module_css_1.default.cellBox }),
                        React.createElement("td", { className: TimetableViewer_module_css_1.default.cellBox }))));
        };
        const makeRows = () => {
            const outputRows = [];
            for (let index = 1; index <= 6; index++) {
                const periodCourses = index === 7 ? courses.filter((course) => course.period == "Session") : courses.filter((course) => course.period == index.toString());
                outputRows.push(makeRow(index, periodCourses));
            }
            return outputRows;
        };
        return (React.createElement("tbody", null, makeRows()));
    };
    const onUpdateTA = (course, checked) => {
        for (let index = 0; index < courses.length; index++) {
            if (course.code === courses[index].code) {
                courses[index].isTA = checked;
            }
        }
        setLoadedCourses(courses);
        forceUpdate();
        forceUpdateParent();
    };
    const sessionCourse = courses.find((course) => course.day == "0");
    return (React.createElement("div", { id: TimetableViewer_module_css_1.default.calendarContainer },
        React.createElement("table", { id: TimetableViewer_module_css_1.default.calendarTable },
            React.createElement("thead", null,
                React.createElement("tr", null,
                    React.createElement("th", null),
                    React.createElement("th", null, "Monday"),
                    React.createElement("th", null, "Tuesday"),
                    React.createElement("th", null, "Wednesday"),
                    React.createElement("th", null, "Thursday"),
                    React.createElement("th", null, "Friday"))),
            makeTableBody()),
        sessionCourse !== undefined ?
            React.createElement("table", { className: TimetableViewer_module_css_1.default.sessionClass },
                React.createElement("tr", null,
                    React.createElement("td", { className: TimetableViewer_module_css_1.default.sessionBox }, "Session"),
                    React.createElement(exports.ClassBox, { className: TimetableViewer_module_css_1.default.sessionClassBox, onUpdateTA: onUpdateTA, course: sessionCourse }))) : React.createElement(React.Fragment, null)));
};
exports.TimetableViewer = TimetableViewer;
const ClassBox = ({ course, onUpdateTA, className = "" }) => {
    var _a;
    if (course === undefined) {
        return (React.createElement("td", { className: TimetableViewer_module_css_1.default.cellBox }));
    }
    let collegeClass = course.field === "専門/Major"
        ? TimetableViewer_module_css_1.default.collegeMajor
        : course.field === "他学部/Other College"
            ? TimetableViewer_module_css_1.default.collegeOther
            : course.field === "言語/Language"
                ? TimetableViewer_module_css_1.default.collegeLangauge
                : course.field === "教養/Liberal Arts"
                    ? TimetableViewer_module_css_1.default.collegeLiberalArts
                    : "";
    if (course.isTA) {
        collegeClass = TimetableViewer_module_css_1.default.collegeTa;
    }
    return (React.createElement("td", { className: `${TimetableViewer_module_css_1.default.cellBox} ${collegeClass} ${className}` },
        course.nameEN.length > 30
            ? React.createElement("div", { className: TimetableViewer_module_css_1.default.courseName },
                `📖`,
                React.createElement("p", { className: TimetableViewer_module_css_1.default.marquee },
                    React.createElement("span", null, course.nameEN)))
            : React.createElement("div", { className: TimetableViewer_module_css_1.default.courseName }, `📖 ${course.nameEN}`),
        React.createElement("div", { className: TimetableViewer_module_css_1.default.courseRoom }, `📍 ${course.location}`),
        course.instructorEN.length > 30
            ? React.createElement("div", { className: TimetableViewer_module_css_1.default.courseInstructor },
                `🧑‍🏫`,
                React.createElement("p", { className: TimetableViewer_module_css_1.default.marquee },
                    React.createElement("span", null, course.instructorEN)))
            : React.createElement("div", { className: TimetableViewer_module_css_1.default.courseInstructor }, `🧑‍🏫 ${course.instructorEN}`),
        React.createElement("div", { className: TimetableViewer_module_css_1.default.courseCredits }, course.isTA ? `⭐ Credits: TA` : `⭐ Credits: ${course.credits}`),
        React.createElement("div", { className: TimetableViewer_module_css_1.default.courseCode }, `🔗 ${course.code}`),
        React.createElement("input", { type: "checkbox", className: TimetableViewer_module_css_1.default.taButton, checked: (_a = course.isTA) !== null && _a !== void 0 ? _a : false, onChange: (e) => onUpdateTA(course, e.target.checked) })));
};
exports.ClassBox = ClassBox;
//# sourceMappingURL=TimetableViewer.js.map