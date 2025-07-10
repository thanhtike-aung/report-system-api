import axios from "axios";
import { MESSAGE } from "../../constants/messages";
import { User } from "types/user";
import { Report } from "types/report";
import dayjs from "dayjs";
import { MEMBER_ROLE } from "../../constants/common";
import { Attendance } from "types/attendance";
import { LEAVE_PERIOD } from "../../constants/attendance";
import { saveAdaptiveCardMessage } from "../../services/report/reportService";

export const sendReportReminderToTeamsUtils = async (): Promise<void> => {
  const workflowsUrl = process.env.EVENING_REPORT_WEBHOOK;
  if (!workflowsUrl) {
    throw new Error("There is no workflows URL provided.");
  }
  try {
    const messagePayload = buildReportReminderMessageCard();
    await axios.post(workflowsUrl, messagePayload);
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error: unknown): void => {
  console.error(error);
};

export const buildReportReminderMessageCard = (): any => ({
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
            type: "RichTextBlock",
            inlines: [
              {
                type: "TextRun",
                text: "<at>everyone</at> ရုံးဆင်းပါတော့မယ်။ 🏃‍♂️‍➡️\nမိတ်ဆွေ report တင်ပြီးပြီလား။ 🤗",
              },
            ],
          },
        ],
        actions: [
          {
            type: "Action.OpenUrl",
            title: "Click to report",
            url: "https://dev02-report-system.vercel.app",
          },
        ],
        msteams: {
          entities: [
            {
              type: "mention",
              text: "<at>everyone</at>",
              mentioned: {
                id: "everyone",
                name: "everyone",
              },
            },
          ],
        },
      },
    },
  ],
});

type ReportBlock = {
  type: "manager" | "header" | "project" | "task" | "footer" | "separator";
  content?: string;
  managerInfo?: { email: string; name: string };
};

export const buildReportMessageStructureBlocks = (
  members: User[],
  reports: Report[],
  attendances: Attendance[],
): ReportBlock[] => {
  const blocks: ReportBlock[] = [];
  const manager = members.find((member) => member.role === MEMBER_ROLE.MANAGER);

  if (!process.env.DEV02_MANAGER_EMAIL || !process.env.DEV02_MANAGER_NAME) {
    throw new Error("There is no manager information provided in env");
  }

  blocks.push({
    type: "manager",
    managerInfo: {
      email: manager?.email || process.env.DEV02_MANAGER_EMAIL,
      name: manager?.name || process.env.DEV02_MANAGER_NAME,
    },
  });

  blocks.push({
    type: "header",
    content: `\n\n${dayjs().format("YYYY-MM-DD")} の作業状況を報告させて頂きます。\n`,
  });

  // const leaveAttendances = attendances.filter(
  //   (attendance) => attendance.leave_period === LEAVE_PERIOD.FULL,
  // );

  const users: Record<string, any> = {};
  reports.forEach(
    ({
      user,
      project,
      task_title,
      task_description,
      progress,
      man_hours,
      working_time,
    }) => {
      if (user) {
        if (!users[user.id]) {
          users[user.id] = {
            name: user.name,
            project: user.project?.name,
            workingTime: working_time,
            tasks: [],
          };
        }
        users[user.id].tasks.push({
          project,
          task_title,
          task_description,
          progress,
          man_hours,
        });
      }
    },
  );

  Object.values(users).forEach((user: any, index: number) => {
    if (index > 0) {
      blocks.push({ type: "separator", content: "" });
    }
    blocks.push({ type: "project", content: `◆ ${user.name}` });
    blocks.push({
      type: "project",
      content: `<Project Name>: ${user.project}`,
    });
    blocks.push({ type: "task", content: `■今日の作業実績` });

    user.tasks.forEach((task: any, index: number) => {
      blocks.push({
        type: "task",
        content: `${index + 1})【${task.project}】${task.task_title} ${
          task.progress ? `<${task.progress}%完了>` : ""
        } ${task.man_hours ? `(${task.man_hours}hr)` : ""}${task.task_description ? ` \n       -${task.task_description}` : ""}`,
      });
    });

    if (user.workingTime === 0) {
      blocks.push({
        type: "task",
        content: " ⇨ Full Leave",
      });
    }

    if (user.workingTime === 4) {
      blocks.push({
        type: "task",
        content: " ⇨ Half Leave",
      });
    }

    // blocks.push({ type: "task", content: `\n■明日の作業予定` });
    // blocks.push({ type: "task", content: `1) その他\n` });
  });

  blocks.push({
    type: "footer",
    content: "以上です。よろしくお願いいたします。",
  });
  return blocks;
};

export const buildReportMessageCard = (blocks: ReportBlock[]): any => {
  const mentions: any = [];
  const body = blocks.map((block) => {
    switch (block.type) {
      case "manager":
        if (block.managerInfo?.email && block.managerInfo.name) {
          mentions.push({
            type: "mention",
            text: `<at>${block.managerInfo.name}</at>`,
            mentioned: {
              id: block.managerInfo.email,
              name: block.managerInfo.name,
            },
          });
        }
        return {
          type: "TextBlock",
          text: `<at>${block.managerInfo?.name}</at>`,
          wrap: true,
        };
      case "header":
        return {
          type: "TextBlock",
          text: block.content,
          wrap: true,
          size: "Medium",
          weight: "Bolder",
        };
      case "project":
        return {
          type: "TextBlock",
          text: block.content,
          wrap: true,
          spacing: "Small",
        };
      case "task":
        return {
          type: "RichTextBlock",
          inlines: [
            {
              type: "TextRun",
              text: block.content,
              spacing: "None",
            },
          ],
        };
      case "footer":
        return {
          type: "TextBlock",
          text: block.content,
          wrap: true,
          spacing: "Medium",
          isSubtle: true,
        };
      case "separator":
        return {
          type: "TextBlock",
          text: " ",
          separator: true,
          spacing: "Medium",
        };
    }
  });

  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body,
          msteams: {
            entities: mentions,
          },
        },
      },
    ],
  };
};

export const sendReportToTeamsUtils = async (
  members: User[],
  reports: Report[],
  attendances: Attendance[],
  memberGroupedBy: any,
): Promise<void> => {
  try {
    if (!memberGroupedBy.workflowsUrl) {
      throw new Error("There is no workflows URL provided.");
    }

    const blocks = buildReportMessageStructureBlocks(
      members,
      reports,
      attendances,
    );
    const messagePayload = buildReportMessageCard(blocks);
    await saveAdaptiveCardMessage(messagePayload, memberGroupedBy.senderId);
    await axios.post(memberGroupedBy.workflowsUrl, messagePayload);
  } catch (error) {
    handleError(error);
  }
};
