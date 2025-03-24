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
  clientId: "1030159274106-2eap8atrikm6orr165ip6mi579t3ev23.apps.googleusercontent.com",
  apiKey: "AIzaSyBL7yowDy4t2qeS31EKJBojzx51ldqZuNg",
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

export const GoogleCalenderLoginRequest = async (callback: (resp: any) => void) => {
  if (gapi && tokenClient) {
    tokenClient!.callback = (resp: any): void => {
      if (resp.error) {
        console.log(resp.error)
      } else {
        callback(resp);
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

export const GoogleCalenderCreateEvents = async (courses: Course[]) => {
    StartLoading("Getting Google Calendar");
    const apuCalendar = await CreateOrGetApuCalendar();

    StartLoading("Creating Events");
    var eventPromises: gapi.client.HttpRequest<gapi.client.calendar.Event>[]  = [];
    courses.forEach(course => {
        if (course.day === "0" || course.period === "0") {
            return;
        }

        const startTimeQ1 = "20250407";
        const endTimeQ1 = "20250524";

        const startBreak1 = "20250526";
        const endBreak1 = "20250603";

        const startTimeQ2 = "20250604";
        const endTimeQ2 = "20250723";

        const untilTime = course.quarter == "1"
          ? endTimeQ1
          : endTimeQ2;

        const start = course.quarter == "2"
          ? startTimeQ2
          : startTimeQ1;

        var now = new Date(
          Number.parseInt(start.substring(0, 4)),
          Number.parseInt(start.substring(4, 6)) - 1,
          Number.parseInt(start.substring(6, 8)));

        var today = now.getDate() - now.getDay() + parseInt(course.day);

        var startTime = new Date(now.setDate(today));
        let startPeriod = PeriodStartTimes[parseInt(course.period)];
        let endPeriod = PeriodEndTimes[parseInt(course.period)];
        var endTime = new Date(startTime);
        startTime.setHours(startPeriod.hours, startPeriod.minutes, 0);
        endTime.setHours(endPeriod.hours, endPeriod.minutes, 0);

        let colorFromCollege = course.field === "専門/Major"
          ? "5"
          : course.field === "他学部/Other College"
          ? "4"
          : course.field === "言語/Language"
          ? "1"
          : course.field === "教養/Liberal Arts"
          ? "7"
          : "";

        if (course.isTA) {
          colorFromCollege = "2";
        }

        const event = {
          summary: `📖 ${course.isTA ? `TA: ${course.nameEN}` : course.nameEN}`,
          location: `📍 ${course.location}`,
          colorId: colorFromCollege,
          description: `🧑‍🏫 Instructor: ${course.instructorEN}\n⭐ Credits: ${course.isTA ? "TA" : course.credits}\n🔗 Code: ${course.code}`,
          recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${untilTime}`],
          start: {
            dateTime: startTime.toISOString(),
            timeZone: "Asia/Tokyo"
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: "Asia/Tokyo"
          },
          reminders: {
            useDefault: false,
            overrides: [{
              method: "popup",
              minutes: 10
            }]
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
