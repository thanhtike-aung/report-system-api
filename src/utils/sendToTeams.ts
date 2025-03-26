import axios from "axios";
import dayjs from "dayjs";
import { MESSAGE } from "../constants/messages";
import { User } from "../types/user";
import { Report } from "../types/report";
import { LEAVE_PERIOD, TYPE, WORKSPACE } from "../constants/report";

/**
 * send attendance report to ms teams via endpoint
 * @param todayReports
 * @param totalMembers
 */
export const sendAttendanceToTeams = async (
  todayReports: Report[],
  totalMembers: number,
): Promise<void> => {
  const webhookUrl = process.env.TEAMS_WEBHOOK;

  try {
    if (!webhookUrl) {
      throw new Error(MESSAGE.ERROR.NO_TEAMS_WEBHOOK);
    }
    const message = buildReportCardMessage(todayReports, totalMembers);
    await axios.post(webhookUrl, message);
    console.info("Attendance report sent to Microsoft Teams successfully!");
  } catch (error) {
    console.error("Failed to send report:", error);
  }
};

/**
 * send reminder message for members who are not reported
 * @param users
 */
export const sendNoReportedUsersToTeams = async (
  users: User[],
): Promise<void> => {
  const webhookUrl = process.env.TEAMS_WEBHOOK;

  try {
    if (!webhookUrl) {
      throw new Error(MESSAGE.ERROR.NO_TEAMS_WEBHOOK);
    }
    const message = buildNoReportedUsersMessage(users);
    await axios.post(webhookUrl, message);
  } catch (error) {
    console.error(error);
  }
};

/**
 * build attendance message template
 * @param todayReports
 * @param totalMembers
 * @returns
 */
const buildReportCardMessage = (
  todayReports: Report[],
  totalMembers: number,
): any => {
  const today = dayjs().format("YYYY.MM.DD");
  const workingMembers = filterReports(todayReports, TYPE.WORKING);
  const leaveMembers = filterReports(todayReports, TYPE.LEAVE);
  const officeMembers = filterReports(
    todayReports,
    undefined,
    WORKSPACE.OFFICE,
  );
  const wfhMembers = filterReports(todayReports, undefined, WORKSPACE.HOME);
  const lateMembers = todayReports.filter((report) => report.late_minute !== 0);

  const officeMembersReport = generateReportBlocks(officeMembers, "office");
  const leaveReport = generateReportBlocks(leaveMembers, "leave");
  const wfhReport = generateReportBlocks(
    wfhMembers,
    "wfh",
    officeMembers.length,
  );
  const lateReport = generateReportBlocks(lateMembers, "late");

  return createAdaptiveCard(today, totalMembers, workingMembers.length, {
    officeMembersReport,
    wfhReport,
    leaveReport,
    lateReport,
    leaveMembersCount: leaveMembers.length,
    lateMembersCount: lateMembers.length,
  });
};

/**
 * build reminder message template
 * @param noReportedUsers
 * @returns
 */
const buildNoReportedUsersMessage = (noReportedUsers: User[]): any => {
  const mentions = noReportedUsers.map((user) => ({
    type: "mention",
    text: `<at>${user.name}</at>`,
    mentioned: {
      id: user.email,
      name: user.name,
    },
  }));
  const mentionText = noReportedUsers
    .map((user) => `<at>${user.name}</at>`)
    .join(", ");
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.0",
          body: [
            {
              type: "TextBlock",
              text: mentionText,
              wrap: true,
            },
            {
              type: "RichTextBlock",
              inlines: [
                {
                  type: "TextRun",
                  text: "Please report your attendance before 09:30:00",
                },
              ],
            },
          ],
          msteams: {
            entities: mentions,
          },
          actions: [
            {
              type: "Action.OpenUrl",
              title: "Click to report",
              url: "http://localhost:5173/report/self",
            },
          ],
        },
      },
    ],
  };
};

/**
 * helper func
 * @param reports
 * @param type
 * @param workspace
 * @returns
 */
const filterReports = (
  reports: Report[],
  type?: string,
  workspace?: string,
) => {
  return reports.filter((report) => {
    return (
      (!type || report.type === type) &&
      (!workspace || report.workspace === workspace)
    );
  });
};

/**
 * helper func
 * @param reports
 * @param type
 * @param offset
 * @returns
 */
const generateReportBlocks = (
  reports: Report[],
  type: string,
  offset: number = 0,
) => {
  const spaces = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  return reports.map((report, index) => {
    const baseText = `${index + 1 + offset}. ${report.reporter?.name} ${spaces}`;
    switch (type) {
      case "office":
        return {
          type: "TextBlock",
          text: `${baseText}(${report.reporter?.project?.name})`,
        };
      case "leave":
        return {
          type: "TextBlock",
          text: `${baseText}${report.leave_reason} ${
            report.leave_period !== LEAVE_PERIOD.FULL
              ? `【 ${report.leave_period} 】`
              : ""
          }`,
        };
      case "wfh":
        return {
          type: "TextBlock",
          text: `${baseText}(${report.reporter?.project?.name}) 【${report.leave_period === LEAVE_PERIOD.MORNING ? LEAVE_PERIOD.EVENING : LEAVE_PERIOD.MORNING}】`,
        };
      case "late":
        return {
          type: "TextBlock",
          text: `${baseText}(${report.late_minute}min)`,
        };
      default:
        return {};
    }
  });
};

/**
 * helper func
 * @param today
 * @param totalMembers
 * @param workingMembersCount
 * @param param3
 * @returns
 */
const createAdaptiveCard = (
  today: string,
  totalMembers: number,
  workingMembersCount: number,
  {
    officeMembersReport,
    wfhReport,
    leaveReport,
    lateReport,
    leaveMembersCount,
    lateMembersCount,
  }: any,
) => {
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.0",
          body: [
            {
              type: "TextBlock",
              text: `${today} の勤怠状況を報告いたします。`,
              weight: "Bolder",
              size: "Large",
            },
            {
              type: "TextBlock",
              text: `合計：${totalMembers}名\n出勤：${workingMembersCount}名`,
            },
            {
              type: "TextBlock",
              text: "▼ オフィス勤務",
              weight: "Bolder",
            },
            ...officeMembersReport,
            {
              type: "TextBlock",
              text: wfhReport.length === 0 ? "▼ 在宅勤務 : 無し" : "▼ 在宅勤務",
              weight: "Bolder",
            },
            ...wfhReport,
            {
              type: "TextBlock",
              text:
                leaveMembersCount === 0
                  ? "欠勤：無し"
                  : `欠勤： ${leaveMembersCount}名`,
            },
            ...leaveReport,
            {
              type: "TextBlock",
              text:
                lateMembersCount === 0
                  ? "遅刻： 無し"
                  : `遅刻： ${lateMembersCount}名`,
            },
            ...lateReport,
          ],
        },
      },
    ],
  };
};
