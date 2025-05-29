import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import prisma from "../../lib/prisma";
import { LoginPayload } from "types/auth";
import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 *
 * @param loginPayload
 * @returns
 */
export const login = async (loginPayload: LoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: loginPayload.email },
    include: { project: true, supervisor: true },
  });

  if (!user) {
    return {
      status: STATUS_CODES.UNAUTHORIZED,
      message: MESSAGE.ERROR.EMAIL_NOT_FOUND,
    };
  }

  const isMatch = await bcrypt.compare(loginPayload.password, user.password);
  if (!isMatch) {
    return {
      status: STATUS_CODES.UNAUTHORIZED,
      message: MESSAGE.ERROR.WRONG_PASSWORD,
    };
  }

  if (!process.env.JWT_SECRET) throw new Error(MESSAGE.ERROR.JWT_NOT_DEFINED);

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      project: user.project.name,
      projectId: user.project_id,
      supervisorRole: user.supervisor?.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "6d" },
  );

  return {
    status: STATUS_CODES.OK,
    message: MESSAGE.SUCCESS.LOGGED_IN,
    token: token,
  };
};

export const changePassword = async (passwordPayload: {
  userId: number;
  oldPassword: string;
  newPassword: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: passwordPayload.userId },
  });

  if (!user) {
    return {
      status: STATUS_CODES.NOT_FOUND,
      message: `User ${MESSAGE.ERROR.NOT_FOUND}`,
    };
  }

  const isOldPasswordCorrect = await bcrypt.compare(
    passwordPayload.oldPassword,
    user.password,
  );
  if (!isOldPasswordCorrect) {
    return {
      status: STATUS_CODES.UNAUTHORIZED,
      message: "Your current password is wrong.",
    };
  }

  const response = await prisma.user.update({
    where: { id: passwordPayload.userId },
    data: {
      password: await hash(passwordPayload.newPassword, 10),
    },
  });
  return { status: STATUS_CODES.OK, data: response };
};
