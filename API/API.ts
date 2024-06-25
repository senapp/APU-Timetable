import { Course } from "../control/CourseData";
import { PeriodEndTimes, PeriodStartTimes } from "../control/util";
import { StartLoading, StopLoading } from "../src";

const scriptSrcGoogle = "https://accounts.google.com/gsi/client";
const scriptSrcGapi = "https://apis.google.com/js/api.js";

interface GoogleCalendarConfig {
  clientId: string;
  apiKey: string;
  scope: string;
  discoveryDocs: string[];
  hosted_domain?: string;
}

interface ExtendedTokenClient extends google.accounts.oauth2.TokenClient {
  callback?: (resp: any) => void;
  error_callback?: (resp: any) => void;
}

const config: GoogleCalendarConfig = {
  clientId: "Secret",
  apiKey: "Secret",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
  hosted_domain: undefined,
};

let tokenClient: ExtendedTokenClient | null = null;
let onLoadCallback: any = null;

const handleClientLoad = () => {
  const scriptGoogle = document.createElement("script");
  const scriptGapi = document.createElement("script");
  scriptGoogle.src = scriptSrcGoogle;
  scriptGoogle.async = true;
  scriptGoogle.defer = true;
  scriptGapi.src = scriptSrcGapi;
  scriptGapi.async = true;
  scriptGapi.defer = true;
  document.body.appendChild(scriptGapi);
  document.body.appendChild(scriptGoogle);
  scriptGapi.onload = (): void => {
    gapi.load("client", initGapiClient);
  };
  scriptGoogle.onload = async (): Promise<void> => {
    tokenClient = await google.accounts.oauth2.initTokenClient({
      client_id: config.clientId,
      scope: config.scope,
      prompt: "",
      callback: (): void => {},
    });
  };
}

const initGapiClient = (): void => {
  gapi.client
    .init({
      apiKey: config.apiKey,
      discoveryDocs: config.discoveryDocs,
      hosted_domain: config.hosted_domain,
    })
    .then((): void => {
      if (onLoadCallback) {
        onLoadCallback();
      }
    })
    .catch((e: any): void => {
      console.log(e);
    });
}

handleClientLoad();

export const GoogleCalenderLoginRequest = async () => {
  if (gapi && tokenClient) {
    tokenClient!.callback = (resp: any): void => {
      if (resp.error) {
        console.log(resp.error)
      } else {
        console.log(resp)
      }
    };
    tokenClient!.error_callback = (resp: any): void => {
      console.log(resp)
    };
    if (gapi.client.getToken() === null) {
      tokenClient!.requestAccessToken({ prompt: "consent" });
    } else {
      tokenClient!.requestAccessToken({ prompt: "" });
    }
  } else {
    console.error("Error: gapi not loaded");
    return Promise.reject(new Error("Error: this.gapi not loaded"));
  }
}

export const GoogleCalenderLogoutRequest = () => {
  
}

const CreateOrGetApuCalendar = async (): Promise<string> => {
  return new Promise(function (resolve, reject) {
    gapi.client.calendar.calendarList.list().then((item) => {
      if (item.result.items.filter((calendar) => calendar.summary === "APU Calendar").length === 0) {
        gapi.client.calendar.calendars.insert({ summary: "APU Calendar", timeZone: "Asia/Tokyo" }).then((res) => {
          resolve(res.result.id);
        })
      } else {
        resolve(item.result.items.filter((calendar) => calendar.summary === "APU Calendar")[0].id);
      }
    });
  });
}

export const GoogleCalenderCallTestEvent = async (courses: Course[], quarterTWoActive: boolean) => {
    StartLoading("Getting Google Calendar");
    const apuCalendar = await CreateOrGetApuCalendar();
    const currentQuarter = quarterTWoActive === false ? "1" : "2";

    StartLoading("Creating Events");
    var eventPromises: gapi.client.HttpRequest<gapi.client.calendar.Event>[]  = [];
    courses.forEach(course => {
        if (course.day === "0" || course.period === "0" || course.semester !== "0" && course.semester !== currentQuarter) {
            return;
        }

        var now = new Date;
        var today = now.getDate() - now.getDay() + parseInt(course.day);
        var startTime = new Date(now.setDate(today));
        let startPeriod = PeriodStartTimes[parseInt(course.period)];
        let endPeriod = PeriodEndTimes[parseInt(course.period)];
        var endTime = new Date(startTime);
        startTime.setHours(startPeriod.hours, startPeriod.minutes, 0);
        endTime.setHours(endPeriod.hours, endPeriod.minutes, 0);

        const colorFromCollege = course.college === "専門/Major"
          ? "5"
          : course.college === "他学部/Other College"
          ? "4"
          : course.college === "言語/Language"
          ? "3"
          : course.college === "教養/Liberal Arts"
          ? "7"
          : "";

        const event = {
          summary: `📖 ${course.name}`,
          location: `📍 ${course.location}`,
          colorId: colorFromCollege,
          description: `🧑‍🏫 Instructor: ${course.instructor}\n⭐ Credits: ${course.credits}\n🔗 Code: ${course.code}`,
          recurrence: ['RRULE:FREQ=WEEKLY;UNTIL=20240801'],
          start: {
            dateTime: startTime.toISOString(),
            timeZone: "Asia/Tokyo"
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: "Asia/Tokyo"
          },
        };

        if (gapi.client.getToken()) {
          const sendUpdates: "all" | "externalOnly" | "none" = "none"
          eventPromises.push(gapi.client.calendar.events.insert({
            calendarId: apuCalendar,
            resource: event,
            //@ts-ignore the @types/gapi.calendar package is not up to date(https://developers.google.com/calendar/api/v3/reference/events/insert)
            sendUpdates: sendUpdates,
            conferenceDataVersion: 1,
          }))
        }  else {
          console.error("Error: this.gapi not loaded");
          return;
        }
    });

    await Promise.all(eventPromises).then((resArray) => {
      resArray.forEach(result => {
        console.log(result.result);
      });
    });
    StopLoading();
}
