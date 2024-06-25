import * as React from 'react';
import css from './App.module.css';
import { ParsePDFFile } from '../control/PDFReader';
import { ReadExcelFile } from '../control/ExcelFilter';
import { Course } from '../control/CourseData';
import { TimetableViewer } from '../components/TimetableViewer';
import { GoogleCalenderCallTestEvent, GoogleCalenderLoginRequest } from '../API/API';
import { StartLoading, StopLoading } from '.';

export const App: React.FC = () => {
    const [quarterTwoActive, setQuarterTwoActive] = React.useState(false);
    const [loadedCourses, setLoadedCourses] = React.useState<Course[]>([]);
    const [displayCourses, setDisplayCourses] = React.useState(false);
    const [isCurriculum2023, setIsCurriculum2023] = React.useState(false);
    const [errorText, setErrorText] = React.useState("");
    const [fileText, setFileText] = React.useState("");
    const [college, setCollege] = React.useState("APM");

    React.useEffect(() => {
        if (loadedCourses !== null && loadedCourses.length > 0 && loadedCourses[0].location !== undefined) {
            setDisplayCourses(true);
        }
    }, [loadedCourses])

    React.useEffect(() => {
        if (!isCurriculum2023 && college === "ST") {
            setIsCurriculum2023(true);
        }
    }, [college])

    const handleFileChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = e.target.files;
        if (!fileList) return;

        const fileReader = new FileReader();
        fileReader.onload = function (e: Event) {
            var typedarray = fileReader.result as ArrayBuffer;

            StartLoading("Creating Schedule");
            const result = ParsePDFFile(typedarray);
            result.then((res) => {
                setLoadedCourses(res.courses);
                setDisplayCourses(false)
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

    const onGenerateSchedule = async (courses: Course[]) => {
        let response = await fetch(`https://ritsumeikancoding.github.io/Shoganai/resources/${isCurriculum2023 ? "2023" : "2017"}${college}_Curriculum_24Spring_240529.xlsx`);
        let data = await response.blob();

        const fileReader = new FileReader();
        fileReader.onload = function (e: Event) {
            var typedarray = fileReader.result as ArrayBuffer;

            const result = ReadExcelFile(courses, typedarray);
            setLoadedCourses(result);
            StopLoading();

            const element = document.getElementById("fileInput");
            if (element !== undefined) {
                (element as HTMLInputElement).value = "";
            }
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
                .filter((course) => course.isExtraClass === undefined || course.isExtraClass === false)
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
                    <div className={css.uploadContainer}>
                        <label htmlFor="fileInput" className={css.uploadLabel}>Upload and Make Timetable</label>
                        <input type="file" id="fileInput" accept=".pdf" onChange={handleFileChange} />
                    </div>
                    <div className={css.errorText}>{errorText}</div>
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
                    </div>
                    <div>{getCredits()}</div>
                </div>
                <TimetableViewer courses={loadedCourses} displayCourses={displayCourses} quarterTwoActive={quarterTwoActive} />
                <div className={css.fileUploadInfo}>{fileText}</div>
            </div>
        </div>
    )
};
