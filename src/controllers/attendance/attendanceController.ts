import { getByToday as getTodayReports } from "../../services/report/reportService";
import { get as getAllUsers } from "../../services/user/userService";
import {
  sendAttendanceToTeams as sendAttendanceToTeamsUtils,
  sendNoReportedUsersToTeams,
} from "../../utils/sendToTeams";

const getNotReportedUsers = (users: any[], reports: any[]) => {
  const reportedUserIds = reports.map((report) => report.reporter?.id);
  return users.filter((user) => !reportedUserIds.includes(user.id));
};

export const sendAttendanceToTeams = async (): Promise<void> => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 15 * 60 * 1000;

  for (let retryCount = 1; retryCount <= MAX_RETRIES; retryCount++) {
    console.log(`Attempt ${retryCount}/${MAX_RETRIES}`);
    try {
      const users = await getAllUsers();
      const reports = await getTodayReports();

      if (users.length !== reports.length) {
        const notReportedUsers = getNotReportedUsers(users, reports);
        await sendNoReportedUsersToTeams(notReportedUsers);
        throw new Error("Not all members have reported attendance!");
      }

      await sendAttendanceToTeamsUtils(reports, users.length);
      console.log("Attendance sent successfully!");
      return;
    } catch (error) {
      console.error(`Error on attempt ${retryCount}:`, error);
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("Maximum retry limit reached. Exiting.");
      }
    }
  }
};
