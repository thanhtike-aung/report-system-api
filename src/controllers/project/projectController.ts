import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import { Request, Response } from "express";
import {
  create as createProjectService,
  destroy as deleteProjectService,
  getById as getProjectByIdService,
  get as getProjectService,
  update as updateProjectService,
} from "../../services/project/projectService";

/**
 *
 * @param req
 * @param res
 */
export const getProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const projects = await getProjectService();
    res.status(STATUS_CODES.OK).json(projects);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const project = await getProjectByIdService(Number(req.params.id));
    res.status(STATUS_CODES.OK).json(project);
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.OK).json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 *
 * @param req
 * @param res
 */
export const createProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const project = await createProjectService(req.body);
    res.status(STATUS_CODES.CREATED).json(project);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * update project
 * @param req
 * @param res
 */
export const updateProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const project = await updateProjectService(Number(req.params.id), req.body);
    res.status(STATUS_CODES.OK).json(project);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * delete project
 * @param req
 * @param res
 */
export const deleteProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const isDeleted = await deleteProjectService(Number(req.params.id));
    if (!isDeleted) {
      res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: `project ${MESSAGE.ERROR.NOT_FOUND}` });
    }
    res.status(STATUS_CODES.OK).send();
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};
