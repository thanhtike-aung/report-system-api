import { BaseService } from '../base.service';
import { Attendance } from '../../types/models';
import { NotFoundError } from '../../utils/errors/AppError';
import dayjs from 'dayjs';
import { sendAttendanceReminderToTeams } from '../../utils/attendance/sendToTeams';
import { CreateAttendancePayload } from '../../types/attendance';

export class AttendanceService extends BaseService {
  constructor() {
    super('attendance');
  }

  async findAll(): Promise<Attendance[]> {
    return this.prisma.attendance.findMany({
      include: {
        reporter: true,
        creator: true
      }
    });
  }

  async findById(id: number): Promise<Attendance> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        reporter: true,
        creator: true
      }
    });

    if (!attendance) {
      throw new NotFoundError(`Attendance with id ${id} not found`);
    }

    return attendance;
  }

  async findByIdAndDate(id: number, date: string): Promise<Attendance[]> {
    const targetDate = dayjs(date);
    const nextDate = targetDate.add(1, 'day');

    return this.prisma.attendance.findMany({
      where: {
        reported_by: id,
        created_at: {
          gte: targetDate.toDate(),
          lt: nextDate.toDate()
        }
      },
      include: {
        reporter: true,
        creator: true
      }
    });
  }

  async findToday(): Promise<Attendance[]> {
    const today = dayjs().startOf('day');
    const tomorrow = dayjs().endOf('day');

    return this.prisma.attendance.findMany({
      where: {
        created_at: {
          gte: today.toDate(),
          lte: tomorrow.toDate()
        }
      },
      include: {
        reporter: true,
        creator: true
      }
    });
  }

  async create(data: CreateAttendancePayload): Promise<Attendance> {
    return this.prisma.attendance.create({
      data,
      include: {
        reporter: true,
        creator: true
      }
    });
  }

  async sendToTeams(): Promise<void> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          is_active: true
        }
      });

      await sendAttendanceToTeamsUtils(users);
    } catch (error) {
      console.error('Error sending attendance to Teams:', error);
      throw error;
    }
  }

  async sendReminder(): Promise<void> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          is_active: true
        }
      });

      await sendAttendanceReminderToTeams(users);
    } catch (error) {
      console.error('Error sending attendance reminder:', error);
      throw error;
    }
  }
}