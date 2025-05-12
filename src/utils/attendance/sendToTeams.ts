import axios from "axios";
import dayjs from "dayjs";
import { MESSAGE } from "../../constants/messages";
import { User } from "../../types/user";
import { Attendance } from "../../types/attendance";
import { LEAVE_PERIOD, TYPE, WORKSPACE } from "../../constants/attendance";

/**
 * send attendance report to ms teams via endpoint
 * @param todayAttendances
 * @param totalMembers
 */
export const sendAttendanceToTeams = async (
  todayAttendances: Attendance[],
  totalMembers: number,
): Promise<void> => {
  const webhookUrl = process.env.TEAMS_WEBHOOK;

  try {
    if (!webhookUrl) {
      throw new Error(MESSAGE.ERROR.NO_TEAMS_WEBHOOK);
    }
    const message = buildAttendanceCardMessage(todayAttendances, totalMembers);
    await axios.post(webhookUrl, message);
    console.info("Attendance report sent to Microsoft Teams successfully!");
  } catch (error) {
    console.error("Failed to send attendance report:", error);
  }
};

/**
 * send reminder message for members who are not reported attendance
 * @param users
 */
export const sendAttendanceReminderToTeams = async (
  users: User[],
): Promise<void> => {
  const webhookUrl = process.env.TEAMS_WEBHOOK;

  try {
    if (!webhookUrl) {
      throw new Error(MESSAGE.ERROR.NO_TEAMS_WEBHOOK);
    }
    const message = buildAttendanceReminderMessage(users);
    await axios.post(webhookUrl, message);
  } catch (error) {
    console.error(error);
  }
};

/**
 * build attendance message template
 * @param todayAttendances
 * @param totalMembers
 * @returns
 */
const buildAttendanceCardMessage = (
  todayAttendances: Attendance[],
  totalMembers: number,
): any => {
  const today = dayjs().format("YYYY.MM.DD");
  const workingMembers = filterAttendances(todayAttendances, TYPE.WORKING);
  const leaveMembers = filterAttendances(todayAttendances, TYPE.LEAVE);
  const officeMembers = filterAttendances(
    todayAttendances,
    undefined,
    WORKSPACE.OFFICE,
  );
  const wfhMembers = filterAttendances(
    todayAttendances,
    undefined,
    WORKSPACE.HOME,
  );
  const lateMembers = todayAttendances.filter(
    (attendance) => attendance.late_minute !== 0,
  );

  const officeMemberAttendance = generateAttendanceBlocks(
    officeMembers,
    "office",
  );
  const leaveMemberAttendance = generateAttendanceBlocks(leaveMembers, "leave");
  const wfhMemberAttendance = generateAttendanceBlocks(
    wfhMembers,
    "wfh",
    officeMembers.length,
  );
  const lateMemberAttendance = generateAttendanceBlocks(lateMembers, "late");

  return createAdaptiveCard(today, totalMembers, workingMembers.length, {
    officeMemberAttendance,
    wfhMemberAttendance,
    leaveMemberAttendance,
    lateMemberAttendance,
    leaveMembersCount: leaveMembers.length,
    lateMembersCount: lateMembers.length,
  });
};

/**
 * build reminder message template
 * @param noReportedUsers
 * @returns
 */
const buildAttendanceReminderMessage = (noReportedUsers: User[]): any => {
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
              title: "Click to report attendance",
              url: "https://report-system-client-ver001.vercel.app/",
            },
          ],
        },
      },
    ],
  };
};

/**
 * helper func
 * @param attendances
 * @param type
 * @param workspace
 * @returns
 */
const filterAttendances = (
  attendances: Attendance[],
  type?: string,
  workspace?: string,
) => {
  return attendances.filter((attendance) => {
    return (
      (!type || attendance.type === type) &&
      (!workspace || attendance.workspace === workspace)
    );
  });
};

/**
 * helper func
 * @param attendances
 * @param type
 * @param offset
 * @returns
 */
const generateAttendanceBlocks = (
  attendances: Attendance[],
  type: string,
  offset: number = 0,
) => {
  const SPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

  const determineWfhWorkingTime = (leavePeriod: string | null): string => {
    if (!leavePeriod) return "";

    return leavePeriod === LEAVE_PERIOD.MORNING ? "【evening】" : "【morning】";
  };

  return attendances.map((attendance, index) => {
    const baseText = `${index + 1 + offset}. ${attendance.reporter?.name} ${SPACES}`;
    switch (type) {
      case "office":
        return {
          type: "TextBlock",
          text: `${baseText}(${attendance.reporter?.project?.name})`,
        };
      case "leave":
        return {
          type: "TextBlock",
          text: `${baseText} (${attendance.leave_reason}) ${
            attendance.leave_period !== LEAVE_PERIOD.FULL
              ? `【 ${attendance.leave_period} 】`
              : ""
          }`,
        };
      case "wfh":
        return {
          type: "TextBlock",
          text: `${baseText}(${attendance.reporter?.project?.name}) ${determineWfhWorkingTime(attendance.leave_period)}`,
        };
      case "late":
        return {
          type: "TextBlock",
          text: `${baseText}(${attendance.late_minute}min)`,
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
    officeMemberAttendance,
    wfhMemberAttendance,
    leaveMemberAttendance,
    lateMemberAttendance,
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
            ...officeMemberAttendance,
            {
              type: "TextBlock",
              text:
                wfhMemberAttendance.length === 0
                  ? "▼ 在宅勤務 : 無し"
                  : "▼ 在宅勤務",
              weight: "Bolder",
            },
            ...wfhMemberAttendance,
            {
              type: "TextBlock",
              text:
                leaveMembersCount === 0
                  ? "欠勤：無し"
                  : `欠勤： ${leaveMembersCount}名`,
            },
            ...leaveMemberAttendance,
            {
              type: "TextBlock",
              text:
                lateMembersCount === 0
                  ? "遅刻： 無し"
                  : `遅刻： ${lateMembersCount}名`,
            },
            ...lateMemberAttendance,
          ],
        },
      },
    ],
  };
};
