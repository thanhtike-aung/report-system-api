import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Role } from '../types/models';

export const createTestToken = (id: number, role: Role) => {
  return jwt.sign({ id, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

export const testRequest = (app: Express) => {
  return {
    get: (url: string, token?: string) => {
      const req = request(app).get(url);
      if (token) {
        req.set('Authorization', `Bearer ${token}`);
      }
      return req;
    },
    post: (url: string, body: any, token?: string) => {
      const req = request(app).post(url).send(body);
      if (token) {
        req.set('Authorization', `Bearer ${token}`);
      }
      return req;
    },
    put: (url: string, body: any, token?: string) => {
      const req = request(app).put(url).send(body);
      if (token) {
        req.set('Authorization', `Bearer ${token}`);
      }
      return req;
    },
    delete: (url: string, token?: string) => {
      const req = request(app).delete(url);
      if (token) {
        req.set('Authorization', `Bearer ${token}`);
      }
      return req;
    }
  };
};