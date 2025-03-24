import * as React from 'react';
import css from './App.module.css';
import { ParsePDFFile } from '../control/PDFReader';
import { ParseExcelRows } from '../control/ExcelFilter';
import { addManualData, Course, ExcelRowToCourse } from '../control/CourseData';
import { TimetableViewer } from '../components/TimetableViewer';
import { GoogleCalenderCreateEvents, GoogleCalenderLoginRequest } from '../API/API';
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
    const [fullExcelCourses, setFullExcelCourses] = React.useState<Course[]>();
    const [excelUpdateRequest, setExcelUpdateRequest] = React.useState(true);
    const [currentExcelFile, setCurrentExcelFile] = React.useState("");
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    const [searchText, setSearchText] = React.useState("");

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
        } else {
            setExcelUpdateRequest(false);
        }
    }, [college, isCurriculum2023]);

    const handleFileChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const fileReader = new FileReader();
        setDisplayCourses(false)
        fileReader.onload = function (e: Event) {
            var typedarray = fileReader.result as ArrayBuffer;
            
            StartLoading("Creating Schedule");
            const result = ParsePDFFile(typedarray);
            result.then(async (res) => {
                setErrorText(res.error !== undefined ? res.error.messeage : "");
                let courses = await getCoursesFromExcel(res.courseCodes);    

                setLoadedCourses(courses);
                StopLoading();
                const element = document.getElementById("fileInput");
                if (element !== undefined) {
                    (element as HTMLInputElement).value = "";
                }
                
            })
        }
        fileReader.readAsArrayBuffer(fileList[0]);
        setFileText(fileList[0].name);
    };

    const getExcelURL = (): string => {
        return `https://senapp.github.io/APU-Timetable/resources/${isCurriculum2023 ? "2023" : "2017"}${college}_Latest.xlsx`
    }

    const updateExcel = async (): Promise<Course[]> => {
        console.log("Updating excel...")
        return new Promise(async (resolve, reject) => {
            StartLoading("Loading Courses");
            let response = await fetch(getExcelURL());
            setCurrentExcelFile(getExcelURL());
            let data = await response.blob();
            
            const fileReader = new FileReader();
            fileReader.onload = async function (e: Event) {
                var typedarray = fileReader.result as ArrayBuffer;
                
                const resultRows = await ParseExcelRows(typedarray);
                let fullCourseList: Course[] = [];
                for (let index = 0; index < resultRows.length; index++) {
                    const row = resultRows[index];
                    if (row !== undefined && row !== null && row[0] !== undefined && row[0] !== null) {
                        if (row[0].toString() === "Semester" || row[0].toString() === "1Q" || row[0].toString() === "2Q" || row[0].toString() === "Session1") {
                            fullCourseList.push(ExcelRowToCourse(row));
                        }
                    }
                }

                setFullExcelCourses(fullCourseList)
                setExcelUpdateRequest(false);
                setDisplayCourses(true);
                StopLoading();
                
                const element = document.getElementById("fileInput");
                if (element !== undefined) {
                    (element as HTMLInputElement).value = "";
                }
                
                resolve(fullCourseList)
            };
            fileReader.readAsArrayBuffer(data);
        });
    }
    
    const getCoursesFromExcel = async (courseCodes: string []): Promise<Course[]> => {
        let fullCourseList: Course[] = [];
        if (fullExcelCourses === undefined || excelUpdateRequest) {
            fullCourseList = await updateExcel()
        } else {
            fullCourseList = fullExcelCourses;
        }

        let courses: Course[] = [];
        fullCourseList.forEach(course => {
            let found = false;
            courseCodes.forEach(courseCode => {
                if (courseCode.trim() === course.code && !found) {
                    courses.push(course);
                    found = true;
                }
            });
        });

        courses = addManualData(courses);
        return courses;
    }

    const onLoginGoogle = async () => {
        GoogleCalenderLoginRequest((resp) => {
            console.log("Response:", resp);
            setGoogleToken(resp.access_token)
        });
    };

    const onTestGoogleCalender = async () => {
        GoogleCalenderCreateEvents(loadedCourses);
    };

    const getCredits = (): string => {
        if (loadedCourses !== undefined && loadedCourses.length > 0) {
            let credits = 0;
            const creditsArray = loadedCourses
                .filter((course) => !course.isTA && course.isExtraClass === undefined || !course.isTA && course.isExtraClass === false)
                .map((course) => course.credits);
            creditsArray.forEach(credit => {
                credits += parseInt(credit ?? "0");
            });
            return `⭐ Credits: ${credits.toString()}`;
        }
        return "";
    }

    const download = (url: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.target = "_blank"
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

    const [googleToken, setGoogleToken] = React.useState<undefined|string>(undefined);

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
                    <div className={css.uploadContainer}>
                        <label htmlFor="fileInput" className={css.uploadLabel}>Upload and Make Timetable</label>
                        <input type="file" id="fileInput" accept=".pdf" onChange={handleFileChange} />
                    </div>
                    {
                        excelUpdateRequest
                        ? <button className={css.refreshButton} onClick={updateExcel}>Load curriculum?</button>
                        : <></>
                    }
                    <div className={css.errorText}>{errorText}</div>
                    <CourseSearch inputFilterText={searchText} loadedCourses={loadedCourses} allCourses={fullExcelCourses} display={displayCourses} setLoadedCourses={setLoadedCourses} />
                    <div className={css.downloadContainer}>
                        <button className={css.downloadButton} onClick={() => download('https://senapp.github.io/APU-Timetable/sample_files/sample.pdf')}>Sample EN</button>
                        <button className={css.downloadButton} onClick={() => download('https://senapp.github.io/APU-Timetable/sample_files/sample jp.pdf')}>Sample JP</button>
                    </div>
                </div>
                <div className={css.googleContainer}>
                    {!googleToken ?
                        <button id={css.loginToGoogle} onClick={onLoginGoogle}>Login to Google</button>
                        : <div className={css.loggedIn}>{"Google - Logged In"}</div>
                    }
                    {googleToken && <button id={css.importGoogleCalendarButton} disabled={loadedCourses.length === 0 && false} onClick={onTestGoogleCalender}>Export Courses</button>}
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
                <TimetableViewer showCourses={(text) => setSearchText(text)} forceUpdateParent={forceUpdate} setLoadedCourses={setLoadedCourses} courses={loadedCourses} displayCourses={displayCourses} quarterTwoActive={quarterTwoActive} />
                <div className={css.fileUploadInfo}>{fileText}</div>
            </div>
        </div>
    )
};
