"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const React = require("react");
const App_module_css_1 = require("./App.module.css");
const PDFReader_1 = require("../control/PDFReader");
const ExcelFilter_1 = require("../control/ExcelFilter");
const CourseData_1 = require("../control/CourseData");
const TimetableViewer_1 = require("../components/TimetableViewer");
const API_1 = require("../API/API");
const _1 = require(".");
const CourseSearch_1 = require("../components/CourseSearch");
const App = () => {
    const [quarterTwoActive, setQuarterTwoActive] = React.useState(false);
    const [loadedCourses, setLoadedCourses] = React.useState([]);
    const [displayCourses, setDisplayCourses] = React.useState(false);
    const [isCurriculum2023, setIsCurriculum2023] = React.useState(false);
    const [errorText, setErrorText] = React.useState("");
    const [fileText, setFileText] = React.useState("");
    const [college, setCollege] = React.useState("APM");
    const [fullExcelCourses, setFullExcelCourses] = React.useState();
    const [excelUpdateRequest, setExcelUpdateRequest] = React.useState(true);
    const [currentExcelFile, setCurrentExcelFile] = React.useState("");
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    React.useEffect(() => {
        if (loadedCourses !== null && loadedCourses.length > 0 && loadedCourses[0].location !== undefined) {
            setDisplayCourses(true);
        }
    }, [loadedCourses]);
    React.useEffect(() => {
        if (!isCurriculum2023 && college === "ST") {
            setIsCurriculum2023(true);
        }
    }, [college]);
    React.useEffect(() => {
        if (getExcelURL() !== currentExcelFile) {
            setExcelUpdateRequest(true);
        }
        else {
            setExcelUpdateRequest(false);
        }
    }, [college, isCurriculum2023]);
    const handleFileChange = function (e) {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0)
            return;
        const fileReader = new FileReader();
        setDisplayCourses(false);
        fileReader.onload = function (e) {
            var typedarray = fileReader.result;
            (0, _1.StartLoading)("Creating Schedule");
            const result = (0, PDFReader_1.ParsePDFFile)(typedarray);
            result.then((res) => __awaiter(this, void 0, void 0, function* () {
                setErrorText(res.error !== undefined ? res.error.messeage : "");
                let courses = yield getCoursesFromExcel(res.courseCodes);
                setLoadedCourses(courses);
                (0, _1.StopLoading)();
                const element = document.getElementById("fileInput");
                if (element !== undefined) {
                    element.value = "";
                }
            }));
        };
        fileReader.readAsArrayBuffer(fileList[0]);
        setFileText(fileList[0].name);
    };
    const getExcelURL = () => {
        return `https://senapp.github.io/APU-Timetable/resources/${isCurriculum2023 ? "2023" : "2017"}${college}_Latest.xlsx`;
    };
    const updateExcel = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Updating excel...");
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            (0, _1.StartLoading)("Loading Courses");
            let response = yield fetch(getExcelURL());
            setCurrentExcelFile(getExcelURL());
            let data = yield response.blob();
            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                return __awaiter(this, void 0, void 0, function* () {
                    var typedarray = fileReader.result;
                    const resultRows = yield (0, ExcelFilter_1.ParseExcelRows)(typedarray);
                    let fullCourseList = [];
                    for (let index = 0; index < resultRows.length; index++) {
                        const row = resultRows[index];
                        if (row !== undefined && row !== null && row[0] !== undefined && row[0] !== null) {
                            if (row[0].toString() === "Semester" || row[0].toString() === "1Q" || row[0].toString() === "2Q" || row[0].toString() === "Session1") {
                                fullCourseList.push((0, CourseData_1.ExcelRowToCourse)(row));
                            }
                        }
                    }
                    setFullExcelCourses(fullCourseList);
                    setExcelUpdateRequest(false);
                    setDisplayCourses(true);
                    (0, _1.StopLoading)();
                    const element = document.getElementById("fileInput");
                    if (element !== undefined) {
                        element.value = "";
                    }
                    resolve(fullCourseList);
                });
            };
            fileReader.readAsArrayBuffer(data);
        }));
    });
    const getCoursesFromExcel = (courseCodes) => __awaiter(void 0, void 0, void 0, function* () {
        let fullCourseList = [];
        if (fullExcelCourses === undefined || excelUpdateRequest) {
            fullCourseList = yield updateExcel();
        }
        else {
            fullCourseList = fullExcelCourses;
        }
        let courses = [];
        fullCourseList.forEach(course => {
            let found = false;
            courseCodes.forEach(courseCode => {
                if (courseCode.trim() === course.code && !found) {
                    courses.push(course);
                    found = true;
                }
            });
        });
        courses = (0, CourseData_1.addManualData)(courses);
        return courses;
    });
    const onLoginGoogle = () => __awaiter(void 0, void 0, void 0, function* () {
        (0, API_1.GoogleCalenderLoginRequest)();
    });
    const onTestGoogleCalender = () => __awaiter(void 0, void 0, void 0, function* () {
        (0, API_1.GoogleCalenderCreateEvents)(loadedCourses);
    });
    const getCredits = () => {
        if (loadedCourses !== undefined && loadedCourses.length > 0) {
            let credits = 0;
            const creditsArray = loadedCourses
                .filter((course) => !course.isTA && course.isExtraClass === undefined || !course.isTA && course.isExtraClass === false)
                .map((course) => course.credits);
            creditsArray.forEach(credit => {
                credits += parseInt(credit !== null && credit !== void 0 ? credit : "0");
            });
            return `⭐ Credits: ${credits.toString()}`;
        }
        return "";
    };
    return (React.createElement("div", { className: App_module_css_1.default.container },
        React.createElement("div", { className: App_module_css_1.default.sidebar },
            React.createElement("div", { className: App_module_css_1.default.generationContainer },
                React.createElement("div", null, "Curriculum"),
                React.createElement("div", { className: App_module_css_1.default.collegeContainer },
                    React.createElement("div", { className: App_module_css_1.default.collegeBox },
                        React.createElement("span", { id: App_module_css_1.default.toogleLabel }, "APM"),
                        React.createElement("input", { type: "radio", checked: college === "APM", onChange: () => setCollege("APM") })),
                    React.createElement("div", { className: App_module_css_1.default.collegeBox },
                        React.createElement("span", { id: App_module_css_1.default.toogleLabel }, "APS"),
                        React.createElement("input", { type: "radio", checked: college === "APS", onChange: () => setCollege("APS") })),
                    React.createElement("div", { className: App_module_css_1.default.collegeBox },
                        React.createElement("span", { id: App_module_css_1.default.toogleLabel }, "ST"),
                        React.createElement("input", { type: "radio", checked: college === "ST", onChange: () => setCollege("ST") }))),
                React.createElement("div", { className: App_module_css_1.default.sliderContainer },
                    React.createElement("span", { id: App_module_css_1.default.toogleLabel }, "2017"),
                    React.createElement("label", { className: App_module_css_1.default.switch },
                        React.createElement("input", { type: "checkbox", checked: isCurriculum2023, className: App_module_css_1.default.toggle, onChange: (res) => setIsCurriculum2023((college === "ST") || (college !== "ST" && res.target.checked)) }),
                        React.createElement("span", { className: App_module_css_1.default.slider })),
                    React.createElement("span", { id: App_module_css_1.default.toogleLabel }, "2023")),
                React.createElement("div", { className: App_module_css_1.default.uploadContainer },
                    React.createElement("label", { htmlFor: "fileInput", className: App_module_css_1.default.uploadLabel }, "Upload and Make Timetable"),
                    React.createElement("input", { type: "file", id: "fileInput", accept: ".pdf", onChange: handleFileChange })),
                excelUpdateRequest
                    ? React.createElement("button", { className: App_module_css_1.default.refreshButton, onClick: updateExcel }, "Load curriculum?")
                    : React.createElement(React.Fragment, null),
                React.createElement("div", { className: App_module_css_1.default.errorText }, errorText),
                React.createElement(CourseSearch_1.CourseSearch, { loadedCourses: loadedCourses, allCourses: fullExcelCourses, display: displayCourses, setLoadedCourses: setLoadedCourses })),
            React.createElement("div", { className: App_module_css_1.default.googleContainer },
                React.createElement("button", { id: App_module_css_1.default.loginToGoogle, onClick: onLoginGoogle }, "Login to Google"),
                React.createElement("button", { id: App_module_css_1.default.importGoogleCalendarButton, disabled: loadedCourses.length === 0 && false, onClick: onTestGoogleCalender }, "Export Courses"))),
        React.createElement("div", { className: App_module_css_1.default.main },
            React.createElement("div", { className: App_module_css_1.default.topBar },
                React.createElement("div", { className: `${App_module_css_1.default.sliderContainer} ${App_module_css_1.default.quarterContainer}` },
                    React.createElement("label", { className: App_module_css_1.default.switch },
                        React.createElement("input", { type: "checkbox", checked: quarterTwoActive, id: "quarterToggle", onChange: (res) => setQuarterTwoActive(res.target.checked) }),
                        React.createElement("span", { className: App_module_css_1.default.slider })),
                    React.createElement("span", { id: App_module_css_1.default.quarterLabel }, quarterTwoActive ? "Q2" : "Q1")),
                React.createElement("div", { className: App_module_css_1.default.collegeColorTableContainer },
                    React.createElement("div", { className: App_module_css_1.default.collegeColorContainer },
                        React.createElement("div", { className: App_module_css_1.default.collegeMajor }),
                        React.createElement("div", { className: App_module_css_1.default.collegeColorText }, "Major")),
                    React.createElement("div", { className: App_module_css_1.default.collegeColorContainer },
                        React.createElement("div", { className: App_module_css_1.default.collegeLangauge }),
                        React.createElement("div", { className: App_module_css_1.default.collegeColorText }, "Language")),
                    React.createElement("div", { className: App_module_css_1.default.collegeColorContainer },
                        React.createElement("div", { className: App_module_css_1.default.collegeLiberalArts }),
                        React.createElement("div", { className: App_module_css_1.default.collegeColorText }, "Liberal Arts")),
                    React.createElement("div", { className: App_module_css_1.default.collegeColorContainer },
                        React.createElement("div", { className: App_module_css_1.default.collegeOther }),
                        React.createElement("div", { className: App_module_css_1.default.collegeColorText }, "Other")),
                    React.createElement("div", { className: App_module_css_1.default.collegeColorContainer },
                        React.createElement("div", { className: App_module_css_1.default.collegeTa }),
                        React.createElement("div", { className: App_module_css_1.default.collegeColorText }, "TA"))),
                React.createElement("div", null, getCredits())),
            React.createElement(TimetableViewer_1.TimetableViewer, { forceUpdateParent: forceUpdate, setLoadedCourses: setLoadedCourses, courses: loadedCourses, displayCourses: displayCourses, quarterTwoActive: quarterTwoActive }),
            React.createElement("div", { className: App_module_css_1.default.fileUploadInfo }, fileText))));
};
exports.App = App;
//# sourceMappingURL=App.js.map