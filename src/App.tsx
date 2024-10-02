import * as React from 'react';
import css from './App.module.css';
import { ParsePDFFile } from '../control/PDFReader';
import { AppendCourseDataFromExcel, GetRowsOfExcel } from '../control/ExcelFilter';
import { Course } from '../control/CourseData';
import { TimetableViewer } from '../components/TimetableViewer';
import { GoogleCalenderCallTestEvent, GoogleCalenderLoginRequest } from '../API/API';
import { StartLoading, StopLoading } from '.';
import { CourseSearch } from '../components/CourseSearch';
import { Row } from 'read-excel-file';

export const App: React.FC = () => {
    const [quarterTwoActive, setQuarterTwoActive] = React.useState(false);
    const [loadedCourses, setLoadedCourses] = React.useState<Course[]>([]);
    const [displayCourses, setDisplayCourses] = React.useState(false);
    const [isCurriculum2023, setIsCurriculum2023] = React.useState(false);
    const [errorText, setErrorText] = React.useState("");
    const [fileText, setFileText] = React.useState("");
    const [college, setCollege] = React.useState("APM");
    const [excelRows, setExcelRows] = React.useState<Row[]>();
    const [excelUpdateRequest, setExcelUpdateRequest] = React.useState(false);
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
        if (true) {
            setExcelUpdateRequest(true);
        }
    }, [college, isCurriculum2023]);

    const handleFileChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = e.target.files;
        if (!fileList) return;

        const fileReader = new FileReader();
        setDisplayCourses(false)
        fileReader.onload = function (e: Event) {
            var typedarray = fileReader.result as ArrayBuffer;

            StartLoading("Creating Schedule");
            const result = ParsePDFFile(typedarray);
            result.then((res) => {
                setLoadedCourses(res.courses);
                setErrorText(res.error !== undefined ? res.error.messeage : "");
                setFileText(fileList[0].name);
                if (res.courses.length > 0) {
                    onGenerateSchedule(res.courses);
                } else {
                    StopLoading();
                }
            })
        }
        fileReader.readAsArrayBuffer(fileList[0]);
    };

    const getExcelURL = (): string => {
        return `https://senapp.github.io/APU-Timetable/resources/${isCurriculum2023 ? "2023" : "2017"}${college}_Latest.xlsx`
    }

    const onGenerateSchedule = async (courses: Course[]) => {
        let response = await fetch(getExcelURL());
        let data = await response.blob();
        setExcelUpdateRequest(false);

        const fileReader = new FileReader();
        fileReader.onload = async function (e: Event) {
            var typedarray = fileReader.result as ArrayBuffer;

            const result = await AppendCourseDataFromExcel(courses, typedarray);
            setExcelRows(result.rows)
            setLoadedCourses(result.courses);
            StopLoading();

            const element = document.getElementById("fileInput");
            if (element !== undefined) {
                (element as HTMLInputElement).value = "";
            }
        };
        fileReader.readAsArrayBuffer(data);
    };

    const refreshExcel = async () => {
        StartLoading("Loading Curriculum");
        let response = await fetch(getExcelURL());
        let data = await response.blob();
        setExcelUpdateRequest(false);
        setDisplayCourses(true);

        const fileReader = new FileReader();
        fileReader.onload = async function (e: Event) {
            var typedarray = fileReader.result as ArrayBuffer;
            const result = await GetRowsOfExcel(typedarray);
            setExcelRows(result);
            StopLoading();
        };
        fileReader.readAsArrayBuffer(data);
    };

    const onLoginGoogle = async () => {
        GoogleCalenderLoginRequest();
    };

    const onTestGoogleCalender = async () => {
        GoogleCalenderCallTestEvent(loadedCourses, quarterTwoActive);
    };

    const getCredits = (): string => {
        if (loadedCourses !== undefined && loadedCourses.length > 0) {
            let credits = 0;
            const creditsArray = loadedCourses
                .filter((course) => !course.isTA && course.isExtraClass === undefined || !course.isTA && course.isExtraClass === false)
                .map((course) => course.credits);
            creditsArray.forEach(credit => {
                credits += parseInt(credit);
            });
            return `⭐ Credits: ${credits.toString()}`;
        }
        return "";
    }

    return (
        <div className={css.container}>
            <div className={css.sidebar}>
                <div className={css.generationContainer}>
                    <div>Curriculum</div>
                    <div className={css.collegeContainer}>
                        <div className={css.collegeBox}>
                            <span id={css.toogleLabel}>{"APM"}</span>
                            <input type="radio" checked={college === "APM"} onChange={() => setCollege("APM")} />
                        </div>
                        <div className={css.collegeBox}>
                            <span id={css.toogleLabel}>{"APS"}</span>
                            <input type="radio" checked={college === "APS"} onChange={() => setCollege("APS")} />
                        </div>
                        <div className={css.collegeBox}>
                            <span id={css.toogleLabel}>{"ST"}</span>
                            <input type="radio" checked={college === "ST"} onChange={() => setCollege("ST")} />
                        </div>
                    </div>
                    <div className={css.sliderContainer}>
                        <span id={css.toogleLabel}>{"2017"}</span>
                        <label className={css.switch}>
                            <input type="checkbox" checked={isCurriculum2023} className={css.toggle} onChange={(res) => setIsCurriculum2023((college === "ST") || (college !== "ST" && res.target.checked))} />
                            <span className={css.slider}></span>
                        </label>
                        <span id={css.toogleLabel}>{"2023"}</span>
                    </div>
                    {
                        excelUpdateRequest
                        ? <button className={css.refreshButton} onClick={refreshExcel}>Load curriculum?</button>
                        : <></>
                    }
                    <div className={css.uploadContainer}>
                        <label htmlFor="fileInput" className={css.uploadLabel}>Upload and Make Timetable</label>
                        <input type="file" id="fileInput" accept=".pdf" onChange={handleFileChange} />
                    </div>
                    <div className={css.errorText}>{errorText}</div>
                    <CourseSearch loadedCourses={loadedCourses} excelRows={excelRows} display={displayCourses} setLoadedCourses={setLoadedCourses} />
                </div>
                <div className={css.googleContainer}>
                    <button id={css.loginToGoogle} onClick={onLoginGoogle}>Login to Google</button>
                    <button id={css.importGoogleCalendarButton} disabled={loadedCourses.length === 0 && false} onClick={onTestGoogleCalender}>Export Courses</button>
                </div>
            </div>
            <div className={css.main}>
                <div className={css.topBar}>
                    <div className={`${css.sliderContainer} ${css.quarterContainer}`}>
                        <label className={css.switch}>
                            <input type="checkbox" checked={quarterTwoActive} id="quarterToggle" onChange={(res) => setQuarterTwoActive(res.target.checked)} />
                            <span className={css.slider}></span>
                        </label>
                        <span id={css.quarterLabel}>{quarterTwoActive ? "Q2" : "Q1"}</span>
                    </div>
                    <div className={css.collegeColorTableContainer}>
                        <div className={css.collegeColorContainer}>
                            <div className={css.collegeMajor}></div>
                            <div className={css.collegeColorText}>Major</div>
                        </div>
                        <div className={css.collegeColorContainer}>
                            <div className={css.collegeLangauge}></div>
                            <div className={css.collegeColorText}>Language</div>
                        </div>
                        <div className={css.collegeColorContainer}>
                            <div className={css.collegeLiberalArts}></div>
                            <div className={css.collegeColorText}>Liberal Arts</div>
                        </div>
                        <div className={css.collegeColorContainer}>
                            <div className={css.collegeOther}></div>
                            <div className={css.collegeColorText}>Other</div>
                        </div>
                        <div className={css.collegeColorContainer}>
                            <div className={css.collegeTa}></div>
                            <div className={css.collegeColorText}>TA</div>
                        </div>
                    </div>
                    <div>{getCredits()}</div>
                </div>
                <TimetableViewer forceUpdateParent={forceUpdate} setLoadedCourses={setLoadedCourses} courses={loadedCourses} displayCourses={displayCourses} quarterTwoActive={quarterTwoActive} />
                <div className={css.fileUploadInfo}>{fileText}</div>
            </div>
        </div>
    )
};
