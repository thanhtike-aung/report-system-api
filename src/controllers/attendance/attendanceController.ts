import { getByToday as getTodayReports } from "../../services/report/reportService";
import { get as getAllUsers } from "../../services/user/userService";
import {
  sendAttendanceToTeams as sendAttendanceToTeamsUtils,
  sendNoReportedUsersToTeams,
} from "../../utils/sendToTeams";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1 * 60 * 1000;

const getNotReportedUsers = (users: any[], reports: any[]) => {
  const reportedUserIds = reports.map((report) => report.reporter?.id);
  return users.filter((user) => !reportedUserIds.includes(user.id));
};

const handleRetryDelay = async (retryCount: number) => {
  if (retryCount < MAX_RETRIES) {
    console.log("Retrying...");
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  } else {
    console.error("Maximum retry limit reached!");
  }
};

export const sendAttendanceToTeams = async (): Promise<void> => {
  let retryCount = 0;
  let isSuccess = false;

  while (retryCount <= MAX_RETRIES && !isSuccess) {
    try {
      console.log(
        `Attempting cron job (Attempt ${retryCount}/${MAX_RETRIES}) ...`,
      );

      const users = await getAllUsers();
      const reports = await getTodayReports();

      if (users.length !== reports.length) {
        const notReportedUsers = getNotReportedUsers(users, reports);
        await sendNoReportedUsersToTeams(notReportedUsers);
        throw new Error("Not all members have reported attendance!");
      }

      await sendAttendanceToTeamsUtils(reports, users.length);
      isSuccess = true;
    } catch (error) {
      console.error(error);
      retryCount++;
      await handleRetryDelay(retryCount);
    }
  }
};
