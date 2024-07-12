import { Row } from "read-excel-file";

export type Course = {
    quarter: string;
    day: string;
    period: string;
    code: string;
    name: string;
    language: string;
    instructor: string;
    credits: string; // Is empty "" if isExtraClass is true

    location?: string; // Find from EXCEL by using course code.
    isExtraClass?: boolean; // Is true if course code as already been parsed
    college?: string; // Find from EXCEL by using course code. Either "Major" / "Other" / "Liberal Arts"
    isTA?: boolean;
}

export enum Langauge {
    English,
    Japanese
}

export const StringToCourse = (courseString: string, language: Langauge, previousCourseCodes: string[]): Course | null => {
    try
    {
        let splits = courseString.trim().split("   ");
        let isExtraClass = previousCourseCodes.includes(splits[3]);
        let languageMatches = splits[5].match(/[EJ]/g);
        let isLanguageClass = languageMatches === null || languageMatches.length === 0;
        let instructorNameIsSplit =
            splits.length >= 9 && !isExtraClass ||
            splits.length >= 8 && isExtraClass ||
            !isExtraClass && isLanguageClass && splits.length >= 8 ||
            isExtraClass && isLanguageClass && splits.length >= 7;

        let count = 0;
        let course: Course = {
            quarter: parseQuarter(splits[count++], language),
            day: parseDay(parseSplit(splits[count++], language), language),
            period: parsePeriod(splits[count++], language),
            code: splits[count++],
            name: splits[count++],
            language: !isLanguageClass
                ? splits[count++]
                : "",
            instructor: !instructorNameIsSplit
                ? parseSplit(splits[count++], language, true)
                : parseSplit((splits[count++] + splits[count++]), language, true),
            credits: !isExtraClass
                ? textToNumberParse(parseSplit(splits[count++], language)).toString()
                : "",
            isExtraClass: isExtraClass,
        }
        return course;
    }
    catch {
        return null;
    }
}

const textToNumberParse = (number: string) => {
    const matches = number.match(/\d/g);
    if (matches !== null && matches.length > 0) {
        return number;
    } else {
        switch (number.toLowerCase()) {
            case "ten":
                return 10;
            case "nine":
                return 9;
            case "eigth":
                return 8;
            case "seven":
                return 7;
            case "six":
                return 6;
            case "five":
                return 5;
            case "four":
                return 4;
            case "three":
                return 3;
            case "two":
                return 2;
            case "one":
                return 1;
            default:
                return 0;
        }
    }
};

const parsePeriod = (periodText: string, language: Langauge):string  => {
    if (language === Langauge.Japanese) {
        return periodText === "セッション" ? "Session" : periodText.slice(0,1).replace(
            /[\uff01-\uff5e]/g,
            function(ch) {
                return String.fromCharCode(ch.charCodeAt(0) - 0xfee0); }
            );
    } else {
        return textToNumberParse(periodText).toString();
    }
};

const parseQuarter = (quarterText: string, language: Langauge):string  => {
    if (language === Langauge.Japanese) {
        let matches = quarterText.replace(
            /[\uff01-\uff5e]/g,
            function(ch) {
                return String.fromCharCode(ch.charCodeAt(0) - 0xfee0); }
            ).match(/\d/g);
        return matches !== null ? matches[0] : "0";
    } else {
        let matches = quarterText.match(/\d/g);
        return matches !== null ? matches[0] : "0";
    }
};

const parseDay = (dayText: string, language: Langauge):string  => {
    if (language === Langauge.Japanese) {
        switch (dayText) {
            case "⽉曜⽇":
                return "1";
            case "⽕曜⽇":
                return "2";
            case "水曜⽇":
                return "3";
            case "⽊曜⽇":
                return "4";
            case "⾦曜⽇":
                return "5";
            default:
                return "0";
        }
    } else {
        switch (dayText) {
            case "Monday":
                return "1";
            case "Tuesday":
                return "2";
            case "Wednesday":
                return "3";
            case "Thursday":
                return "4";
            case "Friday":
                return "5";
            default:
                return "0";
        }
    }
};

const parseSplit = (text: string, language: Langauge, isInstructor: boolean = false): string => {
    if (language === Langauge.Japanese) {
        if (isInstructor) {
            let matches = text.match(/[A-Za-z]/g);
            return matches === null || matches.length === 0
                ?  text.split(" ").join("")
                : text;
        } else {
            return text.split(" ").join("");
        }
    } else {
        return text;
    }
}

export const ExcelRowToCourse = (row: Row): Course | null => {
    try
    {
        let course: Course = {
            quarter: row[0] ? parseQuarterExcel(row[0].toString()) : "",
            day: row[1] ? parseDayExcel(row[1].toString()) : "",
            period: row[2] ? row[2].toString() : "",
            location: row[5] ? row[5].toString() : "",
            code: row[6] ? row[6].toString() : "",
            name: row[8] ? row[8].toString() : "",
            instructor: row[9] ? row[9].toString() : "",
            language: row[11] ? row[11].toString() : "",
            credits: "0",
            college: row[13] ? row[13].toString() : ""
        }
        return course;
    }
    catch (e) {
        console.log(e)
        return null;
    }
}

const parseQuarterExcel = (text: string): string => {
    if (text === "Semester") {
        return "0";
    } else {
        return text.substring(0,1);
    }
}

const parseDayExcel = (text: string): string => {
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
}